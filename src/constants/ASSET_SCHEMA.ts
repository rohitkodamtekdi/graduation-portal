import type { FormField, FormSection } from '@components/SchemaFormRenderer/type';

export const ASSET_SCHEMA = (hideFileds: string[] = []): FormSection[] => {
  const allTabs: FormSection[] = [
    // ─── Tab 1: Asset Details ──────────────────────────────────────────────────
    {
      type: 'tab',
      id: 'assetDetails',
      title: {
        key: 'supportProvider.assetForm.tabs.assetDetails',
        fallback: 'Asset Details',
      },
      icon: 'FileText',
      children: [
        {
          type: 'section',
          id: 'assetDetailsSection',
          title: {
            key: 'supportProvider.assetForm.step1.title',
            fallback: 'Asset Details',
          },
          subTitle: {
            key: 'supportProvider.assetForm.step1.subTitle',
            fallback: 'Fields marked * are required',
          },
          rows: [
            {
              fields: [
                ...(hideFileds.includes('province') ? [] : [{
                  name: 'province',
                  type: 'select',
                  required: true,
                  label: { key: 'province', fallback: 'Province' },
                  placeholder: { fallback: 'Select province' },
                  optionsSource: 'provinces',
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.provinceRequired',
                        fallback: 'Province is required',
                      },
                    },
                  ],
                }]),
                ...(hideFileds.includes('site') ? [] : [{
                  name: 'site',
                  type: 'multiselect',
                  required: true,
                  label: { key: 'site', fallback: 'Site' },
                  placeholder: { fallback: 'Select province first' },
                  placeholderWhenReady: {
                    key: 'sitePlaceholderReady',
                    fallback: 'Select site',
                  },
                  optionsSource: 'sites',
                  dependsOn: 'province',
                  disabledWhen: { field: 'province', empty: true },
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.siteRequired',
                        fallback: 'Site is required',
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
                  label: { key: 'assetType', fallback: 'Asset Type' },
                  optionsSource: 'assetTypes',
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.assetTypeRequired',
                        fallback: 'Asset type is required',
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
                  label: { key: 'livelihoodCategory', fallback: 'Category of Livelihoods' },
                  placeholder: { fallback: 'Select livelihood category' },
                  optionsSource: 'livelihoodCategories',
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.livelihoodCategoryRequired',
                        fallback: 'Category of livelihoods is required',
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
                  label: { key: 'assetTitle', fallback: 'Asset Title' },
                  placeholder: { fallback: 'Name of this asset...' },
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.assetTitleRequired',
                        fallback: 'Asset title is required',
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
                  label: { key: 'assetDescription', fallback: 'Asset Description (optional)' },
                  placeholder: {
                    fallback: 'Describe this asset, its purpose, and how it benefits the recipient...',
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
                  label: { key: 'estimatedValue', fallback: 'Estimated Asset Value (Rands)' },
                  placeholder: { fallback: 'R 0.00' },
                  inputProps: { keyboardType: 'numeric' },
                  validation: [
                    {
                      rule: 'required',
                      message: {
                        key: 'errors.estimatedValueRequired',
                        fallback: 'Estimated asset value is required',
                      },
                    },
                  ],
                }]),
              ] as FormField[],
            },
            {
              fields: [
                ...(hideFileds.includes('quantity') ? [] : [{
                  name: 'quantity',
                  type: 'text',
                  required: false,
                  label: { key: 'quantity', fallback: 'Quantity (optional)' },
                  placeholder: { fallback: 'e.g. 10' },
                  inputProps: { keyboardType: 'numeric' },
                }]),
              ] as FormField[],
            },
          ],
        },
        {
          type: 'section',
          id: 'availability',
          title: {
            key: 'supportProvider.assetForm.step1.availabilityTitle',
            fallback: 'Availability (optional)',
          },
          rows: [
            {
              fields: [
                ...(hideFileds.includes('startDate') ? [] : [{
                  name: 'startDate',
                  type: 'datetime',
                  required: false,
                  label: { key: 'startDate', fallback: 'Start Date' },
                  placeholder: { fallback: 'DD/MM/YYYY HH:MM' },
                  validation: [
                    {
                      rule: 'dateNotInPast',
                      message: {
                        key: 'errors.dateNotInPast',
                        fallback: 'Past dates are not allowed.',
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
                        fallback: "Start Date must be before or equal to End Date."
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
                  label: { key: 'endDate', fallback: 'End Date' },
                  placeholder: { fallback: 'DD/MM/YYYY HH:MM' },
                  validation: [
                    {
                      rule: 'dateNotInPast',
                      message: {
                        key: 'errors.dateNotInPast',
                        fallback: 'Past dates are not allowed.',
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
                        fallback: "End Date must be after or equal to Start Date."
                      }
                    }
                  ],
                }]),
              ] as FormField[],
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
