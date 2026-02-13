import type { ChangeEvent } from 'react'
import './TextInput.css'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TextInput({ value, onChange, placeholder }: TextInputProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="text-input">
      <label htmlFor="maven-output">Paste Maven Enforcer Output:</label>
      <textarea
        id="maven-output"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  )
}
