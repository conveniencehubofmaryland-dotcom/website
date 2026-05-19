import type { MetadataRoute } from 'next'


export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.conveniencehubofmaryland.com'
  return [
    { url: base,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/services`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/book`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/deals`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/reviews`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/contact`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/membership`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/careers`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/about`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
