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
    // Merge custom client settings with default values from manifest.default.json
    // This specifies the PWA's metadata such as name, description, and icons
    manifest: {
      ...manifest,
      name: clientSetting?.title || 'Ethereal Engine',
      description: clientSetting?.siteDescription || 'Connected Worlds for Everyone',
      short_name: clientSetting?.shortName || 'EE',
      theme_color: clientSetting?.themeColor || '#ffffff',
      background_color: clientSetting?.backgroundColor || '#000000'
    },
    // Use generateSW caching strategy
    // This specifies the caching strategy for the service worker
    strategies: 'generateSW',
    // Set mode to development or production depending on environment variable
    // This specifies the build mode ('development' or 'production') depending on the environment variable APP_ENV
    mode: process.env.APP_ENV === 'development' ? 'development' : 'production',
    // Set scope to root directory
    // This specifies the URL scope that the service worker controls
    scope: './',
    // Set register type to autoUpdate
    // This specifies the service worker registration type, which is set to 'autoUpdate'
    // to automatically update the service worker when a new version is available
    registerType: 'autoUpdate',
    // Inline registration code in index.html during development
    // This specifies the registration code injection method, which is set to 'inline' for development mode
    injectRegister: process.env.APP_ENV === 'development' ? 'inline' : null,
    includeManifestIcons: true,
    devOptions: {
      // Enable dev options only during development
      // This specifies that these options should only be used during development mode
      enabled: process.env.APP_ENV === 'development',
      // Navigate to index.html for all 404 errors during development
      // This specifies the fallback URL for all 404 errors during development mode
      navigateFallback: '/index.html',
      // Allowlist all paths for navigateFallback during development
      // This specifies that all paths should be allowed for the navigateFallback option during development mode
      navigateFallbackAllowlist: [
        // allow all files for local vite dev server
        /^\/.*/
      ]
    },
    workbox: {
      // Navigate to index.html for all 404 errors during production
      // This specifies the fallback URL for all 404 errors during production mode
      navigateFallback: '/index.html',
      // Allowlist all paths for navigateFallback during production
      // This specifies that all paths should be allowed for the navigateFallback option during production mode
      navigateFallbackAllowlist: [
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
        /^\/api?.*/
      ],
      // Set the path for the service worker file
      // This specifies the path for the service worker file
      swDest: 'public/sw.js',
      // Set the glob directory and patterns for the cache
      // This specifies the directory and patterns for the cache files
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
      // This specifies additional files to be cached and their revision version
      additionalManifestEntries: [{ url: '/index.html', revision: packageJson.version }],
      // Enable cleanup of outdated caches
      // This specifies whether outdated caches should be cleaned up
      cleanupOutdatedCaches: true,
      // Set maximum cache size to 100 MB
      // This specifies the maximum cache size in bytes
      maximumFileSizeToCacheInBytes: 1000 * 1000 * 100,
      runtimeCaching: [
        // Cache all production assets
        // This specifies that all production assets should be cached
        {
          urlPattern:
            /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif|ico|webp|webmanifest|woff2|woff|ttf|eot|mp3|mp4|webm|js|css|html|txt|xml|json|pdf|gltf|glb|bin|mtl|br|gzip|zip|rar|7z|wasm|ktx2)/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'assets',
            expiration: {
              maxEntries: 1000,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Cache all API requests
        // This specifies that all API requests should be cached
        {
          urlPattern: /^https?:\/\/.*\/api\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'api',
            expiration: {
              maxEntries: 1000,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Cache all admin requests
        // This specifies that all admin requests should be cached
        {
          urlPattern: /^https?:\/\/.*\/admin\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'admin',
            expiration: {
              maxEntries: 1000,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Cache google fonts
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

// {
//   urlPattern: /^https?.*/i,
//   handler: 'CacheFirst',
//   options: {
//     cacheName: 'all-content-cache',
//     expiration: {
//       maxEntries: 1000,
//       maxAgeSeconds: 7 * 24 * 60 * 60 // <== 7 days
//     },
//     cacheableResponse: {
//       statuses: [0, 200]
//     }
//   }
// },
// {
//   urlPattern: /^\/fonts?.*/i,
//   handler: 'CacheFirst',
//   options: {
//     cacheName: 'fonts-assets-cache',
//     expiration: {
//       maxEntries: 100,
//       maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
//     },
//     cacheableResponse: {
//       statuses: [0, 200]
//     }
//   }
// },
// {
//   urlPattern: /^\/icons?.*/,
//   handler: 'CacheFirst',
//   options: {
//     cacheName: 'icons-assets-cache',
//     expiration: {
//       maxEntries: 100,
//       maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
//     },
//     cacheableResponse: {
//       statuses: [0, 200]
//     }
//   }
// },
// {
//   urlPattern: /^\/static?.*/i,
//   handler: 'CacheFirst',
//   options: {
//     cacheName: 'static-assets-cache',
//     expiration: {
//       maxEntries: 100,
//       maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
//     },
//     cacheableResponse: {
//       statuses: [0, 200]
//     }
//   }
// },
