import {NavLink, Outlet, useNavigate} from 'react-router-dom'
import {Button, Text} from '@gravity-ui/uikit'
import {Key, LayoutDashboard, LogOut, Moon, Sun} from 'lucide-react'
import {useAuth} from '@/providers/AuthProvider'
import {useTheme} from '@/providers/ThemeProvider'
import styles from './AppLayout.module.css'

const NAV_ITEMS = [
    {to: '/', label: 'Dashboard', icon: LayoutDashboard},
    {to: '/keys', label: 'API Keys', icon: Key},
]

export function AppLayout() {
    const {user, logout} = useAuth()
    const {theme, toggle} = useTheme()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <div className={styles.shell}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <Text variant="header-1">Dataly</Text>
                </div>
                <nav className={styles.nav}>
                    {NAV_ITEMS.map(({to, label, icon: Icon}) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({isActive}) =>
                                [styles.navItem, isActive ? styles.active : ''].join(' ')
                            }
                        >
                            <Icon size={16}/>
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className={styles.footer}>
                    <Text variant="caption-1" color="secondary">
                        {user?.email}
                    </Text>
                    <div className={styles.footerActions}>
                        <Button view="flat" size="s" onClick={toggle}>
                            {theme === 'dark' ? <Sun size={14}/> : <Moon size={14}/>}
                        </Button>
                        <Button view="flat" size="s" onClick={handleLogout}>
                            <LogOut size={14}/>
                        </Button>
                    </div>
                </div>
            </aside>
            <main className={styles.main}>
                <Outlet/>
            </main>
        </div>
    )
}
