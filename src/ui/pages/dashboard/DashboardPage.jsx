import {useLayoutEffect, useMemo, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Breadcrumbs, SegmentedRadioGroup, Select, Skeleton, Table, Text} from '@gravity-ui/uikit'
import {RangeDatePicker} from '@gravity-ui/date-components'
import {dateTime} from '@gravity-ui/date-utils'
import {marketingApi} from '@/services/api/marketing'
import {useAccount} from '@/providers/AccountProvider'
import {useHeaderActions} from '@/providers/HeaderActionsProvider'
import styles from './DashboardPage.module.css'

const UZS_PER_USD = 12000
const pct = (v) => (v > 0 ? `${v.toFixed(1)}%` : '—')
const usd = (v) => (v > 0 ? `$${v.toFixed(2)}` : '—')
const num = (v) => v?.toLocaleString() ?? '0'

function formatDate(d) {
    return d.toISOString().split('T')[0]
}

const today = formatDate(new Date())
const defaultFrom = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

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
    const {accountId, setAccountId} = useAccount()
    const setActions = useHeaderActions()
    const [dateFrom, setDateFrom] = useState(defaultFrom)
    const [dateTo, setDateTo] = useState(today)
    const [level, setLevel] = useState('campaigns')
    const [campaignFilter, setCampaignFilter] = useState(null)
    const [adsetFilter, setAdsetFilter] = useState(null)
    const [sort, setSort] = useState({column: 'spendUsd', order: 'desc'})

    const {data: accounts = [], isLoading: loadingAccounts} = useQuery({
        queryKey: ['marketing-accounts'],
        queryFn: marketingApi.accounts,
    })

    useLayoutEffect(() => {
        setActions(
            <div className={styles.headerActions}>
                <RangeDatePicker
                    value={{
                        start: dateTime({input: dateFrom}),
                        end: dateTime({input: dateTo}),
                    }}
                    onUpdate={(range) => {
                        setDateFrom(range.start.format('YYYY-MM-DD'))
                        setDateTo(range.end.format('YYYY-MM-DD'))
                    }}
                    format="D MMM YYYY"
                    size="m"
                />
                {loadingAccounts ? (
                    <Skeleton className={styles.selectSkeleton}/>
                ) : (
                    <Select
                        options={accounts.map((a) => ({value: a.id, content: a.name}))}
                        value={accountId ? [accountId] : []}
                        onUpdate={([v]) => setAccountId(v)}
                        placeholder="Select account…"
                        size="m"
                    />
                )}
            </div>
        )
        return () => setActions(null)
    }, [accounts, accountId, dateFrom, dateTo, loadingAccounts, setAccountId, setActions, setDateFrom, setDateTo])

    const useAdsByAdset = level === 'ads' && !!adsetFilter
    const {data: rows = [], isLoading: loadingRows} = useQuery({
        queryKey: useAdsByAdset
            ? ['marketing-ads-by-adset', accountId, adsetFilter.id, dateFrom, dateTo]
            : [`marketing-${level}`, accountId, dateFrom, dateTo],
        queryFn: useAdsByAdset
            ? () => marketingApi.adsByAdset(accountId, adsetFilter.id, dateFrom, dateTo)
            : () => marketingApi[level](accountId, dateFrom, dateTo),
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
            {accountId && (
                <div className={styles.tableWrap}>
                    <div className={styles.tableBox}>
                        <div className={styles.tableHeader}>
                            <Breadcrumbs onAction={(key) => handleLevelChange(key)}>
                                <Breadcrumbs.Item key="campaigns">Campaigns</Breadcrumbs.Item>
                                {campaignFilter && (
                                    <Breadcrumbs.Item key="adsets">{campaignFilter.title}</Breadcrumbs.Item>
                                )}
                                {adsetFilter && (
                                    <Breadcrumbs.Item key="ads">{adsetFilter.title}</Breadcrumbs.Item>
                                )}
                            </Breadcrumbs>
                            <SegmentedRadioGroup
                                value={level}
                                onUpdate={handleLevelChange}
                                options={LEVELS}
                                size="m"
                            />
                        </div>

                        {loadingRows ? (
                            <div className={styles.skeletonRows}>
                                {Array.from({length: 8}).map((_, i) => (
                                    <Skeleton key={i} className={styles.skeletonRow}/>
                                ))}
                            </div>
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
                </div>
            )}
        </div>
    )
}
