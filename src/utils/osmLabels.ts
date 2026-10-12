import type { Locale } from '../types/settings'

interface Label {
  ar: string
  en: string
}

/**
 * تسميات عربية/إنجليزية لقيم وسوم OpenStreetMap الشائعة.
 * لا تُترجم القيم غير المعروفة؛ تُعرض كما هي لتبقى صادقة.
 */
const VALUE_LABELS: Record<string, Label> = {
  cafe: { ar: 'مقهى', en: 'Café' },
  restaurant: { ar: 'مطعم', en: 'Restaurant' },
  fast_food: { ar: 'مطعم سريع', en: 'Fast food' },
  bakery: { ar: 'مخبز', en: 'Bakery' },
  bar: { ar: 'بار', en: 'Bar' },
  pub: { ar: 'حانة', en: 'Pub' },
  ice_cream: { ar: 'آيس كريم', en: 'Ice cream' },
  food_court: { ar: 'منطقة مطاعم', en: 'Food court' },
  pharmacy: { ar: 'صيدلية', en: 'Pharmacy' },
  hospital: { ar: 'مستشفى', en: 'Hospital' },
  clinic: { ar: 'عيادة', en: 'Clinic' },
  doctors: { ar: 'طبيب', en: 'Doctors' },
  dentist: { ar: 'طبيب أسنان', en: 'Dentist' },
  veterinary: { ar: 'بيطري', en: 'Veterinary' },
  fuel: { ar: 'محطة وقود', en: 'Fuel station' },
  charging_station: { ar: 'محطة شحن', en: 'Charging station' },
  bank: { ar: 'مصرف', en: 'Bank' },
  atm: { ar: 'صراف آلي', en: 'ATM' },
  bureau_de_change: { ar: 'صرافة', en: 'Currency exchange' },
  police: { ar: 'مركز شرطة', en: 'Police' },
  fire_station: { ar: 'مطافئ', en: 'Fire station' },
  post_office: { ar: 'مكتب بريد', en: 'Post office' },
  townhall: { ar: 'مبنى بلدية', en: 'Town hall' },
  courthouse: { ar: 'محكمة', en: 'Courthouse' },
  school: { ar: 'مدرسة', en: 'School' },
  university: { ar: 'جامعة', en: 'University' },
  college: { ar: 'كلية', en: 'College' },
  kindergarten: { ar: 'روضة أطفال', en: 'Kindergarten' },
  library: { ar: 'مكتبة', en: 'Library' },
  place_of_worship: { ar: 'دار عبادة', en: 'Place of worship' },
  marketplace: { ar: 'سوق', en: 'Marketplace' },
  supermarket: { ar: 'سوبرماركت', en: 'Supermarket' },
  convenience: { ar: 'بقالة', en: 'Convenience store' },
  mall: { ar: 'مركز تسوق', en: 'Mall' },
  clothes: { ar: 'ملابس', en: 'Clothing' },
  hotel: { ar: 'فندق', en: 'Hotel' },
  motel: { ar: 'موتيل', en: 'Motel' },
  hostel: { ar: 'بيت ضيافة', en: 'Hostel' },
  guest_house: { ar: 'دار ضيافة', en: 'Guest house' },
  museum: { ar: 'متحف', en: 'Museum' },
  attraction: { ar: 'معلم جذب', en: 'Attraction' },
  viewpoint: { ar: 'نقطة مشاهدة', en: 'Viewpoint' },
  monument: { ar: 'نصب تذكاري', en: 'Monument' },
  park: { ar: 'حديقة', en: 'Park' },
  garden: { ar: 'حديقة', en: 'Garden' },
  playground: { ar: 'ملعب أطفال', en: 'Playground' },
  sports_centre: { ar: 'مركز رياضي', en: 'Sports centre' },
  stadium: { ar: 'ملعب', en: 'Stadium' },
  bus_station: { ar: 'موقف باصات', en: 'Bus station' },
  bus_stop: { ar: 'موقف باص', en: 'Bus stop' },
  taxi: { ar: 'موقف تاكسي', en: 'Taxi rank' },
  parking: { ar: 'موقف سيارات', en: 'Parking' },
  fuel_pump: { ar: 'مضخة وقود', en: 'Fuel pump' },
  cinema: { ar: 'سينما', en: 'Cinema' },
  theatre: { ar: 'مسرح', en: 'Theatre' },
  mosque: { ar: 'جامع', en: 'Mosque' },
  church: { ar: 'كنيسة', en: 'Church' },
  city: { ar: 'مدينة', en: 'City' },
  town: { ar: 'بلدة', en: 'Town' },
  village: { ar: 'قرية', en: 'Village' },
  suburb: { ar: 'منطقة', en: 'Suburb' },
  neighbourhood: { ar: 'حي', en: 'Neighbourhood' },
  administrative: { ar: 'منطقة إدارية', en: 'Administrative area' },
  residential: { ar: 'منطقة سكنية', en: 'Residential area' },
  road: { ar: 'طريق', en: 'Road' },
  primary: { ar: 'طريق رئيسي', en: 'Primary road' },
  secondary: { ar: 'طريق ثانوي', en: 'Secondary road' },
  tertiary: { ar: 'طريق فرعي', en: 'Tertiary road' },
  motorway: { ar: 'طريق سريع', en: 'Motorway' },
  trunk: { ar: 'طريق رئيسي', en: 'Trunk road' },
  footway: { ar: 'ممر مشي', en: 'Footway' },
  house: { ar: 'مبنى', en: 'Building' },
  yes: { ar: 'مبنى', en: 'Building' },
}

/**
 * يحوّل وسم OSM خاماً (مثل `amenity=cafe`) إلى تسمية مقروءة.
 * يعيد الوسم الخام عند عدم معرفته بدل اختراع تسمية.
 */
export function describeOsmCategory(raw: string | undefined, locale: Locale): string | undefined {
  if (!raw) return undefined
  const equalityIndex = raw.indexOf('=')
  const value = equalityIndex >= 0 ? raw.slice(equalityIndex + 1) : raw
  const label = VALUE_LABELS[value]
  if (label) return label[locale]
  return raw.replace('=', ' / ')
}
