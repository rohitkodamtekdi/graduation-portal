import React, { useState } from 'react';
import {
  Button,
  ButtonIcon,
  ButtonText,
  Container,
  HStack,
  LucideIcon,
  Pressable,
  Text,
  VStack,
} from '@ui';
import styles from './styles';
import DashboardContent from './components/DashboardContent';
import SPTitleHeader from '@components/Header/SPTitleHeader';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '@contexts/LanguageContext';

const App = (): React.JSX.Element => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'assets'>('overview');

  return (
    <VStack flex={1} bg="#F9FAFB">
      <SPTitleHeader
        title={t('supportProvider.dashboard.title', 'Support Provider Dashboard')}
        subTitle={t(
          'supportProvider.dashboard.subtitle',
          "Overview of your organization's support commitments, intervention fulfillment tracking & performance portfolio"
        )}
        rightSection={
          <Button
            {...styles.headerActionBtn}
            onPress={() => navigation.navigate('create-opportunity' as never)}
          >
            <ButtonIcon as={LucideIcon} name={'Plus'} size={16} color="$white" />
            <ButtonText {...styles.headerActionBtnText}>
              {t('supportProvider.dashboard.createSupportBtn', 'Create Support Intervention')}
            </ButtonText>
          </Button>
        }
      >
        {/* Dashboard Navigation Tabs directly in header as per Figma */}
        <HStack {...styles.headerTabContainer}>
          <Pressable
            {...styles.tabButton}
            {...(activeTab === 'overview' ? styles.tabButtonActive : styles.tabButtonInactive)}
            onPress={() => setActiveTab('overview')}
          >
            <LucideIcon
              name="TrendingUp"
              {...(activeTab === 'overview' ? styles.tabTrendingIconActive : styles.tabTrendingIconInactive)}
            />
            <Text {...(activeTab === 'overview' ? styles.tabTextActive : styles.tabTextInactive)}>
              Interventions Overview
            </Text>
          </Pressable>

          <Pressable
            {...styles.tabButton}
            {...(activeTab === 'assets' ? styles.tabButtonActive : styles.tabButtonInactive)}
            onPress={() => setActiveTab('assets')}
          >
            <LucideIcon
              name="ShieldCheck"
              {...(activeTab === 'assets' ? styles.tabShieldIconActive : styles.tabShieldIconInactive)}
            />
            <Text {...(activeTab === 'assets' ? styles.tabTextActive : styles.tabTextInactive)}>
              Asset Provider Approvals & Financials
            </Text>
          </Pressable>
        </HStack>
      </SPTitleHeader>
      <Container {...styles.container}>
        <DashboardContent
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hideHeaderTabs={true}
        />
      </Container>
    </VStack>
  );
};

export default App;
