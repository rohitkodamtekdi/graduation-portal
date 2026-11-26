import React, { useEffect, useState } from 'react';
import Modal from '@components/ui/Modal';
import Select from '@components/ui/Inputs/Select';
import { Box, HStack, Input, InputField, LucideIcon, Text, Textarea, TextareaInput, VStack } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { theme } from '@config/theme';
import { PillarProjectTemplate, TaskCreate, TaskSupportType } from '@app-types/templateManagement';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillarName: string;
  /** session_category of the pillar, sent for schedulable tasks */
  sessionCategory: string;
  projectTemplates: PillarProjectTemplate[];
  onSave: (templateId: string, data: TaskCreate) => Promise<void>;
}

const NAME_MAX_LENGTH = 200;
const DESCRIPTION_MAX_LENGTH = 1000;
// 'plain' stands for '' (no support type) because the dropdown needs a non-empty value
const TASK_TYPE_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'plain', labelKey: 'admin.templates.addTask.typePlain' },
  { value: 'training', labelKey: 'admin.templates.addTask.typeTraining' },
  { value: 'additional_service', labelKey: 'admin.templates.addTask.typeAdditionalService' },
  { value: 'asset', labelKey: 'admin.templates.addTask.typeAsset' },
];

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  pillarName,
  sessionCategory,
  projectTemplates,
  onSave,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('plain');
  const [templateId, setTemplateId] = useState('');
  const [showNameError, setShowNameError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setTaskType('plain');
      setTemplateId(projectTemplates[0]?.id || '');
      setShowNameError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const selectedTemplate = projectTemplates.find(template => template.id === templateId);

  const handleSave = async () => {
    if (!name.trim()) {
      setShowNameError(true);
      return;
    }
    if (!templateId) return;

    const supportOfferingType = (taskType === 'plain' ? '' : taskType) as TaskSupportType;
    setIsSaving(true);
    try {
      await onSave(templateId, {
        name: name.trim(),
        description: description.trim(),
        supportOfferingType,
        // Only schedulable tasks are grouped by session category
        sessionCategory: supportOfferingType ? sessionCategory : '',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSaving ? () => {} : onClose}
      size="md"
      headerIcon={<LucideIcon name="Plus" size={20} color={theme.tokens.colors.primary500} />}
      headerTitle={t('admin.templates.addTask.title')}
      headerDescription={t('admin.templates.addTask.subtitle', { pillar: pillarName })}
      showCloseButton
      cancelButtonText={t('common.cancel')}
      confirmButtonText={t('admin.templates.addTask.save')}
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
              value={name}
              maxLength={NAME_MAX_LENGTH}
              onChangeText={(value: string) => {
                setName(value);
                if (showNameError && value.trim()) setShowNameError(false);
              }}
            />
          </Input>
          {showNameError && (
            <Text fontSize="$xs" color="$error600">
              {t('admin.templates.edit.nameRequired')}
            </Text>
          )}
        </VStack>

        <VStack space="xs">
          <Text fontSize="$sm" fontWeight="$medium" color="$textForeground">
            {t('admin.templates.edit.description')}
          </Text>
          <Textarea isDisabled={isSaving}>
            <TextareaInput
              value={description}
              maxLength={DESCRIPTION_MAX_LENGTH}
              onChangeText={setDescription}
            />
          </Textarea>
          <Text fontSize="$xs" color="$textMutedForeground">
            {t('admin.templates.addTask.descriptionHelper')}
          </Text>
        </VStack>

        <VStack space="xs">
          <Text fontSize="$sm" fontWeight="$medium" color="$textForeground">
            {t('admin.templates.addTask.taskType')}
          </Text>
          <Select
            options={TASK_TYPE_OPTIONS.map(option => ({ value: option.value, label: t(option.labelKey) }))}
            value={taskType}
            onChange={(value: string) => setTaskType(value)}
            disabled={isSaving}
          />
          <Text fontSize="$xs" color="$textMutedForeground">
            {t(taskType === 'plain' ? 'admin.templates.addTask.plainHelper' : 'admin.templates.addTask.scheduleHelper')}
          </Text>
        </VStack>

        {/* Pick the template only when the pillar has more than one */}
        {projectTemplates.length > 1 && (
          <VStack space="xs">
            <Text fontSize="$sm" fontWeight="$medium" color="$textForeground">
              {t('admin.templates.addTask.projectTemplate')}
            </Text>
            <Select
              options={projectTemplates.map(template => ({ value: template.id, label: template.title }))}
              value={templateId}
              onChange={(value: string) => setTemplateId(value)}
              disabled={isSaving}
            />
          </VStack>
        )}

        {selectedTemplate?.isShared && (
          <Box bg="$warning50" borderWidth={1} borderColor="$warning200" borderRadius="$lg" p="$3">
            <HStack space="sm" alignItems="flex-start">
              <LucideIcon name="AlertTriangle" size={16} color="$warning600" />
              <Text flex={1} fontSize="$xs" color="$warning700">
                {t('admin.templates.addTask.sharedWarning')}
              </Text>
            </HStack>
          </Box>
        )}

        <Text fontSize="$xs" color="$textMutedForeground">
          {t('admin.templates.addTask.newIdpsOnlyNote')}
        </Text>
      </VStack>
    </Modal>
  );
};

export default AddTaskModal;
