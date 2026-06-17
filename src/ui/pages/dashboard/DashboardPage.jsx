import {useMemo, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Loader, SegmentedRadioGroup, Select, Table, Text} from '@gravity-ui/uikit'
import {marketingApi} from '@/services/api/marketing'
import styles from './DashboardPage.module.css'

const UZS_PER_USD = 12000
const pct = (v) => (v > 0 ? `${v.toFixed(1)}%` : '—')
const usd = (v) => (v > 0 ? `$${v.toFixed(2)}` : '—')
const num = (v) => v?.toLocaleString() ?? '0'

const LEVELS = [
    {value: 'campaigns', label: 'Campaigns'},
    {value: 'adsets', label: 'Ad Sets'},
    {value: 'ads', label: 'Ads'},
]

const COLUMN_DEFS = [
    {id: 'title', label: 'Name', primary: true},
    {id: 'spendUsd', label: 'Spend', fmt: (r) => `$${r.spendUsd?.toFixed(2)}`},
    {id: 'cpl', label: 'CPL', fmt: (r) => usd(r.cpl)},
    {id: 'cac', label: 'CAC', fmt: (r) => usd(r.cac)},
    {id: 'saleAmount', label: 'Revenue', fmt: (r) => num(r.saleAmount)},
    {id: 'roas', label: 'ROAS', fmt: (r) => (r.roas > 0 ? `${r.roas}x` : '—')},
    {id: 'reach', label: 'Reach', fmt: (r) => num(r.reach)},
    {id: 'frequency', label: 'Frequency', fmt: (r) => r.frequency?.toFixed(2) ?? '0'},
    {id: 'views', label: 'Impressions', fmt: (r) => num(r.views)},
    {id: 'cpm', label: 'CPM', fmt: (r) => usd(r.cpm)},
    {id: 'videoThruplay', label: 'ThruPlay', fmt: (r) => num(r.videoThruplay)},
    {id: 'video25', label: 'Video 25%', fmt: (r) => num(r.video25)},
    {id: 'video50', label: 'Video 50%', fmt: (r) => num(r.video50)},
    {id: 'video75', label: 'Video 75%', fmt: (r) => num(r.video75)},
    {id: 'video100', label: 'Video 100%', fmt: (r) => num(r.video100)},
    {id: 'avgVideoTime', label: 'Avg. Play Time', fmt: (r) => (r.avgVideoTime > 0 ? `${r.avgVideoTime}s` : '—')},
    {id: 'clicks', label: 'Clicks', fmt: (r) => num(r.clicks)},
    {id: 'linkClicks', label: 'Link Clicks', fmt: (r) => num(r.linkClicks)},
    {id: 'linkCtr', label: 'CTR (unique)', fmt: (r) => pct(r.linkCtr)},
    {id: 'overallLeadsCount', label: 'All Leads', fmt: (r) => num(r.overallLeadsCount)},
    {id: 'leadsCount', label: 'Won (30d)', fmt: (r) => num(r.leadsCount)},
]

function computeTotal(rows) {
    const sum = (key) => rows.reduce((s, c) => s + (c[key] ?? 0), 0)

    const totalSpend = sum('spendUsd')
    const totalViews = sum('views')
    const totalReach = sum('reach')
    const totalSaleAmount = sum('saleAmount')
    const totalOverall = sum('overallLeadsCount')
    const totalWon = sum('leadsCount')
    const totalThruplay = sum('videoThruplay')
    const totalLinkClicks = sum('linkClicks')
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
        videoThruplay: totalThruplay,
        video25: sum('video25'),
        video50: sum('video50'),
        video75: sum('video75'),
        video100: sum('video100'),
        avgVideoTime: 0,
        clicks: sum('clicks'),
        linkClicks: totalLinkClicks,
        linkCtr: totalViews > 0 ? +(totalLinkClicks / totalViews * 100).toFixed(2) : 0,
        overallLeadsCount: totalOverall,
        leadsCount: totalWon,
    }
}

