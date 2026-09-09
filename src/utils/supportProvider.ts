import { LC_ROLES, PARTICIPANT } from '@constants/ROLES';
import { CERTIFICATE_OPTIONS, RECURRING_OPTIONS } from '@constants/SUPPORT_PROVIDER_CARDS';
import moment from 'moment';
import { uploadFiles } from '../project-player/services/projectPlayerService';

export type SupportOfferingFormType = 'training' | 'additional_service' | 'asset' | string;

export function valueMapping(
  formValues: any,
  isReverseMapping: boolean = false,
  optionsMap: any,
  formType: SupportOfferingFormType = 'training',
): any {
  const effectiveFormType: SupportOfferingFormType = formType || 'training';

  if (isReverseMapping) {
    let recommended_for = '';
    if (
      formValues.recommended_for &&
      Array.isArray(formValues.recommended_for)
    ) {
      let tempArray = formValues.recommended_for.map(
        (item: any) => item?.value ?? item,
      );
      let isLcRole = tempArray.some((item: string) => LC_ROLES.includes(item));
      let isParticipantRole = tempArray.some((item: string) =>
        PARTICIPANT.includes(item),
      );
      if (isLcRole && isParticipantRole) {
        recommended_for = 'both';
      } else if (isLcRole) {
        recommended_for = 'org_admin';
      } else if (isParticipantRole) {
        recommended_for = 'user';
      }
    }
    return {
      // ...formValues,
      title: formValues?.title,
      provinces: formValues?.provinces,
      sites: formValues?.sites,
      categories: formValues.categories?.[0],
      idp_training_task: formValues.idp_training_task,
      sessionTypeOther: formValues.idp_training_task === "custom" ? formValues?.title : "",
      description: formValues?.description,
      learning_objectives: formValues?.learning_objectives,
      recommended_for,
      certificate_provided: `${formValues.certificate_provided}`,
      seats_limit: formValues?.seats_limit,
      can_be_copied: `${formValues.can_be_copied}`,
      max_capacity: formValues.seats_limit,
      resources: formValues?.resources,
      // delivery_mode: formValues.delivery_mode?.value || formValues.delivery_mode,
      // meeting_link: formValues.meeting_info?.meeting_link,
      // location: formValues.meeting_info?.location,
      // start_date: moment(formValues.start_date).format('DD-MM-YYYY HH:mm'),
      // end_date: moment(formValues.end_date).format('DD-MM-YYYY HH:mm'),
    };
  }

  const { province, site, ...restFormValues } = formValues;

  let recommendedForPayload: string[] = [];
  if (effectiveFormType === 'additional_service' || effectiveFormType === 'asset') {
    recommendedForPayload = ['user'];
  } else if (Array.isArray(formValues.recommended_for)) {
    recommendedForPayload = formValues.recommended_for;
  } else if (formValues.recommended_for === 'both') {
    recommendedForPayload = ['org_admin', 'user'];
  } else if (formValues.recommended_for) {
    recommendedForPayload = [formValues.recommended_for];
  }

  const rawStartDate = formValues.start_date ?? formValues.startDate;
  const rawEndDate = formValues.end_date ?? formValues.endDate;

  const startDate: number = rawStartDate ? moment(rawStartDate).unix() : 0;
  const endDate: number = rawEndDate ? moment(rawEndDate).unix() : (rawStartDate ? moment(rawStartDate).add(30, 'minutes').unix() : 1800);

  const resolvedTitle = formValues?.idp_training_task === 'custom'
    ? formValues?.sessionTypeOther
    : (formValues?.title || formValues?.assetTitle || '');

  const resolvedDescription = formValues?.description || formValues?.assetDescription || '';

  const rawProvinces = formValues.provinces ?? formValues.province;
  const resolvedProvinces = Array.isArray(rawProvinces) ? rawProvinces.filter(Boolean) : (rawProvinces ? [rawProvinces] : []);

  const rawSites = formValues.sites ?? formValues.site;
  const resolvedSites = Array.isArray(rawSites) ? rawSites.filter(Boolean) : (rawSites ? [rawSites] : []);

  const rawCategories = formValues.categories ?? formValues.livelihoodCategory;
  const resolvedCategories = Array.isArray(rawCategories) ? rawCategories.filter(Boolean) : (rawCategories ? [rawCategories] : []);

  return {
    ...formValues,
    title: resolvedTitle,
    description: resolvedDescription,
    categories: resolvedCategories,
    delivery_mode: formValues.delivery_mode || 'offline',
    provinces: resolvedProvinces,
    sites: resolvedSites,
    recommended_for: recommendedForPayload,
    start_date: startDate,
    end_date: endDate,
    certificate_provided: formValues.certificate_provided === "true" || formValues.certificate_provided === true,
    can_be_copied: formValues.can_be_copied === "true" || formValues.can_be_copied === true,
    session_type: 'Public',
    status: formValues.isDraft ? 'DRAFT' : 'PUBLISHED',
    seats_limit: formValues.seats_limit,
    meeting_info: {
      link: formValues?.meeting_link || '',
      location: formValues?.location || '',
    },
    support_offering_type: effectiveFormType
  };
}

