import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Box, Button, HStack, Pressable, Text, VStack, LucideIcon, Spinner, useAlert } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { usePlatform } from '@utils/platform';
import { theme } from '@config/theme';
import { TemplatePillar, TemplateTask } from '@app-types/templateManagement';
import { updateIdpCategory, updateIdpTask } from '../../../services/templateManagementService';
import { StatusBadge } from '../TemplatesTableConfig';
import { useIdpTemplates } from '../templateStore';
import EditTemplateItemModal, { EditableValues } from '../EditTemplateItemModal';
import { templateDetailStyles as styles, TASK_TABLE_COLUMNS, TASK_TABLE_MIN_WIDTH } from './Styles';

const EMPTY_VALUE = '—';

type EditTarget =
  | { kind: 'pathway' | 'pillar'; id: string; values: EditableValues }
  | { kind: 'task'; id: string; values: EditableValues; isShared: boolean };

const EditIconButton: React.FC<{ onPress: () => void; label: string }> = ({ onPress, label }) => (
  <Pressable {...styles.editButton} onPress={onPress} accessibilityLabel={label}>
    <LucideIcon name="Pencil" size={16} color={theme.tokens.colors.textMutedForeground} />
  </Pressable>
);

const PillarTasksTable: React.FC<{
  pillar: TemplatePillar;
  isMobile: boolean;
  onEditTask: (task: TemplateTask) => void;
}> = ({ pillar, isMobile, onEditTask }) => {
  const { t } = useLanguage();

  if (pillar.tasks.length === 0) {
    return <Text {...styles.mutedCell}>{t('admin.templates.detail.noTasks')}</Text>;
  }

  const table = (
    <VStack minWidth={isMobile ? TASK_TABLE_MIN_WIDTH : undefined} width="100%">
      <HStack {...styles.tableHeaderRow}>
        <Text {...styles.tableHeaderText} {...TASK_TABLE_COLUMNS.number}>#</Text>
        <Text {...styles.tableHeaderText} {...TASK_TABLE_COLUMNS.name}>{t('admin.templates.detail.taskName')}</Text>
        <Text {...styles.tableHeaderText} {...TASK_TABLE_COLUMNS.description}>{t('admin.templates.detail.description')}</Text>
        <Text {...styles.tableHeaderText} {...TASK_TABLE_COLUMNS.projectTemplate}>{t('admin.templates.detail.projectTemplate')}</Text>
        <Box {...TASK_TABLE_COLUMNS.actions} />
      </HStack>

      {pillar.tasks.map((task, index) => (
        <HStack key={`${task.projectTemplate}-${task.taskId}-${index}`} {...styles.tableRow}>
          <Box {...TASK_TABLE_COLUMNS.number}>
            <Box {...styles.taskNumber}>
              <Text {...styles.taskNumberText}>{index + 1}</Text>
            </Box>
          </Box>
          <VStack {...TASK_TABLE_COLUMNS.name}>
            <Text {...styles.taskName}>{task.name}</Text>
            <Text {...styles.label} mt="$0.5">{task.id}</Text>
          </VStack>
          <Text {...styles.value} {...TASK_TABLE_COLUMNS.description}>{task.description || EMPTY_VALUE}</Text>
          <VStack {...TASK_TABLE_COLUMNS.projectTemplate}>
            <Text {...styles.mutedCell}>{task.projectTemplate || EMPTY_VALUE}</Text>
            {task.isShared && (
              <Text {...styles.sharedText}>{t('admin.templates.detail.sharedTask')}</Text>
            )}
          </VStack>
          <Box {...TASK_TABLE_COLUMNS.actions}>
            <EditIconButton onPress={() => onEditTask(task)} label={t('admin.templates.edit.editTask')} />
          </Box>
        </HStack>
      ))}
    </VStack>
  );

  return isMobile ? (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      {table}
    </ScrollView>
  ) : (
    table
  );
};

