import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { VStack, HStack, Button, ButtonText, Modal, Badge, BadgeText, Text, LucideIcon, Spinner } from '@ui';
import { useAlert } from '@components/ui';
import { TYPOGRAPHY } from '@constants/TYPOGRAPHY';
import { FormField, FormSection, FORM_FIELD_TYPES } from '@components/SchemaFormRenderer/type';
import SchemaFormRenderer, { validateSchema } from '@components/SchemaFormRenderer';
import { createUser, getSitesByProvince } from '../../services/usersService';
import { updateMentorExtension } from '../../services/mentoringService';
import { useUserManagementFilters } from '@constants/USER_MANAGEMENT';
import type { AdminUserManagementData } from '@app-types/Users';
import { ROLE_NAMES } from '@constants/ROLES';
import { CREATE_USER_FORM_SCHEMA, INPUT_STYLE } from '@constants/CREATE_USER_FORM_SCHEMA';

interface CreateUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isMobile?: boolean;
  t: any;
}

export const CreateUserForm = React.memo<CreateUserFormProps>(({
  isOpen,
  onClose,
  onSuccess,
  t,
}) => {
  const { showAlert } = useAlert();
  const { roles, provinces, genders, organisations, positions, countryCodes } = useUserManagementFilters({});
  const initialValues = useMemo(() => {
    const vals: Record<string, any> = {};
    const initializeField = (field: FormField) => {
      if (field.type === FORM_FIELD_TYPES.GROUP && field.fields) {
        field.fields.forEach(initializeField);
      } else if (field.name) {
        vals[field.name] = field.defaultValue ?? '';
      }
    };
    CREATE_USER_FORM_SCHEMA.forEach(section => {
      section.rows.forEach(row => {
        row.fields.forEach(initializeField);
      });
    });
    return vals;
  }, []);

  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSites, setFormSites] = useState<any[]>([]);

  const isMultiLocation = isMultiLocationRole(values.roleId, roles);
  const formSchema = useMemo(() => getLocationSchema(isMultiLocation), [isMultiLocation]);

  // useEffect(() => {
  //   if (!values.provinceId) {
  //     setFormSites([]);
  //     return;
  //   }
  //   getSitesByProvince({ provinceId: values.provinceId })
  //     .then(res => setFormSites(res.result?.data || []))
  //     .catch(() => setFormSites([]));
  // }, [values.provinceId]);

  // Load sites for every selected province; in multi mode drop picked sites whose province was removed
  const provinceKey = toLocationList(values.provinceId).join(',');
  useEffect(() => {
    let cancelled = false;
    fetchSitesForProvinces(provinceKey ? provinceKey.split(',') : []).then(sites => {
      if (cancelled) return;
      setFormSites(sites);
      const siteIds = sites.map((s: any) => s._id);
      setValues(prev =>
        Array.isArray(prev.siteId)
          ? { ...prev, siteId: prev.siteId.filter((id: string) => siteIds.includes(id)) }
          : prev,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [provinceKey]);

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialValues]);

  const optionsMap = useMemo(() => mapFiltersToOptionsMap({
    roles,
    genders,
    provinces,
    sites: formSites,
    organisations,
    positions,
    countryCodes,
  }), [roles, genders, provinces, formSites, organisations, positions, countryCodes]);

  const handleFieldChange = useCallback((name: string, value: any) => {
    let nextValues: Record<string, any> = {};
    setValues(prev => {
      nextValues = { ...prev, [name]: value };
      if (name === 'email' && (prev.username === '' || prev.username === prev.email)) {
        nextValues.username = value;
      }
      // if (name === 'provinceId') nextValues.siteId = '';
      // Single select resets site on province change; multi select keeps sites and prunes them after reload
      if (name === 'provinceId' && !Array.isArray(value)) nextValues.siteId = '';
      if (name === 'roleId') {
        const selectedRole = roles.find((r: any) => r.id.toString() === value);
        const roleTitle = (selectedRole?.title || '').toLowerCase();
        nextValues.isParticipant = roleTitle === 'user' ? 'true' : 'false';
        // Switching between LC/Supervisor and other roles converts province/site between list and single value
        const multi = isMultiLocationRole(value, roles);
        nextValues.provinceId = toLocationValue(prev.provinceId, multi);
        nextValues.siteId = toLocationValue(prev.siteId, multi);
      }
      return nextValues;
    });
    setErrors(prev => {
      const next = { ...prev };
      const validationErrs = validateSchema(
        getLocationSchema(isMultiLocationRole(nextValues.roleId, roles)),
        nextValues,
        optionsMap,
      );
      if (validationErrs[name]) {
        next[name] = validationErrs[name];
      } else {
        delete next[name];
      }
      if (name === 'roleId') {
        delete next.provinceId;
        delete next.siteId;
      }
      return next;
    });
  }, [roles, optionsMap]);

  const handleSubmit = useCallback(async () => {
    const validationErrs = validateSchema(formSchema, values, optionsMap);
    if (Object.keys(validationErrs).length > 0) {
      setErrors({});
      setTimeout(() => {
        setErrors(validationErrs);
      }, 0);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = mapFormValuesToPayload(values, roles);
      // @ts-ignore - process.env is injected by webpack DefinePlugin on web
      payload.password = process.env.DEFAULT_USER_PASSWORD || 'Password@1234';

      const createRes = await createUser(payload);
      try {
        await syncMentorExtension(createRes, payload, values);
      } catch (mentorError: any) {
        // User exists at this point, so close the form and refresh the list instead of letting a retry hit a duplicate
        showAlert(
          'warning',
          t('admin.users.createUser.mentorProfileError') ||
            `User created successfully, but creating the mentoring profile failed${mentorError?.message ? `: ${mentorError.message}` : '.'}`,
          { placement: 'bottom' },
        );
        onSuccess();
        return;
      }
      showAlert('success', t('admin.users.createUser.success') || 'User created successfully.', { placement: 'bottom' });
      onSuccess();
    } catch (error: any) {
      let errMsg = error?.message || t('admin.users.createUser.error') || 'Failed to create user.';
      let type: "error" | "warning" = "error"
      if (error?.statusCode === 406 || error?.statusCode === 422) {
        type = 'warning';
      }
      showAlert(type, errMsg, { placement: 'bottom' });
      setErrors({
        ...errors,
        [error?.data?.error?.[0]?.param]:
          error?.data?.error?.[0]?.msg ||
          error?.data?.error?.[0]?.message,
      });
      //setErrors({ ...errors, [error?.data?.error?.[0]?.param]: error?.data?.error?.[0]?.message })
    } finally {
      setIsSubmitting(false);
    }
  }, [values, formSchema, optionsMap, roles, showAlert, t, onSuccess]);
  
  const firstNameRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        firstNameRef.current?.focus?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      headerTitle={t('admin.users.createUser.title') || 'Create New User'}
      headerDescription={t('admin.users.createUser.description')}
      showCloseButton={true}
      closeOnOverlayClick={!isSubmitting}
      style={{ zIndex: 9999 }}
    >
      <VStack space="md" width="100%" px="$1">
        <SchemaFormRenderer
          schema={formSchema}
          values={values}
          errors={errors}
          onFieldChange={handleFieldChange}
          optionsMap={optionsMap}
          disabled={isSubmitting}
          t={t}
          _input={INPUT_STYLE}
          firstNameRef={firstNameRef}
        // onSubmit={handleSubmit}
        />
        <VStack space="md" width="100%">
          <HStack space="md" justifyContent="flex-end">
            <Button variant={'outlineghost' as any} onPress={onClose} isDisabled={isSubmitting}>
              <ButtonText {...TYPOGRAPHY.bodySmall}>{t('admin.users.createUser.cancel') || 'Cancel'}</ButtonText>
            </Button>
            <Button variant="solid" action="primary" onPress={handleSubmit} isDisabled={isSubmitting}>
              {isSubmitting && <Spinner size="small" color="$white" mr="$2" />}
              <ButtonText color="$white" {...TYPOGRAPHY.bodySmall}>
                {isSubmitting ? 'Submitting...' : (t('admin.users.createUser.create') || 'Create User')}
              </ButtonText>
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Modal>
  );
});

