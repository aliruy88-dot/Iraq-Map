interface SpinnerProps {
  label?: string
}

export function Spinner({ label }: SpinnerProps) {
  return <span className="spinner" role="status" aria-label={label ?? 'loading'} />
}
