import React from 'react';
import { Box, HStack, VStack, Text, Button, ButtonText, Badge, BadgeText, Spinner, LucideIcon } from '@ui';
import moment from 'moment';
import { useLanguage } from '@contexts/LanguageContext';
import { useSessionStatus } from '@hooks/useSessionStatus';
import styles from '../styles';

interface LcMySessionTabProps {
  item: {
    id?: string;
    _id?: string;
    title?: string;
    status?: string;
    start_date?: string | number;
    end_date?: string | number;
    seats_limit?: number;
    seats_remaining?: number;
    delivery_mode?: string | { value: string };
    [key: string]: any;
  };
  isFirst?: boolean;
  onAssignParticipants?: (item: any) => void;
  onEditSession?: (sessionId: string) => void;
  isShowLoadMore?: boolean;
  onLoadMoreItems?: () => void;
  isLoadingMore?: boolean;
}

const getStatusColors = (status: string) => {
  const s = (status || '').toUpperCase();
  if (s === 'UPCOMING') {
    return { bg: '$blue50', border: '$blue200', text: '$blue600', icon: 'Clock' };
  }
  if (s === 'IN PROGRESS') {
    return { bg: '$observationTaskBg', border: '#fde68a', text: '$warningIconColor', icon: 'AlertCircle' };
  }
  if (s === 'COMPLETED') {
    return { bg: '$success50', border: '#a7f3d0', text: '$success600', icon: 'CheckCircle' };
  }
  if (s === 'DRAFT') {
    return { bg: '$backgroundLight100', border: '$borderColor', text: '$textMuted', icon: 'FileText' };
  }
  if (s === 'CANCELLED') {
    return { bg: '$error50', border: '$red200', text: '$red600', icon: 'XCircle' };
  }
  return { bg: '$blue50', border: '$blue200', text: '$blue600', icon: 'Clock' };
};

