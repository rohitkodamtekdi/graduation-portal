import React, { useMemo } from "react";
import { useNavigation } from '@react-navigation/native';
import { HStack, VStack, Text, Button, Box } from "@ui";
import { useLanguage } from '@contexts/LanguageContext';
import TitleHeader from '@components/TitleHeader';
import { titleHeaderStyles } from '@components/TitleHeader/Styles';
import { templateManagementStyles } from './Styles';
import DataTable from '@components/DataTable';
import { getTemplatesColumns } from './TemplatesTableConfig';
import { Template } from '@app-types/templateManagement';
import { useIdpTemplates } from './templateStore';

const TemplateManagementScreen = () => {
    const { t } = useLanguage();
    const navigation = useNavigation();
    const { templates, isLoading, error, reload } = useIdpTemplates();

    const columns = useMemo(
        () =>
            getTemplatesColumns({
                onView: (template: Template) => {
                    // @ts-ignore - route params are not typed for admin screens
                    navigation.navigate('template-detail', { templateId: template.id });
                },
            }),
        [navigation],
    );

    return(
        <VStack>
           <TitleHeader
            title="admin.menu.templateManagement"
            description="admin.templateManagement.viewOnlyDescription"
           />

            {/* Table Section with Border */}
            <Box {...templateManagementStyles.tableContainer}>
                {/* Table Section Header */}
                <Box {...templateManagementStyles.tableHeaderContainer}>
                    <Text {...templateManagementStyles.tableHeaderTitle}>
                        {t('admin.templates.tableTitle')}
                    </Text>
                </Box>

                {error ? (
                    <HStack space="md" alignItems="center" flexWrap="wrap">
                        <Text {...templateManagementStyles.errorText}>
                            {t('admin.templates.loadError')}
                        </Text>
                        <Button {...titleHeaderStyles.outlineButton} onPress={reload}>
                            <Text {...titleHeaderStyles.outlineButtonText}>{t('admin.templates.retry')}</Text>
                        </Button>
                    </HStack>
                ) : (
                    /* Templates Table */
                    <DataTable
                        data={templates}
                        columns={columns}
                        getRowKey={(template) => template.id}
                        isLoading={isLoading}
                        emptyMessage={t('admin.templates.noTemplatesFound')}
                        loadingMessage={t('admin.templates.loadingTemplates')}
                        pagination={{
                            enabled: true,
                            pageSize: 10,
                            maxPageNumbers: 5,
                        }}
                    />
                )}
            </Box>
        </VStack>
    );
}

export default TemplateManagementScreen
