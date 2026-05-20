export default function SectionLabel({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase border ${className}`}>
      {children}
    </span>
  )
}