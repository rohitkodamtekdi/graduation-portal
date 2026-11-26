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
  /** True when the task's project template is used by more than one pathway */
  isShared: boolean;
}

export interface TemplatePillar {
  id: string;
  name: string;
  description: string;
  status: TemplateStatus;
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
