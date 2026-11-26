import React from 'react';
import { HStack, Text, Pressable, VStack } from '@ui';
import { ColumnDef } from '@app-types/components';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import { LucideIcon, Menu } from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import { theme } from '@config/theme';
// import { Template } from '@constants/TEMPLATE_MANAGEMENT_MOCK_DATA';
import { Template } from '@app-types/templateManagement';
import { styles as dataTableStyles } from '@components/DataTable/Styles';
import { MenuItemData } from '@components/ui/Menu';
import { templateManagementStyles as styles } from './Styles';

/**
 * Status Badge Component
 */
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useLanguage();
  const isActive = status === 'Active';

  return (
    <HStack
      {...(isActive ? styles.statusBadgeActive : styles.statusBadgeInactive)}
      {...styles.statusBadge}
    >
      <Text
        {...TYPOGRAPHY.bodySmall}
        {...styles.statusBadgeText}
      >
        {/* {status} */}
        {t(isActive ? 'admin.templates.statusActive' : 'admin.templates.statusInactive')}
      </Text>
    </HStack>
  );
};

export interface TemplateActionHandlers {
  onView: (template: Template) => void;
}

/**
 * Custom trigger for actions menu
 */
const getCustomTrigger = (triggerProps: any) => (
  <Pressable {...triggerProps} {...dataTableStyles.customTrigger}>
    <LucideIcon
      name="MoreVertical"
      size={20}
      color={theme.tokens.colors.textForeground}
    />
  </Pressable>
);

/**
 * Get Template Menu Items
 */
const TEMPLATE_MENU_ITEMS: MenuItemData[] = [
  {
    key: 'view',
    label: 'admin.templates.actionMenu.view',
    textValue: 'View',
    iconName: 'Eye',
    iconColor: theme.tokens.colors.textMutedForeground,
    iconSizeValue: 16,
  },
];

/**
 * Actions Column Component
 */
const ActionsColumn: React.FC<{ template: Template; handlers: TemplateActionHandlers }> = ({
  template,
  handlers,
}) => {
  const handleMenuSelect = (key: string) => {
    if (key === 'view') {
      handlers.onView(template);
    }
  };

  const menuItems = TEMPLATE_MENU_ITEMS;

  return (
    <Menu
      items={menuItems}
      placement="bottom right"
      offset={5}
      trigger={getCustomTrigger}
      onSelect={handleMenuSelect}
    />
  );
};

/**
 * Template Name Cell Component
 */
const TemplateNameCell: React.FC<{ template: Template }> = ({ template }) => (
  <VStack space="xs">
    <Text {...TYPOGRAPHY.paragraph} {...styles.templateNameText}>
      {template.templateName}
    </Text>
  </VStack>
);

/**
 * Tasks Cell Component
 */
const TasksCell: React.FC<{ template: Template }> = ({ template }) => {
  const { t } = useLanguage();
  
  return (
    <Text {...TYPOGRAPHY.paragraph} {...styles.tasksText}>
      {template.tasks} {t('admin.templates.tasksLabel')}
    </Text>
  );
};

/**
 * All possible columns for Templates Table
 */
export const getTemplatesColumns = (handlers: TemplateActionHandlers): ColumnDef<Template>[] => [
  {
    key: 'templateName',
    label: 'admin.templates.templateName',
    flex: 2.5,
    render: (template) => <TemplateNameCell template={template} />,
    mobileConfig: {
      leftRank: 1,
      showLabel: false,
    },
  },
  {
    key: 'status',
    label: 'admin.templates.status',
    flex: 1,
    render: (template) => <StatusBadge status={template.status} />,
    mobileConfig: {
      rightRank: 1,
      showLabel: false,
    },
  },
  {
    key: 'creator',
    label: 'admin.templates.creator',
    flex: 1.2,
    render: (template) => (
      <Text {...TYPOGRAPHY.paragraph} {...styles.creatorText}>
        {/* {template.creator} */}
        {template.creator || '—'}
      </Text>
    ),
    mobileConfig: {
      leftRank: 2,
      showLabel: false,
    },
  },
  {
    key: 'tasks',
    label: 'admin.templates.tasks',
    flex: 1,
    render: (template) => <TasksCell template={template} />,
    mobileConfig: {
      rightRank: 2,
      showLabel: false,
    },
  },
  {
    key: 'createdDate',
    label: 'admin.templates.createdDate',
    flex: 1.2,
    render: (template) => (
      <Text {...TYPOGRAPHY.paragraph} {...styles.createdDateText}>
        {/* {template.createdDate} */}
        {template.createdDate || '—'}
      </Text>
    ),
    mobileConfig: {
      leftRank: 3,
      showLabel: false,
    },
  },
  {
    key: 'actions',
    label: 'admin.templates.actions',
    flex: 0.8,
    render: (template) => <ActionsColumn template={template} handlers={handlers} />,
    mobileConfig: {
      fullWidthRank: 1,
      showLabel: false,
    },
  },
];

