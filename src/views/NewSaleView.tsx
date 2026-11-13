import React, { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, User, ShoppingCart, CreditCard, TrendingUp } from 'lucide-react';
import type { BusinessProfile, Order, OrderItem, PaymentMethod, PaymentStatus } from '../types';
import { formatMoney } from '../utils/regions';

interface NewSaleViewProps {
  profile: BusinessProfile;
  orders?: Order[];
  onCompleteSale: (order: Order) => void;
}

export const NewSaleView: React.FC<NewSaleViewProps> = ({ profile, orders = [], onCompleteSale }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', name: '', quantity: 1, unitPrice: 0 },
  ]);

  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Mobile Money');

  // Payment Tracking State
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [customAmountPaid, setCustomAmountPaid] = useState<string>('');

  // Dynamically compute Popular Items ranked by actual sales frequency and volume
  const popularItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; price: number; count: number; totalQty: number }>();

    if (orders && orders.length > 0) {
      orders.forEach((order) => {
        if (order.items && order.items.length > 0) {
          order.items.forEach((item) => {
            if (!item.name || item.name.trim() === '') return;
            const cleanName = item.name.trim();
            const existing = itemMap.get(cleanName);
            if (existing) {
              existing.count += 1;
              existing.totalQty += item.quantity || 1;
              // preserve or update with latest price
              if (item.unitPrice && item.unitPrice > 0) {
                existing.price = item.unitPrice;
              }
            } else {
              itemMap.set(cleanName, {
                name: cleanName,
                price: item.unitPrice || 0,
                count: 1,
                totalQty: item.quantity || 1,
              });
            }
          });
        }
      });
    }

    const sortedFromSales = Array.from(itemMap.values()).sort((a, b) => b.totalQty - a.totalQty);

    const fallbackPresets = [
      { name: 'Signature Fragrance (50ml)', price: 80000, count: 0, totalQty: 0 },
      { name: 'Luxury Oud Blend (100ml)', price: 150000, count: 0, totalQty: 0 },
      { name: 'Aroma Reed Diffuser', price: 65000, count: 0, totalQty: 0 },
      { name: 'Pocket Travel Spray', price: 25000, count: 0, totalQty: 0 },
    ];

    if (sortedFromSales.length === 0) {
      return fallbackPresets;
    }

    const results = [...sortedFromSales.slice(0, 4)];
    for (const preset of fallbackPresets) {
      if (results.length >= 4) break;
      if (!results.some((r) => r.name.toLowerCase() === preset.name.toLowerCase())) {
        results.push(preset);
      }
    }

    return results;
  }, [orders]);

  const handleAddItem = (presetName = '', presetPrice = 0) => {
    setItems((prev) => {
      // If the first row is empty, fill it with the selected preset
      if (prev.length === 1 && prev[0].name.trim() === '' && prev[0].unitPrice === 0) {
        return [{ id: prev[0].id, name: presetName, quantity: 1, unitPrice: presetPrice }];
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          name: presetName,
          quantity: 1,
          unitPrice: presetPrice,
        },
      ];
    });
  };

  const handleUpdateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      setItems([{ id: '1', name: '', quantity: 1, unitPrice: 0 }]);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * (item.unitPrice || 0), 0);
  const total = Math.max(0, subtotal - (discount || 0));

  // Determine amount paid and balance based on state
  let calculatedAmountPaid = total;
  if (paymentStatus === 'Unpaid') {
    calculatedAmountPaid = 0;
  } else if (paymentStatus === 'Partially Paid') {
    calculatedAmountPaid = Math.min(total, parseFloat(customAmountPaid) || 0);
  }
  const calculatedBalanceDue = Math.max(0, total - calculatedAmountPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter((item) => item.name.trim() !== '' && item.unitPrice >= 0);
    if (validItems.length === 0) {
      alert('Please add at least one item with a valid name and price.');
      return;
    }

    const orderNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullPhone = customerPhone.trim()
      ? customerPhone.startsWith('+')
        ? customerPhone.trim()
        : `${profile.phonePrefix} ${customerPhone.trim()}`
      : '';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName.trim() || 'Valued Client',
      customerPhone: fullPhone,
      customerEmail: customerEmail.trim(),
      items: validItems,
      subtotal,
      discount: discount || 0,
      total,
      paymentMethod,
      isPaid: paymentStatus === 'Paid',
      paymentStatus,
      amountPaid: calculatedAmountPaid,
      balanceDue: calculatedBalanceDue,
      status: paymentStatus === 'Paid' ? 'Completed' : 'Received',
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCompleteSale(newOrder);

    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
    setItems([{ id: '1', name: '', quantity: 1, unitPrice: 0 }]);
    setDiscount(0);
    setPaymentStatus('Paid');
    setCustomAmountPaid('');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-28">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Record a Sale
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Complete transactions, record deposits & partial payments, and issue official receipts.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer details, Presets & Items */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-stone-900 uppercase tracking-wider mb-4 pb-2 border-b border-stone-100">
              <User className="w-4 h-4 text-stone-600" />
              <span>Customer Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Samuel Mwase"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Phone (WhatsApp)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3.5 text-xs font-mono font-bold text-stone-600 bg-stone-100 border border-r-0 border-stone-300 rounded-l-xl">
                    {profile.phonePrefix}
                  </span>
                  <input
                    type="tel"
                    placeholder="e.g. 790966231"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-stone-50/50 border border-stone-300 rounded-r-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Popular Items Catalog */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-stone-700" />
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Popular Items
                </span>
              </div>
              <span className="text-[11px] text-stone-400 font-medium">Ranked by sales • Tap to add</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {popularItems.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAddItem(preset.name, preset.price)}
                  className="p-3 bg-white border border-stone-200/90 hover:border-stone-400 hover:shadow-2xs active:bg-stone-50 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-stone-900 line-clamp-1">{preset.name}</div>
                    <div className="font-mono text-xs font-bold text-stone-700 mt-1">
                      {formatMoney(preset.price, profile.currency)}
                    </div>
                  </div>
                  {preset.totalQty > 0 && (
                    <div className="mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block w-fit">
                      {preset.totalQty} sold
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
              <div className="flex items-center space-x-2 text-xs font-bold text-stone-900 uppercase tracking-wider">
                <ShoppingCart className="w-4 h-4 text-stone-600" />
                <span>Line Items</span>
              </div>

              <button
                type="button"
                onClick={() => handleAddItem()}
                className="text-xs font-semibold text-stone-900 hover:text-stone-700 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-stone-50/70 rounded-xl border border-stone-200/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Item #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 sm:col-span-6">
                      <input
                        type="text"
                        placeholder="Item or fragrance description"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                        required
                      />
                    </div>

                    <div className="col-span-5 sm:col-span-3">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-stone-400 font-medium">Qty</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              'quantity',
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-full pl-11 pr-3 py-2 text-sm font-mono bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-center"
                        />
                      </div>
                    </div>

                    <div className="col-span-7 sm:col-span-3">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-stone-400">
                          {profile.currency}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={item.unitPrice || ''}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-12 pr-3 py-2 text-sm font-mono font-bold bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 text-right"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Sticky on Desktop): Payment Breakdown & Balances */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 text-xs font-bold text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100">
              <CreditCard className="w-4 h-4 text-stone-600" />
              <span>Payment & Balance Tracking</span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Payment Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Mobile Money', 'Cash', 'Bank Transfer', 'Card'] as PaymentMethod[]).map(
                  (method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === method
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

            {/* 3 Clear Payment States */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Payment Status
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'Paid' as PaymentStatus, label: 'Paid in Full' },
                  { id: 'Partially Paid' as PaymentStatus, label: 'Deposit / Half' },
                  { id: 'Unpaid' as PaymentStatus, label: 'Unpaid (Due)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPaymentStatus(s.id)}
                    className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      paymentStatus === s.id
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

            {/* If Partially Paid, Merchant Inputs How Much Client Paid */}
            {paymentStatus === 'Partially Paid' && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-amber-900">
                  Amount Client Has Paid Now ({profile.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-amber-700">
                    {profile.currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={total}
                    placeholder="0.00"
                    value={customAmountPaid}
                    onChange={(e) => setCustomAmountPaid(e.target.value)}
                    className="w-full pl-12 pr-3 py-2 text-sm font-mono font-bold bg-white border border-amber-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-600"
                    required
                  />
                </div>
                <div className="text-[11px] text-amber-800 flex justify-between font-medium pt-1">
                  <span>Remaining Debt / Balance:</span>
                  <span className="font-mono font-bold text-rose-700">
                    {formatMoney(calculatedBalanceDue, profile.currency)}
                  </span>
                </div>
              </div>
            )}

            {/* Discount field */}
            <div className="pt-2 border-t border-stone-100">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Discount ({profile.currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-stone-400">
                  {profile.currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount || ''}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-3 py-2 text-sm font-mono bg-stone-50/50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Order Note */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Delivery Address or Custom Note
              </label>
              <input
                type="text"
                placeholder="e.g. Delivered to Nansana, Nsumbi"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50/50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            {/* Calculations Breakdown with Total, Paid, and Balance Due */}
            <div className="pt-4 border-t border-dashed border-stone-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal, profile.currency)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-{formatMoney(discount, profile.currency)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 text-stone-950 font-bold">
                <span className="font-sans text-sm font-extrabold uppercase">Total Order Value</span>
                <span className="text-xl font-extrabold tracking-tight">
                  {formatMoney(total, profile.currency)}
                </span>
              </div>

              {/* Amount Paid Row */}
              <div className="flex justify-between text-emerald-800 font-bold pt-1">
                <span className="font-sans">Amount Paid / Received:</span>
                <span>{formatMoney(calculatedAmountPaid, profile.currency)}</span>
              </div>

              {/* Balance Due Row */}
              {calculatedBalanceDue > 0 && (
                <div className="flex justify-between text-rose-700 font-bold pt-1 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                  <span className="font-sans">Outstanding Balance Due:</span>
                  <span>{formatMoney(calculatedBalanceDue, profile.currency)}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 active:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Complete Sale & View Receipt</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
