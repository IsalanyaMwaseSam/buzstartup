export interface RegionInfo {
  code: string;
  name: string;
  phonePrefix: string;
  currencyCode: string;
  currencySymbol: string;
}

export const ALL_REGIONS: RegionInfo[] = [
  // Africa
  { code: 'KE', name: 'Kenya', phonePrefix: '+254', currencyCode: 'KES', currencySymbol: 'KSh' },
  { code: 'NG', name: 'Nigeria', phonePrefix: '+234', currencyCode: 'NGN', currencySymbol: '₦' },
  { code: 'ZA', name: 'South Africa', phonePrefix: '+27', currencyCode: 'ZAR', currencySymbol: 'R' },
  { code: 'GH', name: 'Ghana', phonePrefix: '+233', currencyCode: 'GHS', currencySymbol: 'GH₵' },
  { code: 'UG', name: 'Uganda', phonePrefix: '+256', currencyCode: 'UGX', currencySymbol: 'USh' },
  { code: 'TZ', name: 'Tanzania', phonePrefix: '+255', currencyCode: 'TZS', currencySymbol: 'TSh' },
  { code: 'RW', name: 'Rwanda', phonePrefix: '+250', currencyCode: 'RWF', currencySymbol: 'FRw' },
  { code: 'ET', name: 'Ethiopia', phonePrefix: '+251', currencyCode: 'ETB', currencySymbol: 'Br' },
  { code: 'EG', name: 'Egypt', phonePrefix: '+20', currencyCode: 'EGP', currencySymbol: 'E£' },
  { code: 'MA', name: 'Morocco', phonePrefix: '+212', currencyCode: 'MAD', currencySymbol: 'DH' },
  { code: 'ZM', name: 'Zambia', phonePrefix: '+260', currencyCode: 'ZMW', currencySymbol: 'ZK' },
  { code: 'ZW', name: 'Zimbabwe', phonePrefix: '+263', currencyCode: 'USD', currencySymbol: '$' },
  { code: 'BW', name: 'Botswana', phonePrefix: '+267', currencyCode: 'BWP', currencySymbol: 'P' },
  { code: 'NA', name: 'Namibia', phonePrefix: '+264', currencyCode: 'NAD', currencySymbol: 'N$' },
  { code: 'SN', name: 'Senegal', phonePrefix: '+221', currencyCode: 'XOF', currencySymbol: 'CFA' },
  { code: 'CI', name: 'Ivory Coast', phonePrefix: '+225', currencyCode: 'XOF', currencySymbol: 'CFA' },
  { code: 'CM', name: 'Cameroon', phonePrefix: '+237', currencyCode: 'XAF', currencySymbol: 'FCFA' },
  { code: 'MU', name: 'Mauritius', phonePrefix: '+230', currencyCode: 'MUR', currencySymbol: 'Rs' },

  // Americas
  { code: 'US', name: 'United States', phonePrefix: '+1', currencyCode: 'USD', currencySymbol: '$' },
  { code: 'CA', name: 'Canada', phonePrefix: '+1', currencyCode: 'CAD', currencySymbol: 'CA$' },
  { code: 'MX', name: 'Mexico', phonePrefix: '+52', currencyCode: 'MXN', currencySymbol: 'MX$' },
  { code: 'BR', name: 'Brazil', phonePrefix: '+55', currencyCode: 'BRL', currencySymbol: 'R$' },
  { code: 'AR', name: 'Argentina', phonePrefix: '+54', currencyCode: 'ARS', currencySymbol: 'AR$' },
  { code: 'CO', name: 'Colombia', phonePrefix: '+57', currencyCode: 'COP', currencySymbol: 'COL$' },
  { code: 'CL', name: 'Chile', phonePrefix: '+56', currencyCode: 'CLP', currencySymbol: 'CLP$' },
  { code: 'PE', name: 'Peru', phonePrefix: '+51', currencyCode: 'PEN', currencySymbol: 'S/' },
  { code: 'JM', name: 'Jamaica', phonePrefix: '+1876', currencyCode: 'JMD', currencySymbol: 'J$' },
  { code: 'TT', name: 'Trinidad and Tobago', phonePrefix: '+1868', currencyCode: 'TTD', currencySymbol: 'TT$' },

  // Europe
  { code: 'GB', name: 'United Kingdom', phonePrefix: '+44', currencyCode: 'GBP', currencySymbol: '£' },
  { code: 'DE', name: 'Germany', phonePrefix: '+49', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'FR', name: 'France', phonePrefix: '+33', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'IT', name: 'Italy', phonePrefix: '+39', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'ES', name: 'Spain', phonePrefix: '+34', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'NL', name: 'Netherlands', phonePrefix: '+31', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'BE', name: 'Belgium', phonePrefix: '+32', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'CH', name: 'Switzerland', phonePrefix: '+41', currencyCode: 'CHF', currencySymbol: 'CHF' },
  { code: 'SE', name: 'Sweden', phonePrefix: '+46', currencyCode: 'SEK', currencySymbol: 'kr' },
  { code: 'NO', name: 'Norway', phonePrefix: '+47', currencyCode: 'NOK', currencySymbol: 'kr' },
  { code: 'DK', name: 'Denmark', phonePrefix: '+45', currencyCode: 'DKK', currencySymbol: 'kr' },
  { code: 'IE', name: 'Ireland', phonePrefix: '+353', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'PL', name: 'Poland', phonePrefix: '+48', currencyCode: 'PLN', currencySymbol: 'zł' },
  { code: 'PT', name: 'Portugal', phonePrefix: '+351', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'AT', name: 'Austria', phonePrefix: '+43', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'GR', name: 'Greece', phonePrefix: '+30', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'FI', name: 'Finland', phonePrefix: '+358', currencyCode: 'EUR', currencySymbol: '€' },
  { code: 'TR', name: 'Turkey', phonePrefix: '+90', currencyCode: 'TRY', currencySymbol: '₺' },

  // Middle East & Asia
  { code: 'AE', name: 'United Arab Emirates', phonePrefix: '+971', currencyCode: 'AED', currencySymbol: 'AED' },
  { code: 'SA', name: 'Saudi Arabia', phonePrefix: '+966', currencyCode: 'SAR', currencySymbol: 'SAR' },
  { code: 'QA', name: 'Qatar', phonePrefix: '+974', currencyCode: 'QAR', currencySymbol: 'QAR' },
  { code: 'KW', name: 'Kuwait', phonePrefix: '+965', currencyCode: 'KWD', currencySymbol: 'KD' },
  { code: 'IN', name: 'India', phonePrefix: '+91', currencyCode: 'INR', currencySymbol: '₹' },
  { code: 'PK', name: 'Pakistan', phonePrefix: '+92', currencyCode: 'PKR', currencySymbol: 'Rs' },
  { code: 'BD', name: 'Bangladesh', phonePrefix: '+880', currencyCode: 'BDT', currencySymbol: '৳' },
  { code: 'SG', name: 'Singapore', phonePrefix: '+65', currencyCode: 'SGD', currencySymbol: 'S$' },
  { code: 'MY', name: 'Malaysia', phonePrefix: '+60', currencyCode: 'MYR', currencySymbol: 'RM' },
  { code: 'ID', name: 'Indonesia', phonePrefix: '+62', currencyCode: 'IDR', currencySymbol: 'Rp' },
  { code: 'PH', name: 'Philippines', phonePrefix: '+63', currencyCode: 'PHP', currencySymbol: '₱' },
  { code: 'VN', name: 'Vietnam', phonePrefix: '+84', currencyCode: 'VND', currencySymbol: '₫' },
  { code: 'TH', name: 'Thailand', phonePrefix: '+66', currencyCode: 'THB', currencySymbol: '฿' },
  { code: 'JP', name: 'Japan', phonePrefix: '+81', currencyCode: 'JPY', currencySymbol: '¥' },
  { code: 'KR', name: 'South Korea', phonePrefix: '+82', currencyCode: 'KRW', currencySymbol: '₩' },
  { code: 'CN', name: 'China', phonePrefix: '+86', currencyCode: 'CNY', currencySymbol: '¥' },
  { code: 'HK', name: 'Hong Kong', phonePrefix: '+852', currencyCode: 'HKD', currencySymbol: 'HK$' },

  // Oceania
  { code: 'AU', name: 'Australia', phonePrefix: '+61', currencyCode: 'AUD', currencySymbol: 'AU$' },
  { code: 'NZ', name: 'New Zealand', phonePrefix: '+64', currencyCode: 'NZD', currencySymbol: 'NZ$' },
  { code: 'FJ', name: 'Fiji', phonePrefix: '+679', currencyCode: 'FJD', currencySymbol: 'FJ$' },
];

export const formatMoney = (amount: number, currencySymbol: string): string => {
  const formattedNumber = Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencySymbol}${formattedNumber}`;
};
