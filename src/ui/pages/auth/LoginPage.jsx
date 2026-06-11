import {useState} from 'react'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import {useMutation} from '@tanstack/react-query'
import {Button, Card, Text, TextInput} from '@gravity-ui/uikit'
import {authApi} from '@/services/api/auth'
import {useAuth} from '@/providers/AuthProvider'
import styles from './AuthPage.module.css'

export function LoginPage() {
    const {login} = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname ?? '/'

    const [form, setForm] = useState({email: '', password: ''})
    const [error, setError] = useState(null)

    const mutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: ({accessToken}) => {
            login(accessToken)
            navigate(from, {replace: true})
        },
        onError: (err) => {
            setError(err.response?.data?.message ?? 'Login failed')
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
                    Sign in
                </Text>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label className={styles.field}>
                        <Text variant="body-2" color="secondary">Email</Text>
                        <TextInput
                            type="email"
                            value={form.email}
                            onUpdate={(v) => setForm((f) => ({...f, email: v}))}
                            size="l"
                            required
                        />
                    </label>
                    <label className={styles.field}>
                        <Text variant="body-2" color="secondary">Password</Text>
                        <TextInput
                            type="password"
                            value={form.password}
                            onUpdate={(v) => setForm((f) => ({...f, password: v}))}
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
                        Sign in
                    </Button>
                </form>
                <Text variant="body-2" className={styles.footer}>
                    No account?{' '}
                    <Link to="/register" className={styles.link}>
                        Register
                    </Link>
                </Text>
            </Card>
        </div>
    )
}
