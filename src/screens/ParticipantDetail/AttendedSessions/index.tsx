import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Button,
  ButtonText,
  Pressable,
  LucideIcon,
} from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import type { ParticipantData } from '@app-types/participant';
import { getMenteeSessions } from '../../../services/SupportOfferingsServices/supportOfferingsService';
import { formatDateString } from '@utils/helper';
import { attendedSessionsStyles as styles } from './Styles';

const PAGE_LIMIT = 10;

type FilterType = 'ATTENDED' | 'MISSED' | 'SCHEDULED';

interface AttendedSessionsProps {
  participant?: ParticipantData;
}

// delivery_mode comes back as a plain string or as a { value, label } object
const deliveryModeText = (mode: any): string =>
  mode && typeof mode === 'object' ? String(mode.label ?? mode.value ?? '') : mode ?? '';

// Linkage type is top-level on attended rows and inside meta on scheduled rows; missed rows don't send it yet
const TYPE_TAG_KEYS = ['training', 'additional_service', 'asset'];
const linkageType = (session: any): string => {
  const raw = session?.support_offering_type ?? session?.meta?.support_offering_type;
  const value = raw && typeof raw === 'object' ? raw.value : raw;
  return value === 'training_session' ? 'training' : value ?? '';
};

const AttendedSessions: React.FC<AttendedSessionsProps> = ({ participant }) => {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState<FilterType>('ATTENDED');

  const filterOptions = [
    { label: t('participantDetail.attendedSessions.attended'), value: 'ATTENDED' },
    { label: t('participantDetail.attendedSessions.missed'), value: 'MISSED' },
    { label: t('participantDetail.attendedSessions.scheduled'), value: 'SCHEDULED' },
  ];

  const participantName = participant?.name ?? '';
  const isAttended = filterType === 'ATTENDED';
  const isScheduled = filterType === 'SCHEDULED';
  // No scope returns the upcoming (scheduled) sessions
  const scope = isAttended ? 'attended' : isScheduled ? undefined : 'missed';
  const statusKey = isAttended ? 'attended' : isScheduled ? 'scheduled' : 'missed';
  const [sessions, setSessions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Restart from the first page when the participant or tab changes
  useEffect(() => {
    setPage(1);
    setSessions([]);
    setTotalCount(0);
  }, [participant?.userId, filterType]);

  useEffect(() => {
    const menteeId = participant?.userId;
    if (!menteeId) return;
    let cancelled = false;
    setLoading(true);
    getMenteeSessions(menteeId, scope, page, PAGE_LIMIT)
      .then(({ data, count }) => {
        if (cancelled) return;
        setSessions(prev => (page === 1 ? data : [...prev, ...data]));
        setTotalCount(count);
      })
      .catch(() => !cancelled && page === 1 && setSessions([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [participant?.userId, filterType, page]);

  const hasMore = sessions.length < totalCount;

  const formatEpoch = (value?: string) =>
    value ? formatDateString(new Date(Number(value) * 1000).toISOString()) : '';

  return (
    <Box {...styles.container}>
      {/* Header with Title and Filter */}
      <HStack {...styles.headerHStack}>
        <Text {...styles.headerTitleText}>
          {t(
            isAttended
              ? 'participantDetail.attendedSessions.sectionTitle'
              : isScheduled
                ? 'participantDetail.attendedSessions.scheduledSectionTitle'
                : 'participantDetail.attendedSessions.missedSectionTitle'
          )}{' '}
          ({totalCount || sessions.length})
        </Text>
        <HStack {...styles.toggleHStack}>
          {filterOptions.map(opt => {
            const active = opt.value === filterType;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setFilterType(opt.value as FilterType)}
                {...styles.toggleButton(active)}>
                <Text {...styles.toggleButtonText(active)}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </HStack>
      </HStack>

      {loading && sessions.length === 0 ? (
        <Box {...styles.loadingContainer}>
          <Spinner size="large" color="$primary500" />
        </Box>
      ) : sessions.length === 0 ? (
        <Box {...styles.emptyStateContainer}>
          <VStack {...styles.emptyStateVStack}>
            <Box {...styles.emptyStateIconContainer}>
              <LucideIcon name="Clock" size={30} color="$textMutedForeground" />
            </Box>
            <Text {...styles.emptyStateTitle}>
              {isAttended
                ? t('participantDetail.attendedSessions.noAttendedTitle', 'No attended linkages')
                : isScheduled
                  ? t('participantDetail.attendedSessions.noScheduledTitle', 'No scheduled linkages')
                  : t('participantDetail.attendedSessions.noMissedTitle', 'No missed linkages')}
            </Text>
            <Text {...styles.emptyStateDescription}>
              {isAttended
                ? t('participantDetail.attendedSessions.noAttended', { name: participantName })
                : isScheduled
                  ? t('participantDetail.attendedSessions.noScheduled', { name: participantName })
                  : t('participantDetail.attendedSessions.noMissed', { name: participantName })}
            </Text>
          </VStack>
        </Box>
      ) : (
        <VStack {...styles.listVStack}>
          {sessions.map(session => (
            <Box key={session.id} {...styles.card(isAttended)}>
              <HStack {...styles.cardHeaderHStack}>
                <HStack {...styles.cardTitleHStack}>
                  <Text {...styles.cardTitleText}>{session.title}</Text>
                  {TYPE_TAG_KEYS.includes(linkageType(session)) && (
                    <Box {...styles.tagBadge(true)}>
                      <Text {...styles.tagBadgeText(true)}>
                        {t(`participantDetail.attendedSessions.typeTags.${linkageType(session)}`)}
                      </Text>
                    </Box>
                  )}
                  <Box {...styles.statusBadge(isAttended)}>
                    <Text {...styles.statusBadgeText(isAttended)}>
                      {t(`participantDetail.attendedSessions.${statusKey}`)}
                    </Text>
                  </Box>
                </HStack>
              </HStack>
              {!!session.description && (
                <Text {...styles.subtitleText}>{session.description}</Text>
              )}
              <HStack {...styles.metaRowHStack}>
                <HStack {...styles.metaItemHStack}>
                  <LucideIcon name="Calendar" size={14} color="$textSecondary" />
                  <Text {...styles.metaText}>{formatEpoch(session.start_date)}</Text>
                </HStack>
                {!!session.mentor_name && (
                  <Text {...styles.metaText}>
                    {t('participantDetail.attendedSessions.serviceProvider')}: {session.mentor_name}
                  </Text>
                )}
                {!!deliveryModeText(session.delivery_mode) && (
                  <HStack {...styles.metaItemHStack}>
                    <LucideIcon name="Building2" size={14} color="$success600" />
                    <Text {...styles.deliveryText}>{deliveryModeText(session.delivery_mode)}</Text>
                  </HStack>
                )}
              </HStack>
            </Box>
          ))}
          {hasMore && (
            <Box alignItems="center" mt="$4" width="100%">
              {loading ? (
                <Spinner />
              ) : (
                <Button onPress={() => setPage(prev => prev + 1)}>
                  <ButtonText>
                    {t(
                      'supportProvider.supportOfferings.buttonTexts.loadMoreSessions',
                      'Load More Sessions'
                    )}
                  </ButtonText>
                </Button>
              )}
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default AttendedSessions;