interface ProfileModalHeaderProps {
  selectedUserBase: AdminUserManagementData | null;
  selectedUserProfile: any | null;
  isMobile: boolean;
  t: (key: string, fallback?: string) => string;
}

export const ProfileModalHeader: React.FC<ProfileModalHeaderProps> = ({
  selectedUserBase,
  selectedUserProfile,
  isMobile,
  t,
}) => {
  const roles =
    (selectedUserBase as any)?.user_organizations?.[0]?.roles
      ?.map((r: any) => r?.role?.label)
      .filter(Boolean) || [];

  const profileRole =
    typeof (selectedUserProfile as any)?.role === 'string'
      ? (selectedUserProfile as any)?.role
      : (selectedUserProfile as any)?.role?.label;

  const roleLabel =
    roles[0] ||
    profileRole ||
    selectedUserBase?.role ||
    t('admin.users.profileModal.defaultRole', 'User');

  const badges = (
    <HStack
      space="sm"
      alignItems="center"
      justifyContent="flex-end"
      flexShrink={0}
    >
      <Badge bg="$primary600" borderRadius="$md" px="$2" py="$0.5">
        <BadgeText color="$white" fontSize="$xs" textTransform="none">
          {roleLabel}
        </BadgeText>
      </Badge>

      <Badge
        bg={
          String(
            selectedUserBase?.status || selectedUserProfile?.status || '',
          ).toLowerCase() === 'active'
            ? '$success600'
            : '$textMutedForeground'
        }
        borderRadius="$md"
        px="$2"
        py="$0.5"
      >
        <BadgeText color="$white" fontSize="$xs" textTransform="none">
          {String(
            selectedUserBase?.status || selectedUserProfile?.status || '',
          ).toLowerCase() === 'active'
            ? t('admin.filters.active', 'Active')
            : t('admin.filters.deactivated', 'Deactivated')}
        </BadgeText>
      </Badge>
    </HStack>
  );

  if (isMobile) {
    return (
      <VStack space="sm" flex={1} flexShrink={1}>
        <VStack space="xs">
          <Text {...TYPOGRAPHY.h1} color="$textForeground">
            {selectedUserProfile?.name || selectedUserBase?.name || '-'}
          </Text>
          <HStack space="xs" alignItems="center">
            <LucideIcon name="Mail" size={14} color="$textMutedForeground" />
            <Text {...TYPOGRAPHY.bodySmall} color="$textMutedForeground">
              {selectedUserProfile?.email || selectedUserBase?.email || '-'}
            </Text>
          </HStack>
        </VStack>
        {badges}
      </VStack>
    );
  }

  return (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      flex={1}
      flexShrink={1}
      pr="$8"
      gap="$2"
    >
      <VStack space="xs" flex={1} flexShrink={1}>
        <Text {...TYPOGRAPHY.h1} color="$textForeground" numberOfLines={1}>
          {selectedUserProfile?.name || selectedUserBase?.name || '-'}
        </Text>
        <HStack space="xs" alignItems="center">
          <LucideIcon name="Mail" size={14} color="$textMutedForeground" />
          <Text
            {...TYPOGRAPHY.bodySmall}
            color="$textMutedForeground"
            numberOfLines={1}
          >
            {selectedUserProfile?.email || selectedUserBase?.email || '-'}
          </Text>
        </HStack>
      </VStack>
      {badges}
    </HStack>
  );
};

