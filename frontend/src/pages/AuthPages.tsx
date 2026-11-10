import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../api/client'

const loginSchema = z.object({ email: z.email('ENTER A VALID EMAIL').max(255), password: z.string().min(1, 'PASSWORD IS REQUIRED') })
const registerSchema = z.object({
  name: z.string().trim().min(1, 'USERNAME IS REQUIRED').max(100, 'MAXIMUM 100 CHARACTERS'),
  email: z.email('ENTER A VALID EMAIL').max(255),
  password: z.string().min(8, 'MINIMUM 8 CHARACTERS').max(72, 'MAXIMUM 72 CHARACTERS'),
  confirmPassword: z.string().min(1, 'CONFIRM YOUR PASSWORD'),
}).refine(v => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'PASSWORDS DO NOT MATCH' })
type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

function AuthFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return <main className="auth-page"><div className="auth-card"><Link to="/" className="auth-brand">CANARY<span>®</span></Link><p className="eyebrow">{label} / CANARY SHOP</p>{children}<p className="auth-foot">A LITTLE LESS, A LITTLE BETTER. <Link to="/">BACK TO SHOP ↗</Link></p></div></main>
}
export function LoginPage() {
  const { login } = useAuth()
  const { error } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })
  const onSubmit = async (values: LoginValues) => {
    setBusy(true)
    try { await login(values); navigate((location.state as { from?: string } | null)?.from || '/', { replace: true }) }
    catch (e) { error(e instanceof ApiError ? e.message : 'SOMETHING WENT WRONG') }
    finally { setBusy(false) }
  }
  return <AuthFrame label="WELCOME BACK"><h1>GOOD TO<br/><em>SEE YOU.</em></h1><form onSubmit={handleSubmit(onSubmit)} noValidate>
    <label className="field"><span>EMAIL ADDRESS</span><input type="email" autoComplete="email" {...register('email')} placeholder="YOU@EXAMPLE.COM"/>{errors.email && <small>{errors.email.message}</small>}</label>
    <label className="field"><span>PASSWORD</span><input type="password" autoComplete="current-password" {...register('password')} placeholder="••••••••"/>{errors.password && <small>{errors.password.message}</small>}</label>
    <button className="button button-dark full" disabled={busy}>{busy ? 'SIGNING IN...' : 'LOGIN →'}</button>
  </form><p className="auth-switch">NEW HERE? <Link to="/register">CREATE AN ACCOUNT ↗</Link></p></AuthFrame>
}
export function RegisterPage() {
  const { register: createAccount } = useAuth()
  const { error } = useToast()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })
  const onSubmit = async ({ confirmPassword: _confirm, ...values }: RegisterValues) => {
    setBusy(true)
    try { await createAccount(values); navigate('/login', { replace: true }) }
    catch (e) {
      if (e instanceof ApiError && e.fieldErrors) Object.values(e.fieldErrors).forEach(error)
      else error(e instanceof ApiError ? e.message : 'SOMETHING WENT WRONG')
    } finally { setBusy(false) }
  }
  return <AuthFrame label="JOIN THE COLLECTION"><h1>MAKE IT<br/><em>YOURS.</em></h1><form onSubmit={handleSubmit(onSubmit)} noValidate>
    <label className="field"><span>USERNAME</span><input autoComplete="name" {...register('name')} placeholder="YOUR NAME"/>{errors.name && <small>{errors.name.message}</small>}</label>
    <label className="field"><span>EMAIL ADDRESS</span><input type="email" autoComplete="email" {...register('email')} placeholder="YOU@EXAMPLE.COM"/>{errors.email && <small>{errors.email.message}</small>}</label>
    <label className="field"><span>PASSWORD</span><input type="password" autoComplete="new-password" {...register('password')} placeholder="MIN. 8 CHARACTERS"/>{errors.password && <small>{errors.password.message}</small>}</label>
    <label className="field"><span>CONFIRM PASSWORD</span><input type="password" autoComplete="new-password" {...register('confirmPassword')} placeholder="RE-ENTER PASSWORD"/>{errors.confirmPassword && <small>{errors.confirmPassword.message}</small>}</label>
    <button className="button button-dark full" disabled={busy}>{busy ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}</button>
  </form><p className="auth-switch">ALREADY A MEMBER? <Link to="/login">LOGIN ↗</Link></p></AuthFrame>
}
