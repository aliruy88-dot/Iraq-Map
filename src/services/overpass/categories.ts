export interface CategoryDefinition {
  id: string
  labelAr: string
  labelEn: string
  /** اسم أيقونة Material Symbols. */
  icon: string
  /** مقطع فلترة Overpass يُلحق بـ nwr(around...). */
  filter: string
}

export const CATEGORIES: CategoryDefinition[] = [
  { id: 'cafe', labelAr: 'مقاهي', labelEn: 'Cafés', icon: 'local_cafe', filter: '["amenity"="cafe"]' },
  { id: 'restaurant', labelAr: 'مطاعم', labelEn: 'Restaurants', icon: 'restaurant', filter: '["amenity"~"^(restaurant|fast_food)$"]' },
  { id: 'mosque', labelAr: 'مساجد', labelEn: 'Mosques', icon: 'mosque', filter: '["amenity"="place_of_worship"]["religion"="muslim"]' },
  { id: 'fuel', labelAr: 'وقود', labelEn: 'Fuel', icon: 'local_gas_station', filter: '["amenity"="fuel"]' },
  { id: 'pharmacy', labelAr: 'صيدليات', labelEn: 'Pharmacies', icon: 'local_pharmacy', filter: '["amenity"="pharmacy"]' },
  { id: 'hospital', labelAr: 'مستشفيات', labelEn: 'Hospitals', icon: 'local_hospital', filter: '["amenity"~"^(hospital|clinic)$"]' },
  { id: 'bank', labelAr: 'مصارف', labelEn: 'Banks', icon: 'account_balance', filter: '["amenity"~"^(bank|atm)$"]' },
  { id: 'market', labelAr: 'أسواق', labelEn: 'Markets', icon: 'storefront', filter: '["shop"~"^(supermarket|convenience|mall)$"]' },
  { id: 'hotel', labelAr: 'فنادق', labelEn: 'Hotels', icon: 'hotel', filter: '["tourism"~"^(hotel|guest_house|hostel|motel)$"]' },
  { id: 'school', labelAr: 'مدارس', labelEn: 'Schools', icon: 'school', filter: '["amenity"~"^(school|college|university|kindergarten)$"]' },
  { id: 'park', labelAr: 'حدائق', labelEn: 'Parks', icon: 'park', filter: '["leisure"~"^(park|garden)$"]' },
  { id: 'police', labelAr: 'شرطة', labelEn: 'Police', icon: 'local_police', filter: '["amenity"="police"]' },
]

export function findCategory(id: string): CategoryDefinition | undefined {
  return CATEGORIES.find((category) => category.id === id)
}