export const mapFiltersToOptionsMap = (params: {
  roles: any[];
  genders: any[];
  provinces: any[];
  sites: any[];
  organisations: any[];
  positions: any[];
  countryCodes?: any[];
}) => {
  const {
    roles = [],
    genders = [],
    provinces = [],
    sites = [],
    organisations = [],
    positions = [],
    countryCodes = [],
  } = params;

  return {
    roles: roles
      .filter((r: any) => !['admin', 'brac admin'].includes((r.label || r.title)?.toLowerCase() ?? ''))
      .map((r: any) => ({ value: r.id.toString(), label: r.label || r.title || '' })),
    genders: genders.map((g: any) => ({ value: g._id, label: g.metaInformation?.name || g.name })),
    provinces: provinces.map((p: any) => ({ value: p._id, label: p.metaInformation?.name || p.name })),
    sites: sites.map((s: any) => ({ value: s._id, label: s.metaInformation?.name || s.name })),
    organisations: organisations.map((o: any) => ({ value: o._id, label: o.metaInformation?.name || o.name })),
    positions: positions.map((p: any) => ({ value: p._id, label: p.metaInformation?.name || p.name })),
    countryCodes: countryCodes.map((c: any) => ({ value: c.metaInformation?.externalId || c.externalId || '', label: c.metaInformation?.externalId || c.externalId || '' })).sort((a, b) => parseInt(a.value) - parseInt(b.value) || a.value.localeCompare(b.value)),
  };
};

