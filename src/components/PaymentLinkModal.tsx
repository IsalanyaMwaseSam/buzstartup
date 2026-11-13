import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, ArrowRight, Link } from 'lucide-react';
import type { BusinessProfile } from '../types';
import { formatMoney } from '../utils/regions';

interface PaymentLinkModalProps {
  profile: BusinessProfile;
  onClose: () => void;
  onCreateOrderFromLink?: (data: { customerName: string; itemName: string; amount: number; notes: string }) => void;
}

export const PaymentLinkModal: React.FC<PaymentLinkModalProps> = ({
  profile,
  onClose,
  onCreateOrderFromLink,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;

  const generatePaymentMessage = () => {
    return (
      `Hello ${customerName || 'there'},\n\n` +
      `Here are the payment details for your order of *${itemName || 'your selected items'}* with ${profile.businessName}:\n\n` +
      `Total Due: *${formatMoney(parsedAmount, profile.currency)}*\n` +
      (notes ? `Note: ${notes}\n` : '') +
      `\nTo complete payment:\n` +
      `• Beneficiary: ${profile.businessName}\n` +
      `• Contact / Reference: ${profile.phonePrefix} ${profile.phone}\n\n` +
      `Once sent, please send a quick confirmation or screenshot here so we can start fulfilling your order right away.\n\n` +
      `Thank you!`
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatePaymentMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(generatePaymentMessage());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCreateOrder = () => {
    if (onCreateOrderFromLink && parsedAmount > 0) {
      onCreateOrderFromLink({
        customerName: customerName.trim() || 'Valued Customer',
        itemName: itemName.trim() || 'Custom Order',
        amount: parsedAmount,
        notes: notes.trim(),
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center space-x-2">
            <Link className="w-4 h-4 text-stone-900" />
            <h3 className="text-sm font-bold text-stone-900">Create Payment Request</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-800 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Customer Name</label>
              <input
                type="text"
                placeholder="e.g. Rachel Adams"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50/50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Amount ({profile.currencyCode} - {profile.currency})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-stone-50/50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Item or Service Name</label>
            <input
              type="text"
              placeholder="e.g. Handcrafted Ceramic Teapot"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50/50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Optional Note or Instruction</label>
            <input
              type="text"
              placeholder="e.g. Doorstep delivery scheduled for Saturday"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50/50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
            />
          </div>

          {/* Live Message Preview */}
          <div>
            <span className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
              Generated Message Preview
            </span>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-700 font-mono whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
              {generatePaymentMessage()}
            </div>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleWhatsApp}
            disabled={parsedAmount <= 0}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send via WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={parsedAmount <= 0}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-white hover:bg-stone-100 disabled:opacity-40 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Message'}</span>
          </button>

          {onCreateOrderFromLink && (
            <button
              onClick={handleCreateOrder}
              disabled={parsedAmount <= 0}
              className="flex items-center justify-center space-x-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Record as pending order"
            >
              <span>Record Order</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
