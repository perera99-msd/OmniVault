import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tria — Wealth, Income, Expenses',
    short_name: 'Tria',
    description: 'The next generation of asset tracking and personal wealth intelligence.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    prefer_related_applications: false,
    background_color: '#121412',
    theme_color: '#121412',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
