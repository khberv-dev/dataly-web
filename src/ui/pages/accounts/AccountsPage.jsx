import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Text, Loader, Table } from '@gravity-ui/uikit'
import { RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
import { adAccountsApi } from '@/services/api/adAccounts'
import styles from './AccountsPage.module.css'

function CampaignTable({ adAccountId }) {
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', adAccountId],
    queryFn: () => adAccountsApi.campaigns(adAccountId),
  })

  const qc = useQueryClient()
  const sync = useMutation({
    mutationFn: () => adAccountsApi.syncCampaigns(adAccountId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns', adAccountId] }),
  })

  if (isLoading) return <Loader size="s" />

  return (
    <div className={styles.campaigns}>
      <div className={styles.campaignHeader}>
        <Text variant="subheader-1">Campaigns ({campaigns.length})</Text>
        <Button view="outlined" size="xs" loading={sync.isPending} onClick={() => sync.mutate()}>
          <RefreshCw size={12} />
          Sync
        </Button>
      </div>
      {campaigns.length === 0 ? (
        <Text color="secondary" variant="body-2">
          No campaigns. Click Sync to fetch from Meta.
        </Text>
      ) : (
        <Table
          data={campaigns}
          columns={[
            { id: 'title', name: 'Campaign', primary: true },
            { id: 'budget', name: 'Budget', template: (r) => `$${r.budget?.toLocaleString()}` },
            { id: 'views', name: 'Impressions', template: (r) => r.views?.toLocaleString() },
            { id: 'clicks', name: 'Clicks', template: (r) => r.clicks?.toLocaleString() },
          ]}
        />
      )}
    </div>
  )
}

export function AccountsPage() {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState(null)

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['ad-accounts'],
    queryFn: adAccountsApi.list,
  })

  const sync = useMutation({
    mutationFn: adAccountsApi.sync,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ad-accounts'] }),
  })

  function toggle(id) {
    setExpanded((cur) => (cur === id ? null : id))
  }

  return (
    <div>
      <div className={styles.header}>
        <Text variant="header-2">Ad Accounts</Text>
        <Button view="action" size="s" loading={sync.isPending} onClick={() => sync.mutate()}>
          <RefreshCw size={14} />
          Sync accounts
        </Button>
      </div>

      {isLoading ? (
        <Loader size="m" />
      ) : accounts.length === 0 ? (
        <Text color="secondary">No ad accounts. Click "Sync accounts" to fetch from Meta.</Text>
      ) : (
        <div className={styles.list}>
          {accounts.map((account) => (
            <Card key={account.id} className={styles.account}>
              <button
                className={styles.accountHeader}
                onClick={() => toggle(account.id)}
              >
                <div className={styles.accountInfo}>
                  {expanded === account.id ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                  <Text variant="subheader-2">{account.name}</Text>
                  <Text variant="body-2" color="secondary">
                    #{account.accountId}
                  </Text>
                </div>
              </button>
              {expanded === account.id && (
                <CampaignTable adAccountId={account.id} />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
