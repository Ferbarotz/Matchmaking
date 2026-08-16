export default function Badge({ label, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-900/60 text-indigo-300 border-indigo-700',
    green: 'bg-green-900/60 text-green-300 border-green-700',
    yellow: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
    red: 'bg-red-900/60 text-red-300 border-red-700',
    slate: 'bg-slate-700 text-slate-300 border-slate-600',
    purple: 'bg-purple-900/60 text-purple-300 border-purple-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color] ?? colors.indigo}`}>
      {label}
    </span>
  )
}
