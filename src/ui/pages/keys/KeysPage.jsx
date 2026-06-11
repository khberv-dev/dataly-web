import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Card, Label, Loader, Text} from '@gravity-ui/uikit'
import {Pencil, Plus, Trash2} from 'lucide-react'
import {keysApi} from '@/services/api/keys'
import {KeyDialog} from '@/ui/dialogs/KeyDialog'
import styles from './KeysPage.module.css'

const TYPE_THEME = {meta: 'info', amocrm: 'warning'}

export function KeysPage() {
    const qc = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState(null)

    const {data: keys = [], isLoading} = useQuery({
        queryKey: ['keys'],
        queryFn: keysApi.list,
    })

    const remove = useMutation({
        mutationFn: keysApi.remove,
        onSuccess: () => qc.invalidateQueries({queryKey: ['keys']}),
    })

    function openAdd() {
        setEditing(null)
        setDialogOpen(true)
    }

    function openEdit(key) {
        setEditing(key)
        setDialogOpen(true)
    }

    return (
        <div>
            <div className={styles.header}>
                <Text variant="header-2">API Keys</Text>
                <Button view="action" size="s" onClick={openAdd} disabled={keys.length >= 2}>
                    <Plus size={14}/>
                    Add key
                </Button>
            </div>

            {isLoading ? (
                <Loader size="m"/>
            ) : keys.length === 0 ? (
                <Text color="secondary">No keys configured. Add a Meta and amoCRM key to start syncing.</Text>
            ) : (
                <div className={styles.list}>
                    {keys.map((k) => (
                        <Card key={k.id} className={styles.row}>
                            <div className={styles.rowLeft}>
                                <Label theme={TYPE_THEME[k.type] ?? 'normal'}>{k.type}</Label>
                                <Text variant="code-1" className={styles.keyValue}>
                                    {k.key}
                                </Text>
                            </div>
                            <div className={styles.rowActions}>
                                <Button view="flat" size="s" onClick={() => openEdit(k)}>
                                    <Pencil size={14}/>
                                </Button>
                                <Button
                                    view="flat"
                                    size="s"
                                    loading={remove.isPending && remove.variables === k.id}
                                    onClick={() => remove.mutate(k.id)}
                                >
                                    <Trash2 size={14}/>
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <KeyDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                existing={editing}
            />
        </div>
    )
}
