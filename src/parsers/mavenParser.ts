import type { Conflict, DependencyNode, ParseResult } from '../types/index.ts'

const ERROR_PREFIX = '[ERROR]'
const SEPARATOR = 'and'

function parseNode(line: string): DependencyNode | null {
  const trimmed = line.trim()
  const match = trimmed.match(/([\w.-]+):([\w.-]+):([\w.-]+)(?:\s*\[(\w+)\])?/)
  if (!match) return null

  return {
    groupId: match[1],
    artifactId: match[2],
    version: match[3],
    scope: match[4],
  }
}

function extractPath(lines: string[]): DependencyNode[] {
  const path: DependencyNode[] = []
  for (const line of lines) {
    const node = parseNode(line)
    if (node) {
      path.push(node)
    }
  }
  return path
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0
    const p2 = parts2[i] || 0
    if (p1 !== p2) return p1 - p2
  }
  return 0
}

function findHighestVersion(versions: string[]): string {
  return versions.reduce((highest, current) =>
    compareVersions(current, highest) > 0 ? current : highest
  )
}

export function parseMavenOutput(input: string): ParseResult {
  const lines = input.split('\n').filter((line) => line.trim())

  if (lines.length === 0) {
    return { type: 'error', message: 'Empty input' }
  }

  const errorLines = lines.filter((line) => line.includes(ERROR_PREFIX))

  if (errorLines.length === 0) {
    return { type: 'error', message: 'No [ERROR] lines found. Please paste maven enforcer output.' }
  }

  const sections: string[][] = []
  let currentSection: string[] = []

  for (const line of errorLines) {
    const cleanLine = line.replace(ERROR_PREFIX, '').trim()

    if (cleanLine === SEPARATOR) {
      if (currentSection.length > 0) {
        sections.push(currentSection)
        currentSection = []
      }
    } else if (cleanLine && cleanLine !== ']') {
      currentSection.push(cleanLine)
    }
  }

  if (currentSection.length > 0) {
    sections.push(currentSection)
  }

  if (sections.length === 0) {
    return { type: 'error', message: 'Could not parse dependency paths' }
  }

  const conflicts = new Map<string, Conflict>()

  for (const section of sections) {
    const path = extractPath(section)
    if (path.length === 0) continue

    const target = path[path.length - 1]
    const key = `${target.groupId}:${target.artifactId}`

    if (!conflicts.has(key)) {
      conflicts.set(key, {
        target,
        paths: [],
        versions: [],
        highestVersion: target.version,
      })
    }

    const conflict = conflicts.get(key)!
    conflict.paths.push(path)

    if (!conflict.versions.includes(target.version)) {
      conflict.versions.push(target.version)
      conflict.highestVersion = findHighestVersion(conflict.versions)
    }
  }

  const conflictList = Array.from(conflicts.values())

  if (conflictList.length === 0) {
    return { type: 'error', message: 'No conflicts found in the input' }
  }

  return { type: 'success', conflicts: conflictList }
}
