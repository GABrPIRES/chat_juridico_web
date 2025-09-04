'use client'
import { useState, useEffect, FormEvent } from 'react'

export default function PerfilPage() {
  // States para o formulário de dados pessoais
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false)

  // States para o formulário de senha
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)

  // Carrega os dados do usuário ao iniciar a página
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) throw new Error('Falha ao carregar perfil')
        const data = await res.json()
        setName(data.name)
        setEmail(data.email)
      } catch (error) {
        console.error(error)
        alert('Não foi possível carregar os dados do seu perfil.')
      }
    }
    fetchProfile()
  }, [])

  // Função para atualizar nome e e-mail
  async function handleUpdateDetails(e: FormEvent) {
    e.preventDefault()
    setIsSubmittingDetails(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { name, email } }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.errors?.join(', ') || 'Erro desconhecido')
      }
      alert('Dados atualizados com sucesso!')
    } catch (e: any) {
      alert(`Erro: ${e.message}`)
    } finally {
      setIsSubmittingDetails(false)
    }
  }

  // Função para atualizar a senha
  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword !== passwordConfirmation) {
      alert('A nova senha e a confirmação não correspondem.')
      return
    }
    setIsSubmittingPassword(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: passwordConfirmation,
          },
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.errors?.join(', ') || 'Erro desconhecido')
      }
      alert('Senha alterada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setPasswordConfirmation('')
    } catch (e: any) {
      alert(`Erro: ${e.message}`)
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  return (
    <main className="p-6 space-y-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Editar Perfil</h1>
      
      {/* Formulário de Dados Pessoais */}
      <section>
        <form onSubmit={handleUpdateDetails} className="space-y-4 bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold">Dados Pessoais</h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={isSubmittingDetails}>
            {isSubmittingDetails ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </section>

      {/* Formulário de Senha */}
      <section>
        <form onSubmit={handleUpdatePassword} className="space-y-4 bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold">Alterar Senha</h2>
          <div>
            <label htmlFor="currentPassword"  className="block text-sm font-medium text-gray-700">Senha Atual</label>
            <input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="newPassword"  className="block text-sm font-medium text-gray-700">Nova Senha</label>
            <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="passwordConfirmation"  className="block text-sm font-medium text-gray-700">Confirme a Nova Senha</label>
            <input id="passwordConfirmation" type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={isSubmittingPassword}>
            {isSubmittingPassword ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </section>
    </main>
  )
}