import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Card, Container, HStack, Text, VStack, useAlert, Loader } from '@ui';
import styles from '../styles';
import lcStyles from '../../../SessionsSupport/styles';
import PageHeader from '@components/PageHeader';
import SPTitleHeader from '@components/Header/SPTitleHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import SchemaFormRenderer from '@components/SchemaFormRenderer';
import { ASSET_FORM_SCHEMA, REQUEST_ASSET_HIDE_FIELDS } from '@constants/ASSET_SCHEMA';
import type { FormSection, FormField } from '@components/SchemaFormRenderer/type';
import { useLanguage } from '@contexts/LanguageContext';
import { useAuth } from '@contexts/AuthContext';
import { getSitesByProvince, getProvincesList } from '../../../../services/usersService';
import { requestSession, getLivelihoodCategoriesOptions, getAssetTypesOptions, createSession, getSessionDetails, updateSessionWithResources } from '../../../../services/mentoringService';
import { requestAssetPayloadMapping, toIdpTasksPayload, uploadService, applyDraftDefaults, ASSET_DRAFT_CONFIG, mapAssetApiToFormValues, valueMapping } from '@utils/supportProvider';
import { useProfileCompletion } from '@hooks';
import NotFound from '@components/NotFound';
import {
  SUPPORT_CATEGORIES,
  FORM_MODE,
  SUPPORT_PROVIDER_ROUTES as ROUTES,
  ASSET_FORM_FIELDS as FORM_FIELDS,
  ASSET_SESSIONS_SUPPORT_TABS as SESSIONS_SUPPORT_TABS,
  SUPPORT_OFFERING_TABS,
  BUTTON_LOADING_STATE,
} from '@constants/SUPPORT_PROVIDER_CARDS';
import { ROLE_NAMES } from '@constants/ROLES';

/**
 * Clones the schema, running `patcher` over the named field so it can show a
 * live-computed value (e.g. a running total) without needing SchemaFormRenderer
 * itself to know about per-field computed content.
 */
const patchField = (schema: FormSection[], fieldName: string, patcher: (field: FormField) => FormField): FormSection[] =>
  schema.map((node) => ({
    ...node,
    rows: node.rows?.map((row) => ({
      ...row,
      fields: row.fields.map((f) => (f.name === fieldName ? patcher(f) : f)),
    })),
    children: node.children ? patchField(node.children, fieldName, patcher) : node.children,
  }));

// White card applies only to the form body, not the progress bar or step tabs
const FORM_CARD_PROPS = { bg: '$white', borderRadius: '$2xl', p: '$6' };

