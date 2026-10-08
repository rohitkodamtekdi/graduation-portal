export default {
  container: {
    px: '$4',
    py: '$5',
    '$md-px': '$6',
    pb: '$12',
    bg: '#F9FAFB',
  },
  rootContainer: {
    space: 'lg',
    width: '100%',
  },

  // Header action button
  headerActionBtn: {
    bg: '#8B2842',
    borderRadius: 8,
    px: '$4',
    py: '$2.5',
    flexDirection: 'row',
    alignItems: 'center',
    space: 'xs',
    ':hover': {
      bg: '#6E1F34',
    },
  },
  headerActionBtnText: {
    color: '$white',
    fontSize: 13,
    fontWeight: '600',
  },

  // Header tabs container (rendered inside header)
  headerTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    bg: '#F3F4F6',
    p: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    mt: '$2',
    mb: '$5',
    gap: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    bg: '#F3F4F6',
    p: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    mb: '$5',
    gap: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 'xs',
    gap: 6,
    px: '$3.5',
    py: '$2',
    borderRadius: 8,
  },
  tabButtonActive: {
    bg: '$white',
    shadowColor: '$black',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonInactive: {
    bg: 'transparent',
  },
  tabTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  tabTextInactive: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },

  // Filters Card
  filterCard: {
    bg: '$white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    p: '$4',
    mb: '$4',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    space: 'md',
    gap: 12,
  },
  filterCol: {
    flex: 1,
    minWidth: 160,
  },

  // KPI Row
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    mb: '$4',
  },
  kpiCard: {
    bg: '$white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    p: '$4',
    flex: 1,
    minWidth: 180,
    justifyContent: 'space-between',
  },
  kpiHeaderHStack: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 'xs',
    mb: '$2',
  },
  kpiLabelNeeded: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  kpiLabelCommitted: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B2842',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  kpiLabelApproved: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  kpiLabelDelivered: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  kpiLabelStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  kpiValueTextDefault: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 32,
  },
  kpiValueTextCommitted: {
    fontSize: 26,
    fontWeight: '800',
    color: '#8B2842',
    lineHeight: 32,
  },
  kpiValueTextApproved: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0284C7',
    lineHeight: 32,
  },
  kpiValueTextDelivered: {
    fontSize: 26,
    fontWeight: '800',
    color: '#059669',
    lineHeight: 32,
  },
  kpiSubText: {
    fontSize: 12,
    color: '#6B7280',
    mt: '$1',
  },

  // Delivery status mini bars
  deliveryStatusBarContainer: {
    mt: '$1',
    space: 'sm',
  },
  statusMiniBarRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
  },
  statusMiniBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4B5563',
  },
  statusMiniBarValueGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  statusMiniBarValueMaroon: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B2842',
  },
  overviewMainVStack: {
    space: 'lg',
  },
  tabContentVStack: {
    space: 'lg',
  },
  statusDeliveryItemVStack: {
    mt: '$1.5',
  },
  trackBar: {
    height: 6,
    borderRadius: 3,
    bg: '#F3F4F6',
    overflow: 'hidden',
    width: '100%',
  },
  fillBarGreen: {
    height: '$full',
    bg: '#10B981',
    borderRadius: 3,
  },
  fillBarGreen100: {
    height: '$full',
    bg: '#10B981',
    borderRadius: 3,
    w: '$full',
  },
  fillBarMaroon: {
    height: '$full',
    bg: '#8B2842',
    borderRadius: 3,
  },
  fillBarMaroon75: {
    height: '$full',
    bg: '#8B2842',
    borderRadius: 3,
    w: '75%',
  },

  // Table Card
  // Table Card
  tableCard: {
    bg: '$white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    mb: '$4',
    p: '$5',
  },
  tableHeaderWrapper: {
    pb: '$4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  tableTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tableFormulaText: {
    fontSize: 12,
    color: '#6B7280',
    mt: 4,
  },
  tableFormulaBold: {
    fontWeight: '700',
    color: '#111827',
  },
  targetBadge: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    px: '$3.5',
    py: '$2',
    bg: '$white',
  },
  targetBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  targetBadgeBold: {
    fontWeight: '700',
    color: '#111827',
  },

  // Table ViewStyles for pure gluestack / react-native usage
  tableScrollView: {
    width: '100%',
  },
  tableContainer: {
    width: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    bg: '#F9FAFB',
    borderRadius: 6,
    py: '$3',
    px: '$4',
    mb: '$1',
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    py: '$4',
    px: '$4',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCumulativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    py: '$4',
    px: '$4',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    mt: '$1',
  },

  // Disaggregated Delivery Summary Columns
  colSummaryCategory: {
    flex: 2.2,
    minWidth: 160,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colSummaryNeeded: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  colSummaryCommitted: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  colSummaryApproved: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  colSummaryDelivered: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  colSummaryCoverage: {
    flex: 1.5,
    minWidth: 130,
    alignItems: 'center',
  },
  colSummaryRate: {
    flex: 1,
    minWidth: 90,
    alignItems: 'flex-end',
    pr: '$2',
  },

  // Table texts & cells
  thText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  tdCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  tdCategoryCumulativeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  tdNeededText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  tdCommittedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C', // Red/Maroon from Figma
  },
  tdApprovedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7', // Blue from Figma
  },
  tdDeliveredText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669', // Green from Figma
  },
  tdCumulativeCellText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  tdRateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  // Badges & dots
  categoryDotPurple: {
    width: 8,
    height: 8,
    borderRadius: 99,
    bg: '#8B5CF6',
    mr: '$2.5',
  },
  categoryDotBlue: {
    width: 8,
    height: 8,
    borderRadius: 99,
    bg: '#3B82F6',
    mr: '$2.5',
  },
  categoryDotAmber: {
    width: 8,
    height: 8,
    borderRadius: 99,
    bg: '#F59E0B',
    mr: '$2.5',
  },
  surplusBadgeGreen: {
    bg: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 8,
    px: '$3',
    py: 4,
    alignSelf: 'center',
  },
  surplusBadgeGreenText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  surplusBadgeCumulative: {
    bg: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 8,
    px: '$3',
    py: 4,
    alignSelf: 'center',
  },
  surplusBadgeCumulativeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },

  // Disaggregated Delivery Summary table - rows run edge-to-edge of the card (Figma)
  summaryTableCard: {
    bg: '$white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    mb: '$4',
    pt: '$5',
    pb: '$5',
  },
  summaryHeaderWrapper: {
    px: '$5',
    pb: '$4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryScrollContent: {
    flexGrow: 1,
  },
  summaryTableContainer: {
    flex: 1,
    minWidth: '100%',
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    bg: '#F9FAFB',
    py: '$3.5',
    px: '$5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    bg: '$white',
    py: '$4',
    px: '$5',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryBodyRowAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    bg: '#FAFAFB',
    py: '$4',
    px: '$5',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryCumulativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    bg: '#F9FAFB',
    py: '$4',
    px: '$5',
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  summaryThText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  summaryColRate: {
    flex: 1,
    minWidth: 90,
    alignItems: 'flex-end',
  },
  summaryCommittedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9F1239',
  },
  summaryApprovedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0284C7',
  },
  summaryDeliveredText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  summaryBadge: {
    bg: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 999,
    px: '$2.5',
    py: 3,
    alignSelf: 'center',
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#059669',
  },
  summaryBadgeCumulative: {
    bg: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 999,
    px: '$2.5',
    py: 3,
    alignSelf: 'center',
  },
  summaryBadgeCumulativeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },

  // Mid Charts Row (Benchmark + Province)
  midRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    mb: '$4',
    width: '100%',
  },
  benchmarkCard: {
    bg: '$white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    p: '$4',
    flex: 2,
    minWidth: 320,
  },
  provinceCard: {
    bg: '$white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    p: '$4',
    flex: 1.2,
    minWidth: 280,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: '$3',
  },
  provinceHeaderVStack: {
    mb: '$2',
  },
  chartTitleHStack: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 'xs',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  chartSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    mt: 2,
  },
  chartLegendHStack: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 'md',
    gap: 12,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    space: 'xs',
    gap: 4,
  },
  legendColorSquareApproved: {
    width: 10,
    height: 10,
    borderRadius: 2,
    bg: '#E5BAC5', // Approved lighter maroon
  },
  legendColorSquareDelivered: {
    width: 10,
    height: 10,
    borderRadius: 2,
    bg: '#8B2842', // Delivered dark maroon
  },
  legendLabel: {
    fontSize: 11,
    color: '#4B5563',
  },

  // Province list summary rows below chart
  provinceListWrapper: {
    mt: '$3',
    pt: '$3',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    space: 'xs',
    gap: 6,
  },
  provinceListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  provinceListName: {
    fontSize: 11,
    color: '#4B5563',
  },
  provinceListStats: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },

  // Bottom Row (Upcoming Sessions + Recent Activity)
  bottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  bottomCard: {
    bg: '$white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    p: '$4',
    flex: 1,
    minWidth: 300,
  },
  viewCatalogBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  sessionItemCard: {
    bg: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    p: '$3',
    mb: '$2.5',
    cursor: 'pointer',
    space: 'xs',
  },
  sessionItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  scheduledBadge: {
    bg: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 4,
    px: 6,
    py: 2,
  },
  scheduledBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  sessionItemMeta: {
    fontSize: 11,
    color: '#4B5563',
  },
  sessionItemHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionItemMetaRow: {
    space: 'md',
    alignItems: 'center',
    mt: '$1',
  },
  sessionItemMetaGroup: {
    space: 'xs',
    alignItems: 'center',
  },
  logListVStack: {
    space: 'sm',
  },
  sessionListVStack: {
    space: 'sm',
  },
  logHeaderVStack: {
    mb: '$3',
  },
  logContentVStack: {
    flex: 1,
  },
  logItemHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    space: 'sm',
    p: '$2.5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    mb: '$2',
    bg: '$white',
    gap: 10,
  },
  logIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 99,
    bg: '#FDF2F4',
    alignItems: 'center',
    justifyContent: 'center',
    mt: 2,
  },
  logTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  logTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  logDesc: {
    fontSize: 11,
    color: '#4B5563',
    mt: 2,
  },

  // Tab 2: Asset Financials
  assetBannerCard: {
    bg: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    p: '$4',
    mb: '$4',
  },
  assetBannerHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: '$3',
  },
  assetBannerTitleHStack: {
    space: 'xs',
    alignItems: 'center',
  },
  assetCatalogTitleHStack: {
    space: 'xs',
    alignItems: 'center',
  },
  assetBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#064E3B',
  },
  assetBannerSubtitle: {
    fontSize: 11,
    color: '#065F46',
    mt: 2,
  },
  assetPoolBadge: {
    bg: '#047857',
    borderRadius: 6,
    px: '$3',
    py: '$1.5',
  },
  assetPoolBadgeText: {
    color: '$white',
    fontSize: 12,
    fontWeight: '600',
  },
  clarificationBox: {
    bg: '$white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    p: '$3',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    my: '$3',
  },
  clarificationTextVStack: {
    flex: 1,
  },
  clarificationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#064E3B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clarificationText: {
    fontSize: 11,
    color: '#374151',
    mt: 2,
    lineHeight: 16,
  },
  clarificationFormulaBoldGreen: {
    fontWeight: '700',
    color: '#064E3B',
  },
  clarificationFormulaBlue: {
    fontWeight: '600',
    color: '#1D4ED8',
  },
  clarificationFormulaEmerald: {
    fontWeight: '600',
    color: '#047857',
  },
  clarificationFormulaAmber: {
    fontWeight: '600',
    color: '#B45309',
  },

  assetKpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    mb: '$3',
  },
  assetKpiCard: {
    bg: '$white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    p: '$3.5',
    flex: 1,
    minWidth: 170,
  },
  assetKpiLabelTotal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  assetKpiLabelApproved: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    textTransform: 'uppercase',
  },
  assetKpiLabelDelivered: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  assetKpiLabelPending: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
    textTransform: 'uppercase',
  },
  assetKpiValueTotal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    my: '$1',
  },
  assetKpiValueApproved: {
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
    my: '$1',
  },
  assetKpiValueDelivered: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB',
    my: '$1',
  },
  assetKpiValuePending: {
    fontSize: 22,
    fontWeight: '800',
    color: '#D97706',
    my: '$1',
  },
  assetKpiSubtextTotal: {
    fontSize: 11,
    color: '#6B7280',
  },
  assetKpiSubtextApproved: {
    fontSize: 11,
    color: '#059669',
  },
  assetKpiSubtextDelivered: {
    fontSize: 11,
    color: '#2563EB',
  },
  assetKpiSubtextPending: {
    fontSize: 11,
    color: '#D97706',
  },

  assetProgressCard: {
    bg: '$white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    p: '$3.5',
  },
  assetProgressHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: '$2',
  },
  assetProgressTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  assetProgressRatioText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  assetProgressBarTrack: {
    height: 8,
    borderRadius: 4,
    bg: '#F3F4F6',
    overflow: 'hidden',
    width: '100%',
  },
  assetProgressBarFill: {
    height: '$full',
    bg: '#10B981',
    borderRadius: 4,
  },

  // Asset Sub Tabs
  subTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    bg: '#F3F4F6',
    p: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  subTabBtn: {
    px: 12,
    py: 6,
    borderRadius: 6,
  },
  subTabBtnActive: {
    bg: '$white',
    shadowColor: '$black',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  subTabTextActive: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  subTabTextInactive: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4B5563',
  },

  // Table Columns - Published Assets (pr = column gutter, minWidth keeps the horizontal scroll usable)
  colAssetId: {
    flex: 0.8,
    minWidth: 56,
    pr: '$3',
  },
  colAssetDate: {
    flex: 1.1,
    minWidth: 84,
    pr: '$3',
  },
  colAssetTitle: {
    flex: 1.9,
    minWidth: 130,
    pr: '$3',
  },
  colAssetSubCat: {
    flex: 2.1,
    minWidth: 140,
    pr: '$3',
  },
  colAssetUnitVal: {
    flex: 1.4,
    minWidth: 96,
    pr: '$3',
  },
  colAssetQty: {
    flex: 1,
    minWidth: 70,
    pr: '$3',
  },
  colAssetApprovedVal: {
    flex: 1.1,
    minWidth: 80,
    pr: '$3',
  },
  colAssetDeliveredVal: {
    flex: 1.1,
    minWidth: 80,
    pr: '$3',
  },
  colAssetAdminStatus: {
    flex: 1.5,
    minWidth: 120,
    pr: '$3',
  },

  // Table Columns - Coach Requests
  colReqId: {
    flex: 1,
    minWidth: 80,
    pr: '$3',
  },
  colReqCoach: {
    flex: 2,
    minWidth: 150,
    pr: '$3',
  },
  colReqItem: {
    flex: 2.2,
    minWidth: 160,
    pr: '$3',
  },
  colReqQty: {
    flex: 1.3,
    minWidth: 110,
    pr: '$3',
  },
  colReqTotalVal: {
    flex: 1.4,
    minWidth: 110,
    pr: '$3',
  },
  colReqDate: {
    flex: 1.2,
    minWidth: 100,
    pr: '$3',
  },
  colReqStatus: {
    flex: 1.6,
    minWidth: 140,
    pr: '$3',
  },

  // Asset cell styling
  textDarkBold: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  textDarkMedium: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  textMuted: {
    fontSize: 12,
    color: '#6B7280',
  },
  textSmallMuted: {
    fontSize: 11,
    color: '#6B7280',
  },
  subCatBadge: {
    bg: '$white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    px: '$2.5',
    py: 3,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  subCatBadgeText: {
    fontSize: 12,
    color: '#374151',
  },
  valApprovedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  valDeliveredText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  statusBadgeActive: {
    bg: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 999,
    px: '$2.5',
    py: 3,
    alignSelf: 'flex-start',
  },
  statusBadgeActiveText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#047857',
  },
  statusBadgePendingAdmin: {
    bg: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 999,
    px: '$2.5',
    py: 3,
    alignSelf: 'flex-start',
  },
  statusBadgePendingAdminText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#B45309',
  },
  statusBadgeApprovedLocked: {
    bg: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 999,
    px: '$2.5',
    py: 3,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeApprovedLockedText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#047857',
  },
  statusBadgeDeclinedLocked: {
    bg: '#FFF1F2',
    borderColor: '#FECDD3',
    borderWidth: 1,
    borderRadius: 999,
    px: '$2.5',
    py: 3,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeDeclinedLockedText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#BE123C',
  },
  statusBadgePendingAction: {
    bg: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 999,
    px: '$2.5',
    py: 3,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgePendingActionText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#B45309',
  },

  // Icon Styles
  tabTrendingIconActive: {
    size: 16,
    color: '#8B2842',
  },
  tabTrendingIconInactive: {
    size: 16,
    color: '#6B7280',
  },
  tabShieldIconActive: {
    size: 16,
    color: '#059669',
  },
  tabShieldIconInactive: {
    size: 16,
    color: '#6B7280',
  },
  kpiIconNeeded: {
    size: 14,
    color: '#6B7280',
  },
  kpiIconCommitted: {
    size: 14,
    color: '#8B2842',
  },
  kpiIconApproved: {
    size: 14,
    color: '#0284C7',
  },
  kpiIconDelivered: {
    size: 14,
    color: '#059669',
  },
  kpiIconStatus: {
    size: 14,
    color: '#1E293B',
  },
  chartBenchmarkIcon: {
    size: 16,
    color: '#8B2842',
  },
  chartProvinceIcon: {
    size: 16,
    color: '#8B2842',
  },
  sessionClockIcon: {
    size: 16,
    color: '#8B2842',
  },
  sessionCalendarIcon: {
    size: 12,
    color: '#9CA3AF',
  },
  sessionUsersIcon: {
    size: 12,
    color: '#9CA3AF',
  },
  logFileIcon: {
    size: 16,
    color: '#8B2842',
  },
  logCheckIcon: {
    size: 14,
    color: '#8B2842',
  },
  assetCoinsIcon: {
    size: 18,
    color: '#047857',
  },
  assetInfoIcon: {
    size: 16,
    color: '#059669',
  },
  assetCatalogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  assetCatalogSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    mt: 2,
  },
  assetTableCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  assetTableMutedText: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Title block of the asset card: divider under it, table starts below
  assetCatalogHeaderWrapper: {
    px: '$5',
    pb: '$4',
    mb: '$4',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  assetShieldIcon: {
    size: 18,
    color: '#059669',
  },
} as const;