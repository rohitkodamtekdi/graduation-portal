import React from 'react';
import { VStack, Text, LucideIcon } from '@ui';
import TitleHeader from '@components/TitleHeader';
import { useLanguage } from '@contexts/LanguageContext';
import { participantsReportStyles as styles } from './Styles';

// Sample Participants report for Report Manager; the actual report content will be added later
const ParticipantsReport = () => {
  const { t } = useLanguage();

  return (
    <VStack {...styles.container}>
      <TitleHeader title="admin.participantsReport.title" description="admin.participantsReport.description" />

      <VStack space="sm" {...styles.sampleCard}>
        <LucideIcon name="Users" size={32} color="$primary500" />
        <Text {...styles.sampleTitle}>{t('admin.participantsReport.sampleTitle')}</Text>
        <Text {...styles.sampleText}>{t('admin.participantsReport.sampleText')}</Text>
      </VStack>
    </VStack>
  );
};

export default ParticipantsReport;
