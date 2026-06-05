import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OmniVault - Personal Finance PWA',
    short_name: 'OmniVault',
    description: 'Your wealth. Every source. One vault.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#003300',
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
