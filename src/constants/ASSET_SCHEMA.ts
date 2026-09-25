import type { FormField, FormSection } from '@components/SchemaFormRenderer/type';

export const ASSET_SCHEMA = (hideFileds: string[] = []): FormSection[] => {
  const allTabs: FormSection[] = [
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
                ...(hideFileds.includes('province') ? [] : [{
                  name: 'province',
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
                ...(hideFileds.includes('site') ? [] : [{
                  name: 'site',
                  type: 'multiselect',
                  required: true,
                  label: { key: 'site' },
                  placeholder: { key: 'sitePlaceholder' },
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
                }]),
              ] as FormField[],
            },
            {
              fields: [
                ...(hideFileds.includes('assetType') ? [] : [{
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
                }]),
              ] as FormField[],
            },
            {
              fields: [
                ...(hideFileds.includes('livelihoodCategory') ? [] : [{
                  name: 'livelihoodCategory',
                  type: 'select',
                  required: true,
                  label: { key: 'livelihoodCategory' },
                  placeholder: { key: 'livelihoodCategoryPlaceholder' },
                  optionsSource: 'livelihoodCategories',
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.livelihoodCategoryRequired',
                      },
                    },
                  ],
                }]),
              ] as FormField[],
            },
            {
              fields: [
                ...(hideFileds.includes('assetTitle') ? [] : [{
                  name: 'assetTitle',
                  type: 'text',
                  required: true,
                  label: { key: 'assetTitle' },
                  placeholder: { key: 'assetTitlePlaceholder' },
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.assetTitleRequired',
                      },
                    },
                  ],
                }]),
              ] as FormField[],
            },
            {
              fields: [
                ...(hideFileds.includes('assetDescription') ? [] : [{
                  name: 'assetDescription',
                  type: 'textarea',
                  required: false,
                  label: { key: 'assetDescription' },
                  placeholder: {
                    key: 'assetDescriptionPlaceholder',
                  },
                }]),
              ] as FormField[],
            },
            {
              fields: [
                ...(hideFileds.includes('estimatedValue') ? [] : [{
                  name: 'estimatedValue',
                  type: 'text',
                  required: true,
                  label: { key: 'estimatedValue' },
                  subTitle: {
                    key: 'supportProvider.assetForm.step1.estimatedValueSubTitle',
                  },
                  placeholder: { key: 'estimatedValuePlaceholder' },
                  inputProps: { keyboardType: 'numeric' },
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.estimatedValueRequired',
                      },
                    },
                  ],
                }]),
                ...(hideFileds.includes('availableQuantity') ? [] : [{
                  name: 'availableQuantity',
                  type: 'text',
                  required: true,
                  label: { key: 'availableQuantity' },
                  subTitle: {
                    key: 'supportProvider.assetForm.step1.availableQuantitySubTitle',
                  },
                  placeholder: { key: 'availableQuantityPlaceholder' },
                  inputProps: { keyboardType: 'numeric' },
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.availableQuantityRequired',
                      },
                    },
                  ],
                }]),
              ] as FormField[],
            },
            {
              fields: [
                {
                  name: 'totalFundBreakdown',
                  type: 'note',
                  variant: 'success',
                  label: {
                    key: 'totalFundBreakdownTitle',
                    fallback: 'Total Asset Fund Breakdown',
                  },
                  subTitle: { key: 'totalFundBreakdown' },
                  badge: {
                    label: {
                      key: 'totalFundAvailableLabel',
                      fallback: 'Total Fund Available',
                    },
                    value: { key: 'totalFundAvailableValue' },
                  },
                  visibleIf: [
                    { name: 'estimatedValue', operator: '!=', value: '' },
                    { name: 'availableQuantity', operator: '!=', value: '' },
                  ],
                } as FormField,
              ] as FormField[],
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
                ...(hideFileds.includes('startDate') ? [] : [{
                  name: 'startDate',
                  type: 'datetime',
                  required: false,
                  label: { key: 'startDate' },
                  placeholder: { key: 'startDatePlaceholder' },
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
                }]),
              ] as FormField[],
            },
            {
              fields: [
                ...(hideFileds.includes('endDate') ? [] : [{
                  name: 'endDate',
                  type: 'datetime',
                  required: false,
                  label: { key: 'endDate' },
                  placeholder: { key: 'endDatePlaceholder' },
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
                }]),
              ] as FormField[],
            },
          ],
        },
        ...(hideFileds.includes('assetDocuments') ? [] : [{
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
                      value: [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      ],
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
            },
          ],
        } as FormSection]),
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
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

  return allTabs;
};

export const REQUEST_ASSET_HIDE_FIELDS: string[] = [  ];

export const ASSET_FORM_SCHEMA = ASSET_SCHEMA;
