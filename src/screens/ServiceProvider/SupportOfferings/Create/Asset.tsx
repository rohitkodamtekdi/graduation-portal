import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Container, VStack, useAlert } from '@ui';
import styles from '../styles';
import SPTitleHeader from '@components/Header/SPTitleHeader';
import { useNavigation } from '@react-navigation/native';
import SchemaFormRenderer from '@components/SchemaFormRenderer';
import { ASSET_FORM_SCHEMA, REQUEST_ASSET_HIDE_FIELDS } from '@constants/ASSET_SCHEMA';
import type { FormSection } from '@components/SchemaFormRenderer/type';
import { useLanguage } from '@contexts/LanguageContext';
import { useAuth } from '@contexts/AuthContext';
import { getSitesByProvince, getProvincesList } from '../../../../services/usersService';
import { requestSession, getLivelihoodsOptions, getAssetTypesOptions } from '../../../../services/mentoringService';
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

/**
 * Clones the schema, overriding the given note field's fallback label text so
 * it can show a live-computed value (e.g. a running total) without needing
 * SchemaFormRenderer itself to know about per-field computed content.
 */
const patchFieldFallback = (schema: FormSection[], fieldName: string, fallback: string): FormSection[] =>
  schema.map((node) => ({
    ...node,
    rows: node.rows?.map((row) => ({
      ...row,
      fields: row.fields.map((f) =>
        f.name === fieldName ? { ...f, label: { ...f.label, fallback } } : f,
      ),
    })),
    children: node.children ? patchFieldFallback(node.children, fieldName, fallback) : node.children,
  }));

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
  const [assetTypeOpts, setAssetTypeOpts] = useState<any[]>([]);
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
    getLivelihoodsOptions()
      .then((res) => setLivelihoodCats(res || []))
      .catch((err: any) => {
        console.warn('Failed to fetch livelihood categories:', err);
      });

    getAssetTypesOptions()
      .then((res) => setAssetTypeOpts(res || []))
      .catch((err: any) => {
        console.warn('Failed to fetch asset types:', err);
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

    return {
      provinces: provinceOpts,
      sites: siteOpts,
      assetTypes: assetTypeOpts,
      livelihoodCategories: livelihoodCats,
    };
  }, [provinces, dynamicSites, livelihoodCats, assetTypeOpts, allowedProvinces, allowedSites, t]);

  const totalFundBreakdownText = useMemo(() => {
    const perParticipant = Number(values.estimatedValue);
    const quantity = Number(values.availableQuantity);
    if (!perParticipant || !quantity) return '';
    const totalFund = perParticipant * quantity;
    return t(
      'supportProvider.assetForm.step1.totalFundBreakdown',
      `Total Asset Fund Breakdown: R ${perParticipant.toLocaleString()} per participant × ${quantity} funded participants = R ${totalFund.toLocaleString()} total`,
    );
  }, [values.estimatedValue, values.availableQuantity, t]);

  const schema = useMemo(
    () => patchFieldFallback(ASSET_FORM_SCHEMA, 'totalFundBreakdown', totalFundBreakdownText),
    [totalFundBreakdownText],
  );

  const handleSave = useCallback(async (formValues: any, isDraft: boolean) => {
    try {
      setIsSubmitting(true);
      setValues(formValues);

      const payload = {
        support_offering_type: SUPPORT_CATEGORIES.ASSET,
        categories: [SUPPORT_CATEGORIES.ASSET],
        title: formValues.assetTitle,
        description: formValues.assetDescription,
        asset_types: formValues.assetType ? [formValues.assetType] : [],
        livelihoods: formValues.livelihoodCategory || '',
        estimated_value: formValues.estimatedValue,
        available_quantity: formValues.availableQuantity,
        meta: {
          estimated_value: formValues.estimatedValue,
          available_quantity: formValues.availableQuantity,
        },
        resources: formValues.assetDocuments,
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
            schema={schema}
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
