// src/app/dashboard/colaborador/page.tsx
export default function ColaboradorHome() {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">Home do Colaborador</h1>
        <ul className="mt-3 list-disc pl-6 text-sm">
          <li><a href="/dashboard/colaborador/clientes">Clientes</a></li>
          <li><a href="/dashboard/colaborador/permissoes">Permissões</a></li>
        </ul>
      </main>
    )
  }
  
  