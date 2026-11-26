/**
 * Template Management (admin) types.
 * An IDP template is a pathway category (e.g. Entrepreneurship Pathway); its pillars are the
 * pathway's child categories, and pillar tasks come from the project templates linked to them.
 */

export type TemplateStatus = 'Active' | 'Inactive';

export interface TemplateTask {
  /** Task _id, used to update the task */
  taskId: string;
  /** Display id (externalId, or _id when missing) */
  id: string;
  name: string;
  description: string;
  /** Title of the project template this task belongs to */
  projectTemplate: string;
  /** _id of that project template; tasks are reordered within it */
  projectTemplateId: string;
  /** True when the task's project template is used by more than one pathway */
  isShared: boolean;
}

/**
 * A direct child category of a pillar (e.g. Livelihoods > Retail and Trade).
 * Only this level is shown: the IDP flow lets the LC pick only these, not deeper levels.
 */
export interface TemplateSubCategory {
  id: string;
  name: string;
  description: string;
  status: TemplateStatus;
}

export interface TemplatePillar {
  id: string;
  name: string;
  description: string;
  status: TemplateStatus;
  /** Direct child categories of the pillar */
  subCategories: TemplateSubCategory[];
  /** session_category for new session tasks in this pillar ('' when none) */
  sessionCategory: string;
  /** Project templates linked to this pillar; a new task is added to one of these */
  projectTemplates: PillarProjectTemplate[];
  tasks: TemplateTask[];
}

export interface Template {
  id: string;
  externalId?: string;
  templateName: string;
  description: string;
  status: TemplateStatus;
  creator: string;
  createdDate: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  tasks: number;
  pillars: TemplatePillar[];
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface TaskUpdate {
  name?: string;
  description?: string;
}

export interface PillarProjectTemplate {
  id: string;
  title: string;
  /** Used by more than one pathway, so a new task shows up in all of them */
  isShared: boolean;
}

/** '' = plain task; the others make the task schedulable in the LC's IDP */
export type TaskSupportType = '' | 'training' | 'additional_service' | 'asset';

export interface TaskCreate {
  name: string;
  description?: string;
  supportOfferingType?: TaskSupportType;
  sessionCategory?: string;
}