// LC (org_admin) and Supervisor (tenant_admin) can cover more than one province/site
const MULTI_LOCATION_ROLES: string[] = [ROLE_NAMES.ORG_ADMIN, 'tenant_admin'];

export const isMultiLocationTitle = (roleTitle: any): boolean =>
  MULTI_LOCATION_ROLES.includes(String(roleTitle || '').toLowerCase());

export const isMultiLocationRole = (roleId: any, roles: any[]): boolean => {
  const role = roles.find((r: any) => r.id?.toString() === String(roleId ?? ''));
  return isMultiLocationTitle(role?.title);
};

export const toLocationList = (value: any): string[] =>
  (Array.isArray(value) ? value : [value])
    .map((v: any) => (v === null || v === undefined ? '' : String(v).trim()))
    .filter(Boolean);

export const toLocationValue = (value: any, isMulti: boolean): string | string[] => {
  const list = toLocationList(value);
  return isMulti ? list : list[0] || '';
};

// Same user form schema, with province/site switched to multi select for LC/Supervisor
export const getLocationSchema = (isMulti: boolean): FormSection[] =>
  !isMulti
    ? CREATE_USER_FORM_SCHEMA
    : CREATE_USER_FORM_SCHEMA.map(section => ({
        ...section,
        rows: (section.rows || []).map(row => ({
          ...row,
          fields: row.fields.map(field =>
            field.name === 'provinceId' || field.name === 'siteId'
              ? { ...field, type: FORM_FIELD_TYPES.MULTISELECT }
              : field,
          ),
        })),
      }));

// Sites of every selected province, merged without duplicates
export const fetchSitesForProvinces = async (provinceIds: string[]): Promise<any[]> => {
  if (!provinceIds.length) return [];
  const results = await Promise.all(
    provinceIds.map(provinceId =>
      getSitesByProvince({ provinceId, page: 1, limit: 100 })
        .then(res => res.result?.data || [])
        .catch(() => []),
    ),
  );
  const seen = new Set<string>();
  return results.flat().filter((site: any) => {
    if (seen.has(site._id)) return false;
    seen.add(site._id);
    return true;
  });
};

/**
 * Creates the mentor extension for newly created org_admin / user role users.
 * org_admin users are flagged as mentors.
 */