const App = (): React.JSX.Element => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const { user } = useAuth() || {};
  const isLc = user?.role === ROLE_NAMES.LC;
  const sessionId = route.params?.id;
  const isEdit = !isLc && Boolean(sessionId) && route.params?.type === FORM_MODE.EDIT;
  // Resources as loaded in edit mode - needed to work out which ones the user removed
  const originalResourcesRef = useRef<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(isEdit);

  const hideFields = [
    ...(isLc ? REQUEST_ASSET_HIDE_FIELDS : []),
  ];

  const { isCardAllowed, allowedProvinces, allowedSites, isProfileLoading } = useProfileCompletion();
  const isAllowed = isLc || Boolean(isCardAllowed(SUPPORT_CATEGORIES.ASSET));
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [dynamicSites, setDynamicSites] = useState<any[]>([]);
  const [livelihoodCats, setLivelihoodCats] = useState<any[]>([]);
  const [assetTypeOpts, setAssetTypeOpts] = useState<any[]>([]);
  const [values, setValues] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lodingButton, setLodingButton] = useState<false | typeof BUTTON_LOADING_STATE[keyof typeof BUTTON_LOADING_STATE]>(false);
  
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

  // Edit mode (draft asset): prefill the form from the saved session
  useEffect(() => {
    if (!isEdit) return;
    const loadDetails = async () => {
      try {
        const rawResponse = await getSessionDetails(sessionId);
        const rawData = rawResponse?.result;
        if (!rawData) {
          showAlert('error', rawResponse?.error?.message || t('common.somethingWentWrong'));
          return;
        }
        originalResourcesRef.current = Array.isArray(rawData.resources) ? rawData.resources : [];
        setValues(mapAssetApiToFormValues(rawData));
      } finally {
        setIsLoadingDetails(false);
      }
    };
    loadDetails();
  }, [isEdit, sessionId]);

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
    // Asset categories have their own list; 'livelihoods' holds the Livelihoods training types
    getLivelihoodCategoriesOptions()
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
    return t(
      'supportProvider.assetForm.step1.totalFundBreakdown',
      `R ${perParticipant.toLocaleString()} per participant × ${quantity} funded participants`,
    );
  }, [values.estimatedValue, values.availableQuantity, t]);

  const totalFundAvailableText = useMemo(() => {
    const perParticipant = Number(values.estimatedValue);
    const quantity = Number(values.availableQuantity);
    if (!perParticipant || !quantity) return '';
    const totalFund = perParticipant * quantity;
    return `R ${totalFund.toLocaleString()}`;
  }, [values.estimatedValue, values.availableQuantity]);

  const schema = useMemo(() => {
    const withFund = patchField(ASSET_FORM_SCHEMA(hideFields), 'totalFundBreakdown', (field) => ({
      ...field,
      subTitle: { ...field.subTitle, fallback: totalFundBreakdownText },
      badge: field.badge
        ? { ...field.badge, value: { ...field.badge.value, fallback: totalFundAvailableText } }
        : field.badge,
    }));
    if (!isLc) return withFund;
    // The request page asks for the total asset value (not per participant) and an optional quantity
    const withValue = patchField(withFund, 'estimatedValue', (field) =>
      field.label?.key === 'estimatedValue'
        ? { ...field, label: { key: 'estimatedValueRequest', fallback: 'Estimated Asset Value (Rands)' } }
        : field);
    return patchField(withValue, 'availableQuantity', (field) =>
      field.type === 'text'
        ? {
          ...field,
          required: false,
          label: { key: 'quantityRequest', fallback: 'Quantity' },
          subTitle: {
            key: 'supportProvider.assetForm.step1.quantityRequestSubTitle',
            fallback: 'Total number of participants / units requiring funds for this asset',
          },
          validation: field.validation?.filter((rule) => rule.rule !== 'required'),
        }
        : field);
  }, [hideFields, totalFundBreakdownText, totalFundAvailableText, isLc]);

  const handleSave = useCallback(async (submittedValues: any, isDraft: boolean) => {
    if (lodingButton || isSubmitting) return;
    try {
      const formValues = isDraft && !isLc ? applyDraftDefaults(submittedValues, ASSET_DRAFT_CONFIG.defaults) : submittedValues;
      setIsSubmitting(true);
      setLodingButton(isDraft ? BUTTON_LOADING_STATE.SAVE_DRAFT : BUTTON_LOADING_STATE.SUBMIT);
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
        // No dates: same default range as Additional Service (toDatePayload: now .. now + 4 years)
        const { start_date: startDate, end_date: endDate } = valueMapping(
          { start_date: formValues.startDate, end_date: formValues.endDate },
          false,
          {},
          SUPPORT_CATEGORIES.ASSET,
        );
        const payload = {
          support_offering_type: SUPPORT_CATEGORIES.ASSET,
          categories: [
            SUPPORT_CATEGORIES.ASSET,
            ...(Array.isArray(formValues.livelihoodCategory)
              ? formValues.livelihoodCategory
              : formValues.livelihoodCategory
                ? [formValues.livelihoodCategory]
                : []),
          ],          
          idp_tasks: toIdpTasksPayload(null, SUPPORT_CATEGORIES.ASSET),
          title: formValues.assetTitle,
          description: formValues.assetDescription,
          asset_types: formValues.assetType ? [formValues.assetType] : [],
          // Old key stored the category under the Livelihoods training types, moved to livelihood_categories
          // livelihoods: formValues.livelihoodCategory || '',
          livelihood_categories: Array.isArray(formValues.livelihoodCategory)
            ? formValues.livelihoodCategory
            : formValues.livelihoodCategory
              ? [formValues.livelihoodCategory]
              : [],
          estimated_value: formValues.estimatedValue,
          seats_limit: formValues.availableQuantity ? Number(formValues.availableQuantity) : undefined,
          meta: {
            estimated_value: formValues.estimatedValue,
          },
          resources: formValues.assetDocuments,
          provinces: formValues.province ? [formValues.province] : [],
          sites: Array.isArray(formValues.site) ? formValues.site : (formValues.site ? [formValues.site] : []),
          recommended_for: ['user'],
          start_date: startDate,
          end_date: endDate,
          status: isDraft ? 'DRAFT' : 'PUBLISHED',
          can_be_copied: false,
          certificate_provided: false,
          delivery_mode: 'offline',
        };

        if (isEdit) {
          await updateSessionWithResources(sessionId, payload, originalResourcesRef.current);
        } else {
          await createSession(payload);
        }

        showAlert(
          'success',
          isDraft
            ? t('supportProvider.assetForm.draftSuccessMessage')
            : t('supportProvider.supportOfferings.cards.alerts.supportPublished', 'Support published successfully!'),
        );
        // @ts-ignore
        navigation.navigate(ROUTES.OPPORTUNITIES, { activeTab: SUPPORT_OFFERING_TABS.ASSETS });
      }
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || t('common.somethingWentWrong');
      showAlert('error', errMsg);
    } finally {
      setIsSubmitting(false);
      setLodingButton(false);
    }
  }, [isLc, isEdit, sessionId, navigation, showAlert, t, lodingButton, isSubmitting]);

  const handleBackPress = () => {
    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // @ts-ignore
      navigation.navigate(isLc ? ROUTES.SESSIONS_SUPPORT : ROUTES.CREATE_OPPORTUNITY);
    }
  }

  if (isProfileLoading || isLoadingDetails) {
    return <Loader fullScreen message="Loading..." />;
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

  const lcHeaderBadge = (
    <HStack {...lcStyles.headerTitleHStack}>
      <Text {...lcStyles.headerSubTitleText}>
        {t('lc.requestAsset.title')}
      </Text>
      <Box {...lcStyles.headerBadgeBox}>
        <Text {...lcStyles.headerBadgeText}>
          {t('lc.requestAsset.badge')}
        </Text>
      </Box>
    </HStack>
  );

  return (
    <VStack flex={1}>
      {isLc ? (
        <PageHeader
          rightSection={lcHeaderBadge}
          backButtonText={t('supportProvider.createSupport.changeType')}
          onBackPress={handleBackPress}
        />
      ) : (
        <SPTitleHeader
          title={t('supportProvider.createSupport.asset.title')}
          backButtonText={t('supportProvider.createSupport.changeType')}
          onNavigateBack={handleBackPress}
        />
      )}
      <Container {...styles.container}>
        <Card borderRadius="$2xl" bg="transparent" p="$0" shadowOpacity={0} elevation={0}>
          <SchemaFormRenderer
            schema={schema}
            optionsMap={optionsMap}
            values={values}
            t={t}
            onFieldChange={handleFieldChange}
            disableStepNavigation={isLc}
            _formContainer={FORM_CARD_PROPS}
            onSubmit={(formValues) => handleSave(formValues, false)}
            onSaveDraft={(formValues) => handleSave(formValues, true)}
            draftRequiredFields={isLc ? undefined : ASSET_DRAFT_CONFIG.requiredFields}
            // LC request goes to requestSessions/create, which has no draft support
            showSaveDraftButton={!isLc}
            isSubmitting={isSubmitting}
            lodingButton={lodingButton}
            uploadService={uploadService}
            // SP publishes with the same button as Training; LC keeps the default Submit for its request
            {...(!isLc
              ? {
                  submitButtonProps: { bg: "green", icon: "Check", _icon: { color: "$white" } },
                  submitButtonText: t("supportProvider.supportOfferings.buttonTexts.publishSupport"),
                }
              : {
                  // White spinner so the loader is visible on the primary Submit button
                  submitButtonProps: { _icon: { color: "$white" } },
                })}
          />
        </Card>
      </Container>
    </VStack>
  );
};

export default App;
