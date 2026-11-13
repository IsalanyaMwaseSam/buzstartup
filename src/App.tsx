import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { NewSaleView } from './views/NewSaleView';
import { OrdersView } from './views/OrdersView';
import { CustomersView } from './views/CustomersView';
import { PromotionsView } from './views/PromotionsView';
import { FinancesView } from './views/FinancesView';
import { SettingsView } from './views/SettingsView';
import { PublicReceiptView } from './views/PublicReceiptView';
import { ReceiptModal } from './components/ReceiptModal';
import { PaymentLinkModal } from './components/PaymentLinkModal';
import { LandingPageView } from './views/LandingPageView';
import { AuthModal } from './components/AuthModal';
import {
  defaultProfile,
  getCustomers,
  getExpenses,
  getOrders,
  getProfile,
  saveCustomers,
  saveExpenses,
  saveOrders,
  saveProfile,
  seedCustomers,
  seedExpenses,
  seedOrders,
} from './utils/storage';
import type { BusinessProfile, Customer, Expense, Order, OrderStatus, PaymentMethod, PaymentStatus } from './types';
import {
  getStoredUser,
  fetchCurrentMe,
  clearAuthSession,
  fetchOrdersApi,
  createOrderApi,
  updateOrderApi,
} from './utils/api';

