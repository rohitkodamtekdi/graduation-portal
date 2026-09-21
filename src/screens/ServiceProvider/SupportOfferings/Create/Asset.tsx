import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Container, VStack, useAlert } from '@ui';
import styles from '../styles';
import SPTitleHeader from '@components/Header/SPTitleHeader';
import { useNavigation } from '@react-navigation/native';
import SchemaFormRenderer from '@components/SchemaFormRenderer';
import { ASSET_FORM_SCHEMA, REQUEST_ASSET_HIDE_FIELDS } from '@constants/ASSET_SCHEMA';
import { useLanguage } from '@contexts/LanguageContext';
import { useAuth } from '@contexts/AuthContext';
import { getSitesByProvince, getProvincesList } from '../../../../services/usersService';
import { getProjectCategoryList } from '../../../../services/projectService';
import { requestSession } from '../../../../services/mentoringService';
import { requestAssetPayloadMapping } from '@utils/supportProvider';
import { useProfileCompletion } from '@hooks';
import NotFound from '@components/NotFound';
import {
  SUPPORT_CATEGORIES,
  SUPPORT_PROVIDER_ROUTES as ROUTES,
  ASSET_FORM_FIELDS as FORM_FIELDS,
  ASSET_SESSIONS_SUPPORT_TABS as SESSIONS_SUPPORT_TABS,
} from '@constants/SUPPORT_PROVIDER_CARDS';
import { ROLE_NAMES } from '@constants/ROLES';
import moment from 'moment';

const App = (): React.JSX.Element => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const { user } = useAuth() || {};
  const isLc = user?.role === ROLE_NAMES.LC;

  const hideFileds = [
    ...(isLc ? REQUEST_ASSET_HIDE_FIELDS : []),
  ];

  const { isCardAllowed, allowedProvinces, allowedSites } = useProfileCompletion();
  const isAllowed = isLc || Boolean(isCardAllowed(SUPPORT_CATEGORIES.ASSET));
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [dynamicSites, setDynamicSites] = useState<any[]>([]);
  const [livelihoodCats, setLivelihoodCats] = useState<any[]>([]);
  const [values, setValues] = useState<any>({});
  
  const handleFieldChange = useCallback((name: string, value: string) => {
    setValues((prev: any) => {
      const next = { ...prev, [name]: value };
      if (name === FORM_FIELDS.PROVINCE) next[FORM_FIELDS.SITE] = '';
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
    if (!values[FORM_FIELDS.PROVINCE]) {
      setDynamicSites([]);
      return;
    }
    getSitesByProvince({ provinceId: values[FORM_FIELDS.PROVINCE], page: 1, limit: 100 })
      .then(res => setDynamicSites(res.result?.data || []))
      .catch(() => setDynamicSites([]));
  }, [values[FORM_FIELDS.PROVINCE]]);

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = useCallback(async (formValues: any, isDraft: boolean) => {
    try {
      setIsSubmitting(true);
      setValues(formValues);

      if (isLc) {
        const payload = requestAssetPayloadMapping({ ...formValues, isDraft });
        await requestSession(payload);

        showAlert(
          'success',
          isDraft
            ? t('supportProvider.createSupport.training.alerts.draftSaved')
            : t('supportProvider.assetForm.requestSuccessMessage'),
        );
        // @ts-ignore
        navigation.navigate(ROUTES.SESSIONS_SUPPORT, {
          activeTab: SESSIONS_SUPPORT_TABS.ACTIVE_TAB,
          activeSubTab: SESSIONS_SUPPORT_TABS.ACTIVE_SUB_TAB,
          refreshRequests: Date.now(),
        });
      } else {
        // TODO: wire up SP-side asset offering creation (createSession) once its payload mapping is defined.
        showAlert('warning', t('supportProvider.createSupport.errors.featureUnderDevelopment'));
      }
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || t('common.somethingWentWrong');
      showAlert('error', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  }, [isLc, navigation, showAlert, t]);

  const handleBackPress = () => {
    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // @ts-ignore
      navigation.navigate(ROUTES.CREATE_OPPORTUNITY);
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
        title={t('supportProvider.createSupport.asset.title')}
        backButtonText={t('supportProvider.createSupport.changeType')}
        onNavigateBack={handleBackPress}
      />
      <Container {...styles.container}>
        <Card borderRadius={"$2xl"} bg="$white">
          <SchemaFormRenderer
            schema={ASSET_FORM_SCHEMA(hideFileds)}
            optionsMap={optionsMap}
            values={values}
            t={t}
            onFieldChange={handleFieldChange}
            onSubmit={(formValues) => handleSave(formValues, false)}
            onSaveDraft={(formValues) => handleSave(formValues, true)}
            isSubmitting={isSubmitting}
          />
        </Card>
      </Container>
    </VStack>
  );
};

export default App;
