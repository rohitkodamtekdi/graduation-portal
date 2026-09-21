import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Container, VStack, useAlert } from '@ui';
import styles from '../styles';
import SPTitleHeader from '@components/Header/SPTitleHeader';
import { useNavigation } from '@react-navigation/native';
import SchemaFormRenderer from '@components/SchemaFormRenderer';
import { ASSET_FORM_SCHEMA } from '@constants/ASSET_SCHEMA';
import type { FormSection } from '@components/SchemaFormRenderer/type';
import { useLanguage } from '@contexts/LanguageContext';
import { getSitesByProvince, getProvincesList } from '../../../../services/usersService';
import { createSession, getLivelihoodsOptions, getAssetTypesOptions } from '../../../../services/mentoringService';
import { useProfileCompletion } from '@hooks';
import NotFound from '@components/NotFound';
import { SUPPORT_CATEGORIES } from '@constants/SUPPORT_PROVIDER_CARDS';
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
  const { isCardAllowed, allowedProvinces, allowedSites } = useProfileCompletion();
  const isAllowed = Boolean(isCardAllowed(SUPPORT_CATEGORIES.ASSET));
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [dynamicSites, setDynamicSites] = useState<any[]>([]);
  const [livelihoodCats, setLivelihoodCats] = useState<any[]>([]);
  const [assetTypeOpts, setAssetTypeOpts] = useState<any[]>([]);
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
            schema={schema}
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
