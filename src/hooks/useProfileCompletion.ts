import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { getUserProfile } from '../services/authenticationService';
import { getMentoringProfile } from '../services/mentoringService';
import { MENTORING_ENTITY_TYPES } from '@constants/SP_MENU_OPTIONS';

// Get Pillers Sub Options
const SUB_OPTION_GROUPS = [
  MENTORING_ENTITY_TYPES.SOCIAL_EMPOWERMENT,
  MENTORING_ENTITY_TYPES.FINANCIAL_INCLUSION,
  MENTORING_ENTITY_TYPES.LIVELIHOODS,
  MENTORING_ENTITY_TYPES.SPECIAL_ATTENTION,
  MENTORING_ENTITY_TYPES.IMMEDIATE_ATTENTION,
  MENTORING_ENTITY_TYPES.ASSET_TYPES,
] as const;

const toId = (entry: any): string => (entry && typeof entry === 'object' ? entry.value : entry);

export const useProfileCompletion = () => {
  const { user } = useAuth();
  const [allowedCategories, setAllowedCategories] = useState<string[]>([]);
  const [allowedSubOptions, setAllowedSubOptions] = useState<Record<string, string[]>>({});
  const [allowedProvinceIds, setAllowedProvinceIds] = useState<string[]>([]);
  const [allowedSiteIds, setAllowedSiteIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const checkCompletion = async () => {
      if (!user?.id) {
        if (isMounted) {
          setAllowedCategories([]);
          setAllowedSubOptions({});
          setAllowedProvinceIds([]);
          setAllowedSiteIds([]);
        }
        return;
      }

      try {
        let profileData: any = {};
        try {
          const mentoringProfileRes = await getMentoringProfile();
          console.log('mentoringProfileRes', mentoringProfileRes);
          if (mentoringProfileRes?.result) {
            profileData = mentoringProfileRes.result;
          }
        } catch (mErr) {
          // No mentoring profile yet (e.g. 404) - fall back below.
        }

        if (!profileData || Object.keys(profileData).length === 0) {
          profileData = (await getUserProfile(user.id)) || {};
        }
        
        const meta = profileData?.meta || {};

        // Extract categories
        const cats: string[] = Array.isArray(profileData.categories) ? profileData.categories : [];

        const subOptions: Record<string, string[]> = {};
        SUB_OPTION_GROUPS.forEach((group) => {
          const raw = profileData[group] ?? meta[group];
          subOptions[group] = Array.isArray(raw) ? raw.map(toId) : [];
        });

        // Extract provinces/sites the provider selected as their coverage
        const rawProvinces = profileData.provinces;
        const rawSites = profileData.sites;
        const provinceIds = Array.isArray(rawProvinces) ? rawProvinces : [];
        const siteIds = Array.isArray(rawSites) ? rawSites : [];

        if (isMounted) {
          setAllowedCategories(cats);
          setAllowedSubOptions(subOptions);
          setAllowedProvinceIds(provinceIds);
          setAllowedSiteIds(siteIds);
        }
      } catch (err) {
        console.error('Error checking profile completion:', err);
        if (isMounted) {
          setAllowedCategories([]);
          setAllowedSubOptions({});
          setAllowedProvinceIds([]);
          setAllowedSiteIds([]);
        }
      }
    };

    checkCompletion();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const isCardAllowed = (cardId?: string): boolean => {
    if (!cardId || !allowedCategories || allowedCategories.length === 0) return false;
    return allowedCategories.includes(cardId);
  };

  const getAllowedSubOptionIds = (groupKey?: string): string[] => {
    if (!groupKey) return [];
    return allowedSubOptions[groupKey] || [];
  };

  const isProfileComplete = allowedProvinceIds.length > 0 && allowedCategories.length > 0;

  return {
    isProfileComplete,
    allowedCategories,
    isCardAllowed,
    allowedSubOptions,
    getAllowedSubOptionIds,
    allowedProvinceIds,
    allowedSiteIds,
  };
};


