import { useState, useCallback } from 'react'
import './XmlOutput.css'

interface XmlOutputProps {
  xml: string
}

export function XmlOutput({ xml }: XmlOutputProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(xml)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy to clipboard')
    }
  }, [xml])

  if (!xml) return null

  return (
    <div className="xml-output">
      <h2>Generated dependencyManagement XML</h2>
      <div className="xml-container">
        <button
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          type="button"
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
        <pre>{xml}</pre>
      </div>
    </div>
  )
}
