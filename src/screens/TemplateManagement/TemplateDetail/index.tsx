import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Box, Button, HStack, Pressable, Text, VStack, LucideIcon, Spinner, useAlert } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { usePlatform } from '@utils/platform';
import { theme } from '@config/theme';
import { TaskCreate, TemplatePillar, TemplateSubCategory, TemplateTask } from '@app-types/templateManagement';
import {
  createIdpTask,
  reorderIdpTasks,
  updateIdpCategory,
  updateIdpTask,
} from '../../../services/templateManagementService';
import AddTaskModal from '../AddTaskModal';
import { StatusBadge } from '../TemplatesTableConfig';
import { useIdpTemplates } from '../templateStore';
import EditTemplateItemModal, { EditableValues } from '../EditTemplateItemModal';
import { templateDetailStyles as styles, TASK_TABLE_COLUMNS, TASK_TABLE_MIN_WIDTH } from './Styles';

const EMPTY_VALUE = '—';

type PillarTab = 'tasks' | 'subCategories';

type EditTarget =
  | { kind: 'pathway' | 'pillar' | 'category'; id: string; values: EditableValues }
  | { kind: 'task'; id: string; values: EditableValues; isShared: boolean };

const EditIconButton: React.FC<{ onPress: () => void; label: string }> = ({ onPress, label }) => (
  <Pressable {...styles.editButton} onPress={onPress} accessibilityLabel={label}>
    <LucideIcon name="Pencil" size={16} color={theme.tokens.colors.textMutedForeground} />
  </Pressable>
);

// Direct child categories of a pillar (e.g. Livelihoods sectors), each editable
const SubCategoryList: React.FC<{
  items: TemplateSubCategory[];
  onEdit: (category: TemplateSubCategory) => void;
}> = ({ items, onEdit }) => {
  const { t } = useLanguage();

  return (
    <VStack>
      {items.map(category => (
        <HStack key={category.id} {...styles.subCategoryRow} space="sm">
          <VStack flex={1}>
            <Text {...styles.taskName}>{category.name}</Text>
            {!!category.description && <Text {...styles.label}>{category.description}</Text>}
          </VStack>
          {category.status === 'Inactive' && <StatusBadge status={category.status} />}
          <EditIconButton onPress={() => onEdit(category)} label={t('admin.templates.edit.editCategory')} />
        </HStack>
      ))}
    </VStack>
  );
};

interface DragHandlers {
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
}

// A task row that can be dragged to a new position (web: HTML5 drag and drop on the row's DOM node)
const DraggableTaskRow: React.FC<
  DragHandlers & { index: number; isDragging: boolean; isDropTarget: boolean; children: React.ReactNode }
> = props => {
  const rowRef = useRef<any>(null);
  // Latest props, so the DOM listeners added once always call the current handlers
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    const element = rowRef.current as HTMLElement | null;
    if (Platform.OS !== 'web' || !element?.addEventListener) return undefined;

    element.setAttribute('draggable', 'true');
    const onDragStart = (event: DragEvent) => {
      event.dataTransfer?.setData('text/plain', String(latest.current.index));
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
      latest.current.onDragStart(latest.current.index);
    };
    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
      latest.current.onDragOver(latest.current.index);
    };
    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      latest.current.onDrop(latest.current.index);
    };
    const onDragEnd = () => latest.current.onDragEnd();

    element.addEventListener('dragstart', onDragStart);
    element.addEventListener('dragover', onDragOver);
    element.addEventListener('drop', onDrop);
    element.addEventListener('dragend', onDragEnd);
    return () => {
      element.removeEventListener('dragstart', onDragStart);
      element.removeEventListener('dragover', onDragOver);
      element.removeEventListener('drop', onDrop);
      element.removeEventListener('dragend', onDragEnd);
    };
  }, []);

  return (
    <HStack
      ref={rowRef}
      {...styles.tableRow}
      {...(props.isDropTarget ? styles.dropTargetRow : {})}
      opacity={props.isDragging ? 0.4 : 1}
    >
      {props.children}
    </HStack>
  );
};

