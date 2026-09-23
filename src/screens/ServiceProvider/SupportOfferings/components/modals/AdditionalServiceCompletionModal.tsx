import React, { useCallback, useEffect, useState } from 'react';
import { Badge, BadgeText, Text, useAlert } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { useRequesterInfo } from '@hooks/useSessionStatus';
import SessionCompleteModal from './SessionCompleteModal';
import type { ParticipantAttendanceItem, ServiceItem } from '../../../../../types/supportOfferingsTypes';
import { getEnrolledMentees } from '../../../../../services/mentoringService';
import { completeTrainingSession } from '../../../../../services/SupportOfferingsServices/supportOfferingsService';

const BASE_PATH = 'supportProvider.supportOfferings.additionalServiceCompletionModal';

interface AdditionalServiceCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
}

export default function AdditionalServiceCompletionModal({
  isOpen,
  onClose,
  service,
}: AdditionalServiceCompletionModalProps): React.JSX.Element | null {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const { requesterName, requesterOrgName } = useRequesterInfo(service as any);

  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<ParticipantAttendanceItem[]>([]);

  const fetchParticipants = useCallback(async () => {
    if (!service) return;
    setIsLoading(true);
    try {
      // Same enrolled-participants lookup "Confirm Attendance" already uses for Training Sessions -
      // additional services share the same underlying session model, so the offering's own id
      // resolves its enrolled/assigned participants directly (no separate request record needed).
      const mentees = await getEnrolledMentees(service.id);
      setParticipants(
        (mentees || []).map((mentee: any) => ({
          id: String(mentee.id),
          name: mentee.name || '',
          lcName: mentee.organization?.name || '',
          isPresent: false,
        })),
      );
    } catch (error) {
      showAlert('error', t(`${BASE_PATH}.fetchFailed`, 'Failed to load participants. Please try again.'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id]);

  useEffect(() => {
    if (isOpen) fetchParticipants();
  }, [isOpen, fetchParticipants]);

  const handleConfirmComplete = async (selectedParticipantIds: string[]) => {
    if (!service) return;
    try {
      await completeTrainingSession(service.id, { mentees: selectedParticipantIds });
      showAlert('success', t(`${BASE_PATH}.saved`, 'Completion status saved.'));
    } catch (error) {
      showAlert('error', t(`${BASE_PATH}.completeFailed`, 'Failed to save completion. Please try again.'));
    }
  };

  if (!service) return null;

  return (
    <SessionCompleteModal
      isOpen={isOpen}
      onClose={onClose}
      sessionTitle={service.title}
      expectedParticipantsCount={participants.length}
      initialParticipants={participants}
      isLoadingParticipants={isLoading}
      onConfirmComplete={handleConfirmComplete}
      onCancel={onClose}
      title={t(`${BASE_PATH}.title`, 'Service Completion & Attendance')}
      headerBadge={
        <Badge bg="$primary100" borderRadius="$full" px="$2.5" py="$0.5" alignSelf="flex-start">
          <BadgeText fontSize="$xs" color="$primary600">
            {t(`${BASE_PATH}.badge`, 'Additional Service')}
          </BadgeText>
        </Badge>
      }
      headerDescription={
        <Text fontSize="$sm" color="$textSecondary">
          {service.title}
          {requesterName
            ? ` • ${t(`${BASE_PATH}.requestedBy`, {
              defaultValue: 'Requested by {{name}}{{org}}',
              name: requesterName,
              org: requesterOrgName ? ` (${requesterOrgName})` : '',
            })}`
            : ''}
        </Text>
      }
      showParticipantStatusBadge
      cancelButtonText={t('common.cancel', 'Cancel')}
      confirmButtonText={t(`${BASE_PATH}.confirmButton`, 'Confirm & Save Completion')}
    />
  );
}
