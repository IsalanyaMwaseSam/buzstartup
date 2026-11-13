import React from 'react';
import {
  Store,
  ArrowRight,
  CheckCircle2,
  Receipt,
  Users,
  Smartphone,
  CreditCard,
  Megaphone,
  Globe,
  ChevronRight,
  LogIn,
} from 'lucide-react';

interface LandingPageViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onEnterDemo: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onGetStarted,
  onSignIn,
  onEnterDemo,
}) => {

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-stone-950 block leading-tight">
                BuzStartup
              </span>
              <span className="text-[11px] text-stone-500 font-medium hidden sm:block">
                Operations Platform for Online & Home Businesses
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onEnterDemo}
              className="text-xs font-semibold px-3 py-2 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer hidden md:inline-flex items-center space-x-1"
            >
              <span>Explore Live Demo</span>
            </button>

            <button
              onClick={onSignIn}
              className="text-xs font-semibold px-3.5 py-2 text-stone-800 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              onClick={onGetStarted}
              className="text-xs font-bold px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Built for Solopreneurs, Home Sellers & Online Brands</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-950 leading-[1.15]">
            Run your startup sales, receipts, and customer connections in one place.
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-600 leading-relaxed font-normal">
            Fast mobile cashiering, instant electronic WhatsApp receipts with real PDF downloads, balance and deposit tracking, client maintenance, and a promotional poster studio.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-7 py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Create Your Free Business Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onEnterDemo}
              className="w-full sm:w-auto px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Try Interactive Live Demo</span>
              <ChevronRight className="w-4 h-4 text-stone-500" />
            </button>
          </div>

          {/* Trust Banner / Key metrics */}
          <div className="pt-8 border-t border-stone-100 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-stone-500">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Works on Smartphones & Laptops</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct WhatsApp Receipts & Clickable Links</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-Currency (USh, KSh, ₦, $, £, €)</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero Complicated Setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-950">
            Everything your online startup needs to close sales and grow.
          </h2>
          <p className="text-sm text-stone-600">
            Say goodbye to disorganized WhatsApp chat orders, lost notes, forgotten balances, and amateur receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Fast Cashier & POS */}
          <div className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-300 hover:shadow-xs transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5 text-stone-800" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Fast Mobile & Laptop Cashier
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Record sales in under 15 seconds. The system automatically computes and displays your <strong>Popular Items</strong> ranked by actual sales so you can tap and bill quickly.
            </p>
          </div>

          {/* Feature 2: Official Receipts & Direct WhatsApp Links */}
          <div className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-300 hover:shadow-xs transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5 text-stone-800" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Verified Digital Receipts
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Generate clean, branded electronic receipts. One tap sends your customer an official receipt link on WhatsApp with verified reference codes, store branding, and direct PDF download.
            </p>
          </div>

          {/* Feature 3: Partial Payments & Demanded Balances */}
          <div className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-300 hover:shadow-xs transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5 text-stone-800" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Deposit & Balance Due Tracking
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              When clients pay a deposit, BuzStartup tracks exactly how much is paid and how much balance is demanded. Record installment payments anytime and send respectful balance reminders on WhatsApp.
            </p>
          </div>

          {/* Feature 4: Client Maintenance CRM */}
          <div className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-300 hover:shadow-xs transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-stone-800" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Customer Retention Directory
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every customer is automatically saved with their lifetime spend, order history, and notes. Re-engage buyers with tailored product check-ins, restock announcements, and appreciation notes.
            </p>
          </div>

          {/* Feature 5: Poster & Banner Studio */}
          <div className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-300 hover:shadow-xs transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5 text-stone-800" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Promotion & Banner Studio
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Design social media flyers, WhatsApp status graphics, and web banners. Upload product photos, choose color themes, adjust typography, and share directly to WhatsApp Status or clients.
            </p>
          </div>

          {/* Feature 6: Multi-Tenant Cloud Storage */}
          <div className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-300 hover:shadow-xs transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5 text-stone-800" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Cloud Persistence & Multi-Currency
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Persistent storage backed by Cloudflare R2 and SQLite. Pre-configured for over 50 countries with local currency formatting, tax reserve buffers, and persistent logo storage.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-stone-100/70 border-y border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-950">
              How business owners get started in 2 minutes
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              No technical expertise, credit card, or lengthy onboarding required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs text-center space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-mono font-bold text-sm mx-auto flex items-center justify-center">
                1
              </div>
              <h4 className="text-sm font-bold text-stone-900">Setup Your Business</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Enter your business name, select your country and currency, and upload your store logo.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs text-center space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-mono font-bold text-sm mx-auto flex items-center justify-center">
                2
              </div>
              <h4 className="text-sm font-bold text-stone-900">Record Sales & Receipts</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Add purchased items, record cash, Mobile Money, or partial deposits, and generate instant receipts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs text-center space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-mono font-bold text-sm mx-auto flex items-center justify-center">
                3
              </div>
              <h4 className="text-sm font-bold text-stone-900">Grow Customer Connections</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Send professional receipt links via WhatsApp, collect remaining balances, and publish promotional banners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demonstration Callout Banner */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="p-8 sm:p-12 bg-stone-900 text-white rounded-3xl shadow-xl space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stone-800 text-stone-200 text-xs font-semibold">
            <span>Ready to see it in action?</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Launch the interactive system now.
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto leading-relaxed">
            Test the point of sale, issue receipts, explore the client directory, and create promotional banners with zero commitment.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onEnterDemo}
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Launch App (Interactive Demo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-stone-900 hover:bg-stone-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <span>Register Your Own Business</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-stone-200 bg-white text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 font-bold text-stone-900">
            <Store className="w-4 h-4" />
            <span>BuzStartup</span>
            <span className="text-stone-400 font-normal">| Small & Online Business Operating System</span>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={onEnterDemo} className="hover:text-stone-900 cursor-pointer">
              Live Demo
            </button>
            <button onClick={onSignIn} className="hover:text-stone-900 cursor-pointer">
              Sign In
            </button>
            <button onClick={onGetStarted} className="hover:text-stone-900 font-bold text-stone-900 cursor-pointer">
              Create Account
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
