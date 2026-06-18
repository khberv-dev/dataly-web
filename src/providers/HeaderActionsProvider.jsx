import {createContext, useContext, useState} from 'react'

const HeaderActionsStateContext = createContext(null)
const HeaderActionsSetContext = createContext(null)

export function HeaderActionsProvider({children}) {
    const [actions, setActions] = useState(null)
    return (
        <HeaderActionsSetContext.Provider value={setActions}>
            <HeaderActionsStateContext.Provider value={actions}>
                {children}
            </HeaderActionsStateContext.Provider>
        </HeaderActionsSetContext.Provider>
    )
}

export function useHeaderActions() {
    return useContext(HeaderActionsSetContext)
}

export function useHeaderActionsState() {
    return useContext(HeaderActionsStateContext)
}
