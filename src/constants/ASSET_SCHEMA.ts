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
        fallback: 'Review & Publish',
      },
      icon: 'Check',
      children: [
        {
          type: 'section',
          id: 'reviewPublishSection',
          title: {
            key: 'supportProvider.assetForm.step2.title',
            fallback: 'Review & Publish',
          },
          hint: {
            title: {
              key: 'supportProvider.assetForm.step2.infoTitle',
              fallback: 'Before you publish:',
            },
            bullets: [
              {
                key: 'supportProvider.assetForm.step2.infoBullet1',
                fallback: 'This support will be visible to all Coaches in the GBL network',
              },
              {
                key: 'supportProvider.assetForm.step2.infoBullet2',
                fallback: 'Coaches can submit requests on behalf of participants',
              },
              {
                key: 'supportProvider.assetForm.step2.infoBullet3',
                fallback: "You'll receive notifications when requests are submitted",
              },
            ],
          },
          children: [
            {
              type: 'section',
              id: 'reviewAssetDetails',
              title: {
                key: 'supportProvider.assetForm.step2.assetDetailsTitle',
                fallback: 'Asset Details',
              },
              rows: [
                ...(hideFileds.includes('province') ? [] : [{
                  fields: [
                    {
                      type: 'view',
                      name: 'province',
                      optionsSource: 'provinces',
                      label: {
                        key: 'province',
                        fallback: 'Province',
                      },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('site') ? [] : [{
                  fields: [
                    {
                      type: 'view',
                      name: 'site',
                      optionsSource: 'sites',
                      label: {
                        key: 'site',
                        fallback: 'Site',
                      },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('assetType') ? [] : [{
                  fields: [
                    {
                      type: 'view',
                      name: 'assetType',
                      label: { key: 'assetType', fallback: 'Asset Type' },
                      optionsSource: 'assetTypes',
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('livelihoodCategory') ? [] : [{
                  fields: [
                    {
                      type: 'view',
                      name: 'livelihoodCategory',
                      label: { key: 'livelihoodCategory', fallback: 'Category of Livelihoods' },
                      optionsSource: 'livelihoodCategories',
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('assetTitle') ? [] : [{
                  fields: [
                    {
                      type: 'view',
                      name: 'assetTitle',
                      label: { key: 'assetTitle', fallback: 'Asset Title' },
                      placeholder: { fallback: 'Name of this asset...' },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('estimatedValue') ? [] : [{
                  fields: [
                    {
                      name: 'estimatedValue',
                      type: 'view',
                      label: { key: 'estimatedValue', fallback: 'Estimated Value' },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('quantity') ? [] : [{
                  fields: [
                    {
                      name: 'quantity',
                      type: 'view',
                      label: { key: 'quantity', fallback: 'Quantity' },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('startDate') ? [] : [{
                  fields: [
                    {
                      name: 'startDate',
                      type: 'view',
                      displayFormat: "dateFormat@DD/MM/YYYY hh:mm A",
                      label: { key: 'startDate', fallback: 'Start Date' },
                    },
                  ] as FormField[],
                }]),
                ...(hideFileds.includes('endDate') ? [] : [{
                  fields: [
                    {
                      name: 'endDate',
                      type: 'view',
                      displayFormat: "dateFormat@DD/MM/YYYY hh:mm A",
                      label: { key: 'endDate', fallback: 'End Date' },
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

export const REQUEST_ASSET_HIDE_FIELDS: string[] = [];

export const ASSET_FORM_SCHEMA = ASSET_SCHEMA;
