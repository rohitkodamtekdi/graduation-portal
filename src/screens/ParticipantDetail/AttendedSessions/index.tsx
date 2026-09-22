import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
} from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import type { ParticipantData } from '@app-types/participant';
import { attendedSessionsStyles as styles } from './Styles';

interface AttendedSessionsProps {
  participant?: ParticipantData;
}

const AttendedSessions: React.FC<AttendedSessionsProps> = () => {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState<'ATTENDED' | 'MISSED'>('ATTENDED');

  const filterOptions = [
    { label: t('participantDetail.attendedSessions.attended', 'Attended'), value: 'ATTENDED' },
    { label: t('participantDetail.attendedSessions.missed', 'Missed'), value: 'MISSED' },
  ];

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

      {/* Empty State */}
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
    </Box>
  );
};

export default AttendedSessions;
