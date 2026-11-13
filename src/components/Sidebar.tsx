import React from 'react';
import {
  ShoppingBag,
  FileText,
  Users,
  Megaphone,
  CreditCard,
  Settings,
  Store,
  Plus,
  Share2,
  Globe,
  LogIn,
  LogOut,
  Cloud,
} from 'lucide-react';
import type { BusinessProfile } from '../types';

export type NavTab = 'sales' | 'orders' | 'customers' | 'promote' | 'finances' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profile: BusinessProfile;
  pendingOrdersCount?: number;
  userEmail?: string | null;
  onOpenPaymentLink: () => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onReturnToLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  pendingOrdersCount = 0,
  userEmail,
  onOpenPaymentLink,
  onOpenAuthModal,
  onLogout,
  onReturnToLanding,
}) => {
  const navItems = [
    { id: 'sales' as NavTab, label: 'Point of Sale', hint: 'Fast cashier', icon: ShoppingBag },
    { id: 'orders' as NavTab, label: 'Orders & Receipts', hint: 'Fulfillment & status', icon: FileText, badge: pendingOrdersCount },
    { id: 'customers' as NavTab, label: 'Client Directory', hint: 'History & follow-up', icon: Users },
    { id: 'promote' as NavTab, label: 'Promotion Studio', hint: 'Banners, posters & flyers', icon: Megaphone },
    { id: 'finances' as NavTab, label: 'Finances & Cash Flow', hint: 'Sales, costs & tax reserve', icon: CreditCard },
    { id: 'settings' as NavTab, label: 'Business Profile', hint: 'Setup, region & currency', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-stone-200/80 h-screen sticky top-0 shrink-0 z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-stone-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-base shadow-xs shrink-0 overflow-hidden">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="Store logo" className="w-full h-full object-contain p-0.5 bg-white" />
            ) : (
              <Store className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-stone-900 truncate tracking-tight">
              {profile.businessName}
            </h2>
            <p className="text-xs text-stone-500 truncate mt-0.5">
              {profile.ownerName}
            </p>
          </div>
        </div>

        {/* Primary Desktop Action Button */}
        <button
          onClick={() => onSelectTab('sales')}
          className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 active:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-stone-600 uppercase tracking-wider px-3 mb-2">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-stone-100 text-stone-950 font-semibold shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 font-medium'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-stone-900 stroke-[2.2]' : 'text-stone-500 stroke-[1.8]'
                  }`}
                />
                <div className="truncate">
                  <div className="text-xs tracking-tight">{item.label}</div>
                  <div className="text-[10px] text-stone-400 font-normal truncate">{item.hint}</div>
                </div>
              </div>

              {Boolean(item.badge && item.badge > 0) && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-full shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Region / Profile Widget */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/60 space-y-2.5">
        <button
          onClick={onOpenPaymentLink}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-stone-500" />
          <span>Payment Link Generator</span>
        </button>

        {/* Cloud Account Status */}
        {userEmail ? (
          <div className="p-2.5 bg-white border border-stone-200 rounded-xl text-xs flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-2">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-[11px]">
                <Cloud className="w-3 h-3" />
                <span>Cloud Connected</span>
              </div>
              <div className="text-stone-600 truncate text-[11px] font-mono mt-0.5">{userEmail}</div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Log out"
                className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-700" />
            <span>Sign In / Create Account</span>
          </button>
        )}

        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
          <div className="flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-stone-400" />
            <span>Active Currency</span>
          </div>
          <span className="font-semibold text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200 font-mono">
            {profile.currency} ({profile.currencyCode})
          </span>
        </div>

        {onReturnToLanding && (
          <button
            onClick={onReturnToLanding}
            className="w-full text-center text-[11px] font-semibold text-stone-500 hover:text-stone-900 pt-1 cursor-pointer"
          >
            ← View BuzStartup Landing Page
          </button>
        )}
      </div>
    </aside>
  );
};
