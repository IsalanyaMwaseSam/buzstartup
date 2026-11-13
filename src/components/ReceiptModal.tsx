import React, { useState, useRef } from 'react';
import { X, MessageSquare, Download, CheckCircle2, QrCode, FileCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { BusinessProfile, Order } from '../types';
import { formatMoney } from '../utils/regions';

interface ReceiptModalProps {
  order: Order | null;
  profile: BusinessProfile;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, profile, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWhatsAppHelper, setShowWhatsAppHelper] = useState(false);
  const receiptCardRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const amountPaid = order.amountPaid ?? (order.isPaid ? order.total : 0);
  const balanceDue = order.balanceDue ?? (order.isPaid ? 0 : order.total);
  const paymentStatus = order.paymentStatus ?? (order.isPaid ? 'Paid' : 'Unpaid');

  // Direct public link to this specific visual receipt
  const publicReceiptUrl = `${window.location.origin}${window.location.pathname}#/receipt/${order.orderNumber}`;

  // Clean WhatsApp message with clickable standalone link
  const cleanWhatsAppMessage =
    `Hello ${order.customerName}, here is your official receipt for order ${order.orderNumber} from ${profile.businessName}:\n\n` +
    `🔗 View & Download Your Official Digital Receipt:\n` +
    `${publicReceiptUrl}\n\n` +
    `• Total Order: ${formatMoney(order.total, profile.currency)}\n` +
    `• Amount Paid: ${formatMoney(amountPaid, profile.currency)}\n` +
    (balanceDue > 0 ? `• Balance Due: ${formatMoney(balanceDue, profile.currency)}\n` : '') +
    `• Status: ${paymentStatus}\n\n` +
    `Thank you for your business! Direct contact: ${profile.phonePrefix} ${profile.phone}`;

  // Render pure receipt card to PDF
  const generatePurePDF = async () => {
    if (!receiptCardRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = await html2canvas(receiptCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${order.orderNumber}.pdf`);
    } catch {
      // Fallback
    } finally {
      setIsProcessing(false);
    }
  };

  // Render pure receipt card to PNG blob
  const generatePurePNGBlob = async (): Promise<Blob | null> => {
    if (!receiptCardRef.current) return null;
    try {
      const canvas = await html2canvas(receiptCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
      return await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
      });
    } catch {
      return null;
    }
  };

  // Dedicated single "Download Receipt" action
  const handleDownloadReceipt = async () => {
    await generatePurePDF();
    const blob = await generatePurePNGBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt_${order.orderNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Primary "Send Receipt on WhatsApp" action
  const handleSendOnWhatsApp = async () => {
    setIsProcessing(true);

    const blob = await generatePurePNGBlob();

    if (blob) {
      // 1. Copy image directly to system clipboard for instant Ctrl+V pasting in WhatsApp
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        } catch {
          // continue
        }
      }

      // 2. Try native file share (attaches file directly on smartphones / supported tablets)
      if (navigator.canShare) {
        try {
          const file = new File([blob], `Receipt_${order.orderNumber}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Receipt ${order.orderNumber}`,
              text: cleanWhatsAppMessage,
              files: [file],
            });
            setIsProcessing(false);
            return;
          }
        } catch {
          // continue
        }
      }
    }

    setIsProcessing(false);
    setShowWhatsAppHelper(true);

    // 3. Open WhatsApp chat with clean clickable link message
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(cleanWhatsAppMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(cleanWhatsAppMessage)}`;

    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 200);
  };

  return (
    <div
      id="receipt-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 text-stone-100 no-print">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-wider uppercase">Official Transaction Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Helper Toast Banner */}
        {showWhatsAppHelper && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-4 text-xs text-emerald-950 space-y-1 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2 font-bold text-emerald-900">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Receipt Link & Graphic Prepared</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              WhatsApp chat with <strong>{order.customerName}</strong> is opening with the direct clickable receipt link. You can also press <strong>Ctrl + V</strong> in WhatsApp to send the receipt image!
            </p>
          </div>
        )}

        {/* PURE RECEIPT CARD - ONLY this container gets printed and exported to PDF */}
        <div
          ref={receiptCardRef}
          id="receipt-print-area"
          className="p-6 sm:p-8 text-stone-900 bg-white"
        >
          {/* Header */}
          <div className="text-center pb-6 border-b border-dashed border-stone-300">
            {profile.logoUrl && (
              <img
                src={profile.logoUrl}
                alt="Business Logo"
                className="w-14 h-14 object-contain mx-auto mb-2.5"
              />
            )}
            <h2 className="text-2xl font-black tracking-tight text-stone-950">
              {profile.businessName}
            </h2>
            {profile.tagline && (
              <p className="text-xs text-stone-500 font-medium mt-1">{profile.tagline}</p>
            )}
            <div className="text-xs text-stone-500 mt-2 space-y-0.5">
              {profile.address && <p>{profile.address}</p>}
              <p>
                Phone: {profile.phonePrefix} {profile.phone} • {profile.email}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="py-4 text-xs grid grid-cols-2 gap-4 border-b border-dashed border-stone-300 font-mono text-stone-700">
            <div>
              <span className="text-stone-400 text-[10px] block uppercase font-sans font-bold">Receipt Ref</span>
              <span className="font-bold text-stone-950">{order.orderNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-stone-400 text-[10px] block uppercase font-sans font-bold">Date & Time</span>
              <span className="text-stone-800">{formattedDate}</span>
            </div>
            <div>
              <span className="text-stone-400 text-[10px] block uppercase font-sans font-bold">Billed To</span>
              <span className="font-bold text-stone-950">{order.customerName}</span>
              {order.customerPhone && (
                <span className="block text-stone-500 text-[11px] font-sans mt-0.5">{order.customerPhone}</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-stone-400 text-[10px] block uppercase font-sans font-bold">Payment Status</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold ${
                  paymentStatus === 'Paid'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : paymentStatus === 'Partially Paid'
                    ? 'bg-amber-50 text-amber-800 border border-amber-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {paymentStatus === 'Paid'
                  ? 'PAID IN FULL'
                  : paymentStatus === 'Partially Paid'
                  ? 'PARTIALLY PAID (DEPOSIT)'
                  : 'UNPAID (PAYMENT DUE)'}{' '}
                ({order.paymentMethod})
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-5 border-b border-dashed border-stone-300">
            <div className="flex justify-between text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-3 font-sans">
              <span>Item Description</span>
              <span className="text-right">Amount</span>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs items-start">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-stone-950">{item.name}</p>
                    <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                      {item.quantity} × {formatMoney(item.unitPrice, profile.currency)}
                    </p>
                  </div>
                  <div className="font-bold text-stone-950 font-mono text-sm">
                    {formatMoney(item.quantity * item.unitPrice, profile.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal, Discount & Total */}
          <div className="py-4 space-y-2 border-b border-dashed border-stone-300 text-xs font-mono">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal, profile.currency)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount Applied</span>
                <span>-{formatMoney(order.discount, profile.currency)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 text-base font-extrabold text-stone-950">
              <span className="font-sans text-sm uppercase tracking-wide">Total Order Value</span>
              <span className="text-xl font-black">{formatMoney(order.total, profile.currency)}</span>
            </div>

            {/* Amount Paid Breakdown */}
            <div className="flex justify-between text-emerald-800 font-bold pt-1">
              <span className="font-sans">Amount Paid / Received:</span>
              <span>{formatMoney(amountPaid, profile.currency)}</span>
            </div>

            {/* Remaining Balance Due if partially paid or unpaid */}
            {balanceDue > 0 && (
              <div className="flex justify-between text-rose-700 font-black pt-1 bg-rose-50 px-2.5 py-1.5 rounded border border-rose-200">
                <span className="font-sans uppercase text-xs">Outstanding Balance Due:</span>
                <span className="text-sm">{formatMoney(balanceDue, profile.currency)}</span>
              </div>
            )}
          </div>

          {/* Verification Code Block */}
          <div className="py-4 flex items-center justify-between text-xs bg-stone-50 p-4 rounded-xl mt-3 border border-stone-200/90">
            <div className="flex items-center space-x-3">
              <QrCode className="w-9 h-9 text-stone-800 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Verification Code</span>
                <span className="font-mono text-xs font-bold text-stone-900 tracking-wider">
                  AUTH-{order.orderNumber.replace('INV-', '')}-VALID
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Fulfillment</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-stone-100 text-stone-900 border border-stone-200">
                {order.status}
              </span>
            </div>
          </div>

          {/* Polite Footer */}
          <div className="text-center text-xs text-stone-500 mt-5 pt-1 space-y-1">
            <p className="font-semibold text-stone-800">Thank you for supporting {profile.businessName}!</p>
            <p className="text-[11px] text-stone-400">
              Direct Contact: {profile.phonePrefix} {profile.phone}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row gap-3 no-print">
          <button
            onClick={handleSendOnWhatsApp}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Receipt on WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadReceipt}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-black disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Receipt (PDF / Image)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
