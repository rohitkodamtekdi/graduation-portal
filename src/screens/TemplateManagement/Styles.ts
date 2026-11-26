import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';

// Base column text style - common properties shared by all column text styles
const columnTextBase = {
  fontWeight: '$normal' as const,
  fontSize: '$sm' as const,
};

export const templateManagementStyles = {
    errorText: {
        fontWeight: '$normal',
        fontSize: '$sm',
        color: '$textMutedForeground',
    },
    tableContainer: {
        bg: '$white' as const,
        padding: '$6' as const,
        borderRadius: '$xl' as const,
        borderWidth: 1,
        borderColor: '$borderColor' as const,
        mt: '$6',
    },
    tableHeaderContainer: {
        mb: '$6',
    },
    tableHeaderTitle: {
        fontWeight: '$normal',
        fontSize: '$lg',
        color: '$textForeground',
    },
    // Status Badge Styles
    statusBadge: {
        paddingHorizontal: '$2' as const,
        paddingVertical: '$0.5' as const,
        borderRadius: '$md' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    statusBadgeText: {
        color: '$white' as const,
        fontWeight: '$medium' as const,
        fontSize: '$xs' as const,
    },
    statusBadgeActive: {
        bg: '$success600' as const,
    },
    statusBadgeInactive: {
        bg: '$textMutedForeground' as const,
    },
    // Column Text Styles - using base style with color overrides
    templateNameText: {
        ...columnTextBase,
        color: '$textForeground' as const,
    },
    creatorText: {
        ...columnTextBase,
        color: '$textForeground' as const,
    },
    tasksText: {
        ...columnTextBase,
        color: '$textForeground' as const,
    },
    createdDateText: {
        ...columnTextBase,
        color: '$textForeground' as const,
    },
} as const;