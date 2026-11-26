const cardBase = {
  bg: '$white' as const,
  borderWidth: 1,
  borderColor: '$borderColor' as const,
  borderRadius: '$xl' as const,
};

const smallText = {
  fontSize: '$xs' as const,
  fontWeight: '$normal' as const,
  color: '$textMutedForeground' as const,
};

const bodyText = {
  fontSize: '$sm' as const,
  fontWeight: '$normal' as const,
  color: '$textForeground' as const,
};

export const templateDetailStyles = {
  container: {
    space: 'lg' as const,
    pb: '$6' as const,
  },
  backButton: {
    alignSelf: 'flex-start' as const,
    bg: '$white' as const,
    borderWidth: 1,
    borderColor: '$borderLight300' as const,
    borderRadius: '$md' as const,
    px: '$3' as const,
    py: '$1.5' as const,
  },
  backButtonText: {
    ...bodyText,
    fontWeight: '$medium' as const,
  },
  title: {
    fontSize: '$2xl' as const,
    fontWeight: '$medium' as const,
    color: '$textForeground' as const,
  },
  description: {
    ...bodyText,
    color: '$textMutedForeground' as const,
  },
  card: {
    ...cardBase,
    p: '$4' as const,
  },
  cardTitle: {
    ...bodyText,
    fontWeight: '$medium' as const,
    mb: '$3' as const,
  },
  label: smallText,
  value: bodyText,
  outlineButton: {
    bg: '$white' as const,
    borderWidth: 1,
    borderColor: '$borderLight300' as const,
    borderRadius: '$md' as const,
    px: '$3' as const,
    py: '$1.5' as const,
  },
  outlineButtonText: {
    ...bodyText,
    fontWeight: '$medium' as const,
  },
  sectionTitle: {
    fontSize: '$lg' as const,
    fontWeight: '$medium' as const,
    color: '$textForeground' as const,
  },
  pillarCard: {
    ...cardBase,
    overflow: 'hidden' as const,
  },
  pillarHeader: {
    px: '$4' as const,
    py: '$3.5' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  pillarName: {
    fontSize: '$md' as const,
    fontWeight: '$medium' as const,
    color: '$textForeground' as const,
  },
  pillarDescription: {
    ...bodyText,
    color: '$textMutedForeground' as const,
    mt: '$0.5' as const,
  },
  countBadge: {
    borderWidth: 1,
    borderColor: '$borderLight300' as const,
    borderRadius: '$md' as const,
    px: '$2' as const,
    py: '$0.5' as const,
  },
  countBadgeText: {
    ...smallText,
    color: '$textForeground' as const,
    fontWeight: '$medium' as const,
  },
  tasksContainer: {
    borderTopWidth: 1,
    borderColor: '$borderLight200' as const,
    px: '$4' as const,
    py: '$4' as const,
  },
  tableHeaderRow: {
    borderBottomWidth: 1,
    borderColor: '$borderLight200' as const,
    pb: '$2' as const,
    space: 'md' as const,
  },
  tableRow: {
    borderBottomWidth: 1,
    borderColor: '$borderLight100' as const,
    py: '$3' as const,
    space: 'md' as const,
    alignItems: 'flex-start' as const,
  },
  tableHeaderText: {
    ...bodyText,
    fontWeight: '$medium' as const,
  },
  taskNumber: {
    width: '$6' as const,
    height: '$6' as const,
    borderRadius: '$full' as const,
    bg: '$primary100' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  taskNumberText: {
    fontSize: '$xs' as const,
    color: '$primary500' as const,
    fontWeight: '$medium' as const,
  },
  taskName: {
    ...bodyText,
    fontWeight: '$medium' as const,
  },
  mutedCell: {
    ...bodyText,
    color: '$textMutedForeground' as const,
  },
  summaryValue: {
    fontSize: '$2xl' as const,
    fontWeight: '$normal' as const,
    color: '$textForeground' as const,
    mt: '$1' as const,
  },
  // Line shown above the row a dragged task will be dropped on
  dropTargetRow: {
    borderTopWidth: 2,
    borderTopColor: '$primary500' as const,
  },
  addTaskButton: {
    alignSelf: 'flex-end' as const,
    bg: '$white' as const,
    borderWidth: 1,
    borderColor: '$borderLight300' as const,
    borderRadius: '$md' as const,
    px: '$3' as const,
    py: '$1.5' as const,
    mb: '$3' as const,
  },
  // Tasks | Sub-categories tabs inside a pillar
  tabBar: {
    alignSelf: 'flex-start' as const,
    bg: '$bgSidebar' as const,
    borderRadius: '$lg' as const,
    p: '$1' as const,
    mb: '$4' as const,
    space: 'xs' as const,
  },
  tab: {
    px: '$3' as const,
    py: '$1.5' as const,
    borderRadius: '$md' as const,
  },
  tabActive: {
    bg: '$white' as const,
    borderWidth: 1,
    borderColor: '$borderLight200' as const,
  },
  tabText: {
    ...bodyText,
    color: '$textMutedForeground' as const,
  },
  tabTextActive: {
    color: '$textForeground' as const,
    fontWeight: '$medium' as const,
  },
  subCategoryRow: {
    alignItems: 'center' as const,
    py: '$2' as const,
    borderBottomWidth: 1,
    borderColor: '$borderLight100' as const,
  },
  editButton: {
    p: '$1.5' as const,
    borderRadius: '$md' as const,
    $hover: { bg: '$bgSidebar' },
  },
  notFoundText: {
    ...bodyText,
    color: '$textMutedForeground' as const,
    mt: '$4' as const,
  },
};

// Column widths for the task table (drag | # | Task Name | Description | Edit)
export const TASK_TABLE_COLUMNS = {
  drag: { width: 24, alignItems: 'center' as const, pt: '$0.5' as const },
  number: { width: 40 },
  name: { flex: 1.5, minWidth: 180 },
  description: { flex: 2, minWidth: 220 },
  actions: { width: 40, alignItems: 'center' as const },
};

export const TASK_TABLE_MIN_WIDTH = 570;
