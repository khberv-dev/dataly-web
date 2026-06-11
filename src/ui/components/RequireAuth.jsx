import {Navigate, useLocation} from 'react-router-dom'
import {useAuth} from '@/providers/AuthProvider'

export function RequireAuth({children}) {
    const {token, isLoading} = useAuth()
    const location = useLocation()

    if (isLoading) return null
    if (!token) return <Navigate to="/login" state={{from: location}} replace/>
    return children
}
