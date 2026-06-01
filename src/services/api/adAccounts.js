import client from '../client'

export const adAccountsApi = {
  list: () => client.get('/ad-accounts').then((r) => r.data),
  get: (id) => client.get(`/ad-accounts/${id}`).then((r) => r.data),
  sync: () => client.post('/ad-accounts/sync').then((r) => r.data),
  campaigns: (adAccountId) =>
    client.get(`/ad-accounts/${adAccountId}/campaigns`).then((r) => r.data),
  syncCampaigns: (adAccountId) =>
    client.post(`/ad-accounts/${adAccountId}/campaigns/sync`).then((r) => r.data),
}
