export interface DependencyNode {
  groupId: string
  artifactId: string
  version: string
  scope?: string
}

export interface Conflict {
  target: DependencyNode
  paths: DependencyNode[][]
  versions: string[]
  highestVersion: string
}

export type ParseResult =
  | { type: 'success'; conflicts: Conflict[] }
  | { type: 'error'; message: string }

export interface GeneratedXml {
  properties: string
  dependencyManagement: string
}
