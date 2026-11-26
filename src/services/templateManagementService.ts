import api from './api';
import { API_ENDPOINTS } from './apiEndpoints';
import offlineStorage from './offlineStorage';
import { STORAGE_KEYS } from '@constants/STORAGE_KEYS';
import {
  CategoryUpdate,
  TaskCreate,
  TaskUpdate,
  Template,
  TemplatePillar,
  TemplateStatus,
  TemplateSubCategory,
  TemplateTask,
} from '@app-types/templateManagement';

const TEMPLATES_PAGE_SIZE = 100;
const MAX_TEMPLATE_PAGES = 20;
const IDP_KEYWORD = 'idp';

const isRemoved = (item: any) => item?.isDeleted === true || item?.deleted === true;

// List APIs send `result: {}` (not an array) when nothing is found
const asArray = (value: any): any[] => (Array.isArray(value) ? value : []);

const toStatus = (status?: string): TemplateStatus => (status === 'active' ? 'Active' : 'Inactive');

// Categories created without a description get the model default 'default'; treat it as empty
const toDescription = (description?: string) => (description && description !== 'default' ? description : '');

const toDate = (value?: string) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const toDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${toDate(value)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// session_category of a pillar's session tasks, from the pillar externalId (e.g. L1_LH_EMP -> livelihoods)
const SESSION_CATEGORY_BY_PILLAR_PREFIX: Record<string, string> = {
  L1_SE_: 'social_empowerment',
  L1_FI_: 'financial_inclusion',
  L1_LH_: 'livelihoods',
};
const toSessionCategory = (externalId?: string) =>
  Object.entries(SESSION_CATEGORY_BY_PILLAR_PREFIX).find(([prefix]) => externalId?.startsWith(prefix))?.[1] || '';

const bySequence = (a: any, b: any) => (a?.sequenceNumber ?? 0) - (b?.sequenceNumber ?? 0);

// The templates list API returns at most 100 per page, so read every page
const fetchAllProjectTemplates = async (): Promise<any[]> => {
  const all: any[] = [];
  for (let page = 1; page <= MAX_TEMPLATE_PAGES; page++) {
    const response = await api.get(
      `${API_ENDPOINTS.PROJECT_TEMPLATES_WITH_TASKS}&page=${page}&limit=${TEMPLATES_PAGE_SIZE}`,
    );
    const batch = asArray(response.data?.result);
    all.push(...batch);
    if (batch.length < TEMPLATES_PAGE_SIZE) break;
  }
  return all.filter(template => !isRemoved(template));
};

// Creator/updater are stored as user ids; names are looked up once. Unknown ids fall back to '—' in the UI.
const fetchUserNames = async (userIds: string[]): Promise<Record<string, string>> => {
  const ids = [...new Set(userIds)].map(Number).filter(id => !Number.isNaN(id));
  if (ids.length === 0) return {};

  try {
    // Same source api.ts uses for the tenant headers: the logged-in user's stored data
    const userData = await offlineStorage.read<any>(STORAGE_KEYS.AUTH_USER).catch(() => null);
    const tenantCode = userData?.tenant_code || 'brac';
    const response = await api.post(
      `${API_ENDPOINTS.USERS_LIST}?tenant_code=${tenantCode}&type=all&page=1&limit=${ids.length}`,
      { user_ids: ids },
    );
    return asArray(response.data?.result?.data).reduce<Record<string, string>>((names, user) => {
      names[String(user.id)] = user.name;
      return names;
    }, {});
  } catch {
    return {};
  }
};

// All category ids and external ids under a category (any depth), including itself
const getCategorySubtreeKeys = (category: any, childrenByParent: Map<string, any[]>) => {
  const keys = new Set<string>([category._id, category.externalId].filter(Boolean));
  const stack = [category._id];
  while (stack.length) {
    (childrenByParent.get(stack.pop() as string) || []).forEach(child => {
      keys.add(child._id);
      if (child.externalId) keys.add(child.externalId);
      stack.push(child._id);
    });
  }
  return keys;
};

const latestBy = (items: any[], field: 'updatedAt' | 'createdAt', newest = true) =>
  items
    .filter(item => item?.[field])
    .sort((a, b) => (newest ? -1 : 1) * String(a[field]).localeCompare(String(b[field])))[0];

/**
 * Builds the IDP templates for Template Management:
 * pathways (root IDP categories) -> pillars (child categories) -> tasks of linked project templates.
 * Uses the admin categories API so inactive pathways and pillars are included.
 */
export const getIdpTemplates = async (): Promise<Template[]> => {
  const [categoriesResponse, projectTemplates] = await Promise.all([
    api.get(API_ENDPOINTS.IDP_TEMPLATE_CATEGORIES),
    fetchAllProjectTemplates(),
  ]);

  const categories = asArray(categoriesResponse.data?.result).filter(category => !isRemoved(category));

  const childrenByParent = new Map<string, any[]>();
  categories.forEach(category => {
    if (!category.parentId) return;
    const siblings = childrenByParent.get(String(category.parentId)) || [];
    siblings.push(category);
    childrenByParent.set(String(category.parentId), siblings);
  });

  // Only the pillar's direct children: the IDP flow lets the LC pick only this level
  const toSubCategories = (parentId: string): TemplateSubCategory[] =>
    [...(childrenByParent.get(parentId) || [])].sort(bySequence).map(category => ({
      id: category._id,
      name: category.name || '',
      description: toDescription(category.description),
      status: toStatus(category.status),
    }));

  const pathways = categories
    .filter(category => !category.parentId && (category.keywords || []).includes(IDP_KEYWORD))
    .sort(bySequence);

  const linkedTo = (template: any, keys: Set<string>) =>
    (template.categories || []).some((c: any) => keys.has(c?._id) || keys.has(c?.externalId));

  // Pillar -> linked project templates, and project template -> pathways using it (to flag shared tasks)
  const pathwaysByTemplate = new Map<string, Set<string>>();
  const pillarsByPathway = pathways.map(pathway => {
    const pillars = [...(childrenByParent.get(String(pathway._id)) || [])].sort(bySequence).map(pillar => {
      const keys = getCategorySubtreeKeys(pillar, childrenByParent);
      const templates = projectTemplates.filter(template => linkedTo(template, keys));
      templates.forEach(template => {
        const used = pathwaysByTemplate.get(template._id) || new Set<string>();
        used.add(pathway._id);
        pathwaysByTemplate.set(template._id, used);
      });
      return { pillar, templates };
    });
    return { pathway, pillars };
  });

  const toTasks = (projectTemplate: any): TemplateTask[] =>
    asArray(projectTemplate.tasks)
      .filter((task: any) => !isRemoved(task))
      .sort(bySequence)
      .map((task: any) => ({
        taskId: task._id,
        id: task.externalId || task._id,
        name: task.name || '',
        description: task.description || '',
        projectTemplate: projectTemplate.title || '',
        projectTemplateId: projectTemplate._id,
        isShared: (pathwaysByTemplate.get(projectTemplate._id)?.size || 0) > 1,
      }));

  const built = pillarsByPathway.map(({ pathway, pillars }) => {
    const templates = [...new Map(pillars.flatMap(p => p.templates).map(t => [t._id, t])).values()];
    const everything = [pathway, ...pillars.map(p => p.pillar), ...templates];
    return {
      pathway,
      pillars: pillars.map(({ pillar, templates: pillarTemplates }): TemplatePillar => ({
        id: pillar._id,
        name: pillar.name || '',
        description: toDescription(pillar.description),
        status: toStatus(pillar.status),
        subCategories: toSubCategories(String(pillar._id)),
        sessionCategory: toSessionCategory(pillar.externalId),
        projectTemplates: pillarTemplates.map(template => ({
          id: template._id,
          title: template.title || '',
          isShared: (pathwaysByTemplate.get(template._id)?.size || 0) > 1,
        })),
        tasks: pillarTemplates.flatMap(toTasks),
      })),
      created: pathway.createdAt ? pathway : latestBy(templates, 'createdAt', false),
      updated: latestBy(everything, 'updatedAt'),
    };
  });

  const names = await fetchUserNames(
    built.flatMap(({ created, updated }) => [created?.createdBy, updated?.updatedBy].filter(Boolean)),
  );

  return built.map(({ pathway, pillars, created, updated }) => ({
    id: pathway._id,
    externalId: pathway.externalId,
    templateName: pathway.name || '',
    description: toDescription(pathway.description),
    status: toStatus(pathway.status),
    creator: names[String(created?.createdBy)] || '',
    createdDate: toDate(created?.createdAt),
    lastUpdated: toDateTime(updated?.updatedAt),
    lastUpdatedBy: names[String(updated?.updatedBy)] || '',
    tasks: pillars.reduce((total, pillar) => total + pillar.tasks.length, 0),
    pillars,
  }));
};

/** Admin: update a pathway or pillar (name, description, status). Applies to new IDPs only. */
export const updateIdpCategory = async (categoryId: string, data: CategoryUpdate) => {
  const response = await api.post(API_ENDPOINTS.IDP_TEMPLATE_UPDATE_CATEGORY(categoryId), data);
  return response.data;
};

/** Admin: update a task (name, description). Applies to new IDPs only. */
export const updateIdpTask = async (taskId: string, data: TaskUpdate) => {
  const response = await api.post(API_ENDPOINTS.IDP_TEMPLATE_UPDATE_TASK(taskId), data);
  return response.data;
};

/** Admin: save a new task order for a project template. Applies to new IDPs only. */
export const reorderIdpTasks = async (templateId: string, taskIds: string[]) => {
  const response = await api.post(API_ENDPOINTS.IDP_TEMPLATE_REORDER_TASKS(templateId), { taskIds });
  return response.data;
};

/** Admin: add a task at the end of a project template. Applies to new IDPs only. */
export const createIdpTask = async (templateId: string, data: TaskCreate) => {
  const response = await api.post(API_ENDPOINTS.IDP_TEMPLATE_CREATE_TASK(templateId), data);
  return response.data;
};
