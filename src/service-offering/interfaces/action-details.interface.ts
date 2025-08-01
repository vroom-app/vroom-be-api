import { ACTION_TYPE } from '../entities/service-offering.entity';

export enum TIME_UNIT {
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
}

export enum REFUND_POLICY {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  NONE = 'NONE',
}

export enum EMBED_TYPE {
  IFRAME = 'IFRAME',
  WIDGET = 'WIDGET',
  SCRIPT = 'SCRIPT',
}

export enum CONTACT_FORM_FIELD_TYPE {
  TEXT = 'TEXT',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  TEXTAREA = 'TEXTAREA',
  SELECT = 'SELECT',
  DATE = 'DATE',
}

export interface BookingSystemActionDetails {
  type: ACTION_TYPE.BOOKING_SYSTEM;
  duration: number;
  timeUnit: TIME_UNIT.MINUTES | TIME_UNIT.HOURS;
  price: number;
  currency: string;
  requiresApproval: boolean;
  cancellationPolicy: {
    allowCancellation: boolean;
    cancellationDeadlineHours: number;
    refundPolicy:
      | REFUND_POLICY.FULL
      | REFUND_POLICY.PARTIAL
      | REFUND_POLICY.NONE;
  };
  requirements?: {
    participantInfo: string[];
    additionalNotes?: string;
  };
}

export interface EmbeddedActionDetails {
  type: ACTION_TYPE.EMBEDDED;
  embedUrl: string;
  embedType: EMBED_TYPE.IFRAME | EMBED_TYPE.WIDGET | EMBED_TYPE.SCRIPT;
  dimensions?: {
    width: number;
    height: number;
  };
  customParameters?: Record<string, any>;
}

export interface CTAActionDetails {
  type: ACTION_TYPE.CTA;
  buttonText: string; // handle in FE
  redirectUrl: string;
  openInNewTab: boolean;
  trackingParameters?: Record<string, string>;
}

export interface ECommerceActionDetails {
  type: ACTION_TYPE.E_COMMERCE;
  productId: string;
  price: number;
  currency: string;
  inventory?: {
    trackInventory: boolean;
    stockQuantity?: number;
    lowStockThreshold?: number;
  };
  shipping?: {
    required: boolean;
    cost?: number;
    methods?: string[];
  };
  variants?: Array<{
    name: string;
    options: string[];
    priceModifier?: number;
  }>;
}

export interface ContactFormActionDetails {
  type: ACTION_TYPE.CONTACT_FORM;
  fields: Array<{
    name: string;
    label: string;
    type:
      | CONTACT_FORM_FIELD_TYPE.TEXT
      | CONTACT_FORM_FIELD_TYPE.EMAIL
      | CONTACT_FORM_FIELD_TYPE.PHONE
      | CONTACT_FORM_FIELD_TYPE.TEXTAREA
      | CONTACT_FORM_FIELD_TYPE.SELECT
      | CONTACT_FORM_FIELD_TYPE.DATE;
    required: boolean;
    options?: string[]; // for SELECT type
    validation?: {
      minLength?: number;
      maxLength?: number;
      pattern?: string;
    };
  }>;
  submitButtonText: string;
  successMessage: string;
  notificationEmail?: string;
  autoReply?: {
    enabled: boolean;
    subject?: string;
    message?: string;
  };
}

export interface NoneActionDetails {
  type: ACTION_TYPE.NONE;
}

export type ActionDetails =
  | BookingSystemActionDetails
  | EmbeddedActionDetails
  | CTAActionDetails
  | ECommerceActionDetails
  | ContactFormActionDetails
  | NoneActionDetails;
