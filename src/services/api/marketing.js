import client from '../client'

export const marketingApi = {
    accounts: () => client.get('/marketing/accounts').then((r) => r.data),
    campaigns: (accountId) =>
        client.get(`/marketing/accounts/${accountId}/campaigns`).then((r) => r.data),
}