const syncMentorExtension = async (
  createRes: any,
  payload: any,
  values: Record<string, any>,
) => {
  const roleList = String(payload.roles || '').toLowerCase().split(',');
  const isOrgAdmin = roleList.includes(ROLE_NAMES.ORG_ADMIN);
  if (!isOrgAdmin && !roleList.includes(ROLE_NAMES.USER)) return;

  const user = createRes?.result?.user;
  if (!user?.id) return;

  // Backend reads mentor fields from the top level of the body
  await updateMentorExtension({
    user_id: String(user.id),
    skipValidation: true,
    forceCreate: true,
    name: payload.name,
    username: payload.username,
    email: payload.email,
    phone: payload.phone,
    // meta: {
    //   provinces: values.provinceId ? [values.provinceId] : [],
    //   sites: values.siteId ? [values.siteId] : [],
    // },
    // provinces: values.provinceId ? [values.provinceId] : [],
    // sites: values.siteId ? [values.siteId] : [],
    provinces: toLocationList(values.provinceId),
    sites: toLocationList(values.siteId),
    is_mentor: isOrgAdmin,
    mentor_visibility: 'CURRENT',
    mentee_visibility: 'CURRENT',
    external_session_visibility: 'CURRENT',
    external_mentor_visibility: 'CURRENT',
    external_mentee_visibility: 'CURRENT',
    visible_to_organizations: (user.organizations || []).map((o: any) => o.id),
  });
};

export const mapFormValuesToPayload = (
  values: Record<string, any>,
  roles: any[],
): any => {
  const roleId = values.roleId;
  const selectedRole = roles.find((r: any) => r.id.toString() === roleId);
  const roleTitle = selectedRole?.title || roleId;
  const roleLabel = (selectedRole?.label || '').toLowerCase();
  const isSupervisorOrLC = ['supervisor', 'org_admin', 'lc', 'linkage champion', 'tenant_admin'].some(
    (k: string) => roleTitle.toLowerCase().includes(k) || roleLabel.includes(k)
  );

  const payload: any = {
    name: values.name?.trim(),
    username: values.username?.trim(),
    email: values.email?.trim(),
    // org_admin users are also added to the mentor list
    roles: roleTitle.toLowerCase() === ROLE_NAMES.ORG_ADMIN ? `${roleTitle},mentor` : roleTitle,
  };

  if (values.dob && values.dob.trim()) {
    payload.dob = values.dob.replace(/[\/\-]/g, '_');
  }
  if (values.gender && values.gender.trim()) {
    payload.gender = values.gender;
  }
  // if (values.siteId && values.siteId.trim()) {
  //   payload.site = values.siteId;
  // }
  // if (values.provinceId && values.provinceId.trim()) {
  //   payload.province = values.provinceId;
  // }
  // user-service stores province/site as ARRAY[STRING], so always send a list
  const siteIds = toLocationList(values.siteId);
  const provinceIds = toLocationList(values.provinceId);
  if (siteIds.length) {
    payload.site = siteIds;
  }
  if (provinceIds.length) {
    payload.province = provinceIds;
  }
  if (values.phoneNumber && values.phoneNumber.trim()) {
    payload.phone = values.phoneNumber.trim();
    if (values.countryCode) {
      payload.phone_code = values.countryCode.replace('+', '');
    }
  } else {
    payload.phone = null;
    payload.phone_code = null;
  }

  if (values.alternativePhone && values.alternativePhone.trim()) {
    payload.alternative_phone = values.alternativePhone.trim();
    if (values.alternativePhoneCode) {
      payload.alternative_phone_code = values.alternativePhoneCode.replace('+', '');
    }
  }
  if (values.location && values.location.trim()) {
    payload.location = values.location.trim();
  } else {
    payload.location = null;
  }
  if (values.nationalId && values.nationalId.trim()) {
    payload.national_id = Number(values.nationalId);
  }

  if (isSupervisorOrLC) {
    if (values.organisationId && values.organisationId.trim()) {
      payload.organization = values.organisationId;
    }
    if (values.positionId && values.positionId.trim()) {
      payload.position = values.positionId;
    }
    if (values.employee_id && values.employee_id.trim()) {
      payload.employee_id = values.employee_id;
    }
  }

  return payload;
};
