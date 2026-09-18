import React, { useState, useEffect } from 'react';
import { Container, VStack, Button, ButtonText, ButtonIcon, Box, Text } from '@ui';
import SPTitleHeader from '@components/Header/SPTitleHeader';
import FilterButton from '@components/Filter';
import { useLanguage } from '@contexts/LanguageContext';
import LucideIcon from '@components/ui/LucideIcon';

// Components
import MaterialsContent from './components/MaterialsContent';

// Styles
import styles from './styles';

// Service
import { getMaterialsList, MaterialItem } from '../../../services/serviceProvider/MaterialsLibrary/materialsLibraryService';

const MaterialsLibraryScreen = (): React.JSX.Element => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [stats, setStats] = useState({
    totalResources: 0,
    pdfDocuments: 0,
    templatesDecks: 0,
    totalDownloads: 0,
  });

  const fetchMaterials = async (currentFilters = filters) => {
    try {
      const res = await getMaterialsList({
        search: currentFilters.search,
        category: currentFilters.category,
        format: currentFilters.format,
      });
      if (res.success) {
        setMaterials(res.data);
        setStats(res.stats);
      }
    } catch (error) {
      console.error('[MaterialsLibraryScreen] Error fetching materials:', error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const categoryFilterOptions = [
    { label: t('supportProvider.materialsLibrary.filters.allCategories'), value: 'All' },
    { label: t('supportProvider.materialsLibrary.categories.financialLiteracy'), value: 'Financial Literacy' },
    { label: t('supportProvider.materialsLibrary.categories.businessManagement'), value: 'Business Management' },
    { label: t('supportProvider.materialsLibrary.categories.assetEquipment'), value: 'Asset & Equipment Support' },
    { label: t('supportProvider.materialsLibrary.categories.legalCompliance'), value: 'Legal & Compliance' },
  ];

  const formatFilterOptions = [
    { label: t('supportProvider.materialsLibrary.filters.allFormats'), value: 'All' },
    { label: t('supportProvider.materialsLibrary.formats.pdf'), value: 'PDF Document' },
    { label: t('supportProvider.materialsLibrary.formats.template'), value: 'Templates & Decks' },
    { label: t('supportProvider.materialsLibrary.formats.video'), value: 'Video Guide' },
  ];

  const filterConfigs = [
    {
      type: 'search',
      attr: 'search',
      placeholder: t('supportProvider.materialsLibrary.filters.searchPlaceholder'),
    },
    {
      type: 'select',
      attr: 'category',
      placeholder: t('supportProvider.materialsLibrary.filters.allCategories'),
      data: categoryFilterOptions,
    },
    {
      type: 'select',
      attr: 'format',
      placeholder: t('supportProvider.materialsLibrary.filters.allFormats'),
      data: formatFilterOptions,
    },
  ];

  return (
    <VStack {...styles.screenWrapper}>
      {/* Title Header */}
      <SPTitleHeader
        title={t('supportProvider.materialsLibrary.title')}
        subTitle={t('supportProvider.materialsLibrary.subtitle')}
      />

      {/* Main content body inside boxed/container layout */}
      <Container {...styles.container}>
        <VStack {...styles.contentContainer}>
          {/* 4 Stat Cards Row */}
          <Box {...styles.statsRow}>
            {/* Total Resources */}
            <Box {...styles.statCardContainer}>
              <Box {...styles.statCardContent}>
                <VStack {...styles.statTextCol}>
                  <Text {...styles.statTitleText}>
                    {t('supportProvider.materialsLibrary.stats.totalResources')}
                  </Text>
                  <Text {...styles.statCountText}>
                    {stats.totalResources}
                  </Text>
                </VStack>
                <Box {...styles.statIconBoxResources}>
                  <LucideIcon name="Folder" size={styles.statIconFolder.size} color={styles.statIconFolder.color} />
                </Box>
              </Box>
            </Box>

            {/* PDFs & Documents */}
            <Box {...styles.statCardContainer}>
              <Box {...styles.statCardContent}>
                <VStack {...styles.statTextCol}>
                  <Text {...styles.statTitleText}>
                    {t('supportProvider.materialsLibrary.stats.pdfDocuments')}
                  </Text>
                  <Text {...styles.statCountText}>
                    {stats.pdfDocuments}
                  </Text>
                </VStack>
                <Box {...styles.statIconBoxPdf}>
                  <LucideIcon name="FileText" size={styles.statIconFileText.size} color={styles.statIconFileText.color} />
                </Box>
              </Box>
            </Box>

          </Box>

          {/* Filters Box */}
          <FilterButton
            data={filterConfigs}
            onFilterChange={setFilters}
            showClearButton={false}
            hideTitleHeader={true}
            _container={styles.filterBoxContainerProps}
          />

          {/* Remaining Page Content */}
          <MaterialsContent
            materials={materials}
            fetchMaterials={fetchMaterials}
            isUploadOpen={isUploadOpen}
            onUploadClose={() => setIsUploadOpen(false)}
          />
        </VStack>
      </Container>
    </VStack>
  );
};

export default MaterialsLibraryScreen;
