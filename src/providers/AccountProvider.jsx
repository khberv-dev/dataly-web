import {createContext, useContext, useState} from 'react'

const AccountContext = createContext(null)

export function AccountProvider({children}) {
    const [accountId, setAccountId] = useState(null)
    return (
        <AccountContext.Provider value={{accountId, setAccountId}}>
            {children}
        </AccountContext.Provider>
    )
}

export function useAccount() {
    const ctx = useContext(AccountContext)
    if (!ctx) throw new Error('useAccount must be used inside AccountProvider')
    return ctx
}