export function requestSessionPayloadMapping(formValues: any, optionMap: any = {}): any {
  const { province, site } = formValues;
  const resolvedProvince = formValues.provinces ?? province;
  const resolvedSites = formValues.sites ?? site;

  return {
    support_offering_type: formValues.support_offering_type || 'training_session',
    provinces: Array.isArray(resolvedProvince) ? resolvedProvince : [resolvedProvince],
    sites: Array.isArray(resolvedSites) ? resolvedSites : (resolvedSites ? [resolvedSites] : []),
    categories: [formValues.categories],
    idp_training_task: formValues.idp_training_task,
    description: formValues.description,
    learning_objectives: formValues.learning_objectives,
    start_date: moment(formValues.start_date).unix(),
    end_date: moment(formValues.end_date).unix(),
    title:
      formValues.idp_training_task === 'custom'
        ? formValues.sessionTypeOther
        : formValues.title,
    agenda: formValues.description,
    requestees: formValues.requestees || [],
    status: formValues.isDraft ? 'DRAFT' : 'Requested',
    time_zone: 'Asia/Kolkata',
    can_be_copied: false,
    certificate_provided: false,
    delivery_mode: formValues.delivery_mode || 'offline',
    meeting_info: {
      link: formValues.meeting_link || '',
      location: formValues.location || '',
    },
  };
}

export const uploadService = async (file: any) => {
  const entityId = `trainingSession-${Date.now()}`;
  const uploaded = await uploadFiles(entityId, [
    { ...file, size: file.size ?? 0 },
  ]);
  const url = uploaded?.data?.[0]?.url;
  if (!url) {
    throw new Error(`Failed to upload file: ${file.name}`);
  }
  const data = uploaded?.data?.[0];
  const [f, s] = data?.type.split('/');
  return {
    name: data?.name,
    link: data?.url,
    sourcePath: data?.sourcePath,
    type: s || f,
    size: data?.size,
  };
};

interface TrainingFormOptionsMapParams {
  provinces?: any[];
  sites?: any[];
  pillers?: any[];
  sessionTypes?: any[];
  targetAudience?: any[];
  deliveryModes?: any[];
  deliveryModeIcons?: Record<string, string>;
}

/**
 * Builds the `optionsMap` consumed by SchemaFormRenderer for the training
 * session form, keyed by each field's `optionsSource` (see TRAINING_FORM_SCHEMA.ts).
 */
export function buildTrainingFormOptionsMap({
  provinces = [],
  sites = [],
  pillers = [],
  sessionTypes = [],
  targetAudience = [],
  deliveryModes = [],
  deliveryModeIcons = {},
}: TrainingFormOptionsMapParams): Record<string, { value: string; label: string }[]> {
  return {
    provinces: provinces.map((province: any) => ({
      value: province._id,
      label: province.name,
    })),
    sites: sites.map((site: any) => ({
      value: site._id,
      label: site.name,
    })),
    pillars: pillers,
    sessionTypes: sessionTypes,
    targetAudienceOptions: targetAudience,
    formatOptions: (Array.isArray(deliveryModes) ? deliveryModes : []).map((mode: any) => ({
      value: mode.value,
      label: mode.label,
      icon: deliveryModeIcons[mode.value?.toLowerCase()] || 'MapPin',
    })),
    certificateOptions: [...CERTIFICATE_OPTIONS],
    recurringOptions: [...RECURRING_OPTIONS],
  };
}
