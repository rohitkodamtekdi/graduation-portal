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
  Button,
  ButtonText,
} from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import type { ParticipantData } from '@app-types/participant';
import {
  getAttendedSessions,
  AttendedSessionItem,
} from '../../../services/SupportOfferingsServices/supportOfferingsService';
import { attendedSessionsStyles as styles } from './Styles';
import moment from 'moment';

const PAGE_LIMIT = 10;

interface AttendedSessionsProps {
  participant?: ParticipantData;
}

const AttendedSessions: React.FC<AttendedSessionsProps> = ({ participant }) => {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<AttendedSessionItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'ATTENDED' | 'MISSED'>('ATTENDED');

  const filterOptions = [
    { label: t('participantDetail.attendedSessions.attended'), value: 'ATTENDED' },
    { label: t('participantDetail.attendedSessions.missed'), value: 'MISSED' },
  ];

  const participantId = participant?.userId || participant?.id || (participant as any)?._id;

  const fetchSessions = useCallback(async () => {
    // The attendedSessions API only returns joined sessions; missed sessions are not supported yet
    if (!participantId || filterType === 'MISSED') {
      setSessions([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }
    const isFirstPage = page === 1;
    isFirstPage ? setIsLoading(true) : setIsLoadingMore(true);
    try {
      const res = await getAttendedSessions(participantId, { page, limit: PAGE_LIMIT });
      const data = res.data || [];
      setSessions((prev) => (isFirstPage ? data : [...prev, ...data]));
      setTotalCount(res.count ?? 0);
    } catch (err) {
      console.error('Error fetching attended sessions:', err);
      if (isFirstPage) {
        setSessions([]);
        setTotalCount(0);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [participantId, filterType, page]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const formatDate = useCallback((val: any) => {
    if (!val) return '--';
    const num = Number(val);
    if (!isNaN(num)) {
      const ms = num < 10000000000 ? num * 1000 : num;
      return moment(ms).format('ddd, D MMM YYYY');
    }
    const m = moment(val);
    return m.isValid() ? m.format('ddd, D MMM YYYY') : String(val);
  }, []);

  const isAttended = filterType === 'ATTENDED';
  const sectionTitle = isAttended
    ? t('participantDetail.attendedSessions.sectionTitle')
    : t('participantDetail.attendedSessions.missed');

  return (
    <Box {...styles.container}>
      {/* Header with Title and Filter */}
      <HStack {...styles.headerHStack}>
        <Text {...styles.headerTitleText}>
          {`${sectionTitle} (${totalCount})`}
        </Text>
        <Box {...styles.filterSelectBox}>
          <Select
            options={filterOptions}
            value={filterType}
            onChange={(val: any) => {
              setPage(1);
              setFilterType(val as 'ATTENDED' | 'MISSED');
            }}
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
            {t('participantDetail.attendedSessions.noSessionsTitle')}
          </Text>
          <Text {...styles.emptyDescription}>
            {isAttended
              ? t('participantDetail.attendedSessions.noAttended')
              : t('participantDetail.attendedSessions.noMissed')}
          </Text>
        </VStack>
      ) : (
        /* Sessions List */
        <VStack {...styles.listVStack}>
          {sessions.map((item) => {
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
                          ? t('participantDetail.attendedSessions.attended')
                          : t('participantDetail.attendedSessions.missed')}
                      </BadgeText>
                    </Badge>
                  </HStack>
                  <LucideIcon name="ChevronRight" {...styles.chevronIconProps} />
                </HStack>

                <Text {...styles.subtitleText}>
                  {item.mentor_name ||
                    t('participantDetail.attendedSessions.serviceProvider')}
                </Text>

                {/* Date and Mode */}
                <HStack {...styles.metaRowHStack}>
                  <HStack {...styles.metaItemHStack}>
                    <LucideIcon name="Calendar" {...styles.metaIconProps} />
                    <Text {...styles.metaText}>{formatDate(item.start_date)}</Text>
                  </HStack>
                  <HStack {...styles.metaItemHStack}>
                    <LucideIcon name="Building2" {...styles.metaIconProps} />
                    <Text {...styles.metaText}>{mediumText}</Text>
                  </HStack>
                </HStack>
              </Box>
            );
          })}
          {sessions.length < totalCount && (
            <Box {...styles.loadMoreContainer}>
              {!isLoadingMore ? (
                <Button onPress={() => setPage((prev) => prev + 1)}>
                  <ButtonText>
                    {t('supportProvider.supportOfferings.buttonTexts.loadMoreSessions')}
                  </ButtonText>
                </Button>
              ) : (
                <Spinner />
              )}
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default AttendedSessions;
