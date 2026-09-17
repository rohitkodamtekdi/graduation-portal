import React from 'react';
import Modal from '@components/ui/Modal';
import { VStack, Text, Box, LucideIcon } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { theme } from '@config/theme';

interface CancelInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  statusLabel: string;
  participantsInfo?: string;
  supportTypeLabel: string;
  location?: string;
  isSubmitting?: boolean;
  onConfirmCancel: () => void;
}

const CancelInterventionModal: React.FC<CancelInterventionModalProps> = ({
  isOpen,
  onClose,
  title,
  statusLabel,
  participantsInfo,
  supportTypeLabel,
  location,
  isSubmitting = false,
  onConfirmCancel,
}) => {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      headerIcon={<LucideIcon name="XCircle" size={22} color={theme.tokens.colors.error600} />}
      headerTitle={t('supportProvider.supportOfferings.cancelModal.title', 'Cancel Support Intervention')}
      headerDescription={title}
      showCloseButton
      cancelButtonText={t('supportProvider.supportOfferings.cancelModal.keep', 'Keep Intervention')}
      confirmButtonText={t('supportProvider.supportOfferings.cancelModal.confirm', 'Confirm Cancel Intervention')}
      confirmButtonColor={theme.tokens.colors.error600}
      confirmLoading={isSubmitting}
      onCancel={onClose}
      onConfirm={onConfirmCancel}
    >
      <VStack space="md">
        <Text fontSize="$sm" color="$textPrimary">
          {t(
            'supportProvider.supportOfferings.cancelModal.confirmText',
            'Are you sure you want to cancel this upcoming intervention?',
          )}
        </Text>

        <Box bg="$error50" borderWidth={1} borderColor="$error200" borderRadius="$lg" p="$3.5">
          <VStack space="xs">
            <Text fontWeight="$bold" fontSize="$sm" color="$error700">
              {title}
            </Text>
            <Text fontSize="$xs" color="$error700">
              {`• ${t('supportProvider.supportOfferings.cancelModal.status', 'Status')}: ${statusLabel}${participantsInfo ? ` (${participantsInfo})` : ''}`}
            </Text>
            <Text fontSize="$xs" color="$error700">
              {`• ${t('supportProvider.supportOfferings.cancelModal.supportType', 'Support Type')}: ${supportTypeLabel}`}
            </Text>
            {location ? (
              <Text fontSize="$xs" color="$error700">
                {`• ${t('supportProvider.supportOfferings.cancelModal.location', 'Location')}: ${location}`}
              </Text>
            ) : null}
          </VStack>
        </Box>

        <Text fontSize="$xs" color="$textMuted">
          {t(
            'supportProvider.supportOfferings.cancelModal.note',
            'Cancelling this intervention will update its status to cancelled in your offerings portfolio.',
          )}
        </Text>
      </VStack>
    </Modal>
  );
};

export default CancelInterventionModal;
