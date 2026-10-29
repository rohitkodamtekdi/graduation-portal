import React, { memo, useCallback } from 'react';
import { Box, Modal, Pressable, Text, VStack } from '@ui';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '@contexts/LanguageContext';

const OPTIONS = [
  { key: 'myself', title: 'projectPlayer.conductMyself', desc: 'projectPlayer.conductMyselfDesc' },
  { key: 'supportProvider', title: 'projectPlayer.conductSupportProvider', desc: 'projectPlayer.conductSupportProviderDesc' },
] as const;

interface ScheduleInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskName?: string;
  // Participant the task belongs to and the task's pillar (session_category); used to pre-filter sessions
  menteeId?: string;
  taskId?: string;
  pillar?: string;
  // Task's training type (its externalId, e.g. SE_TASK_7), so only that type's sessions are listed
  sessionType?: string;
}

/**
 * "Who will be conducting <task>?" prompt. Picking either option opens the sessions-support page.
 */
const ScheduleInterventionModal = memo<ScheduleInterventionModalProps>(({ isOpen, onClose, taskName, menteeId, taskId, pillar, sessionType }) => {
  const { t } = useLanguage();
  const navigation = useNavigation();

  const handleSelect = useCallback((optionKey: string) => {
    onClose();
    const initialFilters = pillar ? { pillar, ...(sessionType ? { type: sessionType } : {}) } : undefined;
    // Myself: My Trainings & Sessions with Assign; Other Support Providers: Browse (existing Assign flow)
    const params = optionKey === 'myself'
      ? { activeTab: 'sessions', activeSubTab: 'my_sessions', initialFilters, assignContext: menteeId ? { menteeId, taskId } : undefined }
      : { activeTab: 'sessions', activeSubTab: 'browse_sessions', initialFilters };
    // @ts-ignore
    navigation.navigate('sessions-support', params);
  }, [navigation, onClose, pillar, sessionType, menteeId, taskId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerTitle={t('projectPlayer.scheduleIntervention')}
      headerAlignment="baseline"
      size="lg"
      cancelButtonText={t('projectPlayer.cancel')}
      confirmButtonText={t('projectPlayer.close')}
    >
      <VStack space="md">
        <Text>
          {taskName
            ? t('projectPlayer.whoWillConduct', { taskName })
            : t('projectPlayer.whoWillConductGeneric')}
        </Text>
        {OPTIONS.map((opt) => (
          <Pressable key={opt.key} onPress={() => handleSelect(opt.key)}>
            <Box borderWidth={1} borderColor="$borderLight200" borderRadius="$lg" padding="$4" $web-cursor="pointer">
              <Text fontWeight="$semibold">{t(opt.title)}</Text>
              <Text size="sm">{t(opt.desc)}</Text>
            </Box>
          </Pressable>
        ))}
      </VStack>
    </Modal>
  );
});
ScheduleInterventionModal.displayName = 'ScheduleInterventionModal';
export default ScheduleInterventionModal;
