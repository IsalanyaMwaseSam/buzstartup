import React from 'react';
import { ShoppingBag, FileText, Users, Megaphone, CreditCard, Settings } from 'lucide-react';
import type { NavTab } from './Sidebar';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingOrdersCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  pendingOrdersCount = 0,
}) => {
  const tabs = [
    { id: 'sales' as NavTab, label: 'Sale', icon: ShoppingBag },
    { id: 'orders' as NavTab, label: 'Orders', icon: FileText, badge: pendingOrdersCount },
    { id: 'customers' as NavTab, label: 'Clients', icon: Users },
    { id: 'promote' as NavTab, label: 'Promote', icon: Megaphone },
    { id: 'finances' as NavTab, label: 'Finances', icon: CreditCard },
    { id: 'settings' as NavTab, label: 'Setup', icon: Settings },
  ];

  return (
    <nav className="bottom-nav-mobile md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg safe-area-bottom">
      <div className="grid grid-cols-6 h-15">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center relative py-1 transition-colors select-none cursor-pointer ${
                isActive ? 'text-stone-950 font-semibold' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 bg-amber-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-stone-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
