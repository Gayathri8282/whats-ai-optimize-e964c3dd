export interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', phoneCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', phoneCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', phoneCode: '+1', flag: '🇨🇦' },
  { code: 'IN', name: 'India', phoneCode: '+91', flag: '🇮🇳' },
  { code: 'CN', name: 'China', phoneCode: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', phoneCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', phoneCode: '+82', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', phoneCode: '+65', flag: '🇸🇬' },
  { code: 'AU', name: 'Australia', phoneCode: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', phoneCode: '+64', flag: '🇳🇿' },
  { code: 'DE', name: 'Germany', phoneCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', phoneCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', phoneCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', phoneCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', phoneCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', phoneCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', phoneCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', phoneCode: '+43', flag: '🇦🇹' },
  { code: 'NO', name: 'Norway', phoneCode: '+47', flag: '🇳🇴' },
  { code: 'SE', name: 'Sweden', phoneCode: '+46', flag: '🇸🇪' },
  { code: 'DK', name: 'Denmark', phoneCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', phoneCode: '+358', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', phoneCode: '+48', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', phoneCode: '+420', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', phoneCode: '+36', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', phoneCode: '+40', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', phoneCode: '+359', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatia', phoneCode: '+385', flag: '🇭🇷' },
  { code: 'SI', name: 'Slovenia', phoneCode: '+386', flag: '🇸🇮' },
  { code: 'SK', name: 'Slovakia', phoneCode: '+421', flag: '🇸🇰' },
  { code: 'LT', name: 'Lithuania', phoneCode: '+370', flag: '🇱🇹' },
  { code: 'LV', name: 'Latvia', phoneCode: '+371', flag: '🇱🇻' },
  { code: 'EE', name: 'Estonia', phoneCode: '+372', flag: '🇪🇪' },
  { code: 'GR', name: 'Greece', phoneCode: '+30', flag: '🇬🇷' },
  { code: 'PT', name: 'Portugal', phoneCode: '+351', flag: '🇵🇹' },
  { code: 'IE', name: 'Ireland', phoneCode: '+353', flag: '🇮🇪' },
  { code: 'IS', name: 'Iceland', phoneCode: '+354', flag: '🇮🇸' },
  { code: 'MT', name: 'Malta', phoneCode: '+356', flag: '🇲🇹' },
  { code: 'CY', name: 'Cyprus', phoneCode: '+357', flag: '🇨🇾' },
  { code: 'BR', name: 'Brazil', phoneCode: '+55', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', phoneCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', phoneCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', phoneCode: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', phoneCode: '+51', flag: '🇵🇪' },
  { code: 'UY', name: 'Uruguay', phoneCode: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', phoneCode: '+595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', phoneCode: '+591', flag: '🇧🇴' },
  { code: 'EC', name: 'Ecuador', phoneCode: '+593', flag: '🇪🇨' },
  { code: 'VE', name: 'Venezuela', phoneCode: '+58', flag: '🇻🇪' },
  { code: 'MX', name: 'Mexico', phoneCode: '+52', flag: '🇲🇽' },
  { code: 'RU', name: 'Russia', phoneCode: '+7', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', phoneCode: '+380', flag: '🇺🇦' },
  { code: 'BY', name: 'Belarus', phoneCode: '+375', flag: '🇧🇾' },
  { code: 'MD', name: 'Moldova', phoneCode: '+373', flag: '🇲🇩' },
  { code: 'AM', name: 'Armenia', phoneCode: '+374', flag: '🇦🇲' },
  { code: 'AZ', name: 'Azerbaijan', phoneCode: '+994', flag: '🇦🇿' },
  { code: 'GE', name: 'Georgia', phoneCode: '+995', flag: '🇬🇪' },
  { code: 'KZ', name: 'Kazakhstan', phoneCode: '+7', flag: '🇰🇿' },
  { code: 'UZ', name: 'Uzbekistan', phoneCode: '+998', flag: '🇺🇿' },
  { code: 'KG', name: 'Kyrgyzstan', phoneCode: '+996', flag: '🇰🇬' },
  { code: 'TJ', name: 'Tajikistan', phoneCode: '+992', flag: '🇹🇯' },
  { code: 'TM', name: 'Turkmenistan', phoneCode: '+993', flag: '🇹🇲' },
  { code: 'MN', name: 'Mongolia', phoneCode: '+976', flag: '🇲🇳' },
  { code: 'ID', name: 'Indonesia', phoneCode: '+62', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', phoneCode: '+60', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', phoneCode: '+66', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', phoneCode: '+84', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', phoneCode: '+63', flag: '🇵🇭' },
  { code: 'MM', name: 'Myanmar', phoneCode: '+95', flag: '🇲🇲' },
  { code: 'KH', name: 'Cambodia', phoneCode: '+855', flag: '🇰🇭' },
  { code: 'LA', name: 'Laos', phoneCode: '+856', flag: '🇱🇦' },
  { code: 'BN', name: 'Brunei', phoneCode: '+673', flag: '🇧🇳' },
  { code: 'TL', name: 'East Timor', phoneCode: '+670', flag: '🇹🇱' },
  { code: 'ZA', name: 'South Africa', phoneCode: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', phoneCode: '+20', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', phoneCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', phoneCode: '+254', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', phoneCode: '+233', flag: '🇬🇭' },
  { code: 'MA', name: 'Morocco', phoneCode: '+212', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia', phoneCode: '+216', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algeria', phoneCode: '+213', flag: '🇩🇿' },
  { code: 'LY', name: 'Libya', phoneCode: '+218', flag: '🇱🇾' },
  { code: 'SD', name: 'Sudan', phoneCode: '+249', flag: '🇸🇩' },
  { code: 'ET', name: 'Ethiopia', phoneCode: '+251', flag: '🇪🇹' },
  { code: 'UG', name: 'Uganda', phoneCode: '+256', flag: '🇺🇬' },
  { code: 'TZ', name: 'Tanzania', phoneCode: '+255', flag: '🇹🇿' },
  { code: 'MW', name: 'Malawi', phoneCode: '+265', flag: '🇲🇼' },
  { code: 'ZM', name: 'Zambia', phoneCode: '+260', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', phoneCode: '+263', flag: '🇿🇼' },
  { code: 'BW', name: 'Botswana', phoneCode: '+267', flag: '🇧🇼' },
  { code: 'NA', name: 'Namibia', phoneCode: '+264', flag: '🇳🇦' },
  { code: 'AE', name: 'United Arab Emirates', phoneCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', phoneCode: '+966', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', phoneCode: '+974', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', phoneCode: '+965', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', phoneCode: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', phoneCode: '+968', flag: '🇴🇲' },
  { code: 'JO', name: 'Jordan', phoneCode: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', phoneCode: '+961', flag: '🇱🇧' },
  { code: 'SY', name: 'Syria', phoneCode: '+963', flag: '🇸🇾' },
  { code: 'IQ', name: 'Iraq', phoneCode: '+964', flag: '🇮🇶' },
  { code: 'IR', name: 'Iran', phoneCode: '+98', flag: '🇮🇷' },
  { code: 'AF', name: 'Afghanistan', phoneCode: '+93', flag: '🇦🇫' },
  { code: 'PK', name: 'Pakistan', phoneCode: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', phoneCode: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', phoneCode: '+94', flag: '🇱🇰' },
  { code: 'MV', name: 'Maldives', phoneCode: '+960', flag: '🇲🇻' },
  { code: 'NP', name: 'Nepal', phoneCode: '+977', flag: '🇳🇵' },
  { code: 'BT', name: 'Bhutan', phoneCode: '+975', flag: '🇧🇹' },
  { code: 'IL', name: 'Israel', phoneCode: '+972', flag: '🇮🇱' },
  { code: 'PS', name: 'Palestine', phoneCode: '+970', flag: '🇵🇸' },
  { code: 'TR', name: 'Turkey', phoneCode: '+90', flag: '🇹🇷' },
];

export const POPULAR_CITIES: Record<string, string[]> = {
  'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
  'GB': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh'],
  'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'],
  'CN': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan', 'Xian', 'Suzhou', 'Chongqing'],
  'JP': ['Tokyo', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama', 'Hiroshima'],
  'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Dusseldorf', 'Dortmund', 'Essen', 'Leipzig'],
  'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
  'BR': ['São Paulo', 'Rio de Janeiro', 'Brasilia', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
  'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'],
  'CA': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener']
};

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(country => country.code === code);
}

export function getCountryByPhoneCode(phoneCode: string): Country | undefined {
  return COUNTRIES.find(country => country.phoneCode === phoneCode);
}

export function formatPhoneNumber(phone: string, countryCode: string): string {
  const country = getCountryByCode(countryCode);
  if (!country) return phone;
  
  // Clean the phone number - remove all non-digits
  let cleanPhone = phone.replace(/\D/g, '');
  
  // If phone already starts with country code digits, remove them
  const countryCodeDigits = country.phoneCode.substring(1); // Remove the + sign
  if (cleanPhone.startsWith(countryCodeDigits)) {
    cleanPhone = cleanPhone.substring(countryCodeDigits.length);
  }
  
  // Add the country code
  return `${country.phoneCode}${cleanPhone}`;
}

export function validateInternationalPhone(phone: string): boolean {
  // E.164 format validation: + followed by 1-3 digit country code, then 4-15 digits
  // More flexible to account for different country code lengths
  const e164Regex = /^\+[1-9]\d{4,14}$/;
  return e164Regex.test(phone) && phone.length >= 8 && phone.length <= 16;
}

export function parsePhoneNumber(phone: string): { countryCode: string; number: string } | null {
  // Try to extract country code from phone number
  for (const country of COUNTRIES) {
    if (phone.startsWith(country.phoneCode)) {
      return {
        countryCode: country.code,
        number: phone.substring(country.phoneCode.length)
      };
    }
  }
  return null;
}