const TemplateDetailScreen = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const { isMobile } = usePlatform();
  const navigation = useNavigation();
  const route = useRoute();
  const { templates, isLoading, error, reload } = useIdpTemplates();
  const templateId = (route.params as { templateId?: string } | undefined)?.templateId;
  const template = templates.find(item => item.id === templateId);
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set());
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  const goBack = () => {
    // @ts-ignore - route names are not typed for admin screens
    navigation.navigate('template-management');
  };

  const backButton = (
    <Pressable {...styles.backButton} onPress={goBack}>
      <HStack space="sm" alignItems="center">
        <LucideIcon name="ArrowLeft" size={16} color={theme.tokens.colors.textForeground} />
        <Text {...styles.backButtonText}>{t('admin.templates.detail.backToTemplates')}</Text>
      </HStack>
    </Pressable>
  );

  if (!template) {
    return (
      <VStack {...styles.container}>
        {backButton}
        {isLoading ? (
          <Spinner size="large" color="$primary500" mt="$6" />
        ) : (
          <HStack space="md" alignItems="center" flexWrap="wrap" mt="$4">
            <Text {...styles.description}>
              {t(error ? 'admin.templates.loadError' : 'admin.templates.detail.notFound')}
            </Text>
            {error && (
              <Button {...styles.outlineButton} onPress={reload}>
                <Text {...styles.outlineButtonText}>{t('admin.templates.retry')}</Text>
              </Button>
            )}
          </HStack>
        )}
      </VStack>
    );
  }

  const togglePillar = (pillarId: string) => {
    setExpandedPillars(prev => {
      const next = new Set(prev);
      if (next.has(pillarId)) {
        next.delete(pillarId);
      } else {
        next.add(pillarId);
      }
      return next;
    });
  };

  // Sends only the fields that changed; reloads so the list and detail show the saved values
  const handleSave = async (values: EditableValues) => {
    if (!editTarget) return;
    const initial = editTarget.values;
    const changes: Record<string, string> = {};
    if (values.name !== initial.name) changes.name = values.name;
    if (values.description !== initial.description) changes.description = values.description;
    if (editTarget.kind !== 'task' && values.status !== initial.status) {
      changes.status = values.status === 'Active' ? 'active' : 'inactive';
    }

    if (Object.keys(changes).length === 0) {
      setEditTarget(null);
      return;
    }

    try {
      if (editTarget.kind === 'task') {
        await updateIdpTask(editTarget.id, changes);
      } else {
        await updateIdpCategory(editTarget.id, changes);
      }
      showAlert('success', t('admin.templates.edit.saved'));
      setEditTarget(null);
      reload();
    } catch (err: any) {
      showAlert('error', err?.response?.data?.message || t('admin.templates.edit.saveFailed'));
    }
  };

  const modalProps = editTarget
    ? {
        pathway: { titleKey: 'admin.templates.edit.editPathway', showStatus: true, warningKey: undefined },
        pillar: { titleKey: 'admin.templates.edit.editPillar', showStatus: true, warningKey: undefined },
        task: {
          titleKey: 'admin.templates.edit.editTask',
          showStatus: false,
          warningKey:
            editTarget.kind === 'task' && editTarget.isShared ? 'admin.templates.edit.sharedTaskWarning' : undefined,
        },
      }[editTarget.kind]
    : null;

  return (
    <VStack {...styles.container}>
      {/* Back button, title and description */}
      <VStack space="sm">
        {backButton}
        <HStack space="sm" alignItems="center" flexWrap="wrap" mt="$1">
          <Text {...styles.title}>{template.templateName}</Text>
          <StatusBadge status={template.status} />
          <EditIconButton
            label={t('admin.templates.edit.editPathway')}
            onPress={() =>
              setEditTarget({
                kind: 'pathway',
                id: template.id,
                values: { name: template.templateName, description: template.description, status: template.status },
              })
            }
          />
        </HStack>
        {!!template.description && <Text {...styles.description}>{template.description}</Text>}
      </VStack>

      {/* Template Information */}
      <Box {...styles.card}>
        <Text {...styles.cardTitle}>{t('admin.templates.detail.templateInformation')}</Text>
        <HStack space="lg" flexDirection={isMobile ? 'column' : 'row'}>
          <VStack flex={isMobile ? undefined : 1}>
            <Text {...styles.label}>{t('admin.templates.detail.lastUpdated')}</Text>
            <HStack space="sm" alignItems="center" mt="$0.5">
              <LucideIcon name="Clock" size={14} color={theme.tokens.colors.textMutedForeground} />
              <Text {...styles.value}>{template.lastUpdated || EMPTY_VALUE}</Text>
            </HStack>
          </VStack>
          <VStack flex={isMobile ? undefined : 1}>
            <Text {...styles.label}>{t('admin.templates.detail.updatedBy')}</Text>
            <HStack space="sm" alignItems="center" mt="$0.5">
              <LucideIcon name="User" size={14} color={theme.tokens.colors.textMutedForeground} />
              <Text {...styles.value}>{template.lastUpdatedBy || EMPTY_VALUE}</Text>
            </HStack>
          </VStack>
        </HStack>
      </Box>

      {/* Template Structure: pillars with collapsible task tables */}
      <VStack space="md">
        <HStack
          justifyContent="space-between"
          alignItems={isMobile ? 'flex-start' : 'center'}
          flexDirection={isMobile ? 'column' : 'row'}
          space="md"
        >
          <VStack flex={isMobile ? undefined : 1}>
            <Text {...styles.sectionTitle}>
              {t('admin.templates.detail.structureTitle', { count: template.pillars.length })}
            </Text>
            <Text {...styles.description}>
              {t('admin.templates.detail.structureDescription', { count: template.pillars.length })}
            </Text>
          </VStack>
          <HStack space="sm">
            <Button {...styles.outlineButton} onPress={() => setExpandedPillars(new Set(template.pillars.map(p => p.id)))}>
              <Text {...styles.outlineButtonText}>{t('admin.templates.detail.expandAll')}</Text>
            </Button>
            <Button {...styles.outlineButton} onPress={() => setExpandedPillars(new Set())}>
              <Text {...styles.outlineButtonText}>{t('admin.templates.detail.collapseAll')}</Text>
            </Button>
          </HStack>
        </HStack>

        {template.pillars.map(pillar => {
          const isExpanded = expandedPillars.has(pillar.id);
          return (
            <Box key={pillar.id} {...styles.pillarCard}>
              <HStack {...styles.pillarHeader} space="md">
                <Pressable flex={1} onPress={() => togglePillar(pillar.id)}>
                  <HStack space="sm" alignItems="center">
                    <LucideIcon
                      name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                      size={16}
                      color={theme.tokens.colors.textMutedForeground}
                    />
                    <VStack flex={1}>
                      <Text {...styles.pillarName}>{pillar.name}</Text>
                      {!!pillar.description && <Text {...styles.pillarDescription}>{pillar.description}</Text>}
                    </VStack>
                  </HStack>
                </Pressable>
                {pillar.status === 'Inactive' && <StatusBadge status={pillar.status} />}
                <Box {...styles.countBadge}>
                  <Text {...styles.countBadgeText}>
                    {t(pillar.tasks.length === 1 ? 'admin.templates.detail.taskCountOne' : 'admin.templates.detail.taskCount', {
                      count: pillar.tasks.length,
                    })}
                  </Text>
                </Box>
                <EditIconButton
                  label={t('admin.templates.edit.editPillar')}
                  onPress={() =>
                    setEditTarget({
                      kind: 'pillar',
                      id: pillar.id,
                      values: { name: pillar.name, description: pillar.description, status: pillar.status },
                    })
                  }
                />
              </HStack>
              {isExpanded && (
                <Box {...styles.tasksContainer}>
                  <PillarTasksTable
                    pillar={pillar}
                    isMobile={isMobile}
                    onEditTask={task =>
                      setEditTarget({
                        kind: 'task',
                        id: task.taskId,
                        values: { name: task.name, description: task.description },
                        isShared: task.isShared,
                      })
                    }
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </VStack>

      {/* Template Summary */}
      <Box {...styles.card}>
        <Text {...styles.cardTitle}>{t('admin.templates.detail.templateSummary')}</Text>
        <HStack space="lg" flexDirection={isMobile ? 'column' : 'row'}>
          <VStack flex={isMobile ? undefined : 1}>
            <Text {...styles.label}>{t('admin.templates.detail.totalPillars')}</Text>
            <Text {...styles.summaryValue}>{template.pillars.length}</Text>
          </VStack>
          <VStack flex={isMobile ? undefined : 1}>
            <Text {...styles.label}>{t('admin.templates.detail.totalTasks')}</Text>
            <Text {...styles.summaryValue}>{template.tasks}</Text>
          </VStack>
          <VStack flex={isMobile ? undefined : 1}>
            <Text {...styles.label}>{t('admin.templates.detail.templateType')}</Text>
            <Text {...styles.value} mt="$1">{t('admin.templates.interventionPlan')}</Text>
          </VStack>
        </HStack>
      </Box>

      {editTarget && modalProps && (
        <EditTemplateItemModal
          isOpen
          onClose={() => setEditTarget(null)}
          titleKey={modalProps.titleKey}
          initialValues={editTarget.values}
          showStatus={modalProps.showStatus}
          warningKey={modalProps.warningKey}
          onSave={handleSave}
        />
      )}
    </VStack>
  );
};

export default TemplateDetailScreen;
