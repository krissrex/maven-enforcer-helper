import type { Conflict, GeneratedXml } from '../types/index.ts'

function generatePropertyName(artifactId: string): string {
  // Convert artifactId to valid XML property name
  // Replace hyphens with nothing, keep alphanumeric and underscores
  return `${artifactId.replace(/[^a-zA-Z0-9]/g, '_')}.version`
}

export function generateXml(conflicts: Conflict[]): GeneratedXml {
  if (conflicts.length === 0) {
    return { properties: '', dependencyManagement: '' }
  }

  // Generate properties section (without wrapper tags for merging into existing <properties>)
  const propertyLines = conflicts.map((conflict) => {
    const propertyName = generatePropertyName(conflict.target.artifactId)
    return `    <${propertyName}>${escapeXml(conflict.highestVersion)}</${propertyName}>`
  })

  const properties = `<!-- Dependency Convergence Overrides -->
${propertyLines.join('\n')}`

  // Generate dependencyManagement section with property references (without wrapper tags)
  const dependencyManagement = conflicts
    .map((conflict) => {
      const propertyName = generatePropertyName(conflict.target.artifactId)
      return `    <dependency>
      <groupId>${escapeXml(conflict.target.groupId)}</groupId>
      <artifactId>${escapeXml(conflict.target.artifactId)}</artifactId>
      <version>\${${propertyName}}</version>
    </dependency>`
    })
    .join('\n')

  return { properties, dependencyManagement }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
