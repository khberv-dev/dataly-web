import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button, TextInput, Text, Card } from '@gravity-ui/uikit'
import { authApi } from '@/services/api/auth'
import { useAuth } from '@/providers/AuthProvider'
import styles from './AuthPage.module.css'

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ accessToken }) => {
      login(accessToken)
      navigate('/', { replace: true })
    },
    onError: (err) => {
      const msg = err.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Registration failed'))
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    mutation.mutate(form)
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <Text variant="header-1" className={styles.title}>
          Create account
        </Text>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <Text variant="body-2" color="secondary">Name</Text>
            <TextInput
              value={form.name}
              onUpdate={(v) => setForm((f) => ({ ...f, name: v }))}
              size="l"
              required
            />
          </label>
          <label className={styles.field}>
            <Text variant="body-2" color="secondary">Email</Text>
            <TextInput
              type="email"
              value={form.email}
              onUpdate={(v) => setForm((f) => ({ ...f, email: v }))}
              size="l"
              required
            />
          </label>
          <label className={styles.field}>
            <Text variant="body-2" color="secondary">Password</Text>
            <TextInput
              type="password"
              value={form.password}
              onUpdate={(v) => setForm((f) => ({ ...f, password: v }))}
              size="l"
              required
            />
          </label>
          {error && (
            <Text color="danger" variant="body-2">
              {error}
            </Text>
          )}
          <Button
            type="submit"
            view="action"
            size="l"
            loading={mutation.isPending}
            width="max"
          >
            Register
          </Button>
        </form>
        <Text variant="body-2" className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </Text>
      </Card>
    </div>
  )
}
