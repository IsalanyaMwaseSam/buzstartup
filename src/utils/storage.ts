import type { BusinessProfile, Customer, Expense, Order } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'business_hub_profile',
  ORDERS: 'business_hub_orders',
  CUSTOMERS: 'business_hub_customers',
  EXPENSES: 'business_hub_expenses',
};

export const defaultProfile: BusinessProfile = {
  businessName: 'Perfect Scents',
  ownerName: 'Samuel Mwase',
  phone: '746022116',
  phonePrefix: '+256',
  email: 'isalanyamwasesam@gmail.com',
  currency: 'USh',
  currencyCode: 'UGX',
  countryCode: 'UG',
  taxReserveRate: 20,
  address: 'Shop 12, Victoria Mall, Entebbe Road',
  tagline: 'Providing you with your affordable perfect scent.',
  setupCompleted: true,
};

export const seedOrders: Order[] = [
  {
    id: 'ord-7215',
    orderNumber: 'INV-7215',
    customerName: 'Samuel Mwase',
    customerPhone: '+256 790966231',
    customerEmail: 'samuel@example.com',
    items: [
      { id: 'item-1', name: 'Blueberry Perfume (50ml)', quantity: 1, unitPrice: 80000 },
    ],
    subtotal: 80000,
    discount: 0,
    total: 80000,
    paymentMethod: 'Mobile Money',
    isPaid: true,
    paymentStatus: 'Paid',
    amountPaid: 80000,
    balanceDue: 0,
    status: 'Completed',
    notes: 'Delivered to Nansana, Nsumbi',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ord-1048',
    orderNumber: 'INV-1048',
    customerName: 'Marcus Vance',
    customerPhone: '+256 701234567',
    customerEmail: 'marcus.v@example.com',
    items: [
      { id: 'item-2', name: 'Vanilla Amber Oud', quantity: 1, unitPrice: 120000 },
      { id: 'item-3', name: 'Pocket Travel Atomizer', quantity: 1, unitPrice: 20000 },
    ],
    subtotal: 140000,
    discount: 10000,
    total: 130000,
    paymentMethod: 'Mobile Money',
    isPaid: false,
    paymentStatus: 'Partially Paid',
    amountPaid: 80000,
    balanceDue: 50000,
    status: 'In Progress',
    notes: 'Client paid 80k deposit, balance of 50k to be cleared on delivery.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'ord-1049',
    orderNumber: 'INV-1049',
    customerName: 'Elena Rostova',
    customerPhone: '+256 782345678',
    customerEmail: 'elena@example.com',
    items: [
      { id: 'item-4', name: 'Rose & Sandalwood Diffuser', quantity: 1, unitPrice: 65000 },
    ],
    subtotal: 65000,
    discount: 0,
    total: 65000,
    paymentMethod: 'Pending',
    isPaid: false,
    paymentStatus: 'Unpaid',
    amountPaid: 0,
    balanceDue: 65000,
    status: 'Ready',
    notes: 'Full payment of 65k due on pickup Friday afternoon.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

export const seedCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Samuel Mwase',
    phone: '+256 790966231',
    email: 'samuel@example.com',
    notes: 'Prefers sweet, fruity notes like Blueberry and Citrus.',
    totalSpent: 80000,
    totalOutstandingBalance: 0,
    orderCount: 1,
    lastPurchaseDate: new Date().toISOString(),
    purchaseHistory: [
      {
        orderId: 'ord-7215',
        date: new Date().toISOString(),
        total: 80000,
        amountPaid: 80000,
        balanceDue: 0,
        paymentStatus: 'Paid',
        itemsSummary: '1x Blueberry Perfume',
      },
    ],
  },
  {
    id: 'cust-2',
    name: 'Marcus Vance',
    phone: '+256 701234567',
    email: 'marcus.v@example.com',
    notes: 'Regular customer. Has open balance of 50k on order INV-1048.',
    totalSpent: 130000,
    totalOutstandingBalance: 50000,
    orderCount: 1,
    lastPurchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    purchaseHistory: [
      {
        orderId: 'ord-1048',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        total: 130000,
        amountPaid: 80000,
        balanceDue: 50000,
        paymentStatus: 'Partially Paid',
        itemsSummary: '1x Vanilla Amber Oud, 1x Pocket Atomizer',
      },
    ],
  },
  {
    id: 'cust-3',
    name: 'Elena Rostova',
    phone: '+256 782345678',
    email: 'elena@example.com',
    notes: 'Home fragrance enthusiast. Total 65k to be paid on Friday.',
    totalSpent: 65000,
    totalOutstandingBalance: 65000,
    orderCount: 1,
    lastPurchaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    purchaseHistory: [
      {
        orderId: 'ord-1049',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        total: 65000,
        amountPaid: 0,
        balanceDue: 65000,
        paymentStatus: 'Unpaid',
        itemsSummary: '1x Rose & Sandalwood Diffuser',
      },
    ],
  },
];

export const seedExpenses: Expense[] = [
  {
    id: 'exp-1',
    title: 'Fragrance glass bottles & atomizers restock',
    category: 'Supplies & Materials',
    amount: 150000,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
  },
  {
    id: 'exp-2',
    title: 'Custom branded gift packaging bags',
    category: 'Packaging & Shipping',
    amount: 45000,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
  },
];

export const getProfile = (): BusinessProfile => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : defaultProfile;
};

export const saveProfile = (profile: BusinessProfile) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const getOrders = (): Order[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return data ? JSON.parse(data) : seedOrders;
};

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const getCustomers = (): Customer[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  return data ? JSON.parse(data) : seedCustomers;
};

export const saveCustomers = (customers: Customer[]) => {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const getExpenses = (): Expense[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  return data ? JSON.parse(data) : seedExpenses;
};

export const saveExpenses = (expenses: Expense[]) => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};
