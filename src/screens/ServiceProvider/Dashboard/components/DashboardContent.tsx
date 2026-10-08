import React, { memo, useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Heading,
  LucideIcon,
  Pressable,
  Button,
  ButtonText,
} from '@ui';
import { ScrollView, ActivityIndicator } from 'react-native';
import Select from '@components/ui/Inputs/Select';
import SimpleGroupedBarChart from '@components/charts/SimpleGroupedBarChart';
import SimpleBarChart from '@components/charts/SimpleBarChart';
import { useNavigation } from '@react-navigation/native';
import { getProvincesList, getSitesByProvince } from '../../../../services/usersService';
import {
  getTrainingSessions,
  getAssets,
} from '../../../../services/SupportOfferingsServices/supportOfferingsService';
import {
  getSupportRequests,
  getDashboardScope,
  type DashboardScope,
} from '../../../../services/serviceProvider/serviceProviderService';
import {
  getSupportCategories,
  getSessionCategories,
  getAdditionalServiceCategories,
  getLivelihoodsOptions,
  type MentoringOption,
} from '../../../../services/mentoringService';
import { SUPPORT_CATEGORIES } from '@constants/SUPPORT_PROVIDER_CARDS';
import styles from '../styles';

// Sub-categories of each support type: Pillars (trainings), service categories and livelihood categories (assets)
const SUB_CATEGORY_FETCHERS: Record<string, () => Promise<MentoringOption[]>> = {
  [SUPPORT_CATEGORIES.TRAINING]: getSessionCategories,
  [SUPPORT_CATEGORIES.ADDITIONAL_SERVICE]: getAdditionalServiceCategories,
  [SUPPORT_CATEGORIES.ASSET]: getLivelihoodsOptions,
};

const BENCHMARK_MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const BENCHMARK_APPROVED = [120, 150, 180, 210, 240, 270];
const BENCHMARK_DELIVERED = [95, 130, 160, 190, 215, 250];

interface ProvinceFulfillmentItem {
  province: string;
  delivered: number;
  committed: number;
}

// TODO: Committed is not captured per province yet, replace this dummy once the backend provides it
const DUMMY_PROVINCE_COMMITTED = 100;

const formatCurrency = (val: number): string => {
  return Number(val || 0).toLocaleString('en-ZA');
};

// Committed is null when a province or site filter is applied, shown as "-"
const formatCommitted = (val: number | null): string => {
  return val === null ? '-' : formatCurrency(val);
};

// Percentage of value against base, 0 when base is empty, null when either is null e.g. getPercent(87, 100) -> 87
const getPercent = (value: number | null, base: number | null): number | null => {
  if (value === null || base === null) return null;
  return base > 0 ? Math.round((value / base) * 100) : 0;
};

const formatPercent = (pct: number | null): string => {
  return pct === null ? '-' : `${pct}%`;
};

// Coverage badge text, capped at 100% with the extra shown as surplus e.g. 120 -> "100% (+20% Surplus)"
const formatCoverage = (coverage: number | null): string => {
  if (coverage === null) return '-';
  return coverage > 100 ? `100% (+${coverage - 100}% Surplus)` : `${coverage}%`;
};

// Rows of the Disaggregated Delivery Summary table, keyed by the scope API categories
const SUMMARY_CATEGORY_ROWS = [
  { key: SUPPORT_CATEGORIES.TRAINING, label: 'Training/Sessions', dotStyle: 'categoryDotPurple', rowStyle: 'summaryBodyRow' },
  { key: SUPPORT_CATEGORIES.ADDITIONAL_SERVICE, label: 'Additional Services', dotStyle: 'categoryDotBlue', rowStyle: 'summaryBodyRowAlt' },
  { key: SUPPORT_CATEGORIES.ASSET, label: 'Assets', dotStyle: 'categoryDotAmber', rowStyle: 'summaryBodyRow' },
] as const;

