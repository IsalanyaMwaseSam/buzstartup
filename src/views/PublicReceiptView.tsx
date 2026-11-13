import React, { useRef } from 'react';
import { CheckCircle2, Download, QrCode, Store, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { BusinessProfile, Order } from '../types';
import { formatMoney } from '../utils/regions';

interface PublicReceiptViewProps {
  order: Order;
  profile: BusinessProfile;
  onBackToApp?: () => void;
}

export const PublicReceiptView: React.FC<PublicReceiptViewProps> = ({
  order,
  profile,
  onBackToApp,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
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
      pdf.save(`Official_Receipt_${order.orderNumber}.pdf`);
    } catch {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/70 py-8 px-4 sm:px-6 flex flex-col items-center justify-center font-sans antialiased text-stone-900">
      {/* Top Banner */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between no-print">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
            <Store className="w-4 h-4 text-stone-100" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              {profile.businessName}
            </h1>
            <p className="text-[10px] text-stone-500">Verified Electronic Receipt</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-3 py-1.5 bg-white border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-50 cursor-pointer flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </button>
          )}

          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save PDF</span>
          </button>
        </div>
      </div>

      {/* The Pure Visual Receipt Card */}
      <div
        ref={receiptRef}
        id="receipt-print-area"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 p-6 sm:p-8 overflow-hidden"
      >
        {/* Verification Pill Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
          <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Electronic Receipt</span>
          </div>
          <span className="text-xs font-mono font-bold text-stone-500">{order.orderNumber}</span>
        </div>

        {/* Business Header */}
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
              Direct Contact: {profile.phonePrefix} {profile.phone}
            </p>
          </div>
        </div>

        {/* Customer & Transaction Meta */}
        <div className="py-4 text-xs grid grid-cols-2 gap-4 border-b border-dashed border-stone-300 font-mono text-stone-700">
          <div>
            <span className="text-stone-400 text-[10px] block uppercase font-sans font-bold">Billed To</span>
            <span className="font-bold text-stone-950 text-sm">{order.customerName}</span>
            {order.customerPhone && (
              <span className="block text-stone-500 text-[11px] font-sans mt-0.5">{order.customerPhone}</span>
            )}
          </div>
          <div className="text-right">
            <span className="text-stone-400 text-[10px] block uppercase font-sans font-bold">Date & Time</span>
            <span className="text-stone-800">{formattedDate}</span>
          </div>

          <div>
            <span className="text-stone-400 text-[10px] block uppercase font-sans font-bold">Payment Channel</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-stone-100 text-stone-900 border border-stone-200">
              {order.paymentMethod}
            </span>
          </div>

          <div className="text-right">
            <span className="text-stone-400 text-[10px] block uppercase font-sans font-bold">Payment Status</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold ${
                paymentStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : paymentStatus === 'Partially Paid'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {paymentStatus === 'Paid'
                ? 'PAID IN FULL'
                : paymentStatus === 'Partially Paid'
                ? 'PARTIALLY PAID'
                : 'UNPAID'}
            </span>
          </div>
        </div>

        {/* Line Items */}
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

        {/* Totals & Balance Due */}
        <div className="py-4 space-y-2 border-b border-dashed border-stone-300 text-xs font-mono">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotal, profile.currency)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span>-{formatMoney(order.discount, profile.currency)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 text-stone-950 font-bold">
            <span className="font-sans text-sm font-extrabold uppercase">Total Order Value</span>
            <span className="text-2xl font-black">{formatMoney(order.total, profile.currency)}</span>
          </div>

          <div className="flex justify-between text-emerald-800 font-bold pt-1">
            <span className="font-sans">Amount Paid / Received:</span>
            <span>{formatMoney(amountPaid, profile.currency)}</span>
          </div>

          {balanceDue > 0 && (
            <div className="flex justify-between text-rose-700 font-black pt-1 bg-rose-50 px-2.5 py-1.5 rounded border border-rose-200">
              <span className="font-sans uppercase text-xs">Outstanding Balance Due:</span>
              <span className="text-sm">{formatMoney(balanceDue, profile.currency)}</span>
            </div>
          )}
        </div>

        {/* Verification QR block */}
        <div className="py-4 flex items-center justify-between text-xs bg-stone-50 p-4 rounded-xl mt-4 border border-stone-200/90">
          <div className="flex items-center space-x-3">
            <QrCode className="w-10 h-10 text-stone-800 shrink-0" />
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Digital Authentication</span>
              <span className="font-mono text-xs font-bold text-stone-900 tracking-wider">
                AUTH-{order.orderNumber.replace('INV-', '')}-VERIFIED
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-stone-500 uppercase font-bold block">Status</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-stone-900 text-white">
              {order.status}
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-stone-500 mt-6 pt-1 space-y-1">
          <p className="font-semibold text-stone-800">
            Thank you for your purchase with {profile.businessName}!
          </p>
          <p className="text-[11px] text-stone-400">
            Please keep this electronic receipt for your records, warranties, and exchanges.
          </p>
        </div>
      </div>
    </div>
  );
};
