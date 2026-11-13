import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Smartphone,
  Square,
  LayoutTemplate,
  FileText,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MessageSquare,
  Check,
  Eye,
  EyeOff,
  Share2,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import type { BusinessProfile, Customer } from '../types';

interface PromotionsViewProps {
  profile: BusinessProfile;
  customers?: Customer[];
}

type PosterFormat = 'story' | 'square' | 'banner' | 'flyer';
type FontFamily = 'sans' | 'serif' | 'display' | 'mono';

export const PromotionsView: React.FC<PromotionsViewProps> = ({ profile, customers = [] }) => {
  // Format & Layout
  const [format, setFormat] = useState<PosterFormat>('story');
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [headlineSize, setHeadlineSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');

  // Custom Colors
  const [bgColor, setBgColor] = useState('#1c1917'); // Default dark obsidian
  const [textColor, setTextColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#10b981'); // Emerald green accent
  const [badgeBgColor, setBadgeBgColor] = useState('#292524');

  // Content
  const [headline, setHeadline] = useState('Weekend Special Offer');
  const [subtitle, setSubtitle] = useState('Handcrafted essentials prepared in small batches.');
  const [badgeText, setBadgeText] = useState('Limited Release');
  const [priceOffer, setPriceOffer] = useState(`${profile.currency} 50,000`);
  const [ctaText, setCtaText] = useState(`WhatsApp ${profile.phonePrefix} ${profile.phone} to order`);

  // Element Visibility Toggles
  const [showBadge, setShowBadge] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showCta, setShowCta] = useState(true);
  const [showContact, setShowContact] = useState(true);

  // Custom Product Image
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [imageStyle, setImageStyle] = useState<'card' | 'background'>('card');
  const [imageOpacity, setImageOpacity] = useState(30);

  // Export & Sharing State
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Client Selection for Direct WhatsApp Sharing
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [customPhone, setCustomPhone] = useState('');

  const posterCanvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset Palettes
  const colorPresets = [
    { name: 'Obsidian Ink', bg: '#1c1917', text: '#ffffff', accent: '#34d399', badge: '#292524' },
    { name: 'Deep Emerald', bg: '#064e3b', text: '#ffffff', accent: '#6ee7b7', badge: '#065f46' },
    { name: 'Royal Navy', bg: '#0f172a', text: '#ffffff', accent: '#38bdf8', badge: '#1e293b' },
    { name: 'Warm Terracotta', bg: '#7c2d12', text: '#ffffff', accent: '#fdba74', badge: '#9a3412' },
    { name: 'Clean White', bg: '#ffffff', text: '#1c1917', accent: '#059669', badge: '#f5f5f4' },
    { name: 'Sand Beige', bg: '#f5f5f0', text: '#292524', accent: '#b45309', badge: '#e7e5e4' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
    }
  };

  const handleRemoveImage = () => {
    if (customImage) {
      URL.revokeObjectURL(customImage);
      setCustomImage(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Font family styles
  const getFontFamilyStyle = () => {
    switch (fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'display':
        return 'font-sans font-black tracking-tight';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  };

  // Headline size class
  const getHeadlineSizeClass = () => {
    switch (headlineSize) {
      case 'sm':
        return 'text-lg sm:text-xl font-bold';
      case 'md':
        return 'text-xl sm:text-2xl font-extrabold';
      case 'xl':
        return 'text-3xl sm:text-4xl lg:text-5xl font-black leading-tight';
      default:
        return 'text-2xl sm:text-3xl font-extrabold leading-tight';
    }
  };

  // Format aspect ratio class
  const getFormatClass = () => {
    switch (format) {
      case 'square':
        return 'aspect-square max-w-sm';
      case 'banner':
        return 'aspect-16/9 max-w-lg';
      case 'flyer':
        return 'aspect-3/4 max-w-sm';
      default:
        return 'aspect-9/16 max-w-xs';
    }
  };

  // Generate high-resolution poster PNG blob
  const generatePosterBlob = async (): Promise<Blob | null> => {
    if (!posterCanvasRef.current) return null;
    try {
      const canvas = await html2canvas(posterCanvasRef.current, {
        scale: 2,
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

  // Download high-resolution poster PNG
  const handleDownloadPoster = async () => {
    setIsExporting(true);
    try {
      const blob = await generatePosterBlob();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${headline.replace(/[^a-zA-Z0-9]/g, '_')}_poster.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch {
      // Non-blocking
    } finally {
      setIsExporting(false);
    }
  };

  // WhatsApp status sharing
  const handleShareStatus = async () => {
    setIsExporting(true);
    const blob = await generatePosterBlob();

    if (blob) {
      // 1. Download file so merchant has the image file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${headline.replace(/[^a-zA-Z0-9]/g, '_')}_poster.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 2. Copy image to clipboard for instant pasting
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        } catch {
          // continue
        }
      }

      // 3. Try native file share (attaches directly on mobile phones)
      if (navigator.canShare) {
        try {
          const file = new File([blob], `${headline.replace(/[^a-zA-Z0-9]/g, '_')}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: headline,
              text: `${headline.toUpperCase()}\n\n${subtitle}\n\nOffer: ${priceOffer}\n\n${ctaText}`,
              files: [file],
            });
            setIsExporting(false);
            return;
          }
        } catch {
          // continue
        }
      }
    }

    setIsExporting(false);
    setShareFeedback('Poster copied to clipboard & downloaded! In WhatsApp, select Status and paste or upload your poster.');
    setTimeout(() => setShareFeedback(null), 6000);

    const text = encodeURIComponent(
      `*${headline.toUpperCase()}*\n\n${subtitle}\n\n🏷️ Offer: *${priceOffer}*\n\n${ctaText}\n\nStore: ${profile.businessName}\nPhone: ${profile.phonePrefix} ${profile.phone}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Send Poster directly to a chosen Client on WhatsApp
  const handleShareToClient = async () => {
    const targetCustomer = customers.find((c) => c.id === selectedCustomerId);
    const targetPhone = targetCustomer ? targetCustomer.phone : customPhone;
    const targetName = targetCustomer ? targetCustomer.name : 'there';

    if (!targetPhone) {
      alert('Please select a client or enter a phone number to send to.');
      return;
    }

    setIsExporting(true);
    const blob = await generatePosterBlob();

    if (blob) {
      // 1. Download file to merchant device
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${headline.replace(/[^a-zA-Z0-9]/g, '_')}_poster.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 2. Copy image to clipboard for instant pasting
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        } catch {
          // continue
        }
      }

      // 3. Try native file share (if supported)
      if (navigator.canShare) {
        try {
          const file = new File([blob], `${headline.replace(/[^a-zA-Z0-9]/g, '_')}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: headline,
              text: `Hello ${targetName}! Here is our latest special offer from ${profile.businessName}:\n\n*${headline}*\n${subtitle}\n\nOffer: *${priceOffer}*\n\n${ctaText}`,
              files: [file],
            });
            setIsExporting(false);
            return;
          }
        } catch {
          // continue
        }
      }
    }

    setIsExporting(false);
    setShareFeedback(`Poster copied to clipboard & downloaded! Opening chat with ${targetName}. Press Ctrl+V to attach the image alongside.`);
    setTimeout(() => setShareFeedback(null), 6000);

    const message =
      `Hello ${targetName}! Check out our latest offer from ${profile.businessName}:\n\n` +
      `*${headline}*\n` +
      `${subtitle}\n\n` +
      `Special Offer: *${priceOffer}*\n\n` +
      `${ctaText}\n\n` +
      `Direct orders: ${profile.phonePrefix} ${profile.phone}`;

    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-28">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Promotion & Banner Design Studio
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manually design banners, flyers, and social posters with custom images, fonts, and colors.
          </p>
        </div>

        <button
          onClick={handleDownloadPoster}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          {downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
          <span>{downloadSuccess ? 'Poster Saved (PNG)' : isExporting ? 'Generating...' : 'Download Poster (PNG)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Comprehensive Design Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Format & Dimensions */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-3">
            <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              1. Choose Format Ratio
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'story' as PosterFormat, label: 'Story / Status', ratio: '9:16', icon: Smartphone },
                { id: 'square' as PosterFormat, label: 'Square Feed', ratio: '1:1', icon: Square },
                { id: 'banner' as PosterFormat, label: 'Web Banner', ratio: '16:9', icon: LayoutTemplate },
                { id: 'flyer' as PosterFormat, label: 'Counter Flyer', ratio: '3:4', icon: FileText },
              ].map((f) => {
                const Icon = f.icon;
                const isSelected = format === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                        : 'bg-stone-50/60 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <div className="text-xs font-bold">{f.label}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                      {f.ratio}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Upload & Background Style */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                2. Product Image
              </span>
              {customImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="manual-poster-image"
              />
              <label
                htmlFor="manual-poster-image"
                className="flex items-center space-x-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-stone-600" />
                <span>{customImage ? 'Change Photo' : 'Upload Merchandise Image'}</span>
              </label>

              {customImage && (
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-semibold text-stone-600">Style:</span>
                  <button
                    type="button"
                    onClick={() => setImageStyle('card')}
                    className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer ${
                      imageStyle === 'card' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageStyle('background')}
                    className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer ${
                      imageStyle === 'background' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    Backdrop Overlay
                  </button>
                </div>
              )}
            </div>

            {customImage && imageStyle === 'background' && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Backdrop Opacity ({imageOpacity}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={imageOpacity}
                  onChange={(e) => setImageOpacity(parseInt(e.target.value))}
                  className="w-full accent-stone-900 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Typography & Alignment */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
            <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              3. Typography & Alignment
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Font Style</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg font-medium cursor-pointer"
                >
                  <option value="sans">Modern Sans (Plus Jakarta)</option>
                  <option value="serif">Classic Luxury (Serif)</option>
                  <option value="display">Heavy Bold Impact</option>
                  <option value="mono">Technical (JetBrains Mono)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Headline Size</label>
                <select
                  value={headlineSize}
                  onChange={(e) => setHeadlineSize(e.target.value as typeof headlineSize)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg font-medium cursor-pointer"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Text Alignment</label>
                <div className="flex space-x-1">
                  {[
                    { id: 'left' as const, icon: AlignLeft },
                    { id: 'center' as const, icon: AlignCenter },
                    { id: 'right' as const, icon: AlignRight },
                  ].map((a) => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setTextAlign(a.id)}
                        className={`flex-1 flex items-center justify-center p-2 rounded-lg border cursor-pointer ${
                          textAlign === a.id
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Color Palettes & Custom Pickers */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
            <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              4. Colors & Style
            </span>

            {/* Quick Palettes */}
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setBgColor(p.bg);
                    setTextColor(p.text);
                    setAccentColor(p.accent);
                    setBadgeBgColor(p.badge);
                  }}
                  className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 flex items-center space-x-2 cursor-pointer"
                >
                  <span className="w-3 h-3 rounded-full border border-stone-400" style={{ backgroundColor: p.bg }} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            {/* Manual Color Pickers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Background</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold">{bgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Main Text</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold">{textColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Price / Accent</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold">{accentColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Badge Tag</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={badgeBgColor}
                    onChange={(e) => setBadgeBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold">{badgeBgColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copy Inputs & Element Visibility */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
            <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              5. Content & Toggles
            </span>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Description / Subtitle</label>
              <textarea
                rows={2}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50/50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-700">Badge Tag</label>
                  <button
                    type="button"
                    onClick={() => setShowBadge(!showBadge)}
                    className="text-xs text-stone-500 hover:text-stone-900 flex items-center space-x-1 cursor-pointer"
                  >
                    {showBadge ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showBadge ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  disabled={!showBadge}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50/50 border border-stone-300 rounded-xl disabled:opacity-40"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-700">Price / Offer Callout</label>
                  <button
                    type="button"
                    onClick={() => setShowPrice(!showPrice)}
                    className="text-xs text-stone-500 hover:text-stone-900 flex items-center space-x-1 cursor-pointer"
                  >
                    {showPrice ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showPrice ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={priceOffer}
                  onChange={(e) => setPriceOffer(e.target.value)}
                  disabled={!showPrice}
                  className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-stone-50/50 border border-stone-300 rounded-xl disabled:opacity-40"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-700">Call to Action</label>
                <button
                  type="button"
                  onClick={() => setShowCta(!showCta)}
                  className="text-xs text-stone-500 hover:text-stone-900 flex items-center space-x-1 cursor-pointer"
                >
                  {showCta ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showCta ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                disabled={!showCta}
                className="w-full px-3.5 py-2 text-sm bg-stone-50/50 border border-stone-300 rounded-xl disabled:opacity-40"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-700">Display Phone & Contact Info</span>
              <button
                type="button"
                onClick={() => setShowContact(!showContact)}
                className="text-xs text-stone-500 hover:text-stone-900 flex items-center space-x-1 cursor-pointer"
              >
                {showContact ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showContact ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Poster Rendering Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-20">
          <div className="flex items-center justify-between w-full max-w-sm mb-3">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Live Banner / Poster
            </span>
            <span className="text-xs font-mono text-stone-600 font-bold uppercase">
              {format}
            </span>
          </div>

          {/* THE BANNER CANVAS TO EXPORT */}
          <div
            ref={posterCanvasRef}
            style={{
              backgroundColor: bgColor,
              color: textColor,
              textAlign: textAlign,
            }}
            className={`w-full ${getFormatClass()} ${getFontFamilyStyle()} rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all border border-stone-800/20`}
          >
            {/* Background Overlay if imageStyle is background */}
            {customImage && imageStyle === 'background' && (
              <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none"
                style={{
                  backgroundImage: `url(${customImage})`,
                  opacity: imageOpacity / 100,
                }}
              />
            )}

            {/* Top Store Header */}
            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-tight block">
                  {profile.businessName}
                </span>
                <span className="text-[10px] opacity-70 block">{profile.ownerName}</span>
              </div>

              {showBadge && (
                <span
                  style={{ backgroundColor: badgeBgColor }}
                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20 shadow-xs"
                >
                  {badgeText}
                </span>
              )}
            </div>

            {/* Product Image Card if imageStyle is card */}
            {customImage && imageStyle === 'card' && (
              <div className="my-3 rounded-xl overflow-hidden max-h-48 w-full border border-white/20 shadow-md relative z-10 bg-black/20">
                <img src={customImage} alt="Product visual" className="w-full h-full object-cover object-center" />
              </div>
            )}

            {/* Middle Main Content */}
            <div className={`my-auto ${customImage && imageStyle === 'card' ? 'py-1' : 'py-4'} relative z-10`}>
              <h3 className={`${getHeadlineSizeClass()} tracking-tight mb-2`}>
                {headline}
              </h3>
              <p className="text-xs opacity-90 leading-relaxed font-normal">
                {subtitle}
              </p>

              {showPrice && (
                <div className="mt-4 pt-3 border-t border-white/15">
                  <span className="text-[10px] uppercase font-mono tracking-wider opacity-70 block">
                    Offer
                  </span>
                  <span
                    style={{ color: accentColor }}
                    className="text-3xl sm:text-4xl font-black tracking-tight font-mono block mt-0.5"
                  >
                    {priceOffer}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Contact & Action */}
            <div className="pt-3 border-t border-white/15 text-xs relative z-10">
              {showCta && <p className="font-bold">{ctaText}</p>}
              {showContact && (
                <p className="text-[11px] opacity-70 mt-0.5 font-mono">
                  Direct Orders: {profile.phonePrefix} {profile.phone}
                </p>
              )}
            </div>
          </div>

          {/* Sharing Feedback Toast / Banner */}
          {shareFeedback && (
            <div className="w-full max-w-sm mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start space-x-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">{shareFeedback}</p>
            </div>
          )}

          {/* Action Toolbar Below Canvas */}
          <div className="w-full max-w-sm mt-5 space-y-3">
            <button
              onClick={handleDownloadPoster}
              disabled={isExporting}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
              <span>{downloadSuccess ? 'Poster Saved (PNG)' : isExporting ? 'Generating...' : 'Download Real Poster Image (PNG)'}</span>
            </button>

            <button
              onClick={handleShareStatus}
              disabled={isExporting}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share Poster to WhatsApp Status</span>
            </button>

            {/* Direct Client Sharing Section */}
            <div className="pt-3 border-t border-stone-200 space-y-2.5">
              <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Send Direct to a Client
              </span>

              <div className="space-y-2">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 cursor-pointer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || 'No phone'})
                    </option>
                  ))}
                  <option value="custom">Other / Custom Phone Number</option>
                </select>

                {selectedCustomerId === 'custom' && (
                  <input
                    type="tel"
                    placeholder="Enter phone with country code e.g. +256790966231"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                  />
                )}

                <button
                  type="button"
                  onClick={handleShareToClient}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send Poster to Client on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
