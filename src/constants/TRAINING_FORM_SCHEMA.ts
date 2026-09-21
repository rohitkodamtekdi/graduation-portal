import type { FormSection } from '@components/SchemaFormRenderer/type';

export const TRAINING_SESSION_SCHEMA = (hideFileds: string[] = []) => ([
  // ─── Tab 1: Session Details ───────────────────────────────────────────────
  {
    type: 'tab',
    id: 'sessionDetails',
    title: {
      key: 'supportProvider.additionalServicesForm.tabs.sessionDetails',
    },
    icon: 'FileText',
    children: [
      {
        type: 'section',
        id: 'trainingDetails',
        title: {
          key: 'trainingDetails',
        },
        subTitle: {
          key: 'trainingDetailsSubTitle',
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
            ],
          },
          {
            fields: [
              ...(hideFileds.includes('categories') ? [] : [{
                name: 'categories',
                type: 'pillselect',
                required: true,
                label: { key: 'pillar' },
                optionsSource: 'pillars',
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.pillarRequired',
                    },
                  },
                ],
              }]),
            ],
          },
          {
            fields: [
              ...(hideFileds.includes('idp_training_task') ? [] : [{
                name: 'idp_training_task',
                type: 'select',
                required: true,
                label: {
                  key: 'idp_training_task',
                },
                placeholder: { key: 'idp_training_taskPlaceholder' },
                optionsSource: 'sessionTypes',
                dependsOn: 'categories',
                disabledWhen: { field: 'categories', empty: true },
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.sessionTypeRequired',
                    },
                  },
                ],
              }]),
            ],
          },
          {
            fields: [
              ...(hideFileds.includes('sessionTypeOther') ? [] : [{
                name: 'sessionTypeOther',
                type: 'text',
                required: true,
                label: {
                  key: 'sessionType',
                },
                placeholder: { key: 'sessionTypePlaceholder' },
                visibleIf: [
                  { name: 'idp_training_task', value: 'custom', operator: '===' },
                ],
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.sessionTitleRequired',
                    },
                  },
                ],
              }]),
            ],
          },
          {
            fields: [
              ...(hideFileds.includes('description') ? [] : [{
                name: 'description',
                type: 'textarea',
                required: true,
                label: {
                  key: 'description',
                },
                placeholder: {
                  key: 'descriptionPlaceholder',
                },
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.descriptionRequired',
                    },
                  },
                ],
              }]),
            ],
          },
          {
            fields: [
              ...(hideFileds.includes('learning_objectives') ? [] : [{
                name: 'learning_objectives',
                type: 'textarea',
                required: false,
                label: {
                  key: 'learningObjectives',
                },
                placeholder: {
                  key: 'learningObjectivesPlaceholder',
                },
              }]),
            ],
          },
          {
            fields: [
              ...(hideFileds.includes('recommended_for') ? [] : [{
                name: 'recommended_for',
                type: 'pillselect',
                required: true,
                label: { key: 'targetAudience' },
                optionsSource: 'targetAudienceOptions',
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.targetAudienceRequired',
                    },
                  },
                ],
              }]),
            ],
          },
          {
            fields: [
              ...(hideFileds.includes('certificate_provided') ? [] : [{
                name: 'certificate_provided',
                type: 'pillselect',
                required: true,
                label: {
                  key: 'certificateProvided',
                },
                optionsSource: 'certificateOptions',
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.certificateRequired',
                    },
                  },
                ],
              }]),
            ],
          },
          {
            fields: [
              ...(hideFileds.includes('seats_limit') ? [] : [{
                name: 'seats_limit',
                type: 'text',
                required: true,
                label: { key: 'maxCapacity' },
                placeholder: { key: 'maxCapacityPlaceholder' },
                inputProps: { keyboardType: 'numeric' },
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.maxCapacityRequired',
                    },
                  },
                ],
              }]),
              ...(hideFileds.includes('can_be_copied') ? [] : [{
                name: 'can_be_copied',
                type: 'select',
                required: false,
                label: {
                  key: 'recurringSession',
                },
                optionsSource: 'recurringOptions',
                defaultValue: 'Yes',
              }]),
            ],
          },
          {
            fields: [
              ...(hideFileds.includes('resources') ? [] : [{
                name: 'resources',
                type: 'file',
                multiple: true,
                required: false,
                showOptionalTag: true,
                validation:[
                   {
                    rule: 'fileType',
                    value: ['pdf','doc'],
                    message: {
                      key: 'errors.fileType',
                    },
                  },
                  {
                    rule: "fileSize",
                    value: 10,
                    message: {
                      key: "errors.fileSize10",
                    }
                  }
                ],
                label: {
                  key: 'supportProvider.trainingSession.step1.resourceContent',
                },
                subTitle: {
                  key: 'supportProvider.trainingSession.step1.resourceUploadSub',
                },
                placeholder: {
                  key: 'supportProvider.trainingSession.step1.uploadPrompt',
                },
              }]),
            ],
          },
        ],
      },
    ],
  },

  // ─── Tab 2: Schedule & Format ─────────────────────────────────────────────
  {
    type: 'tab',
    id: 'scheduleFormat',
    title: { key: 'scheduleFormat' },
    icon: 'Calendar',
    children: [
      {
        type: 'section',
        id: 'scheduleDetails',
        title: {
          key: 'scheduleDetails',
        },
        subTitle: {
          key: 'scheduleDetailsSubTitle',
        },
        rows: [
          {
            fields: [
              ...(hideFileds.includes('start_date') ? [] : [{
                name: 'start_date',
                type: 'datetime',
                required: true,
                label: { key: 'start_date' },
                placeholder: { key: 'start_datePlaceholder' },
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.startDateRequired',
                    },
                  },
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
            ]
          },
          {
            fields: [
              ...(hideFileds.includes('end_date') ? [] : [{
                name: 'end_date',
                type: 'datetime',
                required: true,
                label: { key: 'end_date' },
                placeholder: { key: 'end_datePlaceholder' },
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.endDateRequired',
                    },
                  },
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
            ],
          },
          {
            fields: [
              ...(hideFileds.includes('delivery_mode') ? [] : [{
                name: 'delivery_mode',
                type: 'pillselect',
                required: true,
                label: { key: 'formatType' },
                optionsSource: 'formatOptions',
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.formatTypeRequired',
                    },
                  },
                ],
              }]),
            ],
          },
          {
            fields: [
              ...(hideFileds.includes('location') ? [] : [{
                name: 'location',
                type: 'text',
                required: true,
                label: { key: 'location' },
                placeholder: { key: 'locationPlaceholder' },
                visibleIf: [
                  { name: 'delivery_mode', value: 'online', operator: '!=' },
                ],
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.venueRequired',
                    },
                  },
                ],
              }]),
            ],
          },
          {
            fields: [
              ...(hideFileds.includes('meeting_link') ? [] : [{
                name: 'meeting_link',
                type: 'text',
                required: true,
                label: { key: 'meetingLink' },
                placeholder: { key: 'meetingLinkPlaceholder' },
                visibleIf: [
                  { name: 'delivery_mode', value: 'offline', operator: '!=' },
                ],
                validation: [
                  {
                    rule: 'required',
                    message: {
                      key: 'errors.meetingLinkRequired',
                    },
                  },
                ],
              }]),
            ],
          },
        ],
      },
    ],
  },

  // // ─── Tab 3: Review Tab ─────────────────────────────────────────────
  {
    type: 'tab',
    id: 'review',
    label: {
      key: 'review',
    },
    icon: 'Check',
    children: [
      {
        type: 'section',
        id: 'serviceDetails',
        title: {
          key: 'supportProvider.trainingSession.step3.title',
        },
        hint: {
          title: {
            key: 'supportProvider.trainingSession.step3.infoTitle',
          },
          bullets: [
            {
              key: 'supportProvider.trainingSession.step3.infoBullet1',
            },
            {
              key: 'supportProvider.trainingSession.step3.infoBullet2',
            },
            {
              key: 'supportProvider.trainingSession.step3.infoBullet3',
            },
          ],
        },
        children: [
          {
            type: 'section',
            id: 'serviceDetails',
            title: {
              key: 'supportProvider.trainingSession.step3.sessionDetailsTitle',
            },
            rows: [
              {
                fields: [
                  ...(hideFileds.includes('provinces') ? [] : [{
                    name: 'provinces',
                    type: 'view',
                    label: { key: 'province' },
                    optionsSource: 'provinces',
                  }]),
                ],
              },
              {
                fields: [
                  ...(hideFileds.includes('sites') ? [] : [{
                    name: 'sites',
                    type: 'view',
                    label: { key: 'site' },
                    optionsSource: 'sites',
                  }]),
                ],
              },
              {
                fields: [
                  ...(hideFileds.includes('categories') ? [] : [{
                    name: 'categories',
                    type: 'view',
                    required: true,
                    label: { key: 'pillar' },
                    optionsSource: 'pillars',
                  }]),
                ],
              },
              {
                fields: [
                  ...(hideFileds.includes('idp_training_task') ? [] : [{
                    name: 'idp_training_task',
                    type: 'view',
                    required: true,
                    label: {
                      key: 'idp_training_task',
                    },
                    optionsSource: 'sessionTypes',
                  }]),
                ],
              },
              {
                fields: [
                  ...(hideFileds.includes('recommended_for') ? [] : [{
                    name: 'recommended_for',
                    type: 'view',
                    required: true,
                    label: { key: 'targetAudience' },
                    optionsSource: 'targetAudienceOptions',
                  }]),
                ],
              },
              {
                fields: [
                  ...(hideFileds.includes('can_be_copied') ? [] : [{
                    name: 'can_be_copied',
                    type: 'view',
                    label: {
                      key: 'recurringSession',
                    },
                    optionsSource: 'recurringOptions'
                  }]),
                ],
              },
              {
                fields: [
                  ...(hideFileds.includes('certificate_provided') ? [] : [{
                    name: 'certificate_provided',
                    type: 'view',
                    label: {
                      key: 'certificateProvided',
                    },
                    optionsSource: 'certificateOptions',
                  }]),
                ],
              },
              {
                fields: [
                  ...(hideFileds.includes('seats_limit') ? [] : [{
                    name: 'seats_limit',
                    type: 'view',
                    label: { key: 'maxCapacity' },
                  }]),
                ],
              },
            ],
          },
          {
            type: 'section',
            id: 'availability',
            title: {
              key: 'supportProvider.trainingSession.step3.scheduleTitle',
            },
            rows: [
              {
                fields: [
                  ...(hideFileds.includes('start_date') ? [] : [{
                    type: 'view',
                    name: 'start_date',
                    displayFormat: 'dateFormat@DD-MM-YYYY hh:mm A',
                    label: {
                      key: 'supportProvider.trainingSession.step3.startLabel',
                    },
                  }]),
                ],
              },
              {
                fields: [
                  ...(hideFileds.includes('end_date') ? [] : [{
                    type: 'view',
                    name: 'end_date',
                    displayFormat: 'dateFormat@DD-MM-YYYY hh:mm A',
                    label: {
                      key: 'supportProvider.trainingSession.step3.endLabel',
                    },
                  }]),
                ],
              },
              {
                fields: [
                  ...(hideFileds.includes('delivery_mode') ? [] : [{
                    type: 'view',
                    name: 'delivery_mode',
                    label: {
                      key: 'supportProvider.trainingSession.step3.formatLabel',
                    },
                  }]),
                ],
              },
              {
                fields: [
                  ...(hideFileds.includes('location') ? [] : [{
                    type: 'view',
                    name: 'location',
                    label: {
                      key: 'location',
                    },
                    visibleIf: [
                      { name: 'delivery_mode', value: 'online', operator: '!=' },
                    ],
                  }]),
                ],
              },
              {
                fields: [
                  ...(hideFileds.includes('meeting_link') ? [] : [{
                    type: 'view',
                    name: 'meeting_link',
                    label: {
                      key: 'meetingLink',
                    },
                    visibleIf: [
                      { name: 'delivery_mode', value: 'offline', operator: '!=' },
                    ],
                  }]),
                ],
              },
            ],
          },
        ],
      },
    ],
  },
] as FormSection[]);

