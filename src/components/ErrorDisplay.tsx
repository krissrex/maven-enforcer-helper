import './ErrorDisplay.css'

interface ErrorDisplayProps {
  message: string
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="error-display">
      <p>Error: {message}</p>
    </div>
  )
}
