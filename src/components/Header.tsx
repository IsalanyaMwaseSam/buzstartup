import React from 'react';
import { Store, Plus, Share2, Settings as SettingsIcon, LogIn, LogOut, Cloud } from 'lucide-react';
import type { BusinessProfile } from '../types';
import type { NavTab } from './Sidebar';

interface HeaderProps {
  profile: BusinessProfile;
  currentTab: NavTab;
  userEmail?: string | null;
  onOpenNewSale: () => void;
  onOpenPaymentLink: () => void;
  onOpenSettings: () => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onReturnToLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentTab,
  userEmail,
  onOpenNewSale,
  onOpenPaymentLink,
  onOpenSettings,
  onOpenAuthModal,
  onLogout,
  onReturnToLanding,
}) => {
  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'sales':
        return { title: 'Point of Sale', subtitle: 'Record transactions and issue instant digital receipts' };
      case 'orders':
        return { title: 'Orders & Receipts', subtitle: 'Manage active customer orders and fulfillment status' };
      case 'customers':
        return { title: 'Client Directory', subtitle: 'Track customer lifetime spend and product re-orders' };
      case 'promote':
        return { title: 'Promotion Studio', subtitle: 'Create clean promotional cards for WhatsApp Status and social media' };
      case 'finances':
        return { title: 'Finances & Cash Flow', subtitle: 'Overview of revenue, expenses, and automated tax buffer' };
      case 'settings':
        return { title: 'Business Profile & Setup', subtitle: 'Configure regional dialing codes, currency, and identity' };
    }
  };

  const { title, subtitle } = getTabTitle(currentTab);

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Left Side: Brand & Breadcrumbs */}
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <div className="md:hidden w-9 h-9 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 overflow-hidden">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="Store logo" className="w-full h-full object-contain p-0.5 bg-white" />
            ) : (
              <Store className="w-4 h-4 text-stone-100" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-bold text-stone-900 leading-tight tracking-tight">
                <span className="md:hidden">{profile.businessName}</span>
                <span className="hidden md:inline">{title}</span>
              </h1>
              <span className="hidden sm:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                {profile.currencyCode} ({profile.currency})
              </span>
            </div>
            <p className="text-xs text-stone-500 font-normal hidden sm:block mt-0.5">
              <span className="md:hidden">{profile.ownerName} • {profile.phonePrefix} {profile.phone}</span>
              <span className="hidden md:inline">{subtitle}</span>
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2">
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              title="View product landing page"
              className="hidden xl:inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-stone-500" />
              <span>Landing Page</span>
            </button>
          )}

          {/* Cloud Auth / Account Status */}
          {userEmail ? (
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium text-stone-700 truncate max-w-[140px]">{userEmail}</span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign out of this business"
                  className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-stone-600" />
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={onOpenPaymentLink}
            title="Create payment request link"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 rounded-lg transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Payment Request</span>
          </button>

          <button
            onClick={onOpenNewSale}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 active:bg-black rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>New Sale</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Business setup & region settings"
            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors md:hidden cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