// ─── Field visibility presets ────────────────────────────────────────────────
// "Request a Session" flow only needs the core fields; everything else is
// filled in / managed elsewhere, so we hide it from that form.
export const REQUEST_SESSION_HIDE_FIELDS: string[] = [
  'recommended_for',
  'certificate_provided',
  'seats_limit',
  'can_be_copied',
  'resources',
  'delivery_mode',
  'location',
  'meeting_link',
];

// "Create" (Service Provider) flow keeps everything else as-is; only the
// recurring-session toggle is hidden.
export const CREATE_SESSION_HIDE_FIELDS: string[] = [
  'can_be_copied',
  'recommended_for',
  'certificate_provided'
];

export const schema = (
  { role, hideFileds }: { role?: string; hideFileds?: string[] } = {}
): FormSection[] => {
  if (hideFileds) {
    return TRAINING_SESSION_SCHEMA(hideFileds);
  }

  if (role === 'request') {
    return TRAINING_SESSION_SCHEMA(REQUEST_SESSION_HIDE_FIELDS);
  }

    if (role === 'create') {
    return TRAINING_SESSION_SCHEMA(CREATE_SESSION_HIDE_FIELDS);
  }

  return TRAINING_SESSION_SCHEMA([]);
};

export const TRAINING_FORM_SCHEMA = TRAINING_SESSION_SCHEMA;
