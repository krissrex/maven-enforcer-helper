import type { Conflict, DependencyNode } from '../types/index.ts'
import './ConflictList.css'

interface ConflictListProps {
  conflicts: Conflict[]
}

function formatPath(path: DependencyNode[]): string {
  return path
    .map((node, index) => {
      const isTarget = index === path.length - 1
      const text = `${node.groupId}:${node.artifactId}:${node.version}`
      return isTarget ? `<span class="version-highlight">${text}</span>` : text
    })
    .join(' <span class="path-arrow">→</span> ')
}

export function ConflictList({ conflicts }: ConflictListProps) {
  return (
    <div className="conflict-list">
      <h2>Found {conflicts.length} Conflict(s)</h2>
      {conflicts.map((conflict, index) => (
        <div key={index} className="conflict-card">
          <div className="conflict-header">
            <p className="conflict-title">
              {conflict.target.groupId}:{conflict.target.artifactId}
            </p>
            <p className="conflict-versions">
              Versions: {conflict.versions.join(', ')} → Using: {conflict.highestVersion}
            </p>
          </div>
          <ul className="conflict-paths">
            {conflict.paths.map((path, pathIndex) => (
              <li
                key={pathIndex}
                className="conflict-path"
                dangerouslySetInnerHTML={{ __html: formatPath(path) }}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
