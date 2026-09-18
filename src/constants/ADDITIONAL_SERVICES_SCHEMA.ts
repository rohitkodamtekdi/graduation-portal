import type { FormField, FormSection } from '@components/SchemaFormRenderer/type';

export const ADDITIONAL_SERVICES_SCHEMA = (): FormSection[] => ([
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
              {
                name: 'provinces',
                type: 'select',
                required: true,
                label: { key: 'province' },
                placeholder: { },
                optionsSource: 'provinces',
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.provinceRequired',
                    },
                  },
                ],
              },
              {
                name: 'sites',
                type: 'multiselect',
                required: true,
                label: { key: 'site' },
                placeholder: { },
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
              },
            ],
          },
          {
            fields: [
              {
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
              },
            ],
          },
          {
            fields: [{
              name: 'idp_additional_services_tasks',
              type: 'pillmultiselect',
              label: { key: 'servicesTags' },
              optionsSource: 'sessionTypes',
              dependsOn: 'categories',
              visibleIf: [
                { name: 'categories', value: 'other_attention', operator: '!=' },
              ]
            }
            ],
          },
          {
            fields: [
              {
                name: 'title',
                type: 'text',
                required: true,
                label: { key: 'servicesTitle' },
                placeholder: { },
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.servicesTitleRequired',
                    },
                  },
                ],
              },
            ],
          },
          {
            fields: [
              {
                name: 'description',
                type: 'textarea',
                required: true,
                label: { key: 'servicesDescription' },
                placeholder: {
                },
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.servicesDescriptionRequired',
                    },
                  },
                ],
              },
            ],
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
              {
                name: 'start_date',
                type: 'datetime',
                required: false,
                label: { key: 'startDate' },
                placeholder: { },
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
              },
              // {
              //   name: 'startTime',
              //   type: 'time',
              //   required: false,
              //   label: { key: 'startTime' },
              //   placeholder: { },
              //   validation: [
              //     {
              //       rule: "timeCompare",
              //       value: {
              //         field: "endTime",
              //         operator: "<"
              //       },
              //       message: {
              //         key: "errors.timeCompareEndTime",
              //              //       }
              //     }
              //   ],
              // },
            ],
          },
          {
            fields: [
              {
                name: 'end_date',
                type: 'datetime',
                required: false,
                label: { key: 'endDate' },
                placeholder: { },
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
              },
              // {
              //   name: 'endTime',
              //   type: 'time',
              //   required: false,
              //   label: { key: 'endTime' },
              //   placeholder: { },
              //   validation: [
              //     {
              //       rule: "timeCompare",
              //       value: {
              //         field: "startTime",
              //         operator: ">"
              //       },
              //       message: {
              //         key: "errors.timeCompareStartTime",
              //              //       }
              //     }
              //   ],
              // },
            ],
          },
          {
            fields: [
              {
                name: 'location',
                type: 'text',
                required: false,
                label: { key: 'serviceLocation' },
                placeholder: { },
              },
            ],
          },
          {
            fields: [
              {
                name: 'learning_objectives',
                type: 'textarea',
                required: false,
                label: { key: 'eligibilityCriteria' },
                placeholder: { },
              },
            ],
          },
          {
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
            ],
          },
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
              {
                fields: [
                  {
                    type: 'view',
                    name: 'provinces',
                    optionsSource: 'provinces',
                    label: {
                      key: 'province',
                    },
                  },
                ],
              },
              {
                fields: [
                  {
                    type: 'view',
                    name: 'sites',
                    optionsSource: 'sites',
                    label: {
                      key: 'site',
                    },
                  },
                ],
              },
              {
                fields: [
                  {
                    type: 'view',
                    name: 'categories',
                    optionsSource: 'pillars',
                    label: {
                      key: 'servicesCategoryReview',
                    },
                  },
                ],
              },
              {
                fields: [
                  {
                    type: 'view',
                    name: 'idp_additional_services_tasks',
                    optionsSource: 'sessionTypes',
                    label: {
                      key: 'servicesTags',
                    },
                  },
                ],
              },
              {
                fields: [
                  {
                    name: 'title',
                    type: 'view',
                    label: { key: 'servicesTitleReview' },
                  },
                ],
              },
              {
                fields: [
                  {
                    name: 'start_date',
                    type: 'view',
                    displayFormat: "dateFormat@DD-MM-YYYY hh:mm A",
                    label: { key: 'startDate' },
                  },
                  // {
                  //   name: 'startTime',
                  //   type: 'view',
                  //   label: { key: 'startTime' },
                  // },
                ],
              },
              {
                fields: [
                  {
                    name: 'end_date',
                    type: 'view',
                    displayFormat: "dateFormat@DD-MM-YYYY hh:mm A",
                    label: { key: 'endDate' },
                  },
                  // {
                  //   name: 'endTime',
                  //   type: 'view',
                  //   label: { key: 'endTime' },
                  // },
                ],
              },
              {
                fields: [
                  {
                    name: 'location',
                    type: 'view',
                    label: { key: 'serviceLocationReview' },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

export const ADDITIONAL_SERVICES_FORM_SCHEMA = ADDITIONAL_SERVICES_SCHEMA;
