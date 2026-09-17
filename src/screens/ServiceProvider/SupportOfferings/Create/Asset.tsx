import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Container, VStack, useAlert } from '@ui';
import styles from '../styles';
import SPTitleHeader from '@components/Header/SPTitleHeader';
import { useNavigation } from '@react-navigation/native';
import SchemaFormRenderer from '@components/SchemaFormRenderer';
import { ASSET_FORM_SCHEMA } from '@constants/ASSET_SCHEMA';
import { useLanguage } from '@contexts/LanguageContext';
import { getSitesByProvince, getProvincesList } from '../../../../services/usersService';
import { getProjectCategoryList } from '../../../../services/projectService';
import { createSession } from '../../../../services/mentoringService';
import { useProfileCompletion } from '@hooks';
import NotFound from '@components/NotFound';
import { SUPPORT_CATEGORIES } from '@constants/SUPPORT_PROVIDER_CARDS';
import moment from 'moment';

const App = (): React.JSX.Element => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const { isCardAllowed, allowedProvinces, allowedSites } = useProfileCompletion();
  const isAllowed = Boolean(isCardAllowed(SUPPORT_CATEGORIES.ASSET));
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [dynamicSites, setDynamicSites] = useState<any[]>([]);
  const [livelihoodCats, setLivelihoodCats] = useState<any[]>([]);
  const [values, setValues] = useState<any>({});
  
  const handleFieldChange = useCallback((name: string, value: string) => {
    setValues((prev: any) => {
      const next = { ...prev, [name]: value };
      if (name === 'province') next.site = '';
      return next;
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      const result = await getProvincesList();
      setProvinces(result);
    }
    init();
  },[])

  useEffect(() => {
    if (!values.province) {
      setDynamicSites([]);
      return;
    }
    getSitesByProvince({ provinceId: values.province, page: 1, limit: 100 })
      .then(res => setDynamicSites(res.result?.data || []))
      .catch(() => setDynamicSites([]));
  }, [values.province]);

  useEffect(() => {
    getProjectCategoryList()
      .then((res: any[]) => {
        // Collect all child categories under root IDP templates
        const allChildren = res?.flatMap((root: any) => root.children || []) || [];
        if (allChildren.length > 0) {
          setLivelihoodCats(
            allChildren.map((c: any) => ({
              value: c.name || c.label || c._id,
              label: c.name || c.label,
            })),
          );
        }
      })
      .catch(err => {
        console.warn('Failed to fetch livelihood categories, using fallback:', err);
      });
  }, []);

  const optionsMap = useMemo(() => {
    const filteredProvinces =
      allowedProvinces && allowedProvinces.length > 0
        ? provinces.filter((p: any) => allowedProvinces.includes(p._id || p.id))
        : provinces;

    const filteredSites =
      allowedSites && allowedSites.length > 0
        ? dynamicSites.filter((s: any) => allowedSites.includes(s._id || s.id))
        : dynamicSites;

    const provinceOpts =
      filteredProvinces && filteredProvinces.length > 0
        ? filteredProvinces.map((p: any) => ({
            value: p._id || p.id || p.name,
            label: p.name || p.label,
          }))
        : [];

    const siteOpts = filteredSites
      ? filteredSites.map((s: any) => ({
          value: s._id || s.id || s.name,
          label: s.name || s.label,
        }))
      : [];

    const livelihoodOpts =
      livelihoodCats.length > 0
        ? livelihoodCats
        : [
            {
              value: 'Agriculture & Farming',
              label:'Agriculture & Farming',
            },
            {
              value: 'Livestock & Poultry',
              label:'Livestock & Poultry',
            },
            {
              value: 'Small Business & Retail',
              label:'Small Business & Retail',
            },
            {
              value: 'Vocational & Skills Trades',
              label:'Vocational & Skills Trades',
            },
            {
              value: 'Fisheries & Aquaculture',
              label:'Fisheries & Aquaculture',
            },
            {
              value: 'Services & Micro-enterprise',
              label:'Services & Micro-enterprise',
            },
            {
              value: 'Other',
              label:'Other',
            },
          ];

    return {
      provinces: provinceOpts,
      sites: siteOpts,
      assetTypes: [
        {
          value: 'Cash',
          label: 'Cash',
        },
        {
          value: 'In-kind',
          label: 'In-kind',
        },
        {
          value: 'Voucher',
          label: 'Voucher',
        },
      ],
      livelihoodCategories: livelihoodOpts,
    };
  }, [provinces, dynamicSites, livelihoodCats, allowedProvinces, allowedSites, t]);

  const handleSave = useCallback(async (formValues: any, isDraft: boolean) => {
    try {
      setValues(formValues);

      const payload = {
        support_offering_type: SUPPORT_CATEGORIES.ASSET,
        categories: [SUPPORT_CATEGORIES.ASSET],
        title: formValues.assetTitle,
        description: formValues.assetDescription,
        asset_types: formValues.assetType ? [formValues.assetType] : [],
        livelihoods: formValues.livelihoodCategory || '',
        estimated_value: formValues.estimatedValue,
        provinces: formValues.province ? [formValues.province] : [],
        sites: Array.isArray(formValues.site) ? formValues.site : (formValues.site ? [formValues.site] : []),
        recommended_for: ['user'],
        start_date: formValues.startDate ? moment(formValues.startDate).unix() : moment().unix(),
        end_date: formValues.endDate ? moment(formValues.endDate).unix() : moment().add(2, 'years').unix(),
        status: isDraft ? 'DRAFT' : 'PUBLISHED',
        can_be_copied: false,
        certificate_provided: false,
        delivery_mode: 'offline',
      };

      await createSession(payload);

      showAlert(
        'success',
        isDraft
          ? t('supportProvider.supportOfferings.cards.alerts.draftSaved', 'Draft saved successfully!')
          : t('supportProvider.supportOfferings.cards.alerts.supportPublished', 'Support published successfully!'),
      );
      // @ts-ignore
      navigation.navigate('opportunities');
    } catch (err: any) {
      const errMsg =
        err?.data?.message ||
        err?.message ||
        t('supportProvider.createSupport.errors.saveFailed', 'Something went wrong while saving. Please try again.');
      showAlert('error', errMsg);
    }
  }, [navigation, showAlert, t]);

  const handleBackPress = () => {
    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // @ts-ignore
      navigation.navigate('create-opportunity');
    }
  }

  if (!isAllowed) {
    return (
      <NotFound
        message={t(
          'supportProvider.createSupport.errors.incompleteWarning'
        )}
      />
    );
  }

  return (
    <VStack flex={1}>
      <SPTitleHeader
        title={t('supportProvider.createSupport.asset.title', 'Create Asset')}
        backButtonText={t('supportProvider.createSupport.changeType', 'Change type')}
        onNavigateBack={handleBackPress}
      />
      <Container {...styles.container}>
        <Card borderRadius={"$2xl"} bg="$white">
          <SchemaFormRenderer
            schema={ASSET_FORM_SCHEMA}
            optionsMap={optionsMap}
            values={values}
            t={t}
            onFieldChange={handleFieldChange}
            onSubmit={(formValues) => handleSave(formValues, false)}
            onSaveDraft={(formValues) => handleSave(formValues, true)}
          />
        </Card>
      </Container>
    </VStack>
  );
};

export default App;
