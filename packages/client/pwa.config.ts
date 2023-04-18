import { VitePWA } from 'vite-plugin-pwa'

import manifest from './manifest.default.json'
import packageJson from './package.json'

/**
 * Creates a new VitePWA instance.
 * @param {VitePWAConfig} config - Configuration object for VitePWA plugin.
 * @returns {VitePlugin} - A Vite plugin.
 */
const PWA = (clientSetting) =>
  VitePWA({
    manifest: {
      ...manifest,
      name: clientSetting?.title || 'Ethereal Engine',
      description: clientSetting?.siteDescription || 'Connected Worlds for Everyone',
      short_name: clientSetting?.shortName || 'EE',
      theme_color: clientSetting?.themeColor || '#ffffff',
      background_color: clientSetting?.backgroundColor || '#000000'
    },
    strategies: 'generateSW',
    mode: process.env.APP_ENV === 'development' ? 'development' : 'production',
    scope: './',
    registerType: 'autoUpdate',
    injectRegister: 'inline',
    devOptions: {
      enabled: process.env.APP_ENV === 'development',
      navigateFallback: '/index.html'
      // navigateFallbackAllowlist: [/^\/.*/, /^\/*/]
    },
    workbox: {
      navigateFallback: '/index.html',
      // navigateFallbackAllowlist: [/^\/.*/, /^\/*/],
      swDest: 'public/sw.js',
      globDirectory: './dist',
      globPatterns: [
        '**/*.{br,wasm,js,css,html,png,svg,ico,txt,xml,json,woff2,woff,ttf,eot,map}',
        '**/*.{png,br,jpg,glb,wasm,map,ttf,svg,mp3,ico,js,html,css,webmanifest,txt,xml}'
      ],
      additionalManifestEntries: [
        { url: '/manifest.webmanifest', revision: packageJson.version },
        { url: '/sw.js', revision: packageJson.version },
        { url: '/index.html', revision: packageJson.version }
      ],
      cleanupOutdatedCaches: true,
      maximumFileSizeToCacheInBytes: 1000 * 1000 * 100,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    }
  })

export default PWA
