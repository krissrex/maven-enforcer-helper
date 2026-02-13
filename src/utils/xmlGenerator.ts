import type { Conflict } from '../types/index.ts'

export function generateXml(conflicts: Conflict[]): string {
  if (conflicts.length === 0) return ''

  const dependencies = conflicts
    .map((conflict) => {
      const { target, highestVersion } = conflict
      return `    <dependency>
      <groupId>${escapeXml(target.groupId)}</groupId>
      <artifactId>${escapeXml(target.artifactId)}</artifactId>
      <version>${escapeXml(highestVersion)}</version>
    </dependency>`
    })
    .join('\n')

  return `<dependencyManagement>
  <dependencies>
${dependencies}
  </dependencies>
</dependencyManagement>`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