const LcMySessionTab: React.FC<LcMySessionTabProps> = ({
  item,
  isFirst,
  onAssignParticipants,
  onEditSession,
  isShowLoadMore,
  onLoadMoreItems,
  isLoadingMore = false,
}) => {
  const { t } = useLanguage();
  const { statusTag: statusLabel } = useSessionStatus(item);
  const statusColors = getStatusColors(statusLabel);

  // Date & Time display matching Browse Trainings & Sessions card format
  const displayDateTime = (() => {
    if (!item.start_date) return '--';
    const startNum = Number(item.start_date);
    const startMs = !isNaN(startNum)
      ? (startNum < 10000000000 ? startNum * 1000 : startNum)
      : new Date(item.start_date).getTime();

    const startFormatted = moment(startMs).format('ddd, D MMM YYYY HH:mm');

    if (item.end_date) {
      const endNum = Number(item.end_date);
      const endMs = !isNaN(endNum)
        ? (endNum < 10000000000 ? endNum * 1000 : endNum)
        : new Date(item.end_date).getTime();

      const endFormatted = moment(endMs).format('HH:mm');
      return `${startFormatted} - ${endFormatted}`;
    }

    return startFormatted;
  })();

  // Duration display (e.g. "2 hours", or "2 days 2 hours" when >= 24 hours)
  const displayDuration = (() => {
    if (item.start_date && item.end_date) {
      const startNum = Number(item.start_date);
      const startMs = !isNaN(startNum)
        ? (startNum < 10000000000 ? startNum * 1000 : startNum)
        : new Date(item.start_date).getTime();
      const endNum = Number(item.end_date);
      const endMs = !isNaN(endNum)
        ? (endNum < 10000000000 ? endNum * 1000 : endNum)
        : new Date(item.end_date).getTime();
      const diffMins = Math.round((endMs - startMs) / 60000);
      if (diffMins <= 0) return null;

      const days = Math.floor(diffMins / 1440);
      const hours = Math.floor((diffMins % 1440) / 60);
      const mins = diffMins % 60;

      const parts: string[] = [];
      if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
      if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
      if (mins > 0) parts.push(`${mins} min${mins > 1 ? 's' : ''}`);

      return parts.join(' ');
    }
    if (item.duration) {
      return `${item.duration}`;
    }
    return null;
  })();

  // Participants display
  const maxParticipants = item.seats_limit || item.max_participants || 0;
  const seatsRemaining = item.seats_remaining ?? maxParticipants;
  const assignedCount = maxParticipants - seatsRemaining;

  // Editing is only allowed for upcoming sessions that have no participants assigned yet.
  const canEditSession = statusLabel === 'Upcoming' && assignedCount <= 0;

  // Delivery mode display
  const rawMode = ((typeof item.delivery_mode === 'object' ? (item.delivery_mode as any)?.value : item.delivery_mode) || '').toLowerCase();

  const deliveryModeLabel = rawMode.includes('online')
    ? 'Online'
    : rawMode.includes('hybrid')
      ? 'Hybrid'
      : rawMode
        ? rawMode.charAt(0).toUpperCase() + rawMode.slice(1)
        : null;

  return (
    <VStack space="sm" width="100%">
      {/* Description line shown above the first card only */}
      {isFirst && (
        <Text {...styles.mySessionsDescriptionText}>
          {t('lc.sessionsSupport.mySessionsDescription', 'Sessions created and conducted by you.')}
        </Text>
      )}

      <Box {...styles.mySessionCard}>
        <VStack {...styles.mySessionCardVStack}>
          {/* ROW 1: Title + Status Badge */}
          <HStack {...styles.mySessionCardHeaderRow}>
            <Text {...styles.mySessionCardTitle} flex={1} numberOfLines={2}>
              {item.title || 'Untitled Session'}
            </Text>
            <Badge borderWidth={1} borderColor={statusColors.border} bg={statusColors.bg} borderRadius="$full" px="$2" py="$0.5">
              <HStack space="xs" alignItems="center">
                <LucideIcon name={statusColors.icon} size={11} color={statusColors.text} />
                <BadgeText {...styles.mySessionCardStatusBadgeText} color={statusColors.text}>
                  {statusLabel}
                </BadgeText>
              </HStack>
            </Badge>
          </HStack>

          {/* ROW 2: Metadata */}
          <HStack {...styles.mySessionCardMetaRow}>
            {/* Date & Time */}
            <HStack {...styles.mySessionCardMetaItem}>
              <LucideIcon name="Calendar" size={12} color="$textSecondary" />
              <Text {...styles.mySessionCardMetaText}>{displayDateTime}</Text>
            </HStack>

            {/* Duration */}
            {displayDuration && (
              <HStack {...styles.mySessionCardMetaItem}>
                <LucideIcon name="Clock" size={12} color="$textSecondary" />
                <Text {...styles.mySessionCardMetaText}>{displayDuration}</Text>
              </HStack>
            )}


            {/* Participants */}
            {maxParticipants > 0 && (
              <HStack {...styles.mySessionCardMetaItem}>
                <LucideIcon name="Users" size={12} color="$textSecondary" />
                <Text {...styles.mySessionCardMetaText}>
                  {assignedCount} / {maxParticipants} {t('lc.sessionsSupport.mySessionCard.participants')}
                </Text>
              </HStack>
            )}
          </HStack>

          {/* FOOTER: Action Buttons */}
          <HStack {...styles.mySessionCardFooter}>
            <Button variant="outlineghost" {...styles.mySessionCardAssignBtn} onPress={() => onAssignParticipants?.(item)}>
              <ButtonText {...styles.mySessionCardAssignBtnText}>
                {t('lc.sessionsSupport.mySessionCard.assignParticipants')}
              </ButtonText>
            </Button>

            {canEditSession && (
              <Button {...styles.mySessionCardManageBtn} variant="solid" onPress={() => {
                const sessionId = item.id || item._id;
                if (sessionId) {
                  onEditSession?.(sessionId);
                }
              }}>
                <ButtonText {...styles.mySessionCardManageBtnText}>
                  {t('lc.sessionsSupport.mySessionCard.editSession')}
                </ButtonText>
              </Button>
            )}
          </HStack>
        </VStack>
      </Box>

      {isShowLoadMore && (
        <Box alignItems="center" mt="$4" width="100%">
          {!isLoadingMore ? (
            <Button onPress={onLoadMoreItems}>
              <ButtonText>
                {t('supportProvider.supportOfferings.buttonTexts.loadMoreSessions', 'Load More Sessions')}
              </ButtonText>
            </Button>
          ) : (
            <Spinner />
          )}
        </Box>
      )}
    </VStack>
  );
};

export default LcMySessionTab;
