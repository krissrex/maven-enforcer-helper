import type { Conflict, DependencyNode, ParseResult } from '../types/index.ts'

const ERROR_PREFIX = '[ERROR]'
const SEPARATOR = 'and'
const CONFLICT_HEADER_PATTERN = /^(Dependency convergence error|Require upper bound dependencies error)/

interface ParsedNode {
  node: DependencyNode
  requiredVersion?: string // For RequireUpperBoundDeps: version after <--
}

function looksLikeVersion(part: string): boolean {
  // Version numbers typically contain digits, dots, hyphens, and alphanumeric parts
  // Examples: 1.0, 1.2.3, 4.1.130.Final, 1.local-SNAPSHOT, 1.2.13, 1.5.29
  return /\d/.test(part) && /^[\w.-]+$/.test(part)
}

function parseNode(line: string): ParsedNode | null {
  const trimmed = line.trim()
  // Remove tree structure prefixes (+-, |, etc.) that maven uses for dependency trees
  const cleanLine = trimmed.replace(/^[|\s+\\-]+/, '')

  // Check for RequireUpperBoundDeps format: groupId:artifactId:version (managed) <-- groupId:artifactId:requiredVersion
  // Or: groupId:artifactId:jar:version <-- groupId:artifactId:jar:requiredVersion
  // Or: groupId:artifactId:jar:classifier:version <-- groupId:artifactId:jar:classifier:requiredVersion
  const upperBoundMatch = cleanLine.match(/([\w.-]+:[\w.-]+(?::[\w-]+)*?):([\w.-]+)(?:\s+\(managed\))?\s*<--\s*([\w.-]+:[\w.-]+(?::[\w-]+)*?):([\w.-]+)/)
  if (upperBoundMatch) {
    const leftParts = upperBoundMatch[1].split(':')

    return {
      node: {
        groupId: leftParts[0],
        artifactId: leftParts[1],
        version: upperBoundMatch[2],
      },
      requiredVersion: upperBoundMatch[4],
    }
  }

  // Standard format: split by colon and extract components
  // Format can be: groupId:artifactId:version
  //                groupId:artifactId:type:version:scope
  //                groupId:artifactId:type:classifier:version:scope
  const parts = cleanLine.split(':')

  if (parts.length < 3) return null

  // Find the version by looking for the last part that looks like a version
  // before any optional scope at the end
  let versionIndex = -1
  const scope = parts[parts.length - 1]
  const hasScope = ['compile', 'test', 'runtime', 'provided', 'system'].includes(scope)

  // Start from the end (or one before if there's a scope) and find the version
  const searchStart = hasScope ? parts.length - 2 : parts.length - 1

  for (let i = searchStart; i >= 2; i--) {
    if (looksLikeVersion(parts[i])) {
      versionIndex = i
      break
    }
  }

  if (versionIndex === -1) return null

  return {
    node: {
      groupId: parts[0],
      artifactId: parts[1],
      version: parts[versionIndex],
      scope: hasScope ? scope : undefined,
    },
  }
}

function extractPath(lines: string[]): Array<{ node: DependencyNode; requiredVersion?: string }> {
  const path: Array<{ node: DependencyNode; requiredVersion?: string }> = []
  for (const line of lines) {
    const parsed = parseNode(line)
    if (parsed) {
      path.push(parsed)
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

    // Treat "and" and conflict headers as section separators
    if (cleanLine === SEPARATOR || CONFLICT_HEADER_PATTERN.test(cleanLine)) {
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

    const targetEntry = path[path.length - 1]
    const target = targetEntry.node
    const key = `${target.groupId}:${target.artifactId}`

    // For RequireUpperBoundDeps, use the requiredVersion as the target version
    // This is the version we need to set in dependencyManagement
    const effectiveVersion = targetEntry.requiredVersion || target.version

    if (!conflicts.has(key)) {
      conflicts.set(key, {
        target: {
          ...target,
          version: effectiveVersion,
        },
        paths: [],
        versions: [],
        highestVersion: effectiveVersion,
      })
    }

    const conflict = conflicts.get(key)!
    conflict.paths.push(path.map((p) => p.node))

    // Track both the current version and required version
    if (!conflict.versions.includes(target.version)) {
      conflict.versions.push(target.version)
    }
    if (targetEntry.requiredVersion && !conflict.versions.includes(targetEntry.requiredVersion)) {
      conflict.versions.push(targetEntry.requiredVersion)
    }
    conflict.highestVersion = findHighestVersion(conflict.versions)
  }

  const conflictList = Array.from(conflicts.values())

  if (conflictList.length === 0) {
    return { type: 'error', message: 'No conflicts found in the input' }
  }

  return { type: 'success', conflicts: conflictList }
}
