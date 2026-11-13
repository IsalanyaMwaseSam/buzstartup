import React, { useState } from 'react';
import {
  X,
  Store,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
} from 'lucide-react';
import { CountryCombobox } from './CountryCombobox';
import { loginBusinessUser, registerBusinessUser } from '../utils/api';
import type { BusinessProfile } from '../types';
import { ALL_REGIONS } from '../utils/regions';
import type { RegionInfo } from '../utils/regions';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess: (business: BusinessProfile, email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialTab]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regTagline, setRegTagline] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<RegionInfo>(
    ALL_REGIONS.find((r) => r.code === 'UG') || ALL_REGIONS[0]
  );

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginBusinessUser({
        email: loginEmail,
        password: loginPassword,
      });

      const profile: BusinessProfile = {
        businessName: res.business.name || res.business.businessName || 'My Business',
        ownerName: res.business.owner_name || res.business.ownerName || 'Business Owner',
        phone: res.business.phone || '',
        phonePrefix: res.business.phone_prefix || res.business.phonePrefix || '+256',
        email: res.business.email || res.user.email,
        currency: res.business.currency || 'USh',
        currencyCode: res.business.currency_code || res.business.currencyCode || 'UGX',
        countryCode: res.business.country_code || res.business.countryCode || 'UG',
        taxReserveRate: res.business.tax_reserve_rate || res.business.taxReserveRate || 20,
        address: res.business.address || '',
        tagline: res.business.tagline || '',
        logoUrl: res.business.logo_url || res.business.logoUrl || '',
        setupCompleted: true,
      };

      setSuccessMsg('Signed in successfully! Loading your business...');
      setTimeout(() => {
        onAuthSuccess(profile, res.user.email);
        onClose();
      }, 500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await registerBusinessUser({
        email: regEmail,
        password: regPassword,
        businessName: regBusinessName,
        ownerName: regOwnerName,
        phone: regPhone,
        phonePrefix: selectedRegion.phonePrefix,
        currency: selectedRegion.currencySymbol,
        currencyCode: selectedRegion.currencyCode,
        countryCode: selectedRegion.code,
        tagline: regTagline,
      });

      const profile: BusinessProfile = {
        businessName: res.business.name || regBusinessName,
        ownerName: res.business.owner_name || regOwnerName,
        phone: regPhone,
        phonePrefix: selectedRegion.phonePrefix,
        email: res.user.email,
        currency: selectedRegion.currencySymbol,
        currencyCode: selectedRegion.currencyCode,
        countryCode: selectedRegion.code,
        taxReserveRate: 20,
        tagline: regTagline,
        setupCompleted: true,
      };

      setSuccessMsg('Account registered successfully! Welcome to your Business Hub.');
      setTimeout(() => {
        onAuthSuccess(profile, res.user.email);
        onClose();
      }, 500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setSuccessMsg('Continuing in Demo Mode (Perfect Scents)...');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-stone-900 text-stone-100">
          <div className="flex items-center space-x-2.5">
            <Store className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Business Hub Portal</h3>
              <p className="text-[11px] text-stone-400">Secure entry for small business owners & solopreneurs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-stone-100/80 border-b border-stone-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Existing Business</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New Business</span>
          </button>
        </div>

        {/* Alert / Notification Messages */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Form Content */}
        <div className="p-6">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Business Owner Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. isalanyamwasesam@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In to My Business'}</span>
              </button>

              <div className="pt-3 border-t border-stone-200 text-center">
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className="text-xs text-stone-500 hover:text-stone-800 font-semibold cursor-pointer"
                >
                  Or explore with demo store (Perfect Scents)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Perfect Scents"
                    value={regBusinessName}
                    onChange={(e) => setRegBusinessName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Mwase"
                    value={regOwnerName}
                    onChange={(e) => setRegOwnerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Region & Country Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Country & Primary Currency
                </label>
                <CountryCombobox
                  selectedCode={selectedRegion.code}
                  onSelect={setSelectedRegion}
                />
              </div>

              {/* Contact Phone with Country Code */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Business Phone (WhatsApp)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-xs font-mono font-bold text-stone-600 bg-stone-100 border border-r-0 border-stone-300 rounded-l-xl">
                    {selectedRegion.phonePrefix}
                  </span>
                  <input
                    type="tel"
                    placeholder="e.g. 746022116"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-r-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Business Motto / Tagline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Providing you with your affordable perfect scent"
                  value={regTagline}
                  onChange={(e) => setRegTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                />
              </div>

              {/* Account Credentials */}
              <div className="pt-2 border-t border-stone-200 space-y-3">
                <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Account Sign-in Credentials
                </span>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@yourbusiness.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Password (Min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Create a secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <Store className="w-4 h-4" />
                <span>{loading ? 'Creating Business Hub...' : 'Create Account & Setup Business'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
