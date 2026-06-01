import client from '../client'

export const dealsApi = {
  list: () => client.get('/deals').then((r) => r.data),
  get: (id) => client.get(`/deals/${id}`).then((r) => r.data),
  sync: () => client.post('/deals/sync').then((r) => r.data),
}
