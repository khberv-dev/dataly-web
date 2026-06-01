import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Card, Text, Loader } from '@gravity-ui/uikit'
import { RefreshCw, TrendingUp, DollarSign, MousePointerClick, Eye } from 'lucide-react'
import { adAccountsApi } from '@/services/api/adAccounts'
import { dealsApi } from '@/services/api/deals'
import styles from './DashboardPage.module.css'

function StatCard({ label, value, icon: Icon }) {
  return (
    <Card className={styles.stat}>
      <div className={styles.statIcon}>
        <Icon size={18} />
      </div>
      <Text variant="body-2" color="secondary">
        {label}
      </Text>
      <Text variant="display-1">{value ?? '—'}</Text>
    </Card>
  )
}

export function DashboardPage() {
  const qc = useQueryClient()

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['ad-accounts'],
    queryFn: adAccountsApi.list,
  })

  const { data: deals = [], isLoading: loadingDeals } = useQuery({
    queryKey: ['deals'],
    queryFn: dealsApi.list,
  })

  const syncDeals = useMutation({
    mutationFn: dealsApi.sync,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  })

  const allCampaignsQueries = useQuery({
    queryKey: ['all-campaigns', accounts.map((a) => a.id)],
    queryFn: async () => {
      const results = await Promise.all(
        accounts.map((a) => adAccountsApi.campaigns(a.id)),
      )
      return results.flat()
    },
    enabled: accounts.length > 0,
  })

  const campaigns = allCampaignsQueries.data ?? []

  const totalBudget = campaigns.reduce((s, c) => s + (c.budget ?? 0), 0)
  const totalViews = campaigns.reduce((s, c) => s + (c.views ?? 0), 0)
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks ?? 0), 0)
  const totalRevenue = deals.reduce((s, d) => s + (d.price ?? 0), 0)

  const isLoading = loadingAccounts || loadingDeals

  return (
    <div>
      <div className={styles.header}>
        <Text variant="header-2">Dashboard</Text>
        <Button
          view="outlined"
          size="s"
          loading={syncDeals.isPending}
          onClick={() => syncDeals.mutate()}
        >
          <RefreshCw size={14} />
          Sync deals
        </Button>
      </div>

      {isLoading ? (
        <Loader size="m" />
      ) : (
        <>
          <div className={styles.grid}>
            <StatCard label="Total budget" value={`$${totalBudget.toLocaleString()}`} icon={DollarSign} />
            <StatCard label="Impressions" value={totalViews.toLocaleString()} icon={Eye} />
            <StatCard label="Clicks" value={totalClicks.toLocaleString()} icon={MousePointerClick} />
            <StatCard label="Deal revenue" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} />
          </div>

          <div className={styles.section}>
            <Text variant="subheader-2">Recent Deals</Text>
            {deals.length === 0 ? (
              <Text color="secondary">No deals synced yet.</Text>
            ) : (
              <div className={styles.list}>
                {deals.slice(0, 10).map((deal) => (
                  <Card key={deal.id} className={styles.row}>
                    <Text variant="body-2">{deal.title}</Text>
                    <Text variant="body-2" color="secondary">
                      ${deal.price?.toLocaleString()}
                    </Text>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <Text variant="subheader-2">Campaigns</Text>
            {campaigns.length === 0 ? (
              <Text color="secondary">No campaigns synced yet. Go to Ad Accounts to sync.</Text>
            ) : (
              <div className={styles.list}>
                {campaigns.slice(0, 10).map((c) => (
                  <Card key={c.id} className={styles.row}>
                    <Text variant="body-2">{c.title}</Text>
                    <Text variant="body-2" color="secondary">
                      {c.clicks?.toLocaleString()} clicks · ${c.budget?.toLocaleString()} budget
                    </Text>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
