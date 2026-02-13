import { useState, useCallback } from 'react'
import type { GeneratedXml } from '../types/index.ts'
import './XmlOutput.css'

interface XmlOutputProps {
  xml: GeneratedXml
}

export function XmlOutput({ xml }: XmlOutputProps) {
  const [copiedProperties, setCopiedProperties] = useState(false)
  const [copiedDeps, setCopiedDeps] = useState(false)

  const handleCopyProperties = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(xml.properties)
      setCopiedProperties(true)
      setTimeout(() => setCopiedProperties(false), 2000)
    } catch {
      console.error('Failed to copy properties to clipboard')
    }
  }, [xml.properties])

  const handleCopyDeps = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(xml.dependencyManagement)
      setCopiedDeps(true)
      setTimeout(() => setCopiedDeps(false), 2000)
    } catch {
      console.error('Failed to copy dependencyManagement to clipboard')
    }
  }, [xml.dependencyManagement])

  if (!xml.properties || !xml.dependencyManagement) return null

  return (
    <div className="xml-output">
      <h2>Generated Maven Configuration</h2>
      
      <div className="xml-section">
        <h3>Properties (add to &lt;properties&gt; section)</h3>
        <div className="xml-container">
          <button
            className={`copy-button ${copiedProperties ? 'copied' : ''}`}
            onClick={handleCopyProperties}
            type="button"
          >
            {copiedProperties ? 'Copied!' : 'Copy Properties'}
          </button>
          <pre>{xml.properties}</pre>
        </div>
      </div>

      <div className="xml-section">
        <h3>Dependency Management (add to &lt;dependencyManagement&gt; section)</h3>
        <div className="xml-container">
          <button
            className={`copy-button ${copiedDeps ? 'copied' : ''}`}
            onClick={handleCopyDeps}
            type="button"
          >
            {copiedDeps ? 'Copied!' : 'Copy Dependencies'}
          </button>
          <pre>{xml.dependencyManagement}</pre>
        </div>
      </div>
    </div>
  )
}
