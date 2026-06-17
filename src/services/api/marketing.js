import client from '../client'

export const marketingApi = {
    accounts: () => client.get('/marketing/accounts').then((r) => r.data),
    campaigns: (accountId) =>
        client.get(`/marketing/accounts/${accountId}/campaigns`).then((r) => r.data),
    adsets: (accountId) =>
        client.get(`/marketing/accounts/${accountId}/adsets`).then((r) => r.data),
    ads: (accountId) =>
        client.get(`/marketing/accounts/${accountId}/ads`).then((r) => r.data),
    adsByAdset: (accountId, adsetId) =>
        client.get(`/marketing/accounts/${accountId}/adsets/${adsetId}/ads`).then((r) => r.data),
}