const PillarTasksTable: React.FC<{
  pillar: TemplatePillar;
  isMobile: boolean;
  onEditTask: (task: TemplateTask) => void;
  /** Saves the new order of one project template's tasks; returns false when it failed */
  onReorder: (templateId: string, taskIds: string[]) => Promise<boolean>;
  onCrossTemplateMove: () => void;
}> = ({ pillar, isMobile, onEditTask, onReorder, onCrossTemplateMove }) => {
  const { t } = useLanguage();
  // Local order so a dropped row moves at once; reset whenever fresh data arrives
  const [tasks, setTasks] = useState<TemplateTask[]>(pillar.tasks);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setTasks(pillar.tasks);
  }, [pillar.tasks]);

  if (tasks.length === 0) {
    return <Text {...styles.mutedCell}>{t('admin.templates.detail.noTasks')}</Text>;
  }

  const resetDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDrop = async (toIndex: number) => {
    const fromIndex = dragIndex;
    resetDrag();
    if (fromIndex === null || fromIndex === toIndex) return;

    const moved = tasks[fromIndex];
    // Order is stored per project template, so a task can only move among its own template's tasks
    if (moved.projectTemplateId !== tasks[toIndex].projectTemplateId) {
      onCrossTemplateMove();
      return;
    }

    const previous = tasks;
    const next = [...tasks];
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setTasks(next);

    const templateTaskIds = next
      .filter(task => task.projectTemplateId === moved.projectTemplateId)
      .map(task => task.taskId);
    const saved = await onReorder(moved.projectTemplateId, templateTaskIds);
    if (!saved) setTasks(previous);
  };

  const table = (
    <VStack minWidth={isMobile ? TASK_TABLE_MIN_WIDTH : undefined} width="100%">
      <HStack {...styles.tableHeaderRow}>
        <Box {...TASK_TABLE_COLUMNS.drag} />
        <Text {...styles.tableHeaderText} {...TASK_TABLE_COLUMNS.number}>#</Text>
        <Text {...styles.tableHeaderText} {...TASK_TABLE_COLUMNS.name}>{t('admin.templates.detail.taskName')}</Text>
        <Text {...styles.tableHeaderText} {...TASK_TABLE_COLUMNS.description}>{t('admin.templates.detail.description')}</Text>
        <Box {...TASK_TABLE_COLUMNS.actions} />
      </HStack>

      {tasks.map((task, index) => (
        <DraggableTaskRow
          key={`${task.projectTemplateId}-${task.taskId}`}
          index={index}
          isDragging={dragIndex === index}
          isDropTarget={overIndex === index && dragIndex !== index}
          onDragStart={setDragIndex}
          onDragOver={setOverIndex}
          onDrop={handleDrop}
          onDragEnd={resetDrag}
        >
          <Box {...TASK_TABLE_COLUMNS.drag} accessibilityLabel={t('admin.templates.detail.dragToReorder')}>
            <LucideIcon name="GripVertical" size={16} color={theme.tokens.colors.textMutedForeground} />
          </Box>
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
          <Box {...TASK_TABLE_COLUMNS.actions}>
            <EditIconButton onPress={() => onEditTask(task)} label={t('admin.templates.edit.editTask')} />
          </Box>
        </DraggableTaskRow>
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
  const [pillarTabs, setPillarTabs] = useState<Record<string, PillarTab>>({});
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [addTaskPillar, setAddTaskPillar] = useState<TemplatePillar | null>(null);

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
  const handleReorder = async (projectTemplateId: string, taskIds: string[]) => {
    try {
      await reorderIdpTasks(projectTemplateId, taskIds);
      showAlert('success', t('admin.templates.detail.orderSaved'));
      reload();
      return true;
    } catch (err: any) {
      showAlert('error', err?.response?.data?.message || t('admin.templates.detail.orderSaveFailed'));
      return false;
    }
  };

  const handleAddTask = async (templateId: string, data: TaskCreate) => {
    try {
      await createIdpTask(templateId, data);
      showAlert('success', t('admin.templates.addTask.added'));
      setAddTaskPillar(null);
      reload();
    } catch (err: any) {
      showAlert('error', err?.response?.data?.message || t('admin.templates.addTask.addFailed'));
    }
  };

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
        pathway: { titleKey: 'admin.templates.edit.editPathway', showStatus: true, showDescription: true, warningKey: undefined },
        pillar: { titleKey: 'admin.templates.edit.editPillar', showStatus: true, showDescription: true, warningKey: undefined },
        // Sub-categories are name-only (no description, not activated/deactivated individually)
        category: { titleKey: 'admin.templates.edit.editCategory', showStatus: false, showDescription: false, warningKey: undefined },
        task: {
          titleKey: 'admin.templates.edit.editTask',
          showStatus: false,
          showDescription: true,
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
                  {/* Pillars with sub-categories get two tabs; Tasks is shown first */}
                  {pillar.subCategories.length > 0 && (
                    <HStack {...styles.tabBar}>
                      {(['tasks', 'subCategories'] as PillarTab[]).map(tab => {
                        const isActive = (pillarTabs[pillar.id] || 'tasks') === tab;
                        return (
                          <Pressable
                            key={tab}
                            {...styles.tab}
                            {...(isActive ? styles.tabActive : {})}
                            onPress={() => setPillarTabs(prev => ({ ...prev, [pillar.id]: tab }))}
                          >
                            <Text {...styles.tabText} {...(isActive ? styles.tabTextActive : {})}>
                              {tab === 'tasks'
                                ? t('admin.templates.detail.tasksTitle', { count: pillar.tasks.length })
                                : t('admin.templates.detail.subCategoriesTitle', { count: pillar.subCategories.length })}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </HStack>
                  )}

                  {pillarTabs[pillar.id] === 'subCategories' && pillar.subCategories.length > 0 ? (
                    <SubCategoryList
                      items={pillar.subCategories}
                      onEdit={category =>
                        setEditTarget({
                          kind: 'category',
                          id: category.id,
                          values: {
                            name: category.name,
                            description: category.description,
                            status: category.status,
                          },
                        })
                      }
                    />
                  ) : (
                    <VStack>
                      {pillar.projectTemplates.length > 0 && (
                        <Button {...styles.addTaskButton} onPress={() => setAddTaskPillar(pillar)}>
                          <HStack space="xs" alignItems="center">
                            <LucideIcon name="Plus" size={16} color={theme.tokens.colors.textForeground} />
                            <Text {...styles.outlineButtonText}>{t('admin.templates.addTask.button')}</Text>
                          </HStack>
                        </Button>
                      )}
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
                        onReorder={handleReorder}
                        onCrossTemplateMove={() => showAlert('info', t('admin.templates.detail.reorderSameListOnly'))}
                      />
                    </VStack>
                  )}
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
          showDescription={modalProps.showDescription}
          warningKey={modalProps.warningKey}
          onSave={handleSave}
        />
      )}

      {addTaskPillar && (
        <AddTaskModal
          isOpen
          onClose={() => setAddTaskPillar(null)}
          pillarName={addTaskPillar.name}
          sessionCategory={addTaskPillar.sessionCategory}
          projectTemplates={addTaskPillar.projectTemplates}
          onSave={handleAddTask}
        />
      )}
    </VStack>
  );
};

export default TemplateDetailScreen;
