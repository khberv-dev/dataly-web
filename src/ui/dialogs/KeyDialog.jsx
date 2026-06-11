import {useEffect, useState} from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {Button, Dialog, Select, Text, TextInput} from '@gravity-ui/uikit'
import {keysApi} from '@/services/api/keys'

const KEY_TYPE_OPTIONS = [
    {value: 'meta', content: 'Meta (Facebook)'},
    {value: 'amocrm', content: 'amoCRM'},
]

export function KeyDialog({open, onClose, existing}) {
    const qc = useQueryClient()
    const isEdit = !!existing

    const [form, setForm] = useState({type: 'meta', key: ''})
    const [error, setError] = useState(null)

    useEffect(() => {
        if (existing) {
            setForm({type: existing.type, key: existing.key})
        } else {
            setForm({type: 'meta', key: ''})
        }
        setError(null)
    }, [existing, open])

    const mutation = useMutation({
        mutationFn: isEdit
            ? (data) => keysApi.update(existing.id, data)
            : keysApi.create,
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ['keys']})
            onClose()
        },
        onError: (err) => {
            const msg = err.response?.data?.message
            setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Save failed'))
        },
    })

    function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        mutation.mutate(form)
    }

    return (
        <Dialog open={open} onClose={onClose} size="s">
            <Dialog.Header caption={isEdit ? 'Edit API key' : 'Add API key'}/>
            <Dialog.Body>
                <form id="key-form" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 14}}>
                    <label style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                        <Text variant="body-2" color="secondary">Type</Text>
                        <Select
                            value={[form.type]}
                            onUpdate={([v]) => setForm((f) => ({...f, type: v}))}
                            options={KEY_TYPE_OPTIONS}
                            size="l"
                            disabled={isEdit}
                            width="max"
                        />
                    </label>
                    <label style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                        <Text variant="body-2" color="secondary">API Key</Text>
                        <TextInput
                            value={form.key}
                            onUpdate={(v) => setForm((f) => ({...f, key: v}))}
                            size="l"
                            required
                        />
                    </label>
                    {error && (
                        <Text color="danger" variant="body-2">
                            {error}
                        </Text>
                    )}
                </form>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonApply={() => {
                }}
                renderButtons={() => (
                    <>
                        <Button view="flat" size="l" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            view="action"
                            size="l"
                            type="submit"
                            form="key-form"
                            loading={mutation.isPending}
                        >
                            {isEdit ? 'Save' : 'Add'}
                        </Button>
                    </>
                )}
            />
        </Dialog>
    )
}
