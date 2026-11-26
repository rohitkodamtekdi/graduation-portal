import { useCallback, useEffect, useState } from 'react';
import { Template } from '@app-types/templateManagement';
import { getIdpTemplates } from '../../services/templateManagementService';

// Last loaded list, shared so the detail screen opens instantly from the list
let cachedTemplates: Template[] | null = null;

export const useIdpTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>(cachedTemplates || []);
  const [isLoading, setIsLoading] = useState(!cachedTemplates);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(!cachedTemplates);
    setError(null);
    try {
      const list = await getIdpTemplates();
      cachedTemplates = list;
      setTemplates(list);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { templates, isLoading, error, reload: load };
};
