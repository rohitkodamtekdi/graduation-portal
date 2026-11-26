import React, { useEffect, useState } from 'react';
import { Switch } from 'react-native';
import Modal from '@components/ui/Modal';
import { Box, HStack, Input, InputField, LucideIcon, Text, Textarea, TextareaInput, VStack } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { theme } from '@config/theme';
import { TemplateStatus } from '@app-types/templateManagement';

export interface EditableValues {
  name: string;
  description: string;
  status?: TemplateStatus;
}

interface EditTemplateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Translation key for the modal title */
  titleKey: string;
  initialValues: EditableValues;
  /** Shows the Active toggle (pathways and pillars) */
  showStatus?: boolean;
  /** Shows the Description field (hidden for sub-categories, which are name-only) */
  showDescription?: boolean;
  /** Extra warning, e.g. for tasks shared by both pathways */
  warningKey?: string;
  onSave: (values: EditableValues) => Promise<void>;
}

const NAME_MAX_LENGTH = 200;
const DESCRIPTION_MAX_LENGTH = 1000;

const EditTemplateItemModal: React.FC<EditTemplateItemModalProps> = ({
  isOpen,
  onClose,
  titleKey,
  initialValues,
  showStatus = false,
  showDescription = true,
  warningKey,
  onSave,
}) => {
  const { t } = useLanguage();
  const [values, setValues] = useState<EditableValues>(initialValues);
  const [showNameError, setShowNameError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues);
      setShowNameError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSave = async () => {
    if (!values.name.trim()) {
      setShowNameError(true);
      return;
    }
    setIsSaving(true);
    try {
      await onSave({ ...values, name: values.name.trim(), description: values.description.trim() });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSaving ? () => {} : onClose}
      size="md"
      headerIcon={<LucideIcon name="Pencil" size={20} color={theme.tokens.colors.primary500} />}
      headerTitle={t(titleKey)}
      showCloseButton
      cancelButtonText={t('common.cancel')}
      confirmButtonText={t('admin.templates.edit.save')}
      confirmLoading={isSaving}
      onCancel={onClose}
      onConfirm={handleSave}
    >
      <VStack space="md">
        <VStack space="xs">
          <Text fontSize="$sm" fontWeight="$medium" color="$textForeground">
            {t('admin.templates.edit.name')}
            <Text color="$error600"> *</Text>
          </Text>
          <Input isDisabled={isSaving} isInvalid={showNameError}>
            <InputField
              value={values.name}
              maxLength={NAME_MAX_LENGTH}
              onChangeText={(name: string) => {
                setValues(prev => ({ ...prev, name }));
                if (showNameError && name.trim()) setShowNameError(false);
              }}
            />
          </Input>
          {showNameError && (
            <Text fontSize="$xs" color="$error600">
              {t('admin.templates.edit.nameRequired')}
            </Text>
          )}
        </VStack>

        {showDescription && (
          <VStack space="xs">
            <Text fontSize="$sm" fontWeight="$medium" color="$textForeground">
              {t('admin.templates.edit.description')}
            </Text>
            <Textarea isDisabled={isSaving}>
              <TextareaInput
                value={values.description}
                maxLength={DESCRIPTION_MAX_LENGTH}
                onChangeText={(description: string) => setValues(prev => ({ ...prev, description }))}
              />
            </Textarea>
          </VStack>
        )}

        {showStatus && (
          <HStack alignItems="center" justifyContent="space-between" space="md">
            <VStack flex={1}>
              <Text fontSize="$sm" fontWeight="$medium" color="$textForeground">
                {t('admin.templates.edit.active')}
              </Text>
              <Text fontSize="$xs" color="$textMutedForeground">
                {t('admin.templates.edit.activeHelper')}
              </Text>
            </VStack>
            <Switch
              value={values.status === 'Active'}
              disabled={isSaving}
              onValueChange={isActive =>
                setValues(prev => ({ ...prev, status: isActive ? 'Active' : 'Inactive' }))
              }
              trackColor={{ false: theme.tokens.colors.borderColor, true: theme.tokens.colors.primary500 }}
              accessibilityLabel={t('admin.templates.edit.active')}
            />
          </HStack>
        )}

        {warningKey && (
          <Box bg="$warning50" borderWidth={1} borderColor="$warning200" borderRadius="$lg" p="$3">
            <HStack space="sm" alignItems="flex-start">
              <LucideIcon name="AlertTriangle" size={16} color="$warning600" />
              <Text flex={1} fontSize="$xs" color="$warning700">
                {t(warningKey)}
              </Text>
            </HStack>
          </Box>
        )}

        <Text fontSize="$xs" color="$textMutedForeground">
          {t('admin.templates.edit.newIdpsOnlyNote')}
        </Text>
      </VStack>
    </Modal>
  );
};

export default EditTemplateItemModal;
