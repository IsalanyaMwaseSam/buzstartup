export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Card' | 'Pending';

export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Unpaid';

export type OrderStatus = 'Received' | 'In Progress' | 'Ready' | 'Completed' | 'Cancelled';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  balanceDue: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  totalSpent: number;
  totalOutstandingBalance?: number;
  orderCount: number;
  lastPurchaseDate: string;
  purchaseHistory: {
    orderId: string;
    date: string;
    total: number;
    amountPaid?: number;
    balanceDue?: number;
    paymentStatus?: PaymentStatus;
    itemsSummary: string;
  }[];
}

export interface Expense {
  id: string;
  title: string;
  category: 'Supplies & Materials' | 'Packaging & Shipping' | 'Internet & Phone' | 'Marketing' | 'Other';
  amount: number;
  date: string;
  notes?: string;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  phone: string;
  phonePrefix: string;
  email: string;
  currency: string;
  currencyCode: string;
  countryCode: string;
  taxReserveRate: number;
  address?: string;
  tagline?: string;
  logoUrl?: string;
  setupCompleted?: boolean;
}

export interface PromotionCardData {
  title: string;
  subtitle: string;
  priceOrOffer: string;
  callToAction: string;
  contactInfo: string;
  theme: 'slate' | 'navy' | 'emerald' | 'amber' | 'burgundy';
}
