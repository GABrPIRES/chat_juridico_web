export default function MessageInput({ onSend, disabled }:{ onSend:(t:string)=>void; disabled?:boolean }) {
  return (
    <div className="mt-3 flex">
      <input
        className="flex-1 border rounded-l px-3 py-2"
        placeholder="Digite..."
        disabled={disabled}
        onKeyDown={(e)=>{
          if(e.key==='Enter' && !disabled){
            const v = (e.target as HTMLInputElement).value
            if (v.trim()) onSend(v)
            ;(e.target as HTMLInputElement).value=''
          }
        }}
      />
      <button
        className="border border-l-0 rounded-r px-3"
        disabled={disabled}
        onClick={()=>{
          if (disabled) return
          const el = document.querySelector<HTMLInputElement>('input[placeholder="Digite..."]')
          if (el && el.value.trim()) { onSend(el.value); el.value='' }
        }}
      >
        {disabled ? 'Enviando...' : 'Enviar'}
      </button>
    </div>
  )
}
