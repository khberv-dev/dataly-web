import client from '../client'

export const keysApi = {
    list: () => client.get('/keys').then((r) => r.data),
    get: (id) => client.get(`/keys/${id}`).then((r) => r.data),
    create: (data) => client.post('/keys', data).then((r) => r.data),
    update: (id, data) => client.patch(`/keys/${id}`, data).then((r) => r.data),
    remove: (id) => client.delete(`/keys/${id}`),
}
