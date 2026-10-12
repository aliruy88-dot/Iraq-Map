export interface LatLng {
  lat: number
  lng: number
}

export interface Bounds {
  south: number
  north: number
  west: number
  east: number
}

/** المصادر الحقيقية للبيانات. «demo» مخصّص للبيانات التجريبية الموسومة فقط. */
export type PlaceSource = 'nominatim' | 'photon' | 'overpass' | 'demo'

export interface Place {
  /** معرّف فريد مشتق من المصدر والمعرّف الأصلي. */
  id: string
  name: string
  address?: string
  /** تصنيف مقروء بالعربية إن توفر. */
  categoryLabel?: string
  /** التصنيف الخام كما ورد من المصدر (وسم OSM أو نوع Nominatim). */
  rawCategory?: string
  location: LatLng
  bounds?: Bounds
  /** ساعات العمل الخام كما وردت من المصدر (بدون تفسير). */
  openingHours?: string
  phone?: string
  website?: string
  source: PlaceSource
  /** true عندما يكون السجل بيانات تجريبية وليست مكاناً حقيقياً. */
  demo?: boolean
}


