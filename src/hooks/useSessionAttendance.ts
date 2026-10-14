import { useState } from 'react';
import { useAlert } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { completeTrainingSession } from '../services/SupportOfferingsServices/supportOfferingsService';
import { getEnrolledMentees } from '../services/mentoringService';
import type { ParticipantAttendanceItem } from '../types/supportOfferingsTypes';

/**
 * Shared Confirm Attendance / Complete flow for a training session: loads the enrolled
 * participants when the modal opens and marks the selected ones as attended.
 */
export function useSessionAttendance(
  sessionId: string | number | undefined,
  onCompleted?: (selectedParticipantIds: string[]) => void,
) {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [participants, setParticipants] = useState<ParticipantAttendanceItem[] | null>(null);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  const openModal = async () => {
    setIsModalOpen(true);
    if (!sessionId || participants || isLoadingParticipants) return;

    setIsLoadingParticipants(true);
    try {
      const mentees = await getEnrolledMentees(sessionId);
      setParticipants(
        (mentees || []).map((mentee: any) => ({
          id: String(mentee.id),
          name: mentee.name || '',
          lcName: mentee.organization?.name || '',
          isPresent: !!mentee.is_attended,
        })),
      );
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const confirmAttendance = async (selectedParticipantIds: string[]) => {
    if (!sessionId || isCompleting) return;

    setIsCompleting(true);
    try {
      await completeTrainingSession(sessionId, { mentees: selectedParticipantIds });

      // Keep the cached list in sync so reopening the modal shows the saved attendance
      setParticipants(prev =>
        prev ? prev.map(p => ({ ...p, isPresent: selectedParticipantIds.includes(p.id) })) : prev,
      );
      onCompleted?.(selectedParticipantIds);
      setIsModalOpen(false);
      showAlert('success', t('supportProvider.supportOfferings.cards.alerts.sessionCompleted'));
    } catch (error) {
      console.error('Error completing session via API:', error);
      showAlert('error', 'Failed to complete session. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    isModalOpen,
    openModal,
    closeModal: () => setIsModalOpen(false),
    participants,
    isLoadingParticipants,
    isCompleting,
    confirmAttendance,
  };
}
