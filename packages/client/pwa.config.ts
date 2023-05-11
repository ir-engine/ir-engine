import { VitePWA } from 'vite-plugin-pwa'

import manifest from './manifest.default.json'
import packageJson from './package.json'

/**
 * Creates a new instance of the VitePWA plugin for Vite.js.
 * @param {Object} clientSetting - An object containing custom settings for the PWA.
 * @param {string} clientSetting.title - The title of the PWA.
 * @param {string} clientSetting.siteDescription - The description of the PWA.
 * @param {string} clientSetting.shortName - The short name of the PWA.
 * @param {string} clientSetting.themeColor - The theme color of the PWA.
 * @param {string} clientSetting.backgroundColor - The background color of the PWA.
 * @returns {Object} - A Vite plugin object.
 */
const PWA = (clientSetting) =>
  VitePWA({
    srcDir: 'public',
    filename: 'service-worker.js',
    // Merge custom client settings with default values from manifest.default.json
    manifest: {
      ...manifest,
      name: clientSetting?.title || 'Ethereal Engine',
      description: clientSetting?.siteDescription || 'Connected Worlds for Everyone',
      short_name: clientSetting?.shortName || 'EE',
      theme_color: clientSetting?.themeColor || '#ffffff',
      background_color: clientSetting?.backgroundColor || '#000000',
      start_url: `/`,
      scope: `./`,
      id: `ETHEREAL_ENGINE`
    },
    // Use generateSW when building
    strategies: process.env.GEN_SW === 'true' ? 'generateSW' : 'injectManifest',
    // Set mode to development or production depending on environment variable
    mode: process.env.APP_ENV === 'development' ? 'development' : 'production',
    injectRegister: null,
    includeManifestIcons: true,
    devOptions: {
      disableRuntimeConfig: false,
      // Enable dev options only during development
      enabled: true, // process.env.APP_ENV === 'development',
      // Navigate to index.html for all 404 errors during development
      navigateFallback: '/index.html',
      // Allowlist all paths for navigateFallback during development
      navigateFallbackAllowlist: [
        // allow all files for local vite dev server
        /^\/.*/
      ]
    },
    workbox: {
      clientsClaim: true,
      skipWaiting: true,
      // Set the path for the service worker file
      swDest: process.env.GEN_SW === 'true' ? 'public/service-worker.js' : 'src/service-worker.js',
      // Navigate to index.html for all 404 errors during production
      navigateFallback: '/index.html',
      // Allowlist all paths for navigateFallback during production
      navigateFallbackAllowlist: [
        // allow node_modules/.vite cache
        /^\/node_modules\/\.vite\/.*/,
        // @vite/client
        /^\/@vite\/client\/.*/,
        // src/main.tsx
        /^\/src\/main\.tsx/,
        // @vite-plugin-pwa
        /^\/@vite-plugin-pwa\/.*/,
        // allow all files for production build
        /^\/.*/,
        // location route
        /^\/location?.*/,
        // editor route
        /^\/editor?.*/,
        // sutdio route
        /^\/studio?.*/,
        // admin route
        /^\/admin?.*/,
        // auth route
        /^\/auth?.*/,
        // api route
        /^\/api-?.*/,
        // resources route
        /^\/resources-?.*/,
        // instanceserver route
        /^\/instanceserver-?.*/
      ],
      // Set the glob directory and patterns for the cache
      globDirectory: './public',
      globPatterns: [
        // fonts
        '**/*.{woff2,woff,ttf,eot}',
        // images
        '**/*.{png,jpg,jpeg,gif,svg,ico}',
        // media
        '**/*.{mp3,mp4,webm}',
        // code
        '**/*.{js, css, html}',
        // webmanifest
        '**/*.webmanifest',
        // docs
        '**/*.{txt,xml,json,pdf}',
        // 3d objects
        '**/*.{gltf,glb,bin,mtl}',
        // compressed
        '**/*.{br, gzip, zip,rar,7z}',
        // webassembly
        '**/*.{wasm}',
        // ktx2
        '**/*.{ktx2}'
      ],
      // Set additional manifest entries for the cache
      additionalManifestEntries: [
        { url: '/index.html', revision: null },
        { url: '/service-worker.js', revision: null }
      ],
      // Enable cleanup of outdated caches
      cleanupOutdatedCaches: true,
      // Set maximum cache size to 100 MB
      maximumFileSizeToCacheInBytes: 1000 * 1000 * 100,
      runtimeCaching: [
        // Cache all requests on the resources- subdomain for this domain
        {
          urlPattern: /^https?:\/\/resources-*\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'resources',
            expiration: {
              maxEntries: 1000,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https?.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'all-content-cache',
            expiration: {
              maxEntries: 1000,
              maxAgeSeconds: 7 * 24 * 60 * 60 // <== 7 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^\/fonts?.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'fonts-assets-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^\/icons?.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'icons-assets-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^\/static?.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-assets-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
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
