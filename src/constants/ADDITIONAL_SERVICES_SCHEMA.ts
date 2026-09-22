import type { FormField, FormSection } from '@components/SchemaFormRenderer/type';

export const ADDITIONAL_SERVICES_SCHEMA = (hideFileds: string[] = []): FormSection[] => {
  const allTabs: FormSection[] = [
    // ─── Tab 1: Service Details ───────────────────────────────────────────────
    {
      type: 'tab',
      id: 'serviceDetails',
      title: {
        key: 'supportProvider.additionalServicesForm.tabs.serviceDetails',
      },
      icon: 'FileText',
      children: [
        {
          type: 'section',
          id: 'additionalServiceDetails',
          title: {
            key: 'supportProvider.additionalServicesForm.step1.title',
          },
          subTitle: {
            key: 'supportProvider.additionalServicesForm.step1.subTitle',
          },
          rows: [
            {
              fields: [
                ...(hideFileds.includes('provinces') ? [] : [{
                  name: 'provinces',
                  type: 'select',
                  required: true,
                  label: { key: 'province' },
                  placeholder: { key: 'provincePlaceholder' },
                  optionsSource: 'provinces',
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.provinceRequired',
                      },
                    },
                  ],
                }]),
                ...(hideFileds.includes('sites') ? [] : [{
                  name: 'sites',
                  type: 'multiselect',
                  required: true,
                  label: { key: 'site' },
                  placeholder: { key: 'sitePlaceholder' },
                  placeholderWhenReady: {
                    key: 'sitePlaceholderReady',
                  },
                  optionsSource: 'sites',
                  dependsOn: 'provinces',
                  disabledWhen: { field: 'provinces', empty: true },
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.siteRequired',
                      },
                    },
                  ],
                }]),
              ] as FormField[],
            },
            {
              fields: [
                ...(hideFileds.includes('categories') ? [] : [{
                  name: 'categories',
                  type: 'pillselect',
                  required: true,
                  label: { key: 'servicesCategory' },
                  optionsSource: 'pillars',
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.servicesCategoryRequired',
                      },
                    },
                  ],
                }]),
              ] as FormField[],
            },
            {
              fields: [
                ...(hideFileds.includes('idp_additional_services_tasks') ? [] : [{
                  name: 'idp_additional_services_tasks',
                  type: 'pillmultiselect',
                  label: { key: 'servicesCategory' },
                  optionsSource: 'sessionTypes',
                  dependsOn: 'categories',
                  visibleIf: [
                    { name: 'categories', value: 'other_attention', operator: '!=' },
                  ]
                }]),
              ] as FormField[],
            },
            {
              fields: [
                ...(hideFileds.includes('title') ? [] : [{
                  name: 'title',
                  type: 'text',
                  required: true,
                  label: { key: 'servicesTitle' },
                  placeholder: { key: 'servicesTitlePlaceholder' },
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.servicesTitleRequired',
                      },
                    },
                  ],
                }]),
              ] as FormField[],
            },
            {
              fields: [
                ...(hideFileds.includes('description') ? [] : [{
                  name: 'description',
                  type: 'textarea',
                  required: true,
                  label: { key: 'servicesDescription' },
                  placeholder: {
                    key: 'servicesDescriptionPlaceholder',
                  },
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.servicesDescriptionRequired',
                      },
                    },
                  ],
                }]),
              ] as FormField[],
            },
          ],
        },
        {
          type: 'section',
          id: 'serviceAvailability',
          title: {
            key: 'supportProvider.additionalServicesForm.step1.availabilityTitle',
          },
          rows: [
            {
              fields: [
                ...(hideFileds.includes('start_date') ? [] : [{
                  name: 'start_date',
                  type: 'datetime',
                  required: false,
                  label: { key: 'startDate' },
                  placeholder: { key: 'start_datePlaceholder' },
                  validation: [
                    {
                      rule: 'dateNotInPast',
                      message: {
                        key: 'errors.dateNotInPast',
                      },
                    },
                    {
                      rule: "dateCompare",
                      value: {
                        field: "end_date",
                        operator: "<="
                      },
                      message: {
                        key: "errors.dateCompare",
                      }
                    }
                  ],
                }]),
              ] as FormField[],
            },
            {
              fields: [
                ...(hideFileds.includes('end_date') ? [] : [{
                  name: 'end_date',
                  type: 'datetime',
                  required: false,
                  label: { key: 'endDate' },
                  placeholder: { key: 'end_datePlaceholder' },
                  validation: [
                    {
                      rule: 'dateNotInPast',
                      message: {
                        key: 'errors.dateNotInPast',
                      },
                    },
                    {
                      rule: "dateCompare",
                      value: {
                        field: "start_date",
                        operator: ">="
                      },
                      message: {
                        key: "errors.dateCompareStartDate",
                      }
                    }
                  ],
                }]),
              ] as FormField[],
            },
            ...(hideFileds.includes('location') ? [] : [{
              fields: [
                {
                  name: 'location',
                  type: 'text',
                  required: false,
                  label: { key: 'serviceLocation' },
                  placeholder: { key: 'serviceLocationPlaceholder' },
                },
              ] as FormField[],
            }]),
            ...(hideFileds.includes('learning_objectives') ? [] : [{
              fields: [
                {
                  name: 'learning_objectives',
                  type: 'textarea',
                  required: false,
                  label: { key: 'eligibilityCriteria' },
                  placeholder: { key: 'eligibilityCriteriaPlaceholder' },
                },
              ] as FormField[],
            }]),
            ...(hideFileds.includes('resources') ? [] : [{
              fields: [
                {
                  name: 'resources',
                  type: 'file',
                  multiple: true,
                  required: false,
                  showOptionalTag: true,
                  label: {
                    key: 'supportProvider.additionalServicesForm.step1.resourceContent',
                  },
                  subTitle: {
                    key: 'supportProvider.additionalServicesForm.step1.resourceUploadSub',
                  },
                  placeholder: {
                    key: 'supportProvider.additionalServicesForm.step1.uploadPrompt',
                  },
                  validation: [
                    {
                      rule: 'fileType',
                      value: ['pdf', 'doc', 'docx'],
                      message: {
                        key: 'errors.fileType',
                      },
                    },
                    {
                      rule: 'fileSize',
                      value: 10,
                      message: {
                        key: 'errors.fileSize10',
                      },
                    },
                  ],
                },
              ] as FormField[],
            }]),
          ],
        },
      ],
    },

    // ─── Tab 2: Review & Publish ───────────────────────────────────────────────
    {
      type: 'tab',
      id: 'review',
      title: {
        key: 'supportProvider.additionalServicesForm.tabs.review',
      },
      icon: 'Check',
      children: [
        {
          type: 'section',
          id: 'reviewPublishSection',
          title: {
            key: 'supportProvider.additionalServicesForm.step2.title',
          },
          hint: {
            title: {
              key: 'supportProvider.additionalServicesForm.step2.infoTitle',
            },
            bullets: [
              {
                key: 'supportProvider.additionalServicesForm.step2.infoBullet1',
              },
              {
                key: 'supportProvider.additionalServicesForm.step2.infoBullet2',
              },
              {
                key: 'supportProvider.additionalServicesForm.step2.infoBullet3',
              },
            ],
          },
          children: [
            {
              type: 'section',
              id: 'reviewServiceDetails',
              title: {
                key: 'supportProvider.additionalServicesForm.step2.serviceDetailsTitle',
              },
              rows: [
                ...(hideFileds.includes('provinces') ? [] : [{
                  fields: [
                    {
                      type: 'view',
                      name: 'provinces',
                      optionsSource: 'provinces',
                      label: {
                        key: 'province',
                      },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('sites') ? [] : [{
                  fields: [
                    {
                      type: 'view',
                      name: 'sites',
                      optionsSource: 'sites',
                      label: {
                        key: 'site',
                      },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('categories') ? [] : [{
                  fields: [
                    {
                      type: 'view',
                      name: 'categories',
                      optionsSource: 'pillars',
                      label: {
                        key: 'servicesCategory',
                      },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('idp_additional_services_tasks') ? [] : [{
                  fields: [
                    {
                      type: 'view',
                      name: 'idp_additional_services_tasks',
                      optionsSource: 'sessionTypes',
                      label: {
                        key: 'servicesCategory',
                      },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('title') ? [] : [{
                  fields: [
                    {
                      name: 'title',
                      type: 'view',
                      label: { key: 'servicesTitle' },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('start_date') ? [] : [{
                  fields: [
                    {
                      name: 'start_date',
                      type: 'view',
                      displayFormat: "dateFormat@DD-MM-YYYY hh:mm A",
                      label: { key: 'startDate' },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('end_date') ? [] : [{
                  fields: [
                    {
                      name: 'end_date',
                      type: 'view',
                      displayFormat: "dateFormat@DD-MM-YYYY hh:mm A",
                      label: { key: 'endDate' },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('location') ? [] : [{
                  fields: [
                    {
                      name: 'location',
                      type: 'view',
                      label: { key: 'serviceLocation' },
                    },
                  ] as FormField[],
                }]),
              ],
            },
          ],
        },
      ],
    },
  ];

  return allTabs;
};

export const REQUEST_ADDITIONAL_SERVICE_HIDE_FIELDS: string[] = [
  'location',
  'learning_objectives',
];

export const ADDITIONAL_SERVICES_FORM_SCHEMA = ADDITIONAL_SERVICES_SCHEMA;
