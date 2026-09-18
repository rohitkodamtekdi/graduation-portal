import type { FormSection } from '@components/SchemaFormRenderer/type';

export const ASSET_SCHEMA: FormSection[] = [
  // ─── Tab 1: Asset Details ──────────────────────────────────────────────────
  {
    type: 'tab',
    id: 'assetDetails',
    title: {
      key: 'supportProvider.assetForm.tabs.assetDetails',
    },
    icon: 'FileText',
    children: [
      {
        type: 'section',
        id: 'assetDetailsSection',
        title: {
          key: 'supportProvider.assetForm.step1.title',
        },
        subTitle: {
          key: 'supportProvider.assetForm.step1.subTitle',
        },
        rows: [
          {
            fields: [
              {
                name: 'province',
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
                name: 'site',
                type: 'multiselect',
                required: true,
                label: { key: 'site' },
                placeholder: { },
                placeholderWhenReady: {
                  key: 'sitePlaceholderReady',
                },
                optionsSource: 'sites',
                dependsOn: 'province',
                disabledWhen: { field: 'province', empty: true },
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
                name: 'assetType',
                type: 'pillselect',
                required: true,
                label: { key: 'assetType' },
                optionsSource: 'assetTypes',
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.assetTypeRequired',
                    },
                  },
                ],
              },
            ],
          },
          {
            fields: [
              {
                name: 'livelihoodCategory',
                type: 'pillmultiselect',
                required: true,
                label: { key: 'livelihoodCategory' },
                subTitle: {
                  key: 'supportProvider.assetForm.step1.livelihoodCategorySubTitle',
                },
                optionsSource: 'livelihoodCategories',
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.livelihoodCategoryRequired',
                    },
                  },
                ],
              },
            ],
          },
          {
            fields: [
              {
                name: 'assetTitle',
                type: 'text',
                required: true,
                label: { key: 'assetTitle' },
                placeholder: { },
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.assetTitleRequired',
                    },
                  },
                ],
              },
            ],
          },
          {
            fields: [
              {
                name: 'assetDescription',
                type: 'textarea',
                required: true,
                label: { key: 'assetDescription' },
                placeholder: {
                },
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.assetDescriptionRequired',
                    },
                  },
                ],
              },
            ],
          },
          {
            fields: [
              {
                name: 'estimatedValue',
                type: 'text',
                required: true,
                label: { key: 'estimatedValue' },
                subTitle: {
                  key: 'supportProvider.assetForm.step1.estimatedValueSubTitle',
                },
                placeholder: { },
                inputProps: { keyboardType: 'numeric' },
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.estimatedValueRequired',
                    },
                  },
                ],
              },
              {
                name: 'availableQuantity',
                type: 'text',
                required: true,
                label: { key: 'availableQuantity' },
                subTitle: {
                  key: 'supportProvider.assetForm.step1.availableQuantitySubTitle',
                },
                placeholder: { },
                inputProps: { keyboardType: 'numeric' },
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.availableQuantityRequired',
                    },
                  },
                ],
              },
            ],
          },
          {
            fields: [
              {
                name: 'totalFundBreakdown',
                type: 'note',
                label: { key: 'totalFundBreakdown' },
                visibleIf: [
                  { name: 'estimatedValue', operator: '!=', value: '' },
                  { name: 'availableQuantity', operator: '!=', value: '' },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'section',
        id: 'availability',
        title: {
          key: 'supportProvider.assetForm.step1.availabilityTitle',
        },
        rows: [
          {
            fields: [
              {
                name: 'startDate',
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
                      field: "endDate",
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
                name: 'endDate',
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
                      field: "startDate",
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
        ],
      },
      {
        type: 'section',
        id: 'assetDocuments',
        rows: [
          {
            fields: [
              {
                name: 'assetDocuments',
                type: 'file',
                multiple: true,
                required: false,
                showOptionalTag: true,
                label: {
                  key: 'supportProvider.assetForm.step1.resourceContent',
                },
                subTitle: {
                  key: 'supportProvider.assetForm.step1.resourceUploadSub',
                },
                placeholder: {
                  key: 'supportProvider.assetForm.step1.uploadPrompt',
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
      key: 'supportProvider.assetForm.tabs.review',
    },
    icon: 'Check',
    children: [
      {
        type: 'section',
        id: 'reviewPublishSection',
        title: {
          key: 'supportProvider.assetForm.step2.title',
        },
        hint: {
          title: {
            key: 'supportProvider.assetForm.step2.infoTitle',
          },
          bullets: [
            {
              key: 'supportProvider.assetForm.step2.infoBullet1',
            },
            {
              key: 'supportProvider.assetForm.step2.infoBullet2',
            },
            {
              key: 'supportProvider.assetForm.step2.infoBullet3',
            },
          ],
        },
        children: [
          {
            type: 'section',
            id: 'reviewAssetDetails',
            title: {
              key: 'supportProvider.assetForm.step2.assetDetailsTitle',
            },
            rows:[
              {
                fields: [
                  {
                    type: 'view',
                    name: 'province',
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
                    name: 'site',
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
                    name: 'assetType',
                    label: { key: 'assetType' },
                    optionsSource: 'assetTypes',
                  },
                ],
              },
              {
                fields: [
                  {
                    type: 'view',
                    name: 'livelihoodCategory',
                    label: { key: 'livelihoodCategory' },
                    optionsSource: 'livelihoodCategories',
                  },
                ],
              },
              {
                fields: [
                  {
                    type: 'view',
                    name: 'assetTitle',
                    label: { key: 'assetTitle' },
                    placeholder: { },
                  },
                ],
              },
              {
                fields: [
                  {
                    name: 'estimatedValue',
                    type: 'view',
                    label: { key: 'estimatedValueReview' },
                  },
                  {
                    name: 'availableQuantity',
                    type: 'view',
                    label: { key: 'availableQuantity' },
                  },
                ],
              },
              {
                fields: [
                  {
                    name: 'startDate',
                    type: 'view',
                    displayFormat: "dateFormat@DD/MM/YYYY hh:mm A",
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
                    name: 'endDate',
                    type: 'view',
                    displayFormat: "dateFormat@DD/MM/YYYY hh:mm A",
                    label: { key: 'endDate' },
                  },
                  // {
                  //   name: 'endTime',
                  //   type: 'view',
                  //   label: { key: 'endTime' },
                  // },
                ],
              },
            ]
          },
        ],
      },
    ],
  },
];

export const ASSET_FORM_SCHEMA = ASSET_SCHEMA;
