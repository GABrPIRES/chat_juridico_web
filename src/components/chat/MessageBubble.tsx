export default function MessageBubble({ from, text }:{ from:'client'|'user'|'ia'; text:string }) {
  const isSelf = from === 'user'
  const base = 'max-w-[70%] rounded px-3 py-2 text-sm'
  const cls = isSelf ? 'bg-blue-100 self-end' : from==='ia' ? 'bg-gray-100 self-start' : 'bg-white border self-start'
  return <div className={`${base} ${cls}`}>{text}</div>
}
