import type { Place } from '../../types/place'

/**
 * بيانات تجريبية توضيحية فقط — لا تمثّل أماكن حقيقية.
 * تُستخدم فقط عند تعيين VITE_ENABLE_DEMO_DATA=true، وتظهر دائماً بوسم «بيانات تجريبية».
 */
export const DEMO_PLACES: Place[] = [
  {
    id: 'demo:placeholder-1',
    name: 'مكان تجريبي (بيانات للعرض)',
    address: 'موقع توضيحي وليس مكاناً حقيقياً',
    rawCategory: 'amenity=cafe',
    location: { lat: 33.3128, lng: 44.3615 },
    source: 'demo',
    demo: true,
  },
  {
    id: 'demo:placeholder-2',
    name: 'نقطة تجريبية للعرض',
    address: 'موقع توضيحي وليس مكاناً حقيقياً',
    rawCategory: 'amenity=restaurant',
    location: { lat: 33.3055, lng: 44.3731 },
    source: 'demo',
    demo: true,
  },
]
