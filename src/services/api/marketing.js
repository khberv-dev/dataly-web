import client from '../client'

export const marketingApi = {
    accounts: () => client.get('/marketing/accounts').then((r) => r.data),
    campaigns: (accountId, from, to) =>
        client.get(`/marketing/accounts/${accountId}/campaigns`, {params: {from, to}}).then((r) => r.data),
    adsets: (accountId, from, to) =>
        client.get(`/marketing/accounts/${accountId}/adsets`, {params: {from, to}}).then((r) => r.data),
    ads: (accountId, from, to) =>
        client.get(`/marketing/accounts/${accountId}/ads`, {params: {from, to}}).then((r) => r.data),
    adsByAdset: (accountId, adsetId, from, to) =>
        client.get(`/marketing/accounts/${accountId}/adsets/${adsetId}/ads`, {params: {from, to}}).then((r) => r.data),
}
