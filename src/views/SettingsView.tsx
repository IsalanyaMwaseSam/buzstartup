import React, { useState, useRef } from 'react';
import {
  Save,
  Check,
  RotateCcw,
  Shield,
  Globe,
  Building2,
  Percent,
  Upload,
  Image as ImageIcon,
  Trash2,
  Cloud,
} from 'lucide-react';
import type { BusinessProfile } from '../types';
import { CountryCombobox } from '../components/CountryCombobox';
import type { RegionInfo } from '../utils/regions';
import { uploadBusinessLogoApi, updateBusinessProfileApi } from '../utils/api';

interface SettingsViewProps {
  profile: BusinessProfile;
  userEmail?: string | null;
  onSaveProfile: (profile: BusinessProfile) => void;
  onResetData: () => void;
  onOpenAuthModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  userEmail,
  onSaveProfile,
  onResetData,
  onOpenAuthModal,
}) => {
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRegionSelect = (region: RegionInfo) => {
    setFormData((prev) => ({
      ...prev,
      countryCode: region.code,
      phonePrefix: region.phonePrefix,
      currencyCode: region.currencyCode,
      currency: region.currencySymbol,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      // Try Cloudflare R2 upload via API first
      const cloudUrl = await uploadBusinessLogoApi(file);
      if (cloudUrl) {
        const updated = { ...formData, logoUrl: cloudUrl };
        setFormData(updated);
        onSaveProfile(updated);
      } else {
        // Fallback to local Base64 URL
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Url = reader.result as string;
          const updated = { ...formData, logoUrl: base64Url };
          setFormData(updated);
          onSaveProfile(updated);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Non-blocking
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    const updated = { ...formData, logoUrl: '' };
    setFormData(updated);
    onSaveProfile(updated);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    await updateBusinessProfileApi(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-28 max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Business Setup & Identity
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Configure your brand identity, logo, currency, and dialing prefixes.
          </p>
        </div>

        {/* Account / Portal Badge */}
        {userEmail ? (
          <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Synced: {userEmail}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center space-x-1.5 text-xs font-bold py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sign In / Create Cloud Account</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Logo & Branding Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100">
            <ImageIcon className="w-4 h-4 text-stone-600" />
            <span>Business Brand Logo (Cloudflare R2 Storage)</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Logo Preview */}
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden bg-stone-50 shrink-0 relative group">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Business Logo"
                  className="w-full h-full object-contain p-1.5"
                />
              ) : (
                <div className="text-center p-2 text-stone-400">
                  <Building2 className="w-8 h-8 mx-auto mb-1 stroke-1" />
                  <span className="text-[10px] font-semibold block">No Logo</span>
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap gap-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center space-x-1.5 py-2 px-3.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? 'Uploading to R2...' : formData.logoUrl ? 'Change Logo' : 'Upload Store Logo'}</span>
                </button>

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="flex items-center space-x-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Logo</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Your logo automatically appears on electronic receipts, PDFs, customer payment links, and banner designs. Stored persistently in Cloudflare R2 bucket <code>business</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Searchable Region Selector */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100">
            <Globe className="w-4 h-4 text-stone-600" />
            <span>Search Country, Phone Code & Currency</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Select Your Country (Searchable Dropdown)
            </label>
            <CountryCombobox
              selectedCode={formData.countryCode}
              onSelect={handleRegionSelect}
            />
            <p className="text-[11px] text-stone-500 mt-1.5">
              Type any country name, international phone code (e.g. +256, +254, +234, +44, +1), or currency to search.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Phone Dialing Code
              </label>
              <input
                type="text"
                value={formData.phonePrefix}
                onChange={(e) => setFormData({ ...formData, phonePrefix: e.target.value })}
                className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                placeholder="+256"
                required
              />
              <span className="text-[11px] text-stone-400 mt-1 block">e.g. +256, +254, +234</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                placeholder="USh"
                required
              />
              <span className="text-[11px] text-stone-400 mt-1 block">e.g. USh, KSh, ₦, $, £, €</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Currency ISO Code
              </label>
              <input
                type="text"
                value={formData.currencyCode}
                onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                placeholder="UGX"
                required
              />
              <span className="text-[11px] text-stone-400 mt-1 block">e.g. UGX, KES, NGN, USD, GBP</span>
            </div>
          </div>
        </div>

        {/* Business Identity Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100">
            <Building2 className="w-4 h-4 text-stone-600" />
            <span>Business Profile & Receipt Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Owner / Founder Name
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Business Phone (WhatsApp)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 text-xs font-mono font-bold text-stone-600 bg-stone-100 border border-r-0 border-stone-300 rounded-l-xl">
                  {formData.phonePrefix}
                </span>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-r-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Business Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Physical Location / Workshop Address (Optional)
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              placeholder="e.g. Shop 12, Victoria Mall, Entebbe Road"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Receipt Tagline / Mission Note
            </label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              placeholder="e.g. Providing you with your affordable perfect scent."
            />
          </div>
        </div>

        {/* Tax Buffer Configuration Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100">
            <Percent className="w-4 h-4 text-stone-600" />
            <span>Tax Reserve Buffer</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Recommended Tax Reserve Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.taxReserveRate}
              onChange={(e) =>
                setFormData({ ...formData, taxReserveRate: parseInt(e.target.value) || 20 })
              }
              className="w-full max-w-xs px-3.5 py-2.5 text-sm font-mono font-bold bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              required
            />
            <p className="text-xs text-stone-500 mt-1.5">
              The percentage of net profit the application automatically advises you to set aside into your tax reserve account.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center space-x-2 py-3 px-6 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Changes Saved Successfully' : 'Save Business Settings'}</span>
          </button>
        </div>
      </form>

      {/* Local Storage Notice & Demo Data */}
      <div className="mt-10 pt-6 border-t border-stone-200">
        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
          <div>
            <div className="flex items-center space-x-2 font-bold text-stone-900">
              <Shield className="w-4 h-4 text-stone-600" />
              <span>Offline & Cloud Sync Protection</span>
            </div>
            <p className="text-stone-500 mt-0.5">
              Your business records are cached locally and synchronized with Cloudflare R2 persistent cloud storage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset to sample demo data? This will restore initial examples.')) {
                onResetData();
              }
            }}
            className="flex items-center justify-center space-x-1.5 py-2 px-3.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl font-semibold transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
