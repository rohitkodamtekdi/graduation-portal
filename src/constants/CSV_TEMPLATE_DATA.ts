export const CSV_TEMPLATES_KEYS = [
    {
        id: 'user_import',
        titleKey: 'admin.csvTemplatePage.templates.user_import.title',
        descriptionKey: 'admin.csvTemplatePage.templates.user_import.description',
    },
    // {
    //     id: 'participant_assignment',
    //     titleKey: 'admin.csvTemplatePage.templates.participant_assignment.title',
    //     descriptionKey: 'admin.csvTemplatePage.templates.participant_assignment.description',
    // },
    // {
    //     id: 'lc_supervisor_mapping',
    //     titleKey: 'admin.csvTemplatePage.templates.lc_supervisor_mapping.title',
    //     descriptionKey: 'admin.csvTemplatePage.templates.lc_supervisor_mapping.description',
    // },
    // {
    //     id: 'bulk_status_update',
    //     titleKey: 'admin.csvTemplatePage.templates.bulk_status_update.title',
    //     descriptionKey: 'admin.csvTemplatePage.templates.bulk_status_update.description',
    // },
    // {
    //     id: 'geographic_reassignment',
    //     titleKey: 'admin.csvTemplatePage.templates.geographic_reassignment.title',
    //     descriptionKey: 'admin.csvTemplatePage.templates.geographic_reassignment.description',
    // },
];

export const GUIDELINES_KEYS = [
    'admin.csvTemplatePage.guidelines.items.0',
    'admin.csvTemplatePage.guidelines.items.1',
    'admin.csvTemplatePage.guidelines.items.2',
    'admin.csvTemplatePage.guidelines.items.3',
    'admin.csvTemplatePage.guidelines.items.4',
    'admin.csvTemplatePage.guidelines.items.5',
    'admin.csvTemplatePage.guidelines.items.6',
    'admin.csvTemplatePage.guidelines.items.7',
];

// Templates served as a ready-made file (e.g. the GBL XLSX on S3) instead of the generated CSV below
export const TEMPLATE_FILE_URLS: Record<string, string> = {
    // @ts-ignore - process.env from DefinePlugin
    user_import: (process.env.USER_IMPORT_TEMPLATE_URL || '').trim(),
};

export const CSV_CONTENT_STRINGS: Record<string, string> = {
    // Replaced by the GBL v5 upload template columns (roles, gender, national_id, password; dob as dd/mm/yyyy)
    // user_import: "username,email,phone_code,phone,name,role,province,site,location,dob\njohn.doe,john@example.com,27,6789450945,John Doe,user,SA-G,SA-G-RF,A2659 Jozini Road Ntuzuma 4359,04/03/75",
    user_import: "username,email,phone_code,phone,name,roles,province,site,location,dob,gender,national_id,password\njane.doe@example.com,jane.doe@example.com,27,821234567,Jane Doe,user,SA-FS,SA-FS-OM,\"1 Main Road, Sample, 0000\",28/10/1995,FEMALE,9510280000000,Example@123",
    participant_assignment: "participant_email,lc_email,assignment_date\nparticipant@example.com,lc@example.com,2024-01-01",
    lc_supervisor_mapping: "lc_email,supervisor_email\nlc@example.com,supervisor@example.com",
    bulk_status_update: "user_email,new_status,reason\nuser@example.com,inactive,Resigned",
    geographic_reassignment: "user_email,new_province,new_district\nuser@example.com,Western Cape,Cape Town"
};