interface DashboardContentProps {
  activeTab?: 'overview' | 'assets';
  onTabChange?: (tab: 'overview' | 'assets') => void;
  hideHeaderTabs?: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab: propActiveTab,
  onTabChange: propOnTabChange,
  hideHeaderTabs = false,
}) => {
  const navigation = useNavigation();

  // Top Tabs: 'overview' | 'assets'
  const [internalActiveTab, setInternalActiveTab] = useState<'overview' | 'assets'>('overview');
  const activeTab = propActiveTab !== undefined ? propActiveTab : internalActiveTab;
  const setActiveTab = propOnTabChange || setInternalActiveTab;

  // Filter States
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [selectedSupportType, setSelectedSupportType] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');

  // Dynamic Options from API
  const [provinceOptions, setProvinceOptions] = useState<{ label: string; value: string }[]>([
    { label: 'All Provinces', value: 'all' },
  ]);
  const [siteOptions, setSiteOptions] = useState<{ label: string; value: string }[]>([
    { label: 'All Sites', value: 'all' },
  ]);
  const [supportTypeOptions, setSupportTypeOptions] = useState<{ label: string; value: string }[]>([
    { label: 'All Support Types', value: 'all' },
  ]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<{ label: string; value: string }[]>([
    { label: 'All Sub-Categories', value: 'all' },
  ]);

  // Asset View Tab: 'published' | 'coach-requests'
  const [assetViewTab, setAssetViewTab] = useState<'published' | 'coach-requests'>('published');
  const [coachRequests, setCoachRequests] = useState<any[]>([]);
  const [publishedAssets, setPublishedAssets] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);

  // Rows shown in the asset tables, "Load More" shows the next ASSET_TABLE_PAGE_SIZE rows
  const ASSET_TABLE_PAGE_SIZE = 5;
  const [assetVisibleCount, setAssetVisibleCount] = useState<number>(ASSET_TABLE_PAGE_SIZE);
  const [coachVisibleCount, setCoachVisibleCount] = useState<number>(ASSET_TABLE_PAGE_SIZE);

  // KPI scope numbers (needed, committed, approved, delivered) from backend
  const [scope, setScope] = useState<DashboardScope>({
    needed: 0,
    committed: 0,
    approved: 0,
    delivered: 0,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchScope = async () => {
      const result = await getDashboardScope({
        province: selectedProvince === 'all' ? undefined : selectedProvince,
        site: selectedSite === 'all' ? undefined : selectedSite,
        type: selectedSupportType === 'all' ? undefined : selectedSupportType,
      });
      if (isMounted && result) setScope(result);
    };
    fetchScope();
    return () => {
      isMounted = false;
    };
  }, [selectedProvince, selectedSite, selectedSupportType]);

  const coveragePct = getPercent(scope.committed, scope.needed);
  const deliveryPct = getPercent(scope.delivered, scope.committed);

  // Delivered per province from scope API, named using the provinces list
  const provinceFulfillment: ProvinceFulfillmentItem[] = useMemo(() => {
    return Object.entries(scope.provinces || {})
      .map(([provinceId, counts]) => ({
        province: provinceOptions.find((p) => p.value === provinceId)?.label || provinceId,
        delivered: counts.delivered,
        committed: DUMMY_PROVINCE_COMMITTED,
      }))
      .sort((a, b) => b.delivered - a.delivered);
  }, [scope.provinces, provinceOptions]);

  // 1. Fetch Dynamic Provinces from Backend
  useEffect(() => {
    let isMounted = true;
    const fetchProvinces = async () => {
      try {
        const provinces = await getProvincesList();
        if (isMounted && provinces && provinces.length > 0) {
          const formatted = [
            { label: 'All Provinces', value: 'all' },
            ...provinces.map((p: any) => ({
              label: p.metaInformation?.name || p.name || p.title || p.label,
              value: p._id || p.id || p.value,
            })),
          ];
          setProvinceOptions(formatted);
        }
      } catch (err) {
        console.warn('[Dashboard] Could not fetch dynamic provinces, using default', err);
      }
    };
    fetchProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Dynamic Sites based on selected Province, all sites when no province is selected
  useEffect(() => {
    let isMounted = true;
    const fetchSites = async () => {
      try {
        const res = await getSitesByProvince({
          provinceId: selectedProvince === 'all' ? undefined : selectedProvince,
          page: 1,
          limit: 100,
        });
        const sites = res?.result?.data || [];
        if (isMounted) {
          if (sites.length > 0) {
            setSiteOptions([
              { label: 'All Sites', value: 'all' },
              ...sites.map((s: any) => ({
                label: s.name || s.title || s.label,
                value: s._id || s.id || s.value,
              })),
            ]);
          } else {
            setSiteOptions([{ label: 'All Sites', value: 'all' }]);
          }
        }
      } catch (err) {
        console.warn('[Dashboard] Could not fetch dynamic sites, using default', err);
        setSiteOptions([{ label: 'All Sites', value: 'all' }]);
      }
    };
    fetchSites();
    return () => {
      isMounted = false;
    };
  }, [selectedProvince]);

  // Support types from the support_offering_type entity type
  useEffect(() => {
    let isMounted = true;
    getSupportCategories()
      .then((types) => {
        if (!isMounted || !types?.length) return;
        setSupportTypeOptions([
          { label: 'All Support Types', value: 'all' },
          ...types.map((type) => ({ label: type.label, value: type.value })),
        ]);
      })
      .catch((err) => console.warn('[Dashboard] Could not fetch support types', err));
    return () => {
      isMounted = false;
    };
  }, []);

  // Sub-categories of the selected support type, of every support type when none is selected
  useEffect(() => {
    let isMounted = true;
    const fetchers =
      selectedSupportType === 'all'
        ? Object.values(SUB_CATEGORY_FETCHERS)
        : [SUB_CATEGORY_FETCHERS[selectedSupportType]].filter(Boolean);
    Promise.all(fetchers.map((fetcher) => fetcher().catch(() => [] as MentoringOption[]))).then((results) => {
      if (!isMounted) return;
      const seen = new Set<string>();
      const subCategories = results
        .flat()
        .filter((c) => (c?.value && !seen.has(c.value) ? (seen.add(c.value), true) : false));
      setSubCategoryOptions([
        { label: 'All Sub-Categories', value: 'all' },
        ...subCategories.map((c) => ({ label: c.label, value: c.value })),
      ]);
    });
    return () => {
      isMounted = false;
    };
  }, [selectedSupportType]);

  // 3. Fetch Real Upcoming Sessions from Mentor/Training Sessions API & generate Activity Logs
  useEffect(() => {
    let isMounted = true;
    const fetchSessions = async () => {
      try {
        setLoadingSessions(true);
        // Fetch sessions without restrictive status filter so all available sessions are received
        const res = await getTrainingSessions({
          page: 1,
          limit: 20,
        });
        const apiData = res?.result?.data || [];
        if (isMounted && apiData.length > 0) {
          const nowMs = Date.now();

          // Map items and compute start timestamp
          const parsedSessions = apiData.map((item: any, idx: number) => {
            const rawStart = item.start_date;
            const startMs = rawStart
              ? (typeof rawStart === 'number' || !isNaN(Number(rawStart)))
                ? Number(rawStart) * (Number(rawStart) < 10000000000 ? 1000 : 1)
                : new Date(rawStart).getTime()
              : null;

            const rawEnd = item.end_date;
            const endMs = rawEnd
              ? (typeof rawEnd === 'number' || !isNaN(Number(rawEnd)))
                ? Number(rawEnd) * (Number(rawEnd) < 10000000000 ? 1000 : 1)
                : new Date(rawEnd).getTime()
              : null;

            let formattedDate = 'TBD';
            let formattedTime = item.meeting_info?.time || '09:00 - 12:00';
            if (startMs) {
              const d = new Date(startMs);
              formattedDate = d.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const startHours = String(d.getHours()).padStart(2, '0');
              const startMinutes = String(d.getMinutes()).padStart(2, '0');
              if (endMs) {
                const endD = new Date(endMs);
                const endHours = String(endD.getHours()).padStart(2, '0');
                const endMinutes = String(endD.getMinutes()).padStart(2, '0');
                formattedTime = `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
              } else {
                formattedTime = `${startHours}:${startMinutes}`;
              }
            }

            const rawStatus = String(item.status || '').toUpperCase();
            const isCompleted = rawStatus === 'COMPLETED' || (endMs && nowMs > endMs);
            const isCancelled = rawStatus === 'CANCELLED';
            const isUpcoming = !isCancelled && !isCompleted;

            const rawDeliveryMode =
              typeof item.delivery_mode === 'object'
                ? item.delivery_mode?.label || item.delivery_mode?.value || item.delivery_mode?.name || ''
                : typeof item.delivery_mode === 'string'
                ? item.delivery_mode
                : '';

            const rawLocation =
              typeof item.location === 'object'
                ? item.location?.name || item.location?.label || item.location?.value || ''
                : typeof item.location === 'string'
                ? item.location
                : '';

            const meetingLocation =
              item.meeting_info?.location ||
              (item as any).meeting_info_details?.location ||
              '';

            const resolvedLocation =
              rawLocation ||
              meetingLocation ||
              (rawDeliveryMode ? rawDeliveryMode.charAt(0).toUpperCase() + rawDeliveryMode.slice(1) : 'Offline');

            return {
              id: item.id || item._id || `SES-${idx + 1}`,
              title: item.title || item.name || 'Training Session',
              date: formattedDate,
              time: formattedTime,
              participants: item.seats_limit || item.seats || 25,
              location: resolvedLocation,
              startMs: startMs || 0,
              isUpcoming,
              status: rawStatus,
              createdDate: formattedDate,
            };
          });

          // Filter for upcoming sessions (future/active), sort by date ascending
          const upcoming = parsedSessions
            .filter((s: any) => s.isUpcoming)
            .sort((a: any, b: any) => (a.startMs || 0) - (b.startMs || 0));

          // If no upcoming found, take the most recent available sessions as fallback
          const displaySessions = (upcoming.length > 0 ? upcoming : parsedSessions).slice(0, 5);
          setUpcomingSessions(displaySessions);

          // Populate Recent Activity & System Logs from latest sessions
          const logs = parsedSessions.slice(0, 5).map((s: any, idx: number) => ({
            id: `LOG-${s.id}-${idx}`,
            title: `Session scheduled: ${s.title}`,
            timestamp: s.date !== 'TBD' ? s.date : 'Recently',
            description: `Session scheduled for ${s.participants} participants • ${s.location}`,
          }));
          setRecentLogs(logs);
        }
      } catch (err) {
        console.warn('[Dashboard] Could not fetch real upcoming sessions', err);
      } finally {
        if (isMounted) setLoadingSessions(false);
      }
    };
    fetchSessions();
    return () => {
      isMounted = false;
    };
  }, []);

  // 4. Fetch Real Assets from SupportOfferings / Assets API
  useEffect(() => {
    let isMounted = true;
    const fetchAssetData = async () => {
      try {
        setLoadingAssets(true);
        const res = await getAssets({ page: 1, limit: 100 });
        const apiData = res?.result?.data || [];
        if (isMounted && apiData.length > 0) {
          // Real values of the asset; missing ones stay null and are shown as "-" in the table.
          // Approved and delivered value per asset are not available (requests are not linked to an asset).
          const mapped = apiData
            .filter((item: any) => String(item.status).toUpperCase() !== 'CANCELLED')
            .map((item: any) => ({
              id: item.id,
              datePublished: item.createdAt ? String(item.createdAt).slice(0, 10) : '-',
              assetTitle: item.title || '-',
              subCategory: item.type || '-',
              unitValue: item.estimatedValuePerParticipant ?? null,
              availableQuantity: item.quantity ?? null,
              adminStatus: item.status === 'Pending' ? 'pending' : 'approved',
            }));
          setPublishedAssets(mapped);
        }
      } catch (err) {
        console.warn('[Dashboard] Could not fetch real assets, keeping fallback', err);
      } finally {
        if (isMounted) setLoadingAssets(false);
      }
    };
    fetchAssetData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 5. Fetch Real Coach Support Requests from API
  useEffect(() => {
    let isMounted = true;
    const fetchCoachReqs = async () => {
      try {
        const res = await getSupportRequests({ tab: 'assets' as any });
        const apiReqs = res?.data || [];
        if (isMounted && apiReqs.length > 0) {
          const mapped = apiReqs.map((r: any, idx: number) => ({
            id: String(r.id || `CAR-${500 + idx}`),
            coachName: r.coach || 'Coach',
            coachOrg: r.site || r.location || 'Community Hub',
            requestedItem: r.title || 'Physical Asset Request',
            quantity: r.participantsCount || r.participants || 2,
            unitValue: 3500,
            totalValue: (r.participantsCount || 2) * 3500,
            requestDate: r.requestedDate || r.preferredDate || '2026-05-02',
            status: (r.status === 'accepted' || r.status === 'approved' ? 'approved' : r.status === 'declined' ? 'declined' : 'pending') as 'pending' | 'approved' | 'declined',
            // Kept for Approve: the accept API needs the request's own title/province/sites/category
            source: r,
          }));
          setCoachRequests(mapped);
        }
      } catch (err) {
        console.warn('[Dashboard] Could not fetch real coach requests, keeping fallback', err);
      }
    };
    fetchCoachReqs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Asset Financial Totals - approved asset requests from scope API (value of a request = estimated value x quantity)
  // Delivered value is not calculated yet and is shown as "-"
  const approvedAssetsValue = scope.assets?.approved.value || 0;
  // const deliveredAssetsValue = scope.assets?.delivered.value || 0;
  const pendingRequestsValue = scope.assets?.pending.value || 0;

  // Total Asset Pool = Published Assets Value - (Approved + Pending Requests Value) (delivered not counted yet)
  // TODO: Total pool is shown as "-" until delivered value is calculated
  // const totalFundPool = scope.assets?.pool || 0;
  const publishedAssetsCount = scope.assets?.published.count || 0;

  return (
    <VStack {...styles.rootContainer}>
      {/* 1. Dashboard View Tabs (if not rendered in header) */}
      {!hideHeaderTabs && (
        <HStack {...styles.tabContainer}>
          <Pressable
            {...styles.tabButton}
            {...(activeTab === 'overview' ? styles.tabButtonActive : styles.tabButtonInactive)}
            onPress={() => setActiveTab('overview')}
          >
            <LucideIcon
              name="TrendingUp"
              {...(activeTab === 'overview' ? styles.tabTrendingIconActive : styles.tabTrendingIconInactive)}
            />
            <Text {...(activeTab === 'overview' ? styles.tabTextActive : styles.tabTextInactive)}>
              Interventions Overview
            </Text>
          </Pressable>

          <Pressable
            {...styles.tabButton}
            {...(activeTab === 'assets' ? styles.tabButtonActive : styles.tabButtonInactive)}
            onPress={() => setActiveTab('assets')}
          >
            <LucideIcon
              name="ShieldCheck"
              {...(activeTab === 'assets' ? styles.tabShieldIconActive : styles.tabShieldIconInactive)}
            />
            <Text {...(activeTab === 'assets' ? styles.tabTextActive : styles.tabTextInactive)}>
              Asset Provider Approvals & Financials
            </Text>
          </Pressable>
        </HStack>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: INTERVENTIONS OVERVIEW                                             */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <VStack {...styles.overviewMainVStack}>
          {/* Filter Bar */}
          <Box {...styles.filterCard}>
            <HStack {...styles.filterRow}>
              {/* Province Filter */}
              <Box {...styles.filterCol}>
                <Select
                  options={provinceOptions}
                  value={selectedProvince}
                  onChange={(val) => {
                    setSelectedProvince(val);
                    setSelectedSite('all');
                  }}
                  placeholder="All Provinces"
                />
              </Box>

              {/* Site Filter */}
              <Box {...styles.filterCol}>
                <Select
                  options={siteOptions}
                  value={selectedSite}
                  onChange={setSelectedSite}
                  placeholder="All Sites"
                />
              </Box>

              {/* Support Type Filter */}
              <Box {...styles.filterCol}>
                <Select
                  options={supportTypeOptions}
                  value={selectedSupportType}
                  onChange={(val) => {
                    setSelectedSupportType(val);
                    setSelectedSubCategory('all');
                  }}
                  placeholder="All Support Types"
                />
              </Box>

              {/* Sub-Category Filter */}
              <Box {...styles.filterCol}>
                <Select
                  options={subCategoryOptions}
                  value={selectedSubCategory}
                  onChange={setSelectedSubCategory}
                  placeholder="All Sub-Categories"
                />
              </Box>
            </HStack>
          </Box>

          {/* 5 KPI Metric Cards */}
          <Box {...styles.kpiGrid}>
            {/* 1. NEEDED */}
            <Box {...styles.kpiCard}>
              <HStack {...styles.kpiHeaderHStack}>
                <LucideIcon name="Users" {...styles.kpiIconNeeded} />
                <Text {...styles.kpiLabelNeeded}>NEEDED</Text>
              </HStack>
              <VStack>
                <Text {...styles.kpiValueTextDefault}>{formatCurrency(scope.needed)}</Text>
                <Text {...styles.kpiSubText}>Required for your portfolio</Text>
              </VStack>
            </Box>

            {/* 2. COMMITTED */}
            <Box {...styles.kpiCard}>
              <HStack {...styles.kpiHeaderHStack}>
                <LucideIcon name="BookOpen" {...styles.kpiIconCommitted} />
                <Text {...styles.kpiLabelCommitted}>COMMITTED</Text>
              </HStack>
              <VStack>
                <Text {...styles.kpiValueTextCommitted}>{formatCommitted(scope.committed)}</Text>
                <Text {...styles.kpiSubText}>{formatPercent(coveragePct)} of your needed target</Text>
              </VStack>
            </Box>

            {/* 3. APPROVED */}
            <Box {...styles.kpiCard}>
              <HStack {...styles.kpiHeaderHStack}>
                <LucideIcon name="CheckCircle2" {...styles.kpiIconApproved} />
                <Text {...styles.kpiLabelApproved}>APPROVED</Text>
              </HStack>
              <VStack>
                <Text {...styles.kpiValueTextApproved}>{formatCurrency(scope.approved)}</Text>
                <Text {...styles.kpiSubText}>
                  {formatPercent(getPercent(scope.approved, scope.committed))} of your committed
                </Text>
              </VStack>
            </Box>

            {/* 4. DELIVERED */}
            <Box {...styles.kpiCard}>
              <HStack {...styles.kpiHeaderHStack}>
                <LucideIcon name="Check" {...styles.kpiIconDelivered} />
                <Text {...styles.kpiLabelDelivered}>DELIVERED</Text>
              </HStack>
              <VStack>
                <Text {...styles.kpiValueTextDelivered}>{formatCurrency(scope.delivered)}</Text>
                <Text {...styles.kpiSubText}>
                  {formatPercent(getPercent(scope.delivered, scope.approved))} of your approved
                </Text>
              </VStack>
            </Box>

            {/* 5. DELIVERY STATUS */}
            <Box {...styles.kpiCard}>
              <HStack {...styles.kpiHeaderHStack}>
                <LucideIcon name="BarChart2" {...styles.kpiIconStatus} />
                <Text {...styles.kpiLabelStatus}>DELIVERY STATUS</Text>
              </HStack>
              <VStack {...styles.deliveryStatusBarContainer}>
                {/* Coverage Bar */}
                <VStack>
                  <HStack {...styles.statusMiniBarRow}>
                    <Text {...styles.statusMiniBarLabel}>Coverage</Text>
                    <Text {...styles.statusMiniBarValueGreen}>{formatPercent(coveragePct)}</Text>
                  </HStack>
                  <Box {...styles.trackBar}>
                    <Box {...styles.fillBarGreen100} w={`${Math.min(coveragePct ?? 0, 100)}%`} />
                  </Box>
                </VStack>

                {/* Delivery Bar */}
                <VStack {...styles.statusDeliveryItemVStack}>
                  <HStack {...styles.statusMiniBarRow}>
                    <Text {...styles.statusMiniBarLabel}>Delivery</Text>
                    <Text {...styles.statusMiniBarValueMaroon}>{formatPercent(deliveryPct)}</Text>
                  </HStack>
                  <Box {...styles.trackBar}>
                    <Box {...styles.fillBarMaroon75} w={`${Math.min(deliveryPct ?? 0, 100)}%`} />
                  </Box>
                </VStack>
              </VStack>
            </Box>
          </Box>

          {/* DISAGGREGATED DELIVERY SUMMARY Table */}
          <Box {...styles.summaryTableCard}>
            <HStack {...styles.summaryHeaderWrapper}>
              <VStack>
                <Heading {...styles.tableTitle}>DISAGGREGATED DELIVERY SUMMARY</Heading>
                <Text {...styles.tableFormulaText}>
                  <Text {...styles.tableFormulaBold}>Formulas: </Text>
                  Coverage = (Committed / Needed) × 100% · Delivery Rate = (Delivered / Committed) × 100%
                </Text>
              </VStack>
              <Box {...styles.targetBadge}>
                <Text {...styles.targetBadgeText}>
                  Coverage Target: <Text {...styles.targetBadgeBold}>100%</Text> · Delivery Rate Target:{' '}
                  <Text {...styles.targetBadgeBold}>100%</Text>
                </Text>
              </Box>
            </HStack>

            {/* Styled React Native Horizontal Scroll Table */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} {...styles.tableScrollView} contentContainerStyle={styles.summaryScrollContent}>
              <VStack {...styles.summaryTableContainer}>
                {/* Table Header */}
                <HStack {...styles.summaryHeaderRow}>
                  <Box {...styles.colSummaryCategory}>
                    <Text {...styles.summaryThText}>Support Category</Text>
                  </Box>
                  <Box {...styles.colSummaryNeeded}>
                    <Text {...styles.summaryThText}>Needed</Text>
                  </Box>
                  <Box {...styles.colSummaryCommitted}>
                    <Text {...styles.summaryThText}>Committed</Text>
                  </Box>
                  <Box {...styles.colSummaryApproved}>
                    <Text {...styles.summaryThText}>Approved</Text>
                  </Box>
                  <Box {...styles.colSummaryDelivered}>
                    <Text {...styles.summaryThText}>Delivered</Text>
                  </Box>
                  <Box {...styles.colSummaryCoverage}>
                    <Text {...styles.summaryThText}>Coverage</Text>
                  </Box>
                  <Box {...styles.summaryColRate}>
                    <Text {...styles.summaryThText}>Delivery Rate</Text>
                  </Box>
                </HStack>

                {/* Category rows from scope API, only the selected support type when filtered */}
                {SUMMARY_CATEGORY_ROWS.filter(
                  (row) => selectedSupportType === 'all' || row.key === selectedSupportType
                ).map((row) => {
                  const counts = scope.categories?.[row.key] || {
                    needed: 0,
                    committed: 0,
                    approved: 0,
                    delivered: 0,
                  };
                  return (
                    <HStack key={row.key} {...styles[row.rowStyle]}>
                      <HStack {...styles.colSummaryCategory}>
                        <Box {...styles[row.dotStyle]} />
                        <Text {...styles.tdCategoryText}>{row.label}</Text>
                      </HStack>
                      <Box {...styles.colSummaryNeeded}>
                        <Text {...styles.tdNeededText}>{formatCurrency(counts.needed)}</Text>
                      </Box>
                      <Box {...styles.colSummaryCommitted}>
                        <Text {...styles.summaryCommittedText}>{formatCommitted(counts.committed)}</Text>
                      </Box>
                      <Box {...styles.colSummaryApproved}>
                        <Text {...styles.summaryApprovedText}>{formatCurrency(counts.approved)}</Text>
                      </Box>
                      <Box {...styles.colSummaryDelivered}>
                        <Text {...styles.summaryDeliveredText}>{formatCurrency(counts.delivered)}</Text>
                      </Box>
                      <Box {...styles.colSummaryCoverage}>
                        <Box {...styles.summaryBadge}>
                          <Text {...styles.summaryBadgeText} numberOfLines={1}>
                            {formatCoverage(getPercent(counts.committed, counts.needed))}
                          </Text>
                        </Box>
                      </Box>
                      <Box {...styles.summaryColRate}>
                        <Text {...styles.tdRateText}>{formatPercent(getPercent(counts.delivered, counts.committed))}</Text>
                      </Box>
                    </HStack>
                  );
                })}

                {/* Cumulative Total - same totals as the KPI cards */}
                <HStack {...styles.summaryCumulativeRow}>
                  <Box {...styles.colSummaryCategory}>
                    <Text {...styles.tdCategoryCumulativeText}>Cumulative Total</Text>
                  </Box>
                  <Box {...styles.colSummaryNeeded}>
                    <Text {...styles.tdCumulativeCellText}>{formatCurrency(scope.needed)}</Text>
                  </Box>
                  <Box {...styles.colSummaryCommitted}>
                    <Text {...styles.summaryCommittedText}>{formatCommitted(scope.committed)}</Text>
                  </Box>
                  <Box {...styles.colSummaryApproved}>
                    <Text {...styles.summaryApprovedText}>{formatCurrency(scope.approved)}</Text>
                  </Box>
                  <Box {...styles.colSummaryDelivered}>
                    <Text {...styles.summaryDeliveredText}>{formatCurrency(scope.delivered)}</Text>
                  </Box>
                  <Box {...styles.colSummaryCoverage}>
                    <Box {...styles.summaryBadgeCumulative}>
                      <Text {...styles.summaryBadgeCumulativeText} numberOfLines={1}>
                        {formatCoverage(coveragePct)}
                      </Text>
                    </Box>
                  </Box>
                  <Box {...styles.summaryColRate}>
                    <Text {...styles.tdRateText}>{formatPercent(deliveryPct)}</Text>
                  </Box>
                </HStack>
              </VStack>
            </ScrollView>
          </Box>

          {/* Mid Row: Approved vs. Delivered Benchmark + Fulfillment by Province */}
          <HStack {...styles.midRow}>
            {/* Benchmark Chart */}
            <Box {...styles.benchmarkCard}>
              <HStack {...styles.cardTitleRow}>
                <VStack>
                  <HStack {...styles.chartTitleHStack}>
                    <LucideIcon name="BarChart2" {...styles.chartBenchmarkIcon} />
                    <Heading {...styles.chartTitle}>Approved vs. Delivered Interventions Benchmark</Heading>
                  </HStack>
                  <Text {...styles.chartSubtitle}>Side-by-side comparative volume (Month-on-Month)</Text>
                </VStack>

                <HStack {...styles.chartLegendHStack}>
                  <HStack {...styles.chartLegendItem}>
                    <Box {...styles.legendColorSquareApproved} />
                    <Text {...styles.legendLabel}>Approved</Text>
                  </HStack>
                  <HStack {...styles.chartLegendItem}>
                    <Box {...styles.legendColorSquareDelivered} />
                    <Text {...styles.legendLabel}>Delivered</Text>
                  </HStack>
                </HStack>
              </HStack>

              <SimpleGroupedBarChart
                height={290}
                categories={BENCHMARK_MONTHS}
                series={[
                  {
                    id: 'approved',
                    label: 'Approved',
                    color: '#E5BAC5', // Light maroon tone
                    data: BENCHMARK_APPROVED,
                  },
                  {
                    id: 'delivered',
                    label: 'Delivered',
                    color: '#8B2842', // Dark maroon tone
                    data: BENCHMARK_DELIVERED,
                  },
                ]}
              />
            </Box>

            {/* Fulfillment by Province Horizontal Bar */}
            <Box {...styles.provinceCard}>
              <VStack {...styles.provinceHeaderVStack}>
                <HStack {...styles.chartTitleHStack}>
                  <LucideIcon name="MapPin" {...styles.chartProvinceIcon} />
                  <Heading {...styles.chartTitle}>Fulfillment by Province</Heading>
                </HStack>
                <Text {...styles.chartSubtitle}>Delivered interventions unit volume</Text>
              </VStack>

              <SimpleBarChart
                data={provinceFulfillment.map((p) => ({
                  label: p.province,
                  value: p.delivered,
                  color: '#8B2842',
                }))}
                orientation="horizontal"
                height={210}
                defaultColor="#8B2842"
                showGrid={true}
                showAxes={true}
                valueFormat="number"
              />

              {/* Province stats summary list */}
              <VStack {...styles.provinceListWrapper}>
                {provinceFulfillment.map((p) => (
                  <HStack key={p.province} {...styles.provinceListRow}>
                    <Text {...styles.provinceListName}>{p.province}</Text>
                    <Text {...styles.provinceListStats}>
                      {p.delivered} delivered / {p.committed} committed
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </HStack>

          {/* Bottom Row: Upcoming Scheduled Sessions + Recent Activity */}
          <HStack {...styles.bottomRow}>
            {/* Upcoming Scheduled Sessions */}
            <Box {...styles.bottomCard}>
              <HStack {...styles.cardTitleRow}>
                <HStack {...styles.chartTitleHStack}>
                  <LucideIcon name="Clock" {...styles.sessionClockIcon} />
                  <Heading {...styles.chartTitle}>Upcoming Scheduled Sessions</Heading>
                </HStack>
                <Pressable onPress={() => navigation.navigate('opportunities' as never)}>
                  <Text {...styles.viewCatalogBtnText}>View Catalog</Text>
                </Pressable>
              </HStack>

              <VStack {...styles.sessionListVStack}>
                {loadingSessions ? (
                  <Box py="$6" alignItems="center" justifyContent="center">
                    <ActivityIndicator size="small" color="#8B2842" />
                  </Box>
                ) : upcomingSessions.length === 0 ? (
                  <Box py="$6" alignItems="center" justifyContent="center">
                    <Text {...styles.textMuted}>No upcoming scheduled sessions.</Text>
                  </Box>
                ) : (
                  upcomingSessions.map((session) => (
                    <Pressable
                      key={session.id}
                      {...styles.sessionItemCard}
                      onPress={() => navigation.navigate('opportunities' as never)}
                    >
                      <HStack {...styles.sessionItemHeaderRow}>
                        <Text {...styles.sessionItemTitle}>{session.title}</Text>
                        <Box {...styles.scheduledBadge}>
                          <Text {...styles.scheduledBadgeText}>Scheduled</Text>
                        </Box>
                      </HStack>
                      <HStack {...styles.sessionItemMetaRow}>
                        <HStack {...styles.sessionItemMetaGroup}>
                          <LucideIcon name="Calendar" {...styles.sessionCalendarIcon} />
                          <Text {...styles.sessionItemMeta}>
                            {session.date} • {session.time}
                          </Text>
                        </HStack>
                        <HStack {...styles.sessionItemMetaGroup}>
                          <LucideIcon name="Users" {...styles.sessionUsersIcon} />
                          <Text {...styles.sessionItemMeta}>{session.participants} spots</Text>
                        </HStack>
                      </HStack>
                    </Pressable>
                  ))
                )}
              </VStack>
            </Box>

            {/* Recent Activity & System Logs */}
            <Box {...styles.bottomCard}>
              <VStack {...styles.logHeaderVStack}>
                <HStack {...styles.chartTitleHStack}>
                  <LucideIcon name="FileText" {...styles.logFileIcon} />
                  <Heading {...styles.chartTitle}>Recent Activity & System Logs</Heading>
                </HStack>
              </VStack>

              <VStack {...styles.logListVStack}>
                {recentLogs.length === 0 ? (
                  <Box py="$6" alignItems="center" justifyContent="center">
                    <Text {...styles.textMuted}>No recent activity logs.</Text>
                  </Box>
                ) : (
                  recentLogs.map((log) => (
                    <HStack key={log.id} {...styles.logItemRow}>
                      <Box {...styles.logIconCircle}>
                        <LucideIcon name="CheckCircle2" {...styles.logCheckIcon} />
                      </Box>
                      <VStack {...styles.logContentVStack}>
                        <HStack {...styles.logItemHeaderRow}>
                          <Text {...styles.logTitle}>{log.title}</Text>
                          <Text {...styles.logTime}>{log.timestamp}</Text>
                        </HStack>
                        <Text {...styles.logDesc}>{log.description}</Text>
                      </VStack>
                    </HStack>
                  ))
                )}
              </VStack>
            </Box>
          </HStack>
        </VStack>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ASSET PROVIDER APPROVALS & FINANCIALS                             */}
      {/* ========================================================================= */}
      {activeTab === 'assets' && (
        <VStack {...styles.tabContentVStack}>
          {/* Green Valuation & Fund Pool Header Card */}
          <Box {...styles.assetBannerCard}>
            <HStack {...styles.assetBannerHeaderRow}>
              <VStack>
                <HStack {...styles.assetBannerTitleHStack}>
                  <LucideIcon name="Coins" {...styles.assetCoinsIcon} />
                  <Heading {...styles.assetBannerTitle}>
                    Asset Financial Valuation & Fund Pool Dashboard
                  </Heading>
                </HStack>
                <Text {...styles.assetBannerSubtitle}>
                  Monetary valuation ($/Rand) is tracked exclusively for physical and in-kind Assets (1:1 participant ratio)
                </Text>
              </VStack>
              <Box {...styles.assetPoolBadge}>
                <Text {...styles.assetPoolBadgeText}>
                  Total Fund Pool: -
                  {/* Total Fund Pool: R {formatCurrency(totalFundPool)} */}
                </Text>
              </Box>
            </HStack>

            {/* Formula Clarification Callout */}
            <Box {...styles.clarificationBox}>
              <LucideIcon name="Info" {...styles.assetInfoIcon} />
              <VStack {...styles.clarificationTextVStack}>
                <Text {...styles.clarificationTitle}>Asset Financial Formula Clarification</Text>
                <Text {...styles.clarificationText}>
                  <Text {...styles.clarificationFormulaBoldGreen}>Total Asset Pool </Text>
                  = Published Assets Value by Support Provider − (
                  <Text {...styles.clarificationFormulaBlue}>Delivered Assets Value </Text>
                  + <Text {...styles.clarificationFormulaEmerald}>Approved Assets Value </Text>
                  + <Text {...styles.clarificationFormulaAmber}>Pending Requests Value</Text>
                  )
                </Text>
              </VStack>
            </Box>

            {/* 4 Financial KPI Cards */}
            <Box {...styles.assetKpiGrid}>
              <Box {...styles.assetKpiCard}>
                <Text {...styles.assetKpiLabelTotal}>Total Available Fund Pool</Text>
                <Text {...styles.assetKpiValueTotal}>-</Text>
                {/* <Text {...styles.assetKpiValueTotal}>R {formatCurrency(totalFundPool)}</Text> */}
                <Text {...styles.assetKpiSubtextTotal}>
                  {publishedAssetsCount > 0 ? `Across ${publishedAssetsCount} active asset offerings` : 'No active asset offerings'}
                </Text>
              </Box>

              <Box {...styles.assetKpiCard}>
                <Text {...styles.assetKpiLabelApproved}>Approved Assets Value</Text>
                <Text {...styles.assetKpiValueApproved}>R {formatCurrency(approvedAssetsValue)}</Text>
                <Text {...styles.assetKpiSubtextApproved}>
                  {scope.assets?.approved.count || 0} approved allocations
                </Text>
              </Box>

              <Box {...styles.assetKpiCard}>
                <Text {...styles.assetKpiLabelDelivered}>Delivered Assets Value</Text>
                {/* TODO: Delivered assets value is not calculated yet */}
                <Text {...styles.assetKpiValueDelivered}>-</Text>
                <Text {...styles.assetKpiSubtextDelivered}>- delivered items</Text>
                {/* <Text {...styles.assetKpiValueDelivered}>R {formatCurrency(deliveredAssetsValue)}</Text>
                <Text {...styles.assetKpiSubtextDelivered}>
                  {scope.assets?.delivered.count || 0} delivered items
                </Text> */}
              </Box>

              <Box {...styles.assetKpiCard}>
                <Text {...styles.assetKpiLabelPending}>Pending Requests Value</Text>
                <Text {...styles.assetKpiValuePending}>R {formatCurrency(pendingRequestsValue)}</Text>
                <Text {...styles.assetKpiSubtextPending}>
                  {scope.assets?.pending.count || 0} unapproved participant requests
                </Text>
              </Box>
            </Box>

            {/* Delivered vs. Approved Progress Bar */}
            <Box {...styles.assetProgressCard}>
              <HStack {...styles.assetProgressHeaderRow}>
                <Text {...styles.assetProgressTitle}>Delivered Assets Value vs. Approved Allocation</Text>
                <Text {...styles.assetProgressRatioText}>
                  - / R {formatCurrency(approvedAssetsValue)}
                  {/* R {formatCurrency(deliveredAssetsValue)} / R {formatCurrency(approvedAssetsValue)} (
                  {Math.round((deliveredAssetsValue / (approvedAssetsValue || 1)) * 100)}%) */}
                </Text>
              </HStack>
              {/* TODO: Fill the bar once delivered assets value is calculated */}
              <Box {...styles.assetProgressBarTrack}>
                <Box {...styles.assetProgressBarFill} style={{ width: '0%' }} />
                {/* <Box
                  {...styles.assetProgressBarFill}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((deliveredAssetsValue / (approvedAssetsValue || 1)) * 100)
                    )}%`,
                  }}
                /> */}
              </Box>
            </Box>
          </Box>

          {/* Asset Request Approvals & Offering Catalog Card */}
          <Box {...styles.summaryTableCard}>
            <HStack {...styles.assetCatalogHeaderWrapper}>
              <VStack>
                <HStack {...styles.assetCatalogTitleHStack}>
                  <LucideIcon name="Package" {...styles.assetShieldIcon} />
                  <Heading {...styles.assetCatalogTitle}>Asset Request Approvals & Offering Catalog</Heading>
                </HStack>
                <Text {...styles.assetCatalogSubtitle}>Review published assets and approve coach requests</Text>
              </VStack>

              {/* Sub tabs: Published Assets vs Coach Asset Requests */}
              <HStack {...styles.subTabContainer}>
                <Pressable
                  {...styles.subTabBtn}
                  {...(assetViewTab === 'published' ? styles.subTabBtnActive : {})}
                  onPress={() => setAssetViewTab('published')}
                >
                  <Text {...(assetViewTab === 'published' ? styles.subTabTextActive : styles.subTabTextInactive)}>
                    My Published Assets (Provider View)
                  </Text>
                </Pressable>
                <Pressable
                  {...styles.subTabBtn}
                  {...(assetViewTab === 'coach-requests' ? styles.subTabBtnActive : {})}
                  onPress={() => setAssetViewTab('coach-requests')}
                >
                  <Text {...(assetViewTab === 'coach-requests' ? styles.subTabTextActive : styles.subTabTextInactive)}>
                    Coach Asset Requests (Coach View)
                  </Text>
                </Pressable>
              </HStack>
            </HStack>

            {/* Table 1: My Published Assets */}
            {assetViewTab === 'published' && (
              <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} {...styles.tableScrollView} contentContainerStyle={styles.summaryScrollContent}>
                <VStack {...styles.summaryTableContainer}>
                  {/* Table Header */}
                  <HStack {...styles.summaryHeaderRow}>
                    <Box {...styles.colAssetId}>
                      <Text {...styles.summaryThText}>Asset ID</Text>
                    </Box>
                    <Box {...styles.colAssetDate}>
                      <Text {...styles.summaryThText}>Published Date</Text>
                    </Box>
                    <Box {...styles.colAssetTitle}>
                      <Text {...styles.summaryThText}>Published Asset Item</Text>
                    </Box>
                    <Box {...styles.colAssetSubCat}>
                      <Text {...styles.summaryThText}>Sub-Category</Text>
                    </Box>
                    <Box {...styles.colAssetUnitVal}>
                      <Text {...styles.summaryThText}>Unit Value (1:1 Ratio)</Text>
                    </Box>
                    <Box {...styles.colAssetQty}>
                      <Text {...styles.summaryThText}>Available Qty</Text>
                    </Box>
                    <Box {...styles.colAssetApprovedVal}>
                      <Text {...styles.summaryThText}>Approved Value</Text>
                    </Box>
                    <Box {...styles.colAssetDeliveredVal}>
                      <Text {...styles.summaryThText}>Delivered Value</Text>
                    </Box>
                    <Box {...styles.colAssetAdminStatus}>
                      <Text {...styles.summaryThText}>Admin Approval</Text>
                    </Box>
                  </HStack>

                  {/* Table Body */}
                  {loadingAssets ? (
                    <Box py="$6" alignItems="center" justifyContent="center">
                      <ActivityIndicator size="small" color="#8B2842" />
                    </Box>
                  ) : publishedAssets.length === 0 ? (
                    <Box py="$6" alignItems="center" justifyContent="center">
                      <Text {...styles.assetTableMutedText}>No published assets found.</Text>
                    </Box>
                  ) : (
                    publishedAssets.slice(0, assetVisibleCount).map((item) => (
                    <HStack key={item.id} {...styles.summaryBodyRow}>
                      <Box {...styles.colAssetId}>
                        <Text {...styles.assetTableCellText}>{item.id}</Text>
                      </Box>
                      <Box {...styles.colAssetDate}>
                        <Text {...styles.assetTableMutedText}>{item.datePublished}</Text>
                      </Box>
                      <Box {...styles.colAssetTitle}>
                        <Text {...styles.assetTableCellText}>{item.assetTitle}</Text>
                      </Box>
                      <Box {...styles.colAssetSubCat}>
                        <Box {...styles.subCatBadge}>
                          <Text {...styles.subCatBadgeText} numberOfLines={1} ellipsizeMode="tail">{item.subCategory}</Text>
                        </Box>
                      </Box>
                      <Box {...styles.colAssetUnitVal}>
                        <Text {...styles.assetTableCellText}>
                          {item.unitValue !== null ? `R ${formatCurrency(item.unitValue)} / participant` : '-'}
                        </Text>
                      </Box>
                      <Box {...styles.colAssetQty}>
                        <Text {...styles.assetTableCellText}>
                          {item.availableQuantity !== null ? `${item.availableQuantity} units` : '-'}
                        </Text>
                      </Box>
                      {/* TODO: Approved and delivered value per asset need requests linked to the asset */}
                      <Box {...styles.colAssetApprovedVal}>
                        <Text {...styles.valApprovedText}>-</Text>
                        {/* <Text {...styles.valApprovedText}>
                          R {formatCurrency(item.approvedQuantity * item.unitValue)}
                        </Text> */}
                      </Box>
                      <Box {...styles.colAssetDeliveredVal}>
                        <Text {...styles.valDeliveredText}>-</Text>
                        {/* <Text {...styles.valDeliveredText}>
                          R {formatCurrency(item.deliveredQuantity * item.unitValue)}
                        </Text> */}
                      </Box>
                      <Box {...styles.colAssetAdminStatus}>
                        {item.adminStatus === 'approved' ? (
                          <Box {...styles.statusBadgeActive}>
                            <Text {...styles.statusBadgeActiveText}>✓ Published & Active</Text>
                          </Box>
                        ) : (
                          <Box {...styles.statusBadgePendingAdmin}>
                            <Text {...styles.statusBadgePendingAdminText}>⏳ Pending Admin Review</Text>
                          </Box>
                        )}
                      </Box>
                    </HStack>
                  )))}
                </VStack>
              </ScrollView>
              {publishedAssets.length > assetVisibleCount && (
                <Box alignItems="center" mt="$4" width="100%">
                  <Button onPress={() => setAssetVisibleCount((prev) => prev + ASSET_TABLE_PAGE_SIZE)}>
                    <ButtonText>Load More</ButtonText>
                  </Button>
                </Box>
              )}
              </>
            )}

            {/* Table 2: Coach Asset Requests */}
            {assetViewTab === 'coach-requests' && (
              <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} {...styles.tableScrollView} contentContainerStyle={styles.summaryScrollContent}>
                <VStack {...styles.summaryTableContainer}>
                  {/* Table Header */}
                  <HStack {...styles.summaryHeaderRow}>
                    <Box {...styles.colReqId}>
                      <Text {...styles.summaryThText}>Request ID</Text>
                    </Box>
                    <Box {...styles.colReqCoach}>
                      <Text {...styles.summaryThText}>Coach Name & Hub</Text>
                    </Box>
                    <Box {...styles.colReqItem}>
                      <Text {...styles.summaryThText}>Requested Asset Item</Text>
                    </Box>
                    <Box {...styles.colReqQty}>
                      <Text {...styles.summaryThText}>Quantity Requested</Text>
                    </Box>
                    <Box {...styles.colReqTotalVal}>
                      <Text {...styles.summaryThText}>Total Rand Value</Text>
                    </Box>
                    <Box {...styles.colReqDate}>
                      <Text {...styles.summaryThText}>Request Date</Text>
                    </Box>
                    <Box {...styles.colReqStatus}>
                      <Text {...styles.summaryThText}>Status</Text>
                    </Box>
                  </HStack>

                  {/* Table Body */}
                  {coachRequests.length === 0 ? (
                    <Box py="$6" alignItems="center" justifyContent="center">
                      <Text {...styles.assetTableMutedText}>No coach requests found.</Text>
                    </Box>
                  ) : (
                    coachRequests.slice(0, coachVisibleCount).map((req) => (
                    <HStack key={req.id} {...styles.summaryBodyRow}>
                      <Box {...styles.colReqId}>
                        <Text {...styles.assetTableCellText}>{req.id}</Text>
                      </Box>
                      <Box {...styles.colReqCoach}>
                        <Text {...styles.assetTableCellText}>{req.coachName}</Text>
                        <Text {...styles.textSmallMuted}>{req.coachOrg}</Text>
                      </Box>
                      <Box {...styles.colReqItem}>
                        <Text {...styles.textDarkMedium}>{req.requestedItem}</Text>
                      </Box>
                      <Box {...styles.colReqQty}>
                        <Text {...styles.assetTableCellText}>{req.quantity} participant(s)</Text>
                      </Box>
                      <Box {...styles.colReqTotalVal}>
                        <Text {...styles.valApprovedText}>R {formatCurrency(req.totalValue)}</Text>
                      </Box>
                      <Box {...styles.colReqDate}>
                        <Text {...styles.assetTableMutedText}>{req.requestDate}</Text>
                      </Box>
                      <Box {...styles.colReqStatus}>
                        {req.status === 'approved' ? (
                          <Box {...styles.statusBadgeApprovedLocked}>
                            <Text {...styles.statusBadgeApprovedLockedText}> Approved (Locked)</Text>
                          </Box>
                        ) : req.status === 'declined' ? (
                          <Box {...styles.statusBadgeDeclinedLocked}>
                            <Text {...styles.statusBadgeDeclinedLockedText}> Declined (Locked)</Text>
                          </Box>
                        ) : (
                          <Box {...styles.statusBadgePendingAction}>
                            <Text {...styles.statusBadgePendingActionText}> Pending Action</Text>
                          </Box>
                        )}
                      </Box>
                    </HStack>
                  )))}
                </VStack>
              </ScrollView>
              {coachRequests.length > coachVisibleCount && (
                <Box alignItems="center" mt="$4" width="100%">
                  <Button onPress={() => setCoachVisibleCount((prev) => prev + ASSET_TABLE_PAGE_SIZE)}>
                    <ButtonText>Load More</ButtonText>
                  </Button>
                </Box>
              )}
              </>
            )}
          </Box>
        </VStack>
      )}
    </VStack>
  );
};

export default memo(DashboardContent);
