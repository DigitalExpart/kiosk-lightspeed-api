export interface LightspeedSaleLine {
  itemID: string;
  quantity: number;
  unitPrice: number;
  note?: string;
  discounts?: Array<{ description: string; amount: number }>;
}

export interface LightspeedSalePayment {
  amount: number;
  paymentTypeID?: string;
  reference?: string;
}

export interface LightspeedSalePayload {
  shopID: string;
  employeeID?: string;
  customerID?: string;
  registerID?: string;
  lines: LightspeedSaleLine[];
  payments: LightspeedSalePayment[];
  taxAmount?: number;
  tipAmount?: number;
  total?: number;
  referenceNumber?: string;
  note?: string;
}
