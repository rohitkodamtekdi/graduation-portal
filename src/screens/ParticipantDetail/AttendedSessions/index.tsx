import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  BadgeText,
  Spinner,
  Select,
  LucideIcon,
} from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import type { ParticipantData } from '@app-types/participant';
import {
  getAttendedSessions,
  AttendedSessionItem,
} from '../../../services/SupportOfferingsServices/supportOfferingsService';
import { attendedSessionsStyles as styles } from './Styles';
import moment from 'moment';

interface AttendedSessionsProps {
  participant?: ParticipantData;
}

const AttendedSessions: React.FC<AttendedSessionsProps> = ({ participant }) => {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<AttendedSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'ATTENDED' | 'MISSED'>('ATTENDED');

  const filterOptions = [
    { label: t('participantDetail.attendedSessions.attended', 'Attended'), value: 'ATTENDED' },
    { label: t('participantDetail.attendedSessions.missed', 'Missed'), value: 'MISSED' },
  ];

  const participantId = participant?.userId || participant?.id || (participant as any)?._id;

  const fetchSessions = useCallback(async () => {
    if (!participantId) {
      setSessions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getAttendedSessions(participantId, {
        type: filterType,
        page: 1,
        limit: 50,
      });
      setSessions(res.data || []);
    } catch (err) {
      console.error('Error fetching attended sessions:', err);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [participantId, filterType]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const formatDateTime = (val: any) => {
    if (!val) return '--';
    const num = Number(val);
    if (!isNaN(num)) {
      const ms = num < 10000000000 ? num * 1000 : num;
      return moment(ms).format('ddd, D MMM YYYY, HH:mm');
    }
    const m = moment(val);
    return m.isValid() ? m.format('ddd, D MMM YYYY, HH:mm') : String(val);
  };

  const isAttended = filterType === 'ATTENDED';

  return (
    <Box {...styles.container}>
      {/* Header with Title and Filter */}
      <HStack {...styles.headerHStack}>
        <Text {...styles.headerTitleText}>
          {t('participantDetail.attendedSessions.title', 'Sessions')}
        </Text>
        <Box {...styles.filterSelectBox}>
          <Select
            options={filterOptions}
            value={filterType}
            onChange={(val: any) => setFilterType(val as 'ATTENDED' | 'MISSED')}
          />
        </Box>
      </HStack>

      {/* Loading State */}
      {isLoading ? (
        <Box {...styles.loadingContainer}>
          <Spinner />
        </Box>
      ) : sessions.length === 0 ? (
        /* Empty State */
        <VStack {...styles.content} py="$10" space="xs">
          <Text {...styles.emptyTitle}>
            {t('participantDetail.attendedSessions.noSessionsTitle', 'No Sessions Found')}
          </Text>
          <Text {...styles.emptyDescription}>
            {isAttended
              ? t(
                  'participantDetail.attendedSessions.noAttended',
                  'This participant has not attended any sessions yet.'
                )
              : t(
                  'participantDetail.attendedSessions.noMissed',
                  'No missed sessions recorded for this participant.'
                )}
          </Text>
        </VStack>
      ) : (
        /* Sessions List */
        <VStack {...styles.listVStack}>
          {sessions.map((item) => {
            const displayDate = formatDateTime(item.start_date);
            const mediumText =
              Array.isArray(item.medium) && item.medium.length > 0
                ? item.medium.join(', ')
                : 'Offline';

            return (
              <Box key={item.id} {...styles.card(isAttended)}>
                <HStack {...styles.cardHeaderHStack}>
                  <HStack {...styles.cardTitleHStack}>
                    <Text {...styles.cardTitleText}>{item.title}</Text>
                    <Badge {...styles.statusBadge(isAttended)}>
                      <BadgeText {...styles.statusBadgeText(isAttended)}>
                        {isAttended
                          ? t('participantDetail.attendedSessions.attended', 'Attended')
                          : t('participantDetail.attendedSessions.missed', 'Missed')}
                      </BadgeText>
                    </Badge>
                  </HStack>
                </HStack>

                {/* Subtitle / Date */}
                <Text {...styles.subtitleText}>{displayDate}</Text>

                {/* Metadata Row */}
                <HStack {...styles.metaRowHStack}>
                  <HStack {...styles.metaItemHStack}>
                    <LucideIcon name="MapPin" size={14} color="$textSecondary" />
                    <Text {...styles.metaText}>
                      <Text {...styles.deliveryText}>{mediumText}</Text>
                    </Text>
                  </HStack>
                </HStack>

                {/* Categories / Tags */}
                {Array.isArray(item.categories) && item.categories.length > 0 && (
                  <HStack {...styles.tagsRowHStack}>
                    {item.categories.map((cat, idx) => (
                      <Badge key={idx} {...styles.tagBadge(idx === 0)}>
                        <BadgeText {...styles.tagBadgeText(idx === 0)}>{cat}</BadgeText>
                      </Badge>
                    ))}
                  </HStack>
                )}
              </Box>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

export default AttendedSessions;
