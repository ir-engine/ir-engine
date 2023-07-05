/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { VitePWA } from 'vite-plugin-pwa'

import manifest from './manifest.default.json'

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
      start_url:
        process.env.APP_ENV === 'development' || process.env.VITE_LOCAL_BUILD === 'true' ? '/' : process.env.APP_URL,
      scope: `./`,
      id: `ETHEREAL_ENGINE`,
      protocol_handlers: [
        {
          protocol: 'web+etherealengine',
          url: '/?deeplink=%s'
        }
      ]
    },
    useCredentials: true,
    // Use generateSW when building
    strategies: 'generateSW',
    // Set mode to development or production depending on environment variable
    mode: process.env.APP_ENV === 'development' ? 'development' : 'production',
    injectRegister: null,
    includeManifestIcons: true,
    devOptions: {
      // Enable dev options only during development
      enabled: process.env.APP_ENV === 'development' ? true : false,
      // Navigate to index.html for all 404 errors during development
      navigateFallback: undefined,
      // Allowlist all paths for navigateFallback during development
      navigateFallbackAllowlist: [
        // allow everything
        new RegExp('^/.*$'),
        // allow @fs
        new RegExp('^/@fs/.*$')
      ]
    },
    workbox: {
      // don't wait for service worker to become active
      skipWaiting: true,
      // claim clients immediately
      clientsClaim: true,
      // show source maps
      sourcemap: true,
      // Set the path for the service worker file
      swDest: process.env.APP_ENV === 'development' ? 'public/service-worker.js' : 'dist/service-worker.js',
      // Navigate to index.html for all 404 errors during production
      navigateFallback: null,
      // Allowlist all paths for navigateFallback during production
      navigateFallbackAllowlist: [
        // allow everything
        new RegExp('^/.*$')
      ],
      // Set the glob directory and patterns for the cache
      globDirectory: process.env.APP_ENV === 'development' ? './public' : './dist',
      globPatterns: [
        // fonts
        '**/*.{woff2,woff,ttf,eot}',
        // images
        '**/*.{png,jpg,jpeg,gif,svg,ico}',
        // media
        '**/*.{mp3,mp4,webm}',
        // code
        '**/*.{js, css}',
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
        { url: '/service-worker', revision: null },
        { url: '/dev-sw', revision: null },
        { url: '/src/main', revision: null }
      ],
      // Enable cleanup of outdated caches
      cleanupOutdatedCaches: true,
      // Set maximum cache size to 10 MB
      maximumFileSizeToCacheInBytes: 1000 * 1000 * 10,
      runtimeCaching: [
        // Cache local assets
        {
          urlPattern: ({ url }) => {
            return /\/assets?.*/i.test(url.href)
          },
          handler: 'CacheFirst',
          options: {
            cacheName: 'build-assets-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 24 * 60 * 60 * 30 // <== 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Cache local fonts
        {
          urlPattern: ({ url }) => {
            return /\/fonts?.*/i.test(url.href)
          },
          handler: 'CacheFirst',
          options: {
            cacheName: 'fonts-assets-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 24 * 60 * 60 * 30 // <== 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Cache local icons
        {
          urlPattern: ({ url }) => {
            return /\/icons?.*/.test(url.href)
          },
          handler: 'CacheFirst',
          options: {
            cacheName: 'icons-assets-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 24 * 60 * 60 * 30 // <== 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Cache local static assets
        {
          urlPattern: ({ url }) => {
            return /\/static?.*/i.test(url.href)
          },
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-assets-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 24 * 60 * 60 * 30 // <== 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Cache google font requests
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
        },
        // Cache all requests
        {
          urlPattern: /^https?:\/\/.*\..*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'all-content-cache',
            expiration: {
              maxEntries: 1000,
              maxAgeSeconds: 24 * 60 * 60 // <== 24 hours
            },
            cacheableResponse: {
              statuses: [0, 200]
            },
            networkTimeoutSeconds: 10
          }
        }
      ]
    }
  })

export default PWA
