export const attendedSessionsStyles = {
  scrollView: {
    flex: 1,
    width: '$full',
  },
  container: {
    flex: 1,
    width: '100%' as const,
  },
  content: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  emptyTitle: {
    fontSize: '$xl',
    fontWeight: '$bold',
    color: '$textForeground',
    textAlign: 'center' as const,
  },
  emptyDescription: {
    fontSize: '$md',
    color: '$textMutedForeground',
    textAlign: 'center' as const,
  },
  loadingContainer: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    py: '$10' as const,
    width: '100%' as const,
  },
  headerHStack: {
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    width: '100%' as const,
    mb: '$4' as const,
  },
  headerTitleText: {
    fontSize: '$md' as const,
    fontWeight: '$bold' as const,
    color: '$textPrimary' as const,
  },
  filterSelectBox: {
    width: 140 as const,
  },
  listVStack: {
    space: 'md' as const,
    width: '100%' as const,
  },
  card: (isAttended: boolean) => ({
    bg: isAttended ? '#F5FBF7' : '$white',
    borderWidth: 1,
    borderColor: isAttended ? '#BBF7D0' : '$borderLight200',
    borderRadius: 12,
    px: '$4' as const,
    py: '$4' as const,
    width: '100%' as const,
  }),
  cardHeaderHStack: {
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    width: '100%' as const,
    space: 'sm' as const,
  },
  cardTitleHStack: {
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    space: 'sm' as const,
    flex: 1,
  },
  cardTitleText: {
    fontSize: '$sm' as const,
    fontWeight: '$bold' as const,
    color: '$textPrimary' as const,
  },
  statusBadge: (isAttended: boolean) => ({
    bg: isAttended ? '$success50' : '$backgroundLight100',
    borderWidth: 1,
    borderColor: isAttended ? '#a7f3d0' : '$borderColor',
    borderRadius: '$full' as const,
    paddingLeft: 8 as const,
    paddingRight: 8 as const,
    paddingTop: 2 as const,
    paddingBottom: 2 as const,
  }),
  statusBadgeText: (isAttended: boolean) => ({
    fontSize: 12 as const,
    color: isAttended ? '$success600' : '$textMuted',
    fontWeight: '$medium' as const,
    textTransform: 'none' as const,
  }),
  chevronIconProps: {
    size: 18,
    color: '$textMuted',
  },
  subtitleText: {
    fontSize: '$xs' as const,
    color: '$textSecondary' as const,
    mt: '$1' as const,
  },
  metaRowHStack: {
    alignItems: 'center' as const,
    width: '100%' as const,
    mt: '$3' as const,
  },
  metaItemHStack: {
    flex: 1,
    alignItems: 'center' as const,
    space: 'sm' as const,
  },
  metaIconProps: {
    size: 14,
    color: '$success600',
  },
  loadMoreContainer: {
    alignItems: 'center' as const,
    mt: '$4' as const,
    width: '100%' as const,
  },
  metaText: {
    fontSize: '$xs' as const,
    color: '$textSecondary' as const,
    textTransform: 'capitalize' as const,
  },
} as const;
