import { useState, useCallback } from 'react'
import { TextInput } from './components/TextInput.tsx'
import { ConflictList } from './components/ConflictList.tsx'
import { XmlOutput } from './components/XmlOutput.tsx'
import { ErrorDisplay } from './components/ErrorDisplay.tsx'
import { parseMavenOutput } from './parsers/mavenParser.ts'
import { generateXml } from './utils/xmlGenerator.ts'
import type { ParseResult, GeneratedXml } from './types/index.ts'
import './App.css'

const PLACEHOLDER = `[ERROR]   +-com.google.cloud:google-cloud-core:2.64.1
[ERROR]     +-com.google.protobuf:protobuf-java-util:4.33.2
[ERROR]       +-com.google.errorprone:error_prone_annotations:2.18.0 [runtime]
[ERROR] and
...`

function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ParseResult | null>(null)

  const handleParse = useCallback(() => {
    const parseResult = parseMavenOutput(input)
    setResult(parseResult)
  }, [input])

  const xml: GeneratedXml = result?.type === 'success' 
    ? generateXml(result.conflicts) 
    : { properties: '', dependencyManagement: '' }

  return (
    <div className="app">
      <header>
        <h1>Maven Enforcer Helper</h1>
        <p>Paste your maven-enforcer-plugin error output to generate dependencyManagement XML</p>
      </header>

      <main>
        <TextInput
          value={input}
          onChange={setInput}
          placeholder={PLACEHOLDER}
        />

        <button
          className="parse-button"
          onClick={handleParse}
          disabled={!input.trim()}
          type="button"
        >
          Parse Output
        </button>

        {result?.type === 'error' && <ErrorDisplay message={result.message} />}

        {result?.type === 'success' && (
          <>
            <XmlOutput xml={xml} />
            <ConflictList conflicts={result.conflicts} />
          </>
        )}
      </main>
    </div>
  )
}

export default App
