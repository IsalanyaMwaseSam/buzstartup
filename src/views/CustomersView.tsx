import React, { useState } from 'react';
import { Search, User, Phone, ChevronRight, X, AlertCircle } from 'lucide-react';
import type { BusinessProfile, Customer, Order } from '../types';
import { formatMoney } from '../utils/regions';

interface CustomersViewProps {
  customers: Customer[];
  orders?: Order[];
  profile: BusinessProfile;
  onUpdateCustomerNotes: (customerId: string, notes: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  orders = [],
  profile,
  onUpdateCustomerNotes,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  // Calculate dynamic outstanding debt per customer from current orders
  const getCustomerOutstandingBalance = (customer: Customer): number => {
    const matchingOrders = orders.filter(
      (o) =>
        (customer.phone && o.customerPhone && o.customerPhone.replace(/[^0-9]/g, '') === customer.phone.replace(/[^0-9]/g, '')) ||
        o.customerName.toLowerCase() === customer.name.toLowerCase()
    );

    if (matchingOrders.length > 0) {
      return matchingOrders.reduce((sum, o) => {
        const balance = o.balanceDue ?? (o.isPaid ? 0 : o.total);
        return sum + (balance > 0 ? balance : 0);
      }, 0);
    }

    return customer.totalOutstandingBalance || 0;
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.notes && c.notes.toLowerCase().includes(search.toLowerCase())) ||
      c.purchaseHistory.some((h) => h.itemsSummary.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditingNotes(customer.notes || '');
  };

  const handleSaveNotes = () => {
    if (selectedCustomer) {
      onUpdateCustomerNotes(selectedCustomer.id, editingNotes);
      setSelectedCustomer({ ...selectedCustomer, notes: editingNotes });
    }
  };

  const sendCustomWhatsApp = (
    customer: Customer,
    templateType: 'checkin' | 'restock' | 'vip' | 'balance' | 'general'
  ) => {
    let message = '';
    const lastItem = customer.purchaseHistory[0]?.itemsSummary || 'your previous order';
    const balance = getCustomerOutstandingBalance(customer);

    if (templateType === 'balance') {
      message = `Hello ${customer.name}, warm greetings from ${profile.businessName}. This is a gentle reminder regarding your outstanding balance of ${formatMoney(balance, profile.currency)}. Please let us know if you need our Mobile Money or payment details to clear this balance. Thank you!`;
    } else if (templateType === 'checkin') {
      message = `Hello ${customer.name}, checking in from ${profile.businessName}! We wanted to make sure you are thoroughly enjoying your ${lastItem}. Please let us know if you need anything!`;
    } else if (templateType === 'restock') {
      message = `Hello ${customer.name}! We wanted to let you know that we have a fresh batch ready for ${lastItem}. If you would like to reserve a refill or new batch, please let us know!`;
    } else if (templateType === 'vip') {
      message = `Hello ${customer.name}, thank you for being one of our most valued patrons at ${profile.businessName}. As a token of appreciation, here is 10% off your next order!`;
    } else {
      message = `Hello ${customer.name}, warm greetings from ${profile.businessName}! Hope you have a wonderful week ahead.`;
    }

    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-28">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Client Directory & Maintenance
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Track client purchase histories, monitor unpaid balances, and send targeted updates.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 font-semibold border border-stone-200">
            {customers.length} Registered Clients
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search by client name, phone, item purchased, or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 shadow-2xs"
        />
      </div>

      {/* Customer List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-stone-200">
            <User className="w-9 h-9 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-800">No client records found</p>
            <p className="text-xs text-stone-500 mt-1">
              Client records are created automatically whenever you record a sale.
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const balance = getCustomerOutstandingBalance(customer);

            return (
              <div
                key={customer.id}
                onClick={() => handleOpenCustomer(customer)}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:border-stone-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-stone-900">{customer.name}</h3>
                        {customer.orderCount >= 2 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-800 rounded-full border border-stone-200">
                            {customer.orderCount} Orders
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 font-mono mt-1">
                        {customer.phone || 'No phone recorded'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-stone-950 font-mono">
                        {formatMoney(customer.totalSpent, profile.currency)}
                      </div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                        Lifetime
                      </div>
                    </div>
                  </div>

                  {/* Demanded Balance Alert if > 0 */}
                  {balance > 0 && (
                    <div className="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Balance Demanded: {formatMoney(balance, profile.currency)}</span>
                    </div>
                  )}

                  {/* Last purchase summary */}
                  {customer.purchaseHistory.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-stone-100 text-xs text-stone-600">
                      <span className="font-semibold text-stone-800">Recent Purchase: </span>
                      <span className="truncate">{customer.purchaseHistory[0].itemsSummary}</span>
                    </div>
                  )}

                  {customer.notes && (
                    <div className="mt-1.5 text-xs text-stone-500 line-clamp-1 italic">
                      Note: {customer.notes}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="text-[11px]">
                    Last active: {new Date(customer.lastPurchaseDate).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-stone-900 flex items-center space-x-1">
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Customer Modal / Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-stone-900" />
                <h3 className="text-sm font-bold text-stone-900">Client Profile</h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-stone-400 hover:text-stone-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Identity summary */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/90">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-stone-950">{selectedCustomer.name}</h2>
                    <div className="flex items-center space-x-2 text-xs text-stone-600 mt-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{selectedCustomer.phone || 'No phone recorded'}</span>
                    </div>
                    {selectedCustomer.email && (
                      <p className="text-xs text-stone-500 mt-0.5">{selectedCustomer.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-200 text-xs">
                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-bold block">
                      Lifetime Spend
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-stone-950 font-mono mt-0.5 block truncate">
                      {formatMoney(selectedCustomer.totalSpent, profile.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-bold block">
                      Orders Placed
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-stone-950 font-mono mt-0.5 block">
                      {selectedCustomer.orderCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 uppercase text-[10px] font-bold block">
                      Balance Due
                    </span>
                    <span
                      className={`text-base sm:text-lg font-extrabold font-mono mt-0.5 block truncate ${
                        getCustomerOutstandingBalance(selectedCustomer) > 0
                          ? 'text-rose-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {formatMoney(getCustomerOutstandingBalance(selectedCustomer), profile.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* One-Tap WhatsApp Communications */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
                  Send Client Update (WhatsApp)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Balance / Debt Reminder if balance > 0 */}
                  {getCustomerOutstandingBalance(selectedCustomer) > 0 && (
                    <button
                      onClick={() => sendCustomWhatsApp(selectedCustomer, 'balance')}
                      className="p-3 text-left bg-rose-50 border border-rose-200 hover:border-rose-400 hover:shadow-2xs rounded-xl transition-all cursor-pointer sm:col-span-2"
                    >
                      <div className="text-xs font-bold text-rose-900 flex items-center space-x-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Send Payment / Balance Reminder</span>
                      </div>
                      <div className="text-[11px] text-rose-700 mt-1 font-mono">
                        Remind client of {formatMoney(getCustomerOutstandingBalance(selectedCustomer), profile.currency)} balance due
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => sendCustomWhatsApp(selectedCustomer, 'checkin')}
                    className="p-3 text-left bg-white border border-stone-200 hover:border-stone-400 hover:shadow-2xs rounded-xl transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-stone-900">Product Check-in</div>
                    <div className="text-[11px] text-stone-500 mt-1">Ask how they like their purchase</div>
                  </button>

                  <button
                    onClick={() => sendCustomWhatsApp(selectedCustomer, 'restock')}
                    className="p-3 text-left bg-white border border-stone-200 hover:border-stone-400 hover:shadow-2xs rounded-xl transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-stone-900">Restock / Refill</div>
                    <div className="text-[11px] text-stone-500 mt-1">Notify of fresh available batch</div>
                  </button>

                  <button
                    onClick={() => sendCustomWhatsApp(selectedCustomer, 'vip')}
                    className="p-3 text-left bg-white border border-stone-200 hover:border-stone-400 hover:shadow-2xs rounded-xl transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-stone-900">Appreciation Note</div>
                    <div className="text-[11px] text-stone-500 mt-1">Send a loyalty discount code</div>
                  </button>

                  <button
                    onClick={() => sendCustomWhatsApp(selectedCustomer, 'general')}
                    className="p-3 text-left bg-white border border-stone-200 hover:border-stone-400 hover:shadow-2xs rounded-xl transition-all cursor-pointer"
                  >
                    <div className="text-xs font-bold text-stone-900">General Greeting</div>
                    <div className="text-[11px] text-stone-500 mt-1">Keep connection warm</div>
                  </button>
                </div>
              </div>

              {/* Purchase History */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
                  Order History
                </h4>
                <div className="space-y-2.5">
                  {selectedCustomer.purchaseHistory.map((item, index) => (
                    <div
                      key={index}
                      className="p-3.5 bg-stone-50/60 border border-stone-200 rounded-xl text-xs space-y-1 font-mono"
                    >
                      <div className="flex justify-between font-semibold text-stone-900">
                        <span className="font-sans">{item.itemsSummary}</span>
                        <span className="font-bold">{formatMoney(item.total, profile.currency)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-stone-400">
                        <span>
                          {new Date(item.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {item.balanceDue !== undefined && item.balanceDue > 0 && (
                          <span className="text-rose-600 font-bold">
                            Balance Due: {formatMoney(item.balanceDue, profile.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Notes & Preferences */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                  Client Notes & Preferences
                </h4>
                <textarea
                  rows={3}
                  placeholder="e.g. Likes delivery on weekends, birthday in October..."
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="mt-2.5 text-xs py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};