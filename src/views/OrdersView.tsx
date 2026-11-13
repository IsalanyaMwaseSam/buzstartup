import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  Eye,
  Clock,
  CreditCard,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { BusinessProfile, Order, OrderStatus, PaymentMethod, PaymentStatus } from '../types';
import { formatMoney } from '../utils/regions';

interface OrdersViewProps {
  orders: Order[];
  profile: BusinessProfile;
  onSelectOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onTogglePaymentStatus: (orderId: string) => void;
  onUpdateOrderPayment: (orderId: string, amountPaid: number, paymentMethod?: PaymentMethod) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  profile,
  onSelectOrder,
  onUpdateOrderStatus,
  onUpdateOrderPayment,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  // Payment Recording Modal State
  const [editingPaymentOrder, setEditingPaymentOrder] = useState<Order | null>(null);
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('Paid');
  const [editAmountPaid, setEditAmountPaid] = useState<string>('0');
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>('Mobile Money');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone.includes(search);

    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'unpaid') return order.paymentStatus === 'Unpaid' || !order.isPaid;
    if (filter === 'partial') return order.paymentStatus === 'Partially Paid';
    if (filter === 'paid') return order.paymentStatus === 'Paid' && order.isPaid;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  const sendStatusWhatsApp = (order: Order, newStatus?: OrderStatus) => {
    const status = newStatus || order.status;
    let message = '';

    if (status === 'Received') {
      message = `Hello ${order.customerName}, your order #${order.orderNumber} with ${profile.businessName} has been received and confirmed. Total: ${formatMoney(order.total, profile.currency)}. We will notify you once it is prepared!`;
    } else if (status === 'In Progress') {
      message = `Hello ${order.customerName}, we are currently preparing your order #${order.orderNumber}. We will update you as soon as it is packaged and ready!`;
    } else if (status === 'Ready') {
      message = `Hello ${order.customerName}, your order #${order.orderNumber} is ready! Please let us know when you would like to pick it up or receive delivery.`;
    } else if (status === 'Completed') {
      message = `Hello ${order.customerName}, your order #${order.orderNumber} has been fulfilled! Thank you for supporting ${profile.businessName}. If you have any feedback, please feel free to message us anytime.`;
    }

    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const openPaymentModal = (order: Order) => {
    setEditingPaymentOrder(order);
    const initialPaid = order.amountPaid ?? (order.isPaid ? order.total : 0);
    setEditAmountPaid(initialPaid.toString());
    setEditPaymentStatus(order.paymentStatus || (order.isPaid ? 'Paid' : 'Unpaid'));
    setEditPaymentMethod(order.paymentMethod === 'Pending' ? 'Mobile Money' : order.paymentMethod);
  };

  const closePaymentModal = () => {
    setEditingPaymentOrder(null);
  };

  const handleSavePayment = (sendWhatsAppReceipt: boolean = false) => {
    if (!editingPaymentOrder) return;

    let finalAmountPaid = 0;
    if (editPaymentStatus === 'Paid') {
      finalAmountPaid = editingPaymentOrder.total;
    } else if (editPaymentStatus === 'Partially Paid') {
      finalAmountPaid = parseFloat(editAmountPaid) || 0;
    } else {
      finalAmountPaid = 0;
    }

    onUpdateOrderPayment(editingPaymentOrder.id, finalAmountPaid, editPaymentMethod);

    if (sendWhatsAppReceipt) {
      const remainingBalance = Math.max(0, editingPaymentOrder.total - finalAmountPaid);
      const publicReceiptUrl = `${window.location.origin}${window.location.pathname}#/receipt/${editingPaymentOrder.orderNumber}`;

      const waMessage =
        `Hello ${editingPaymentOrder.customerName}, here is the updated payment record for your order #${editingPaymentOrder.orderNumber} at ${profile.businessName}:\n\n` +
        `• Total Demanded: ${formatMoney(editingPaymentOrder.total, profile.currency)}\n` +
        `• Amount Paid: ${formatMoney(finalAmountPaid, profile.currency)}\n` +
        (remainingBalance > 0
          ? `• Remaining Balance Due: ${formatMoney(remainingBalance, profile.currency)}\n`
          : `• Balance Due: ${formatMoney(0, profile.currency)} (Fully Cleared)\n`) +
        `• Payment Method: ${editPaymentMethod}\n\n` +
        `🔗 View Your Live Electronic Receipt:\n${publicReceiptUrl}\n\n` +
        `Thank you! Direct contact: ${profile.phonePrefix} ${profile.phone}`;

      const cleanPhone = editingPaymentOrder.customerPhone.replace(/[^0-9]/g, '');
      const encoded = encodeURIComponent(waMessage);
      const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
      window.open(url, '_blank');
    }

    closePaymentModal();
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Ready':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const getPaymentBadge = (order: Order) => {
    const status = order.paymentStatus || (order.isPaid ? 'Paid' : 'Unpaid');
    if (status === 'Paid') {
      return (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Paid in Full</span>
        </span>
      );
    }
    if (status === 'Partially Paid') {
      return (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          <span>Partially Paid</span>
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        <span>Unpaid</span>
      </span>
    );
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-28">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Orders & Receipts
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Track fulfillment, update customers on WhatsApp, and manage payments & balances.
          </p>
        </div>

        {/* Total Orders Metric Badge */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 font-semibold border border-stone-200">
            {orders.length} Total Orders
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by customer name, receipt #, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'partial', label: 'Partially Paid' },
            { id: 'unpaid', label: 'Unpaid (Due)' },
            { id: 'paid', label: 'Paid in Full' },
            { id: 'in progress', label: 'In Progress' },
            { id: 'ready', label: 'Ready for Pickup' },
            { id: 'completed', label: 'Completed' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilter(pill.id)}
              className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                filter === pill.id
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-stone-200/90 hover:bg-stone-50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid/List */}
      <div className="space-y-3.5">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <Clock className="w-9 h-9 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-800">No matching orders found</p>
            <p className="text-xs text-stone-500 mt-1">Try clearing your search query or filter tag.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const amountPaid = order.amountPaid ?? (order.isPaid ? order.total : 0);
            const balanceDue = order.balanceDue ?? (order.isPaid ? 0 : order.total);
            const paymentStatus = order.paymentStatus || (order.isPaid ? 'Paid' : 'Unpaid');

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:border-stone-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      {getPaymentBadge(order)}
                    </div>

                    <h3 className="text-base font-bold text-stone-900 mt-2">{order.customerName}</h3>
                    <p className="text-xs text-stone-500">{order.customerPhone || 'No phone recorded'}</p>
                  </div>

                  {/* Financial Breakdown (Demanded, Paid, Balance Due) */}
                  <div className="sm:text-right bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-stone-100 sm:border-0">
                    <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
                      Total Demanded
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-stone-950 font-mono">
                      {formatMoney(order.total, profile.currency)}
                    </div>

                    {paymentStatus === 'Partially Paid' && (
                      <div className="mt-1 space-y-0.5 text-xs font-mono">
                        <div className="text-emerald-700">
                          Paid: {formatMoney(amountPaid, profile.currency)}
                        </div>
                        <div className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block sm:block">
                          Demanded Balance: {formatMoney(balanceDue, profile.currency)}
                        </div>
                      </div>
                    )}

                    {paymentStatus === 'Unpaid' && (
                      <div className="mt-1 text-xs font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block sm:block">
                        Demanded Balance: {formatMoney(order.total, profile.currency)}
                      </div>
                    )}

                    <div className="text-[11px] text-stone-400 font-mono mt-1">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="mt-3.5 pt-3 border-t border-stone-100 text-xs text-stone-600 flex flex-wrap gap-1.5 items-center">
                  <span className="font-semibold text-stone-800">Items:</span>
                  {order.items.map((i, idx) => (
                    <span
                      key={idx}
                      className="bg-stone-50 text-stone-700 px-2 py-0.5 rounded border border-stone-200/60 font-medium"
                    >
                      {i.quantity}× {i.name}
                    </span>
                  ))}
                </div>

                {order.notes && (
                  <div className="mt-2 text-xs text-stone-500 italic">
                    Note: {order.notes}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-stone-500">Fulfillment:</span>
                    <select
                      value={order.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as OrderStatus;
                        onUpdateOrderStatus(order.id, newStatus);
                      }}
                      className="text-xs font-semibold py-1.5 px-3 border border-stone-300 rounded-lg bg-stone-50 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-900 cursor-pointer"
                    >
                      <option value="Received">Received</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Ready">Ready</option>
                      <option value="Completed">Completed</option>
                    </select>

                    {/* Record Payment / Update Balance Button */}
                    <button
                      onClick={() => openPaymentModal(order)}
                      className={`flex items-center space-x-1.5 text-xs py-1.5 px-3 rounded-lg font-bold border transition-colors cursor-pointer ${
                        paymentStatus === 'Paid'
                          ? 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{paymentStatus === 'Paid' ? 'Edit Payment' : 'Record Payment / Balance'}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => sendStatusWhatsApp(order)}
                      className="flex items-center space-x-1.5 text-xs py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-2xs transition-colors cursor-pointer"
                      title="Send status update to customer on WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send Update</span>
                    </button>

                    <button
                      onClick={() => onSelectOrder(order)}
                      className="flex items-center space-x-1.5 text-xs py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold border border-stone-200 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-600" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Record / Edit Payment Modal */}
      {editingPaymentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-stone-900" />
                <h3 className="text-sm font-bold text-stone-900">
                  Record Payment & Balance: {editingPaymentOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={closePaymentModal}
                className="text-stone-400 hover:text-stone-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Order Context Box */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-semibold">Customer:</span>
                  <span className="font-bold text-stone-900">{editingPaymentOrder.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-semibold">Total Demanded:</span>
                  <span className="font-mono font-extrabold text-stone-950 text-sm">
                    {formatMoney(editingPaymentOrder.total, profile.currency)}
                  </span>
                </div>
              </div>

              {/* Payment State Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Select Payment Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Paid' as PaymentStatus, label: 'Paid in Full' },
                    { id: 'Partially Paid' as PaymentStatus, label: 'Partially Paid' },
                    { id: 'Unpaid' as PaymentStatus, label: 'Unpaid (Due)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setEditPaymentStatus(s.id);
                        if (s.id === 'Paid') {
                          setEditAmountPaid(editingPaymentOrder.total.toString());
                        } else if (s.id === 'Unpaid') {
                          setEditAmountPaid('0');
                        }
                      }}
                      className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        editPaymentStatus === s.id
                          ? s.id === 'Paid'
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : s.id === 'Partially Paid'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-rose-700 text-white border-rose-700'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Paid & Balance Due Inputs */}
              {editPaymentStatus === 'Partially Paid' && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                  <label className="block text-xs font-bold text-amber-900">
                    Amount Customer Has Paid ({profile.currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-amber-700">
                      {profile.currency}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={editingPaymentOrder.total}
                      placeholder="0.00"
                      value={editAmountPaid}
                      onChange={(e) => setEditAmountPaid(e.target.value)}
                      className="w-full pl-12 pr-3 py-2 text-sm font-mono font-bold bg-white border border-amber-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-600"
                    />
                  </div>

                  {/* Real-time Balance Calculation */}
                  <div className="pt-2 border-t border-amber-200 text-xs flex justify-between items-center">
                    <span className="font-semibold text-amber-900">Remaining Balance Demanded:</span>
                    <span className="font-mono font-extrabold text-sm text-rose-700">
                      {formatMoney(
                        Math.max(0, editingPaymentOrder.total - (parseFloat(editAmountPaid) || 0)),
                        profile.currency
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Channel */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Mobile Money', 'Cash', 'Bank Transfer', 'Card'] as PaymentMethod[]).map(
                    (method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setEditPaymentMethod(method)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                          editPaymentMethod === method
                            ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                            : 'bg-stone-50/50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {method}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSavePayment(false)}
                  className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Save Payment Update
                </button>

                <button
                  type="button"
                  onClick={() => handleSavePayment(true)}
                  className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Save & Notify on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};