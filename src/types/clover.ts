export interface CloverOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  modifiers?: Array<{ id: string; name: string; price: number }>;
}

export interface CloverOrder {
  id: string;
  createdTime: number;
  lastModifiedTime?: number;
  currency: string;
  total: number;
  taxAmount?: number;
  tipAmount?: number;
  items: CloverOrderItem[];
  customerId?: string;
  tenderId?: string;
  raw: Record<string, unknown>;
}

export interface CloverWebhookEvent<TPayload = unknown> {
  id: string;
  type: string;
  createdTime: number;
  objectId: string;
  payload: TPayload;
}