export function DashboardPage() {
    const [accountId, setAccountId] = useState(null)
    const [level, setLevel] = useState('campaigns')
    const [campaignFilter, setCampaignFilter] = useState(null) // {id, title}
    const [adsetFilter, setAdsetFilter] = useState(null)       // {id, title}
    const [sort, setSort] = useState({column: 'spendUsd', order: 'desc'})

    const {data: accounts = [], isLoading: loadingAccounts} = useQuery({
        queryKey: ['marketing-accounts'],
        queryFn: marketingApi.accounts,
    })

    const useAdsByAdset = level === 'ads' && !!adsetFilter
    const {data: rows = [], isLoading: loadingRows} = useQuery({
        queryKey: useAdsByAdset
            ? ['marketing-ads-by-adset', accountId, adsetFilter.id]
            : [`marketing-${level}`, accountId],
        queryFn: useAdsByAdset
            ? () => marketingApi.adsByAdset(accountId, adsetFilter.id)
            : () => marketingApi[level](accountId),
        enabled: !!accountId,
    })

    function handleLevelChange(newLevel) {
        if (newLevel === 'campaigns') { setCampaignFilter(null); setAdsetFilter(null) }
        if (newLevel === 'adsets') setAdsetFilter(null)
        setLevel(newLevel)
    }

    function handleRowClick(row) {
        if (row.isTotal) return
        if (level === 'campaigns') {
            setCampaignFilter({id: row.id, title: row.title})
            setAdsetFilter(null)
            setLevel('adsets')
        } else if (level === 'adsets') {
            setAdsetFilter({id: row.id, title: row.title})
            setLevel('ads')
        }
    }

    function toggleSort(column) {
        setSort((s) => ({
            column,
            order: s.column === column && s.order === 'desc' ? 'asc' : 'desc',
        }))
    }

    const columns = useMemo(
        () =>
            COLUMN_DEFS.map((def, i) => ({
                id: def.id,
                primary: def.primary,
                sticky: i === 0 ? 'start' : undefined,
                template: def.fmt,
                name: () => (
                    <button className={styles.sortBtn} onClick={() => toggleSort(def.id)}>
                        {def.label}
                        <span className={sort.column === def.id ? styles.sortActive : styles.sortIdle}>
                            {sort.column === def.id ? (sort.order === 'desc' ? '↓' : '↑') : '↕'}
                        </span>
                    </button>
                ),
            })),
        [sort],
    )

    const sortedRows = useMemo(() => {
        let filtered = rows
        if (campaignFilter && level === 'adsets') filtered = rows.filter((r) => r.campaignId === campaignFilter.id)
        if (!filtered.length) return []
        return [...filtered].sort((a, b) => {
            const av = a[sort.column] ?? 0
            const bv = b[sort.column] ?? 0
            const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv
            return sort.order === 'asc' ? cmp : -cmp
        })
    }, [rows, sort, level, campaignFilter, adsetFilter])

    const tableData = sortedRows.length > 0
        ? [...sortedRows, computeTotal(sortedRows)]
        : []

    return (
        <div className={styles.page}>
            <Text variant="header-2" className={styles.heading}>Dashboard</Text>

            <div className={styles.accountRow}>
                <label className={styles.field}>
                    <Text variant="body-2" color="secondary">Ad account</Text>
                    {loadingAccounts ? (
                        <Loader size="s"/>
                    ) : (
                        <Select
                            options={accounts.map((a) => ({value: a.id, content: a.name}))}
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
                <div className={styles.tableWrap}>
                    <div className={styles.tableHeader}>
                        {campaignFilter || adsetFilter ? (
                            <div className={styles.breadcrumb}>
                                <button className={styles.breadcrumbBack} onClick={() => handleLevelChange('campaigns')}>
                                    Campaigns
                                </button>
                                {campaignFilter && (
                                    <>
                                        <Text variant="body-2" color="secondary">/</Text>
                                        {adsetFilter ? (
                                            <button className={styles.breadcrumbBack} onClick={() => handleLevelChange('adsets')}>
                                                {campaignFilter.title}
                                            </button>
                                        ) : (
                                            <Text variant="body-2">{campaignFilter.title}</Text>
                                        )}
                                    </>
                                )}
                                {adsetFilter && (
                                    <>
                                        <Text variant="body-2" color="secondary">/</Text>
                                        <Text variant="body-2">{adsetFilter.title}</Text>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Text variant="subheader-2">{LEVELS.find((l) => l.value === level)?.label}</Text>
                        )}
                        <SegmentedRadioGroup
                            value={level}
                            onUpdate={handleLevelChange}
                            options={LEVELS}
                            size="m"
                        />
                    </div>

                    {loadingRows ? (
                        <Loader size="m"/>
                    ) : sortedRows.length === 0 ? (
                        <Text color="secondary">No data for this account.</Text>
                    ) : (
                        <div className={styles.tableScroll}>
                            <div className={styles.tableContainer}>
                                <Table
                                    data={tableData}
                                    columns={columns}
                                    onRowClick={handleRowClick}
                                    getRowDescriptor={(row) => ({
                                        interactive: !row.isTotal,
                                        classNames: row.isTotal ? [styles.totalRow] : [],
                                    })}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
