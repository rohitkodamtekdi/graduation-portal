export interface SidebarMenuItem {
  key: string;
  label: string;
  icon: string; // Lucide icon name
  /** In-app route (React Navigation) */
  route?: string;
  /** Static help URL path (web only), opens in new tab — use with `route` omitted */
  href?: string;
  /** Hard redirect: full-page navigation to this URL in the current tab (web), or Linking.openURL on native — use instead of `href` when the destination should replace the current page rather than open a new tab */
  redirectUrl?: string;
  children?: SidebarMenuItem[];
}

export const LC_USER_GUIDE_MENU_ITEM: SidebarMenuItem = {
  key: 'user-story-lc-guide',
  label: 'admin.menu.userStoryGblLcGuide',
  icon: 'MapPin',
  href: '/help/gbl-guide-lclf-v2.html',
};

export const REPORT_FEEDBACK_MENU_ITEM: SidebarMenuItem = {
  key: 'report-feedback',
  label: 'common.reportFeedback',
  icon: 'MessageSquare',
  href: process.env.REPORT_FEEDBACK_FORM_URL || 'https://forms.gle/12ZsUZs9wn2hHtfh9',
};

// All reports and dashboards under one menu, shared by the admin and Report Manager menus
export const REPORTS_AND_DASHBOARDS_MENU_ITEM: SidebarMenuItem = {
  key: 'reports-and-dashboards',
  label: 'admin.menu.reportsAndDashboards',
  icon: 'LayoutDashboard',
  children: [
    {
      key: 'participants',
      label: 'admin.menu.participants',
      icon: 'Users',
      route: 'participants-report',
    },
    {
      key: 'coach-progress',
      label: 'admin.menu.coachProgressInLms',
      icon: 'TrendingUp',
      redirectUrl: '/lms-admin/Coach-Progress-Dashboard',
    },
    {
      key: 'support-provider-dashboard',
      label: 'admin.menu.supportProvider',
      icon: 'ChartColumn',
      route: 'support-provider-dashboard',
    },
  ],
};

export const MAIN_MENU_ITEMS: SidebarMenuItem[] = [
  // Dashboard is hidden from menu but still accessible via /admin-dashboard URL
  // {
  //   key: 'dashboard',
  //   label: 'admin.dashboard',
  //   icon: 'LayoutDashboard', // Lucide icon name
  //   route: 'admin-dashboard',
  // },
  // Replaced by REPORTS_AND_DASHBOARDS_MENU_ITEM, which groups all reports under one menu
  // Pages not built yet — no route/href set; wire these up once their screens exist
  // {
  //   key: 'dashboards',
  //   label: 'admin.menu.dashboards',
  //   icon: 'LayoutDashboard',
  //   children: [
  //     // {
  //     //   key: 'participants',
  //     //   label: 'admin.menu.participants',
  //     //   icon: 'Users',
  //     // },
  //     // {
  //     //   key: 'support-providers',
  //     //   label: 'admin.menu.supportProviders',
  //     //   icon: 'Briefcase',
  //     // },
  //     {
  //       key: 'coach-progress',
  //       label: 'admin.menu.coachProgress',
  //       icon: 'TrendingUp',
  //       redirectUrl:"/lms-admin/Coach-Progress-Dashboard"
  //     },
  //   ],
  // },
  REPORTS_AND_DASHBOARDS_MENU_ITEM,
  {
    key: 'user-management',
    label: 'admin.menu.userManagement',
    icon: 'Users', // Lucide icon name
    route: 'user-management',
  },
  {
    key: 'assign-users',
    label: 'admin.menu.assignUsers',
    icon: 'UserCheck', // Lucide icon name - distinct from Users icon
    route: 'assign-users',
  },
  {
    key: 'review-requests',
    label: 'admin.menu.reviewRequests',
    icon: 'ClipboardCheck', // Lucide icon name
    route: 'review-requests',
  },
  // Moved under Reports and Dashboards
  // {
  //   key: 'support-provider-dashboard',
  //   label: 'admin.menu.supportProviderDashboard',
  //   icon: 'ChartColumn', // Lucide icon name
  //   route: 'support-provider-dashboard',
  // },
  // {
  //   key: 'template-management',
  //   label: 'admin.menu.templateManagement',
  //   icon: 'FileText', // Lucide icon name
  //   route: 'template-management',
  // },
  // {
  //   key: 'audit-log',
  //   label: 'admin.menu.auditLog',
  //   icon: 'Activity', // Lucide icon name for activity log
  //   route: 'audit-log',
  // },
  // {
  //   key: 'forms-surveys-management',
  //   label: 'admin.menu.formsAndSurveysManagement',
  //   icon: 'ClipboardList',
  // },
  {
    key: 'lms-management',
    label: 'admin.menu.lmsManagement',
    icon: 'GraduationCap',
    children: [
      {
        key: 'content-library',
        label: 'admin.menu.contentLibrary',
        icon: 'FileText',
        redirectUrl:"/lms-admin/lms-management/content-library"
      },
      {
        key: 'course-creation',
        label: 'admin.menu.courseCreation',
        icon: 'BookOpen',
        redirectUrl:"/lms-admin/lms-management/course-creation"
      },
    ],
  },
  // {
  //   key: 'certificates',
  //   label: 'admin.menu.certificates',
  //   icon: 'Award',
  // },
];

// export const QUICK_ACTION_MENU_ITEMS: SidebarMenuItem[] = [
//   {
//     key: 'upload-users',
//     label: 'admin.menu.uploadUsers',
//     icon: 'Upload', // Lucide icon name
//     route: 'UploadUsers',
//   },
//   {
//     key: 'new-lc',
//     label: 'admin.menu.createUser',
//     icon: 'UserPlus', // Lucide icon name
//     route: 'NewLC',
//   },
// ];

export const MORE_INFORMATION_MENU_ITEMS: SidebarMenuItem[] = [
  {
    key: 'csv-templates',
    label: 'admin.menu.csvImportTemplates',
    icon: 'FileDown', // Lucide icon name
    route: 'csv-templates',
  },
  {
    key: 'password-policy',
    label: 'admin.menu.passwordManagementPolicy',
    icon: 'Lock', // Lucide icon name
    route: 'PasswordPolicy', // Placeholder route
  },
  {
    key: 'profile-permissions',
    label: 'admin.menu.profileFieldEditPermissions',
    icon: 'FilePenLine', // Lucide icon name
    route: 'ProfilePermissions', // Placeholder route
  },
];

// Report Manager sees only the reports menu
export const REPORT_MANAGER_MENU_ITEMS: SidebarMenuItem[] = [REPORTS_AND_DASHBOARDS_MENU_ITEM];
export const REPORT_MANAGER_USER_STORY_KEYS: string[] = ['user-story-dashboard-guide', 'report-feedback'];

/** GBL help guides and feedback links */
export const USER_STORY_MENU_ITEMS: SidebarMenuItem[] = [
  {
    key: 'user-story-admin-guide',
    label: 'admin.menu.userStoryGblAdminGuide',
    icon: 'BookOpen',
    href: '/help/gbl-guide-admin.html',
  },
  {
    key: 'user-story-dashboard-guide',
    label: 'admin.menu.userStoryGblDashboardGuide',
    icon: 'LayoutDashboard',
    href: '/help/gbl-guide-dashboard.html',
  },
  LC_USER_GUIDE_MENU_ITEM,
  REPORT_FEEDBACK_MENU_ITEM,
];
