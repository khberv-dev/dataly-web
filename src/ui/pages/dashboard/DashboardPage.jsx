import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader, Select, Table, Text } from '@gravity-ui/uikit'
import { marketingApi } from '@/services/api/marketing'
import styles from './DashboardPage.module.css'

const UZS_PER_USD = 12000
const pct = (v) => (v > 0 ? `${v.toFixed(1)}%` : '—')
const usd = (v) => (v > 0 ? `$${v.toFixed(2)}` : '—')
const num = (v) => v?.toLocaleString() ?? '0'

const CAMPAIGN_COLUMNS = [
  { id: 'title', name: 'Campaign', primary: true },

  { id: 'spendUsd', name: 'Spend', template: (r) => `$${r.spendUsd?.toFixed(2)}` },
  { id: 'cpl', name: 'CPL', template: (r) => usd(r.cpl) },
  { id: 'cac', name: 'CAC', template: (r) => usd(r.cac) },
  { id: 'saleAmount', name: 'Revenue', template: (r) => num(r.saleAmount) },
  { id: 'roas', name: 'ROAS', template: (r) => (r.roas > 0 ? `${r.roas}x` : '—') },

  { id: 'reach', name: 'Reach', template: (r) => num(r.reach) },
  { id: 'frequency', name: 'Frequency', template: (r) => r.frequency?.toFixed(2) ?? '0' },
  { id: 'views', name: 'Impressions', template: (r) => num(r.views) },
  { id: 'cpm', name: 'CPM', template: (r) => usd(r.cpm) },

  { id: 'hookRate', name: 'Hook Rate', template: (r) => pct(r.hookRate) },
  { id: 'holdRate', name: 'Hold Rate', template: (r) => pct(r.holdRate) },
  { id: 'video3sec', name: '3-sec Views', template: (r) => num(r.video3sec) },
  { id: 'videoThruplay', name: 'ThruPlay', template: (r) => num(r.videoThruplay) },
  { id: 'video25', name: 'Video 25%', template: (r) => num(r.video25) },
  { id: 'video50', name: 'Video 50%', template: (r) => num(r.video50) },
  { id: 'video75', name: 'Video 75%', template: (r) => num(r.video75) },
  { id: 'video100', name: 'Video 100%', template: (r) => num(r.video100) },
  { id: 'avgVideoTime', name: 'Avg. Play Time', template: (r) => (r.avgVideoTime > 0 ? `${r.avgVideoTime}s` : '—') },

  { id: 'clicks', name: 'Clicks', template: (r) => num(r.clicks) },
  { id: 'linkClicks', name: 'Link Clicks', template: (r) => num(r.linkClicks) },
  { id: 'linkCtr', name: 'CTR (unique)', template: (r) => pct(r.linkCtr) },
  { id: 'landingPageViews', name: 'LP Views', template: (r) => num(r.landingPageViews) },
  { id: 'visitRate', name: 'Visit Rate', template: (r) => pct(r.visitRate) },
  { id: 'websiteLeads', name: 'Web Leads', template: (r) => num(r.websiteLeads) },
  { id: 'leadRate', name: 'Lead Rate', template: (r) => pct(r.leadRate) },
  { id: 'overallLeadsCount', name: 'All Leads', template: (r) => num(r.overallLeadsCount) },
  { id: 'leadsCount', name: 'Won (30d)', template: (r) => num(r.leadsCount) },
]

function computeTotal(campaigns) {
  const sum = (key) => campaigns.reduce((s, c) => s + (c[key] ?? 0), 0)

  const totalSpend = sum('spendUsd')
  const totalViews = sum('views')
  const totalReach = sum('reach')
  const totalSaleAmount = sum('saleAmount')
  const totalOverall = sum('overallLeadsCount')
  const totalWon = sum('leadsCount')
  const totalVideo3sec = sum('video3sec')
  const totalThruplay = sum('videoThruplay')
  const totalLinkClicks = sum('linkClicks')
  const totalLPV = sum('landingPageViews')
  const totalWebLeads = sum('websiteLeads')
  const spendUzs = totalSpend * UZS_PER_USD

  return {
    id: '__total__',
    isTotal: true,
    title: 'Total',
    spendUsd: totalSpend,
    cpl: totalOverall > 0 ? +(totalSpend / totalOverall).toFixed(2) : 0,
    cac: totalWon > 0 ? +(totalSpend / totalWon).toFixed(2) : 0,
    saleAmount: totalSaleAmount,
    roas: spendUzs > 0 ? +(totalSaleAmount / spendUzs).toFixed(2) : 0,
    reach: totalReach,
    frequency: totalReach > 0 ? +(totalViews / totalReach).toFixed(2) : 0,
    views: totalViews,
    cpm: totalViews > 0 ? +(totalSpend / totalViews * 1000).toFixed(2) : 0,
    hookRate: totalViews > 0 ? +(totalVideo3sec / totalViews * 100).toFixed(2) : 0,
    holdRate: totalVideo3sec > 0 ? +(totalThruplay / totalVideo3sec * 100).toFixed(2) : 0,
    video3sec: totalVideo3sec,
    videoThruplay: totalThruplay,
    video25: sum('video25'),
    video50: sum('video50'),
    video75: sum('video75'),
    video100: sum('video100'),
    avgVideoTime: 0,
    clicks: sum('clicks'),
    linkClicks: totalLinkClicks,
    linkCtr: totalViews > 0 ? +(totalLinkClicks / totalViews * 100).toFixed(2) : 0,
    landingPageViews: totalLPV,
    visitRate: totalLinkClicks > 0 ? +(totalLPV / totalLinkClicks * 100).toFixed(2) : 0,
    websiteLeads: totalWebLeads,
    leadRate: totalLPV > 0 ? +(totalWebLeads / totalLPV * 100).toFixed(2) : 0,
    overallLeadsCount: totalOverall,
    leadsCount: totalWon,
  }
}

export function DashboardPage() {
  const [accountId, setAccountId] = useState(null)

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['marketing-accounts'],
    queryFn: marketingApi.accounts,
  })

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ['marketing-campaigns', accountId],
    queryFn: () => marketingApi.campaigns(accountId),
    enabled: !!accountId,
  })

  const tableData = campaigns.length > 0 ? [...campaigns, computeTotal(campaigns)] : []

  return (
    <div className={styles.page}>
      <Text variant="header-2" className={styles.heading}>Dashboard</Text>

      <div className={styles.accountRow}>
        <label className={styles.field}>
          <Text variant="body-2" color="secondary">Ad account</Text>
          {loadingAccounts ? (
            <Loader size="s" />
          ) : (
            <Select
              options={accounts.map((a) => ({ value: a.id, content: a.name }))}
              value={accountId ? [accountId] : []}
              onUpdate={([v]) => setAccountId(v)}
              placeholder="Select account…"
              size="l"
              width="max"
            />
          )}
        </label>
      </div>

      {accountId && (
        loadingCampaigns ? (
          <Loader size="m" />
        ) : (
          <div className={styles.tableWrap}>
            <Text variant="subheader-2">Campaigns</Text>
            {campaigns.length === 0 ? (
              <Text color="secondary">No campaigns for this account.</Text>
            ) : (
              <Table
                data={tableData}
                columns={CAMPAIGN_COLUMNS}
                getRowClassNames={(row) => (row.isTotal ? [styles.totalRow] : [])}
              />
            )}
          </div>
        )
      )}
    </div>
  )
}