export function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<NavTab>('sales');
  const [profile, setProfile] = useState<BusinessProfile>(getProfile);
  const [orders, setOrders] = useState<Order[]>(getOrders);
  const [customers, setCustomers] = useState<Customer[]>(getCustomers);
  const [expenses, setExpenses] = useState<Expense[]>(getExpenses);

  // Authentication State
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    const user = getStoredUser();
    return user ? user.email : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Hash-based routing for client-facing public digital receipt
  const [publicReceiptOrder, setPublicReceiptOrder] = useState<Order | null>(null);

  // Modals
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);

  // Check auth session & sync with cloud on mount
  useEffect(() => {
    fetchCurrentMe().then((res) => {
      if (res && res.business) {
        setUserEmail(res.user.email);
        const cloudBiz: BusinessProfile = {
          businessName: res.business.name || res.business.businessName || profile.businessName,
          ownerName: res.business.owner_name || res.business.ownerName || profile.ownerName,
          phone: res.business.phone || profile.phone,
          phonePrefix: res.business.phone_prefix || res.business.phonePrefix || profile.phonePrefix,
          email: res.business.email || res.user.email,
          currency: res.business.currency || profile.currency,
          currencyCode: res.business.currency_code || profile.currencyCode,
          countryCode: res.business.country_code || profile.countryCode,
          taxReserveRate: res.business.tax_reserve_rate || profile.taxReserveRate,
          address: res.business.address || profile.address,
          tagline: res.business.tagline || profile.tagline,
          logoUrl: res.business.logo_url || profile.logoUrl,
          setupCompleted: true,
        };
        setProfile(cloudBiz);
        setViewMode('app');

        // Fetch cloud orders
        fetchOrdersApi().then((cloudOrders) => {
          if (cloudOrders && cloudOrders.length > 0) {
            setOrders(cloudOrders);
          }
        });
      }
    });
  }, []);

  // Check URL hash for public receipt link
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('receipt/')) {
        const orderNumber = hash.split('receipt/')[1]?.replace('/', '').trim();
        const found = orders.find(
          (o) => o.orderNumber.toLowerCase() === orderNumber?.toLowerCase() || o.id === orderNumber
        );
        if (found) {
          setPublicReceiptOrder(found);
          return;
        }
      }
      setPublicReceiptOrder(null);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [orders]);

  // Sync to storage
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  // Complete a new sale
  const handleCompleteSale = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Background sync to backend & Cloudflare R2
    createOrderApi(newOrder).catch(() => {});

    setCustomers((prevCustomers) => {
      const existingIndex = prevCustomers.findIndex(
        (c) =>
          (newOrder.customerPhone && c.phone === newOrder.customerPhone) ||
          c.name.toLowerCase() === newOrder.customerName.toLowerCase()
      );

      const itemsSummary = newOrder.items
        .map((i) => `${i.quantity}x ${i.name}`)
        .join(', ');

      const purchaseRecord = {
        orderId: newOrder.id,
        date: newOrder.createdAt,
        total: newOrder.total,
        itemsSummary,
      };

      if (existingIndex >= 0) {
        const existing = prevCustomers[existingIndex];
        const updated = {
          ...existing,
          totalSpent: existing.totalSpent + newOrder.total,
          orderCount: existing.orderCount + 1,
          lastPurchaseDate: newOrder.createdAt,
          purchaseHistory: [purchaseRecord, ...existing.purchaseHistory],
        };
        const next = [...prevCustomers];
        next[existingIndex] = updated;
        return next;
      } else {
        const newCustomer: Customer = {
          id: `cust-${Date.now()}`,
          name: newOrder.customerName,
          phone: newOrder.customerPhone,
          email: newOrder.customerEmail,
          totalSpent: newOrder.total,
          orderCount: 1,
          lastPurchaseDate: newOrder.createdAt,
          purchaseHistory: [purchaseRecord],
        };
        return [newCustomer, ...prevCustomers];
      }
    });

    setActiveReceiptOrder(newOrder);
  };

  const handleCreateOrderFromLink = (data: {
    customerName: string;
    itemName: string;
    amount: number;
    notes: string;
  }) => {
    const orderNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: data.customerName,
      customerPhone: '',
      items: [
        {
          id: '1',
          name: data.itemName,
          quantity: 1,
          unitPrice: data.amount,
        },
      ],
      subtotal: data.amount,
      discount: 0,
      total: data.amount,
      paymentMethod: 'Pending',
      isPaid: false,
      paymentStatus: 'Unpaid',
      amountPaid: 0,
      balanceDue: data.amount,
      status: 'Received',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    handleCompleteSale(newOrder);
    setCurrentTab('orders');
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o))
    );
  };

  const handleUpdateOrderPayment = (
    orderId: string,
    newAmountPaid: number,
    paymentMethod?: PaymentMethod
  ) => {
    const target = orders.find((o) => o.id === orderId);
    const total = target ? target.total : newAmountPaid;
    const clampedPaid = Math.max(0, Math.min(newAmountPaid, total));
    const balanceDue = Math.max(0, total - clampedPaid);
    const isPaid = balanceDue <= 0.001;
    const paymentStatus: PaymentStatus = isPaid
      ? 'Paid'
      : clampedPaid > 0
      ? 'Partially Paid'
      : 'Unpaid';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          amountPaid: clampedPaid,
          balanceDue,
          isPaid,
          paymentStatus,
          paymentMethod: paymentMethod || o.paymentMethod,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Cloud sync
    updateOrderApi(orderId, {
      amountPaid: clampedPaid,
      balanceDue,
      isPaid,
      paymentStatus,
      paymentMethod,
    }).catch(() => {});

    // Keep customer record purchaseHistory and balance in sync
    setCustomers((prevCustomers) =>
      prevCustomers.map((cust) => {
        const hasOrder = cust.purchaseHistory.some((h) => h.orderId === orderId);
        if (!hasOrder) return cust;

        const updatedHistory = cust.purchaseHistory.map((h) => {
          if (h.orderId !== orderId) return h;
          const targetOrder = orders.find((o) => o.id === orderId);
          const total = targetOrder ? targetOrder.total : h.total;
          const clampedPaid = Math.max(0, Math.min(newAmountPaid, total));
          const balanceDue = Math.max(0, total - clampedPaid);
          const paymentStatus: PaymentStatus = balanceDue <= 0.001
            ? 'Paid'
            : clampedPaid > 0
            ? 'Partially Paid'
            : 'Unpaid';

          return {
            ...h,
            amountPaid: clampedPaid,
            balanceDue,
            paymentStatus,
          };
        });

        // Calculate total outstanding across all history
        const totalOutstanding = updatedHistory.reduce(
          (sum, h) => sum + (h.balanceDue || 0),
          0
        );

        return {
          ...cust,
          totalOutstandingBalance: totalOutstanding,
          purchaseHistory: updatedHistory,
        };
      })
    );
  };

  const handleTogglePaymentStatus = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    if (order.isPaid) {
      handleUpdateOrderPayment(orderId, 0);
    } else {
      handleUpdateOrderPayment(orderId, order.total);
    }
  };

  const handleUpdateCustomerNotes = (customerId: string, notes: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, notes } : c))
    );
  };

  const handleAddExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  const handleAuthSuccess = (newProfile: BusinessProfile, email: string) => {
    setProfile(newProfile);
    setUserEmail(email);
    setViewMode('app');
    fetchOrdersApi().then((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders(cloudOrders);
      }
    });
  };

  const handleLogout = () => {
    clearAuthSession();
    setUserEmail(null);
    setProfile(defaultProfile);
    setOrders(seedOrders);
    setCustomers(seedCustomers);
    setExpenses(seedExpenses);
    setViewMode('landing');
  };

  const handleResetData = () => {
    setProfile(defaultProfile);
    setOrders(seedOrders);
    setCustomers(seedCustomers);
    setExpenses(seedExpenses);
    saveProfile(defaultProfile);
    saveOrders(seedOrders);
    saveCustomers(seedCustomers);
    saveExpenses(seedExpenses);
  };

  // If a public receipt link is active, render client-facing receipt view directly
  if (publicReceiptOrder) {
    return (
      <PublicReceiptView
        order={publicReceiptOrder}
        profile={profile}
        onBackToApp={() => {
          window.location.hash = '';
          setPublicReceiptOrder(null);
        }}
      />
    );
  }

  // If visitor is on the Landing Page, render full promotional product showcase
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPageView
          onGetStarted={() => {
            setAuthModalTab('register');
            setIsAuthModalOpen(true);
          }}
          onSignIn={() => {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
          }}
          onEnterDemo={() => {
            setViewMode('app');
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          initialTab={authModalTab}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.status !== 'Completed' || !o.isPaid).length;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex font-sans antialiased">
      {/* Desktop & Laptop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        pendingOrdersCount={pendingOrdersCount}
        userEmail={userEmail}
        onOpenPaymentLink={() => setShowPaymentLinkModal(true)}
        onOpenAuthModal={() => {
          setAuthModalTab('login');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onReturnToLanding={() => setViewMode('landing')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          profile={profile}
          currentTab={currentTab}
          userEmail={userEmail}
          onOpenNewSale={() => setCurrentTab('sales')}
          onOpenPaymentLink={() => setShowPaymentLinkModal(true)}
          onOpenSettings={() => setCurrentTab('settings')}
          onOpenAuthModal={() => {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onReturnToLanding={() => setViewMode('landing')}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto">
          {currentTab === 'sales' && (
            <NewSaleView profile={profile} orders={orders} onCompleteSale={handleCompleteSale} />
          )}
          {currentTab === 'orders' && (
            <OrdersView
              orders={orders}
              profile={profile}
              onSelectOrder={(order) => setActiveReceiptOrder(order)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onTogglePaymentStatus={handleTogglePaymentStatus}
              onUpdateOrderPayment={handleUpdateOrderPayment}
            />
          )}
          {currentTab === 'customers' && (
            <CustomersView
              customers={customers}
              orders={orders}
              profile={profile}
              onUpdateCustomerNotes={handleUpdateCustomerNotes}
            />
          )}
          {currentTab === 'promote' && (
            <PromotionsView profile={profile} customers={customers} />
          )}
          {currentTab === 'finances' && (
            <FinancesView
              orders={orders}
              expenses={expenses}
              profile={profile}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}
          {currentTab === 'settings' && (
            <SettingsView
              profile={profile}
              userEmail={userEmail}
              onSaveProfile={setProfile}
              onResetData={handleResetData}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Digital Receipt Modal */}
      <ReceiptModal
        order={activeReceiptOrder}
        profile={profile}
        onClose={() => setActiveReceiptOrder(null)}
      />

      {/* Payment Link Modal */}
      {showPaymentLinkModal && (
        <PaymentLinkModal
          profile={profile}
          onClose={() => setShowPaymentLinkModal(false)}
          onCreateOrderFromLink={handleCreateOrderFromLink}
        />
      )}

      {/* Secure Auth & Business Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Mobile Bottom Thumb Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingOrdersCount={pendingOrdersCount}
      />
    </div>
  );
}

export default App;
