import React from 'react';
import { Linking, Platform } from 'react-native';
import { TemplateCard } from './TemplateCard';
import {
  LucideIcon,
  VStack,
  HStack,
  Text,
  Box,
  Heading,
  useToast,
  Toast,
  ToastTitle,
  ScrollView,
} from '@ui';
import { useLanguage } from '@contexts/LanguageContext';
import {
  CSV_TEMPLATES_KEYS,
  GUIDELINES_KEYS,
  CSV_CONTENT_STRINGS,
  TEMPLATE_FILE_URLS,
} from '@constants/CSV_TEMPLATE_DATA';
import { csvImportStyles } from './Styles';
import logger from '@utils/logger';

const CsvImportTemplates = () => {
  const { t } = useLanguage();
  const toast = useToast();

  // Map keys to translated text
  const TEMPLATE_DATA = CSV_TEMPLATES_KEYS.map(item => ({
    id: item.id,
    title: t(item.titleKey),
    description: t(item.descriptionKey),
  }));

  const GUIDELINES = GUIDELINES_KEYS.map(key => t(key));

  const showDownloadSuccess = (title: string) => {
    toast.show({
      placement: 'top right',
      render: ({ id }) => {
        return (
          <Toast nativeID={`toast-${id}`} action="success" variant="outline" bg="$white" hardShadow="5" borderColor="$gray300">
            <HStack space="md" alignItems="center">
              <LucideIcon name="CheckCircle" size={20} color="$success500" />
              <ToastTitle color="$textPrimary" fontSize="$sm" fontWeight="$bold">
                {t('admin.csvTemplatePage.downloadSuccess', { title })}
              </ToastTitle>
            </HStack>
          </Toast>
        )
      }
    });
  };

  // Fetch the file and save it from memory, so it downloads in the same tab (the S3 bucket allows cross-origin GET)
  const downloadFileFromUrl = async (fileUrl: string, title: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error(`Template download failed: ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', objectUrl);
      link.setAttribute('download', decodeURIComponent(fileUrl.split('?')[0].split('/').pop() || 'template.xlsx'));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      logger.error('CsvImportTemplates: template file fetch failed, opening the link instead', error);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
    showDownloadSuccess(title);
  };

  const handleDownload = (id: string) => {
    const template = TEMPLATE_DATA.find(item => item.id === id);
    if (!template) return;

    // Ready-made template file (e.g. XLSX on S3) when its URL is configured; otherwise the generated CSV below
    const templateFileUrl = TEMPLATE_FILE_URLS[id];
    if (templateFileUrl) {
      if (Platform.OS === 'web') {
        void downloadFileFromUrl(templateFileUrl, template.title);
      } else {
        Linking.openURL(templateFileUrl);
      }
      return;
    }

    const sanitizedTitle = template.title.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${sanitizedTitle || id}.csv`;

    // Trigger Download
    if (Platform.OS === 'web') {
      const csvContent = CSV_CONTENT_STRINGS[id] || "header1,header2\nvalue1,value2";
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show Success Toast only on Web
        showDownloadSuccess(template.title);
      }
    } else {
      // Show Info Toast for Mobile
      toast.show({
        placement: 'top',
        render: ({ id }) => {
          return (
            <Toast nativeID={`toast-${id}`} action="info" variant="outline" bg="$white" hardShadow="5" borderColor="$gray300">
              <HStack space="md" alignItems="center">
                <LucideIcon name="Info" size={20} color="$info500" />
                <ToastTitle color="$textPrimary" fontSize="$sm" fontWeight="$bold">
                  {t('admin.csvTemplatePage.downloadMobileInfo')}
                </ToastTitle>
              </HStack>
            </Toast>
          )
        }
      });
    }
  };

  return (
    <ScrollView {...csvImportStyles.container} showsVerticalScrollIndicator={false}>
      <VStack {...csvImportStyles.headerContainer}>
        <Box>
          <Heading {...csvImportStyles.pageTitle}>{t('admin.csvTemplatePage.pageTitle')}</Heading>
          <Text {...csvImportStyles.pageSubtitle}>{t('admin.csvTemplatePage.pageSubtitle')}</Text>
        </Box>
      </VStack>

      <Box {...csvImportStyles.sectionContainer}>
        <VStack space="md">
          <HStack {...csvImportStyles.gridContainer} justifyContent="center">
            {TEMPLATE_DATA.map((item) => (
              <TemplateCard
                key={item.id}
                title={item.title}
                description={item.description}
                buttonText={t('admin.csvTemplatePage.downloadTemplate')}
                onDownload={() => handleDownload(item.id)}
              />
            ))}
          </HStack>

          <Box {...csvImportStyles.guidelinesContainer}>
            <HStack {...csvImportStyles.guidelinesHeader}>
              <LucideIcon name="Info" size={20} color="$textSecondary" />
              <Heading {...csvImportStyles.guidelinesTitle}>{t('admin.csvTemplatePage.guidelines.title')}</Heading>
            </HStack>

            <VStack {...csvImportStyles.guidelinesList}>
              {GUIDELINES.map((guideline, index) => (
                <HStack key={index} {...csvImportStyles.guidelineItem}>
                  <Box {...csvImportStyles.bulletPoint} />
                  <Text {...csvImportStyles.guidelineText}>{guideline}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </VStack>
      </Box>
    </ScrollView>
  );
};

export default CsvImportTemplates;
