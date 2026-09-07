import type { FormSection } from '@components/SchemaFormRenderer/type';
import { ACCEPT_AND_SCHEDULE_FORM_SECTION_STYLES } from '../screens/ServiceProvider/SupportRequests/styles';

const BASE_PATH = 'supportProvider.supportRequests';

export const DURATION_OPTIONS = [
  { label: `${BASE_PATH}.durationOptions.1hour`, value: '1_hour' },
  { label: `${BASE_PATH}.durationOptions.1_5hours`, value: '1.5_hours' },
  { label: `${BASE_PATH}.durationOptions.2hours`, value: '2_hours' },
  { label: `${BASE_PATH}.durationOptions.3hours`, value: '3_hours' },
  { label: `${BASE_PATH}.durationOptions.fullDay`, value: 'full_day' },
];

export const ACCEPT_AND_SCHEDULE_FORM_SCHEMA: FormSection[] = [
  {
    type: 'section',
    id: 'sessionDetailsSpecification',
    ...ACCEPT_AND_SCHEDULE_FORM_SECTION_STYLES,
    title: {
      key: 'supportProvider.supportRequests.titles.sessionDetails',
      fallback: 'Session Details & Specification',
    },
    icon: 'GraduationCap',
    rows: [
      {
        fields: [
          {
            name: 'province',
            type: 'select',
            required: true,
            label: {
              key: 'supportProvider.supportRequests.labels.province',
              fallback: 'Province',
            },
            placeholder: {
              key: 'supportProvider.supportRequests.placeholders.province',
              fallback: 'Select province',
            },
            optionsSource: 'provinces',
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'supportProvider.supportRequests.errors.provinceRequired',
                  fallback: 'Province is required',
                },
              },
            ],
          },
          {
            name: 'category',
            type: 'select',
            required: true,
            label: {
              key: 'supportProvider.supportRequests.labels.sessionPillarCategory',
              fallback: 'Session Pillar / Category',
            },
            placeholder: {
              key: 'supportProvider.supportRequests.placeholders.category',
              fallback: 'Select category',
            },
            optionsSource: 'pillars',
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'supportProvider.supportRequests.errors.categoryRequired',
                  fallback: 'Category is required',
                },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
            label: {
              key: 'supportProvider.supportRequests.labels.sessionTitle',
              fallback: 'Session Title',
            },
            placeholder: {
              key: 'supportProvider.supportRequests.placeholders.title',
              fallback: 'Enter session title',
            },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'supportProvider.supportRequests.errors.titleRequired',
                  fallback: 'Session title is required',
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
            required: false,
            label: {
              key: 'supportProvider.supportRequests.labels.sessionDescription',
              fallback: 'Session Description & Justification',
            },
            placeholder: {
              key: 'supportProvider.supportRequests.placeholders.description',
              fallback: 'Enter description & justification',
            },
          },
        ],
      },
      {
        fields: [
          {
            name: 'targetAudience',
            type: 'textarea',
            required: false,
            label: {
              key: 'supportProvider.supportRequests.labels.targetAudienceProfile',
              fallback: 'Target Audience & Participant Profile',
            },
            placeholder: {
              key: 'supportProvider.supportRequests.placeholders.targetAudience',
              fallback: 'Enter target audience & participant profile',
            },
          },
        ],
      },
    ],
  },
  {
    type: 'section',
    id: 'scheduleFormatCapacity',
    ...ACCEPT_AND_SCHEDULE_FORM_SECTION_STYLES,
    title: {
      key: 'supportProvider.supportRequests.titles.scheduleFormat',
      fallback: 'Schedule, Format & Capacity',
    },
    icon: 'Calendar',
    rows: [
      {
        fields: [
          {
            name: 'date',
            type: 'date',
            required: true,
            icon: 'Calendar',
            label: {
              key: 'supportProvider.supportRequests.labels.date',
              fallback: 'Date',
            },
            placeholder: {
              key: 'supportProvider.supportRequests.placeholders.date',
              fallback: 'Select date',
            },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'supportProvider.supportRequests.errors.dateRequired',
                  fallback: 'Date is required',
                },
              },
            ],
          },
          {
            name: 'time',
            type: 'time',
            required: true,
            icon: 'Clock',
            label: {
              key: 'supportProvider.supportRequests.labels.startTime',
              fallback: 'Start Time',
            },
            placeholder: {
              key: 'supportProvider.supportRequests.placeholders.time',
              fallback: 'Select time',
            },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'supportProvider.supportRequests.errors.timeRequired',
                  fallback: 'Time is required',
                },
              },
            ],
          },
          {
            name: 'duration',
            type: 'select',
            required: true,
            label: {
              key: 'supportProvider.supportRequests.labels.duration',
              fallback: 'Duration',
            },
            optionsSource: 'durationOptions',
            defaultValue: '2 hours',
          },
        ],
      },
      {
        fields: [
          {
            name: 'delivery_mode',
            type: 'select',
            required: true,
            label: {
              key: 'supportProvider.supportRequests.labels.deliveryFormat',
              fallback: 'Delivery Format',
            },
            placeholder: {
              key: 'supportProvider.supportRequests.placeholders.deliveryFormat',
              fallback: 'Select delivery format',
            },
            optionsSource: 'formatOptions',
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'supportProvider.supportRequests.errors.deliveryFormatRequired',
                  fallback: 'Delivery format is required',
                },
              },
            ],
          },
          {
            name: 'capacity',
            type: 'text',
            required: true,
            label: {
              key: 'supportProvider.supportRequests.labels.maxCapacity',
              fallback: 'Max Capacity (Participants)',
            },
            placeholder: {
              key: 'supportProvider.supportRequests.placeholders.capacity',
              fallback: 'e.g. 15',
            },
            inputProps: {
              keyboardType: 'numeric',
            },
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'supportProvider.supportRequests.errors.capacityRequired',
                  fallback: 'Capacity is required',
                },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'location',
            type: 'text',
            required: true,
            label: {
              key: 'supportProvider.supportRequests.labels.venueLocation',
              fallback: 'Venue Location',
            },
            placeholder: {
              key: 'supportProvider.supportRequests.placeholders.location',
              fallback: 'e.g. BRAC Hub Room 1',
            },
            visibleIf: [
              {
                name: 'delivery_mode',
                operator: '!=',
                value: 'online',
              },
            ],
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'supportProvider.supportRequests.errors.locationRequired',
                  fallback: 'Venue location is required',
                },
              },
            ],
          },
          {
            name: 'meetingLink',
            type: 'text',
            required: true,
            label: {
              key: 'supportProvider.supportRequests.labels.virtualMeetingLink',
              fallback: 'Virtual Meeting Link',
            },
            placeholder: {
              key: 'supportProvider.supportRequests.placeholders.meetingLink',
              fallback: 'https://...',
            },
            visibleIf: [
              {
                name: 'delivery_mode',
                operator: '!=',
                value: 'offline',
              },
            ],
            validation: [
              {
                rule: 'required',
                message: {
                  key: 'supportProvider.supportRequests.errors.meetingLinkRequired',
                  fallback: 'Virtual meeting link is required',
                },
              },
            ],
          },
        ],
      },
      {
        fields: [
          {
            name: 'notes',
            type: 'textarea',
            required: false,
            label: {
              key: 'supportProvider.supportRequests.labels.notesForCoach',
              fallback: 'Notes for Coach',
            },
            placeholder: {
              key: 'supportProvider.supportRequests.placeholders.notes',
              fallback: 'Add any special instructions or details...',
            },
          },
        ],
      },
    ],
  },
];
