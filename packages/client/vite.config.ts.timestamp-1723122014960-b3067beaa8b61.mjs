var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __glob = (map) => (path2) => {
  var fn = map[path2];
  if (fn)
    return fn();
  throw new Error("Module not found in bundle: " + path2);
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../projects/projects/ee-bot/vite.config.extension.ts
var vite_config_extension_exports = {};
__export(vite_config_extension_exports, {
  default: () => vite_config_extension_default
});
var vite_config_extension_default;
var init_vite_config_extension = __esm({
  "../projects/projects/ee-bot/vite.config.extension.ts"() {
    vite_config_extension_default = () => {
      return {
        default: {
          build: {
            rollupOptions: {
              external: ["puppeteer"]
            }
          },
          plugins: []
        }
      };
    };
  }
});

// ../projects/projects/eepro-multitenancy/vite.config.extension.ts
var vite_config_extension_exports2 = {};
__export(vite_config_extension_exports2, {
  default: () => vite_config_extension_default2
});
async function vite_config_extension_default2() {
  return {
    plugins: [
      {
        name: "transform-override-main-tsx",
        load(code, id) {
          if (code.endsWith("packages/client/src/main.tsx")) {
            return {
              code: customImport,
              map: null
            };
          }
        }
      }
    ]
  };
}
var customImport;
var init_vite_config_extension2 = __esm({
  "../projects/projects/eepro-multitenancy/vite.config.extension.ts"() {
    customImport = `import 'eepro-multitenancy/main.tsx';`;
  }
});

// vite.config.ts
import { viteCommonjs } from "file:///home/hanzlamateen/etherealengine/node_modules/@originjs/vite-plugin-commonjs/lib/index.js";
import packageRoot from "file:///home/hanzlamateen/etherealengine/node_modules/app-root-path/index.js";
import dotenv from "file:///home/hanzlamateen/etherealengine/node_modules/dotenv/lib/main.js";
import fs from "fs";
import lodash from "file:///home/hanzlamateen/etherealengine/node_modules/lodash/lodash.js";
import path from "path";
import { defineConfig } from "file:///home/hanzlamateen/etherealengine/node_modules/vite/dist/node/index.js";
import viteCompression from "file:///home/hanzlamateen/etherealengine/node_modules/vite-plugin-compression/dist/index.mjs";
import { ViteEjsPlugin } from "file:///home/hanzlamateen/etherealengine/node_modules/vite-plugin-ejs/index.js";
import { nodePolyfills } from "file:///home/hanzlamateen/etherealengine/node_modules/vite-plugin-node-polyfills/dist/index.js";
import svgr from "file:///home/hanzlamateen/etherealengine/node_modules/vite-plugin-svgr/dist/index.js";

// manifest.default.json
var manifest_default_default = {
  name: "Ethereal Engine",
  start_url: "/",
  id: "EtherealEngine",
  short_name: "EE",
  description: "Connected Worlds for Everyone",
  theme_color: "#ffffff",
  background_color: "#ffffff",
  display: "standalone",
  icons: [
    {
      src: "android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png"
    },
    {
      src: "apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png"
    },
    {
      src: "favicon-16x16.png",
      sizes: "16x16",
      type: "image/png"
    },
    {
      src: "favicon-32x32.png",
      sizes: "32x32",
      type: "image/png"
    },
    {
      src: "mstile-150x150.png",
      sizes: "150x150",
      type: "image/png"
    }
  ]
};

// package.json
var package_default = {
  name: "@etherealengine/client",
  version: "1.6.0",
  private: true,
  type: "module",
  repository: {
    type: "git",
    url: "git://github.com/etherealengine/etherealengine.git"
  },
  engines: {
    node: ">= 18.12.0"
  },
  npmClient: "npm",
  scripts: {
    "check-errors": "tsc --noemit",
    dev: "cross-env APP_ENV=development NODE_OPTIONS=--max_old_space_size=20480 vite",
    build: "cross-env NODE_OPTIONS=--max_old_space_size=10240 vite build",
    preview: "cross-env NODE_OPTIONS=--max_old_space_size=6144 vite preview",
    start: "node server.js",
    validate: "npm run test",
    test: "exit 0",
    local: "npm run localbuild && npm run localstart",
    localbuild: "cross-env APP_ENV=production VITE_LOCAL_BUILD=true npm run build && rm -rf ../server/upload/client && cp -r ./dist ../server/upload/client",
    localstart: "cross-env APP_ENV=production VITE_LOCAL_BUILD=true npm run start"
  },
  resolutions: {
    "@types/react": "18.2.0",
    react: "18.2.0"
  },
  peerDependencies: {
    "@types/react": "18.2.0",
    react: "18.2.0"
  },
  dependencies: {
    "@etherealengine/client-core": "^1.6.0",
    "@etherealengine/common": "^1.6.0",
    "@etherealengine/editor": "^1.6.0",
    "@etherealengine/engine": "^1.6.0",
    "@etherealengine/hyperflux": "^1.6.0",
    "@etherealengine/projects": "^1.6.0",
    "@etherealengine/ui": "^1.6.0",
    "@hookstate/core": "npm:@speigg/hookstate@4.0.1-fix-111-106.2",
    "@mui/icons-material": "5.15.15",
    "@mui/material": "5.11.13",
    "@originjs/vite-plugin-commonjs": "^1.0.3",
    "@swc/core": "1.3.41",
    "app-root-path": "3.1.0",
    classnames: "2.3.2",
    cli: "1.0.1",
    "credential-handler-polyfill": "^3.2.0",
    history: "^5.3.0",
    i18next: "21.6.16",
    "i18next-browser-languagedetector": "6.1.3",
    knex: "2.4.2",
    koa: "2.14.2",
    "koa-body": "6.0.1",
    "koa-qs": "3.0.0",
    "koa-send": "5.0.1",
    "koa-static": "5.0.0",
    lodash: "4.17.21",
    moment: "2.29.4",
    notistack: "^3.0.1",
    react: "18.2.0",
    "react-dom": "18.2.0",
    "react-file-drop": "3.1.6",
    "react-i18next": "11.16.6",
    "react-icons": "^5.0.1",
    "react-json-tree": "^0.18.0",
    "react-router-dom": "6.9.0",
    sass: "1.59.3",
    "tailwind-merge": "^1.13.2",
    tailwindcss: "^3.3.2",
    "ts-node": "10.9.1",
    vite: "5.1.7",
    "vite-plugin-compression": "0.5.1",
    "vite-plugin-ejs": "^1.6.4",
    "vite-plugin-node-polyfills": "^0.9.0",
    "vite-plugin-pwa": "^0.14.7",
    "vite-plugin-svgr": "^4.1.0"
  },
  devDependencies: {
    "@types/node": "18.15.5",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "@vitejs/plugin-basic-ssl": "^1.0.1",
    autoprefixer: "^10.4.14",
    cli: "1.0.1",
    config: "3.3.9",
    "cross-env": "7.0.3",
    "node-fetch": "2.6.9",
    postcss: "^8.4.23",
    "trace-unhandled": "2.0.1",
    "workbox-core": "^6.5.4"
  },
  license: "ISC"
};

// pwa.config.ts
import { VitePWA } from "file:///home/hanzlamateen/etherealengine/node_modules/vite-plugin-pwa/dist/index.mjs";
var WILDCARD_REGEX = /^\/.*$/;
var LOCAL_FILESYSTEM_REGEX = /^\/@fs\/.*$/;
var PWA = (clientSetting) => VitePWA({
  srcDir: "public",
  filename: "service-worker.js",
  // Merge custom client settings with default values from manifest.default.json
  manifest: {
    ...manifest_default_default,
    name: clientSetting?.title || "Ethereal Engine",
    description: clientSetting?.siteDescription || "Connected Worlds for Everyone",
    short_name: clientSetting?.shortName || "EE",
    theme_color: clientSetting?.themeColor || "#ffffff",
    background_color: clientSetting?.backgroundColor || "#000000",
    start_url: process.env.APP_ENV === "development" || process.env.VITE_LOCAL_BUILD === "true" ? "/" : process.env.APP_URL,
    scope: `./`,
    id: `ETHEREAL_ENGINE`,
    protocol_handlers: [
      {
        protocol: "web+etherealengine",
        url: "/?deeplink=%s"
      }
    ]
  },
  useCredentials: true,
  // Use generateSW when building
  strategies: "generateSW",
  // Set mode to development or production depending on environment variable
  mode: process.env.APP_ENV === "development" ? "development" : "production",
  injectRegister: null,
  includeManifestIcons: true,
  devOptions: {
    // Enable dev options only during development
    enabled: process.env.APP_ENV === "development" ? true : false,
    // Navigate to index.html for all 404 errors during development
    navigateFallback: void 0,
    // Allowlist all paths for navigateFallback during development
    navigateFallbackAllowlist: [
      // allow everything
      WILDCARD_REGEX,
      // allow @fs
      LOCAL_FILESYSTEM_REGEX
    ]
  },
  workbox: {
    // don't wait for service worker to become active
    skipWaiting: true,
    // claim clients immediately
    clientsClaim: true,
    // show source maps
    sourcemap: process.env.APP_ENV === "development" ? false : true,
    // Set the path for the service worker file
    swDest: process.env.APP_ENV === "development" ? "public/service-worker.js" : "dist/service-worker.js",
    // Navigate to index.html for all 404 errors during production
    navigateFallback: null,
    // Allowlist all paths for navigateFallback during production
    navigateFallbackAllowlist: [
      // allow everything
      WILDCARD_REGEX
    ],
    // Set the glob directory and patterns for the cache
    globDirectory: process.env.APP_ENV === "development" ? "./public" : "./dist",
    globPatterns: [
      // fonts
      "**/*.{woff2,woff,ttf,eot}",
      // images
      "**/*.{png,jpg,jpeg,gif,svg,ico}",
      // media
      "**/*.{mp3,mp4,webm}",
      // code
      "**/*.{js, css}",
      // docs
      "**/*.{txt,xml,json,pdf}",
      // 3d objects
      "**/*.{gltf,glb,bin,mtl}",
      // compressed
      "**/*.{br, gzip, zip,rar,7z}",
      // webassembly
      "**/*.{wasm}",
      // ktx2
      "**/*.{ktx2}"
    ],
    globIgnores: [
      // fonts
      "**/projects/**/*.{woff2,woff,ttf,eot}",
      // images
      "**/projects/**/*.{png,jpg,jpeg,gif,svg,ico}",
      // media
      "**/projects/**/*.{mp3,mp4,webm}",
      // code
      "**/projects/**/*.{js, css}",
      // docs
      "**/projects/**/*.{txt,xml,json,pdf}",
      // 3d objects
      "**/projects/**/*.{gltf,glb,bin,mtl}",
      // compressed
      "**/projects/**/*.{br, gzip, zip,rar,7z}",
      // webassembly
      "**/projects/**/*.{wasm}",
      // ktx2
      "**/projects/**/*.{ktx2}"
    ],
    // Enable cleanup of outdated caches
    cleanupOutdatedCaches: true,
    // Set maximum cache size to 10 MB
    maximumFileSizeToCacheInBytes: 1e3 * 1e3 * 10,
    runtimeCaching: [
      // Cache static
      {
        urlPattern: ({ url }) => {
          return /\/static?.*/i.test(url.href);
        },
        handler: "CacheFirst",
        options: {
          cacheName: "static-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60 * 30
            // <== 30 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      // Cache static resources
      {
        urlPattern: ({ url }) => {
          return /\/static-resources?.*/i.test(url.href);
        },
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60 * 30
            // <== 30 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      // Cache sfx assets
      {
        urlPattern: ({ url }) => {
          return /\/sfx?.*/i.test(url.href);
        },
        handler: "CacheFirst",
        options: {
          cacheName: "sfx-assets-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60 * 30
            // <== 30 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      // Cache local assets
      {
        urlPattern: ({ url }) => {
          return /\/assets?.*/i.test(url.href) && !/\/projects\//i.test(url.href);
        },
        handler: "CacheFirst",
        options: {
          cacheName: "build-assets-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60 * 30
            // <== 30 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      // Cache local fonts
      {
        urlPattern: ({ url }) => {
          return /\/fonts?.*/i.test(url.href);
        },
        handler: "CacheFirst",
        options: {
          cacheName: "fonts-assets-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60 * 30
            // <== 30 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      // Cache local icons
      {
        urlPattern: ({ url }) => {
          return /\/icons?.*/.test(url.href);
        },
        handler: "CacheFirst",
        options: {
          cacheName: "icons-assets-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60 * 30
            // <== 30 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      // Cache local static assets
      {
        urlPattern: ({ url }) => {
          return /\/static?.*/i.test(url.href);
        },
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60 * 30
            // <== 30 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      // Cache google font requests
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-cache",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365
            // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "gstatic-fonts-cache",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365
            // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      // Cache all requests
      {
        urlPattern: /^https?:\/\/.*\..*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "all-content-cache",
          expiration: {
            maxEntries: 1e3,
            maxAgeSeconds: 24 * 60 * 60
            // <== 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200]
          },
          networkTimeoutSeconds: 10
        }
      },
      // Cache everything else
      {
        urlPattern: /^\/*/,
        handler: "CacheFirst",
        options: {
          cacheName: "all-local-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60 * 30
            // <== 30 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
});
var pwa_config_default = PWA;

// ../common/src/schemas/setting/client-setting.schema.ts
import { getValidator, querySyntax, Type } from "file:///home/hanzlamateen/etherealengine/node_modules/@feathersjs/typebox/lib/index.js";

// ../common/src/schemas/validators.ts
import { addFormats, Ajv } from "file:///home/hanzlamateen/etherealengine/node_modules/@feathersjs/schema/lib/index.js";
var formats = [
  "date-time",
  "time",
  "date",
  "email",
  "hostname",
  "ipv4",
  "ipv6",
  "uri",
  "uri-reference",
  "uuid",
  "uri-template",
  "json-pointer",
  "relative-json-pointer",
  "regex"
];
var dataValidator = addFormats(new Ajv({}), formats);
var queryValidator = addFormats(
  new Ajv({
    coerceTypes: true
  }),
  formats
);

// ../common/src/schemas/setting/client-setting.schema.ts
var clientSettingPath = "client-setting";
var clientSocialLinkSchema = Type.Object(
  {
    link: Type.String(),
    icon: Type.String()
  },
  { $id: "ClientSocialLink", additionalProperties: false }
);
var audioSettingsSchema = Type.Object(
  {
    maxBitrate: Type.Number()
  },
  { $id: "AudioSettingsSchema", additionalProperties: false }
);
var videoSettingsSchema = Type.Object(
  {
    codec: Type.String(),
    maxResolution: Type.String(),
    lowResMaxBitrate: Type.Number(),
    midResMaxBitrate: Type.Number(),
    highResMaxBitrate: Type.Number()
  },
  { $id: "VideoSettingsSchema", additionalProperties: false }
);
var screenshareSettingsSchema = Type.Object(
  {
    codec: Type.String(),
    lowResMaxBitrate: Type.Number(),
    midResMaxBitrate: Type.Number(),
    highResMaxBitrate: Type.Number()
  },
  { $id: "ScreenshareSettingsSchema", additionalProperties: false }
);
var mediaSettingsSchema = Type.Object(
  {
    audio: Type.Ref(audioSettingsSchema),
    video: Type.Ref(videoSettingsSchema),
    screenshare: Type.Ref(screenshareSettingsSchema)
  },
  { $id: "MediaSettingsSchema", additionalProperties: false }
);
var clientThemeOptionsSchema = Type.Object(
  {
    textColor: Type.String(),
    navbarBackground: Type.String(),
    sidebarBackground: Type.String(),
    sidebarSelectedBackground: Type.String(),
    mainBackground: Type.String(),
    panelBackground: Type.String(),
    panelCards: Type.String(),
    panelCardHoverOutline: Type.String(),
    panelCardIcon: Type.String(),
    textHeading: Type.String(),
    textSubheading: Type.String(),
    textDescription: Type.String(),
    iconButtonColor: Type.String(),
    iconButtonHoverColor: Type.String(),
    iconButtonBackground: Type.String(),
    iconButtonSelectedBackground: Type.String(),
    buttonOutlined: Type.String(),
    buttonFilled: Type.String(),
    buttonGradientStart: Type.String(),
    buttonGradientEnd: Type.String(),
    buttonTextColor: Type.String(),
    scrollbarThumbXAxisStart: Type.String(),
    scrollbarThumbXAxisEnd: Type.String(),
    scrollbarThumbYAxisStart: Type.String(),
    scrollbarThumbYAxisEnd: Type.String(),
    scrollbarCorner: Type.String(),
    inputOutline: Type.String(),
    inputBackground: Type.String(),
    primaryHighlight: Type.String(),
    dropdownMenuBackground: Type.String(),
    dropdownMenuHoverBackground: Type.String(),
    dropdownMenuSelectedBackground: Type.String(),
    drawerBackground: Type.String(),
    popupBackground: Type.String(),
    tableHeaderBackground: Type.String(),
    tableCellBackground: Type.String(),
    tableFooterBackground: Type.String(),
    dockBackground: Type.String()
  },
  { $id: "ClientThemeOptions", additionalProperties: false }
);
var clientSettingSchema = Type.Object(
  {
    id: Type.String({
      format: "uuid"
    }),
    logo: Type.String(),
    title: Type.String(),
    shortTitle: Type.String(),
    startPath: Type.String(),
    url: Type.String(),
    releaseName: Type.String(),
    siteDescription: Type.String(),
    appleTouchIcon: Type.String(),
    favicon32px: Type.String(),
    favicon16px: Type.String(),
    icon192px: Type.String(),
    icon512px: Type.String(),
    siteManifest: Type.String(),
    safariPinnedTab: Type.String(),
    favicon: Type.String(),
    webmanifestLink: Type.String(),
    swScriptLink: Type.String(),
    appBackground: Type.String(),
    appTitle: Type.String(),
    appSubtitle: Type.String(),
    appDescription: Type.String(),
    appSocialLinks: Type.Array(Type.Ref(clientSocialLinkSchema)),
    themeSettings: Type.Record(Type.String(), Type.Ref(clientThemeOptionsSchema)),
    themeModes: Type.Record(Type.String(), Type.String()),
    key8thWall: Type.String(),
    privacyPolicy: Type.String(),
    homepageLinkButtonEnabled: Type.Boolean(),
    homepageLinkButtonRedirect: Type.String(),
    homepageLinkButtonText: Type.String(),
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
    mediaSettings: Type.Ref(mediaSettingsSchema)
  },
  { $id: "ClientSetting", additionalProperties: false }
);
var clientSettingDataSchema = Type.Pick(
  clientSettingSchema,
  [
    "logo",
    "title",
    "shortTitle",
    "startPath",
    "url",
    "releaseName",
    "siteDescription",
    "favicon32px",
    "favicon16px",
    "icon192px",
    "icon512px",
    "webmanifestLink",
    "swScriptLink",
    "appBackground",
    "appTitle",
    "appSubtitle",
    "appDescription",
    "appSocialLinks",
    "themeSettings",
    "themeModes",
    "key8thWall",
    "privacyPolicy",
    "homepageLinkButtonEnabled",
    "homepageLinkButtonRedirect",
    "homepageLinkButtonText",
    "mediaSettings"
  ],
  {
    $id: "ClientSettingData"
  }
);
var clientSettingPatchSchema = Type.Partial(clientSettingSchema, {
  $id: "ClientSettingPatch"
});
var clientSettingQueryProperties = Type.Pick(clientSettingSchema, [
  "id",
  "logo",
  "title",
  "shortTitle",
  "startPath",
  "url",
  "releaseName",
  "siteDescription",
  "favicon32px",
  "favicon16px",
  "icon192px",
  "icon512px",
  "webmanifestLink",
  "swScriptLink",
  "appBackground",
  "appTitle",
  "appSubtitle",
  "appDescription",
  // 'appSocialLinks', Commented out because: https://discord.com/channels/509848480760725514/1093914405546229840/1095101536121667694
  // 'themeSettings',
  // 'themeModes',
  "key8thWall",
  "privacyPolicy",
  "homepageLinkButtonEnabled",
  "homepageLinkButtonRedirect",
  "homepageLinkButtonText"
]);
var clientSettingQuerySchema = Type.Intersect(
  [
    querySyntax(clientSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
);

// scripts/getClientSettings.ts
import knex from "file:///home/hanzlamateen/etherealengine/node_modules/knex/knex.js";

// ../server-core/src/setting/client-setting/client-setting.resolvers.ts
import { resolve, virtual } from "file:///home/hanzlamateen/etherealengine/node_modules/@feathersjs/schema/lib/index.js";
import { v4 as uuidv4 } from "file:///home/hanzlamateen/etherealengine/node_modules/uuid/wrapper.mjs";

// ../common/src/utils/datetime-sql.ts
var getDateTimeSql = async () => {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
};
var fromDateTimeSql = (date) => {
  let dateObj;
  if (typeof date === "string") {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  return dateObj.getFullYear() + "-" + ("00" + (dateObj.getMonth() + 1)).slice(-2) + "-" + ("00" + dateObj.getDate()).slice(-2) + "T" + ("00" + dateObj.getHours()).slice(-2) + ":" + ("00" + dateObj.getMinutes()).slice(-2) + ":" + ("00" + dateObj.getSeconds()).slice(-2) + ".000Z";
};

// ../server-core/src/setting/client-setting/client-setting.resolvers.ts
var clientDbToSchema = (rawData) => {
  let appSocialLinks = JSON.parse(rawData.appSocialLinks);
  if (typeof appSocialLinks === "string") {
    appSocialLinks = JSON.parse(appSocialLinks);
  }
  let themeSettings = JSON.parse(rawData.themeSettings);
  if (typeof themeSettings === "string") {
    themeSettings = JSON.parse(themeSettings);
  }
  let themeModes = JSON.parse(rawData.themeModes);
  if (typeof themeModes === "string") {
    themeModes = JSON.parse(themeModes);
  }
  if (typeof rawData.mediaSettings === "string")
    rawData.mediaSettings = JSON.parse(rawData.mediaSettings);
  return {
    ...rawData,
    appSocialLinks,
    themeSettings,
    themeModes
  };
};
var clientSettingResolver = resolve(
  {
    createdAt: virtual(async (clientSetting) => fromDateTimeSql(clientSetting.createdAt)),
    updatedAt: virtual(async (clientSetting) => fromDateTimeSql(clientSetting.updatedAt))
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return clientDbToSchema(rawData);
    }
  }
);
var clientSettingExternalResolver = resolve({});
var clientSettingDataResolver = resolve(
  {
    id: async () => {
      return uuidv4();
    },
    createdAt: getDateTimeSql,
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        appSocialLinks: JSON.stringify(rawData.appSocialLinks),
        themeSettings: JSON.stringify(rawData.themeSettings),
        themeModes: JSON.stringify(rawData.themeModes),
        mediaSettings: JSON.stringify(rawData.mediaSettings)
      };
    }
  }
);
var clientSettingPatchResolver = resolve(
  {
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData,
        appSocialLinks: JSON.stringify(rawData.appSocialLinks),
        themeSettings: JSON.stringify(rawData.themeSettings),
        themeModes: JSON.stringify(rawData.themeModes),
        mediaSettings: JSON.stringify(rawData.mediaSettings)
      };
    }
  }
);
var clientSettingQueryResolver = resolve({});

// scripts/getClientSettings.ts
var getClientSetting = async () => {
  const knexClient = knex({
    client: "mysql",
    connection: {
      user: process.env.MYSQL_USER ?? "server",
      password: process.env.MYSQL_PASSWORD ?? "password",
      host: process.env.MYSQL_HOST ?? "127.0.0.1",
      port: parseInt(process.env.MYSQL_PORT || "3306"),
      database: process.env.MYSQL_DATABASE ?? "etherealengine",
      charset: "utf8mb4"
    }
  });
  const clientSetting = await knexClient.select().from(clientSettingPath).then(([dbClient]) => {
    const dbClientConfig = clientDbToSchema(dbClient) || {
      logo: "./logo.svg",
      title: "IR Engine",
      url: "https://local.etherealengine.org",
      releaseName: "local",
      siteDescription: "Connected Worlds for Everyone",
      favicon32px: "/favicon-32x32.png",
      favicon16px: "/favicon-16x16.png",
      icon192px: "/android-chrome-192x192.png",
      icon512px: "/android-chrome-512x512.png"
    };
    if (dbClientConfig) {
      return dbClientConfig;
    }
  }).catch((e) => {
    console.warn("[vite.config]: Failed to read clientSetting");
    console.warn(e);
  });
  await knexClient.destroy();
  return clientSetting;
};

// scripts/getCoilSettings.ts
import knex2 from "file:///home/hanzlamateen/etherealengine/node_modules/knex/knex.js";

// ../common/src/schemas/setting/coil-setting.schema.ts
import { getValidator as getValidator2, querySyntax as querySyntax2, Type as Type2 } from "file:///home/hanzlamateen/etherealengine/node_modules/@feathersjs/typebox/lib/index.js";
var coilSettingPath = "coil-setting";
var coilSettingSchema = Type2.Object(
  {
    id: Type2.String({
      format: "uuid"
    }),
    paymentPointer: Type2.String(),
    clientId: Type2.String(),
    clientSecret: Type2.String(),
    createdAt: Type2.String({ format: "date-time" }),
    updatedAt: Type2.String({ format: "date-time" })
  },
  { $id: "CoilSetting", additionalProperties: false }
);
var coilSettingDataSchema = Type2.Pick(coilSettingSchema, ["paymentPointer", "clientId", "clientSecret"], {
  $id: "CoilSettingData"
});
var coilSettingPatchSchema = Type2.Partial(coilSettingSchema, {
  $id: "CoilSettingPatch"
});
var coilSettingQueryProperties = Type2.Pick(coilSettingSchema, [
  "id",
  "paymentPointer",
  "clientId",
  "clientSecret"
]);
var coilSettingQuerySchema = Type2.Intersect(
  [
    querySyntax2(coilSettingQueryProperties),
    // Add additional query properties here
    Type2.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
);

// scripts/getCoilSettings.ts
var getCoilSetting = async () => {
  const knexClient = knex2({
    client: "mysql",
    connection: {
      user: process.env.MYSQL_USER ?? "server",
      password: process.env.MYSQL_PASSWORD ?? "password",
      host: process.env.MYSQL_HOST ?? "127.0.0.1",
      port: parseInt(process.env.MYSQL_PORT || "3306"),
      database: process.env.MYSQL_DATABASE ?? "etherealengine",
      charset: "utf8mb4"
    }
  });
  const coilSetting = await knexClient.select().from(coilSettingPath).then(([dbCoil]) => {
    if (dbCoil) {
      return dbCoil;
    }
  }).catch((e) => {
    console.warn("[vite.config]: Failed to read coilSetting");
    console.warn(e);
  });
  await knexClient.destroy();
  return coilSetting;
};

// import("../projects/projects/**/*/vite.config.extension.ts") in vite.config.ts
var globImport_projects_projects_vite_config_extension_ts = __glob({
  "../projects/projects/ee-bot/vite.config.extension.ts": () => Promise.resolve().then(() => (init_vite_config_extension(), vite_config_extension_exports)),
  "../projects/projects/eepro-multitenancy/vite.config.extension.ts": () => Promise.resolve().then(() => (init_vite_config_extension2(), vite_config_extension_exports2))
});

// vite.config.ts
var __vite_injected_original_dirname = "/home/hanzlamateen/etherealengine/packages/client";
var { isArray, mergeWith } = lodash;
var parseModuleName = (moduleName) => {
  if (moduleName.includes("medisoup")) {
    return `vendor_medisoup-client_${moduleName.toString().split("client/lib/")[1].split("/")[0].toString()}`;
  }
  if (moduleName.includes("apexcharts")) {
    return `vendor_apexcharts_${moduleName.toString().split("dist/")[1].split("/")[0].toString()}`;
  }
  if (moduleName.includes("@feathersjs")) {
    return `vendor_feathersjs_${moduleName.toString().split("@feathersjs/")[1].split("/")[0].toString()}`;
  }
  if (moduleName.includes("@reactflow")) {
    return `vendor_reactflow_${moduleName.toString().split("@reactflow/")[1].split("/")[0].toString()}`;
  }
  if (moduleName.includes("react-dom")) {
    return `vendor_react-dom_${moduleName.toString().split("react-dom/")[1].split("/")[0].toString()}`;
  }
  if (moduleName.includes("react-icons")) {
    return `vendor_react-icons_${moduleName.toString().split("react-icons/")[1].split("/")[0].toString()}`;
  }
  if (moduleName.includes("@pixiv")) {
    if (moduleName.includes("@pixiv/three-vrm")) {
      return `vendor_@pixiv_three-vrm_${moduleName.toString().split("three-vrm")[1].split("/")[0].toString()}`;
    }
    return `vendor_@pixiv_${moduleName.toString().split("@pixiv/")[1].split("/")[0].toString()}`;
  }
  if (moduleName.includes("three")) {
    if (moduleName.includes("quarks/dist")) {
      return `vendor_three_quarks_${moduleName.toString().split("dist/")[1].split("/")[0].toString()}`;
    }
    if (moduleName.includes("three")) {
      return `vendor_three_build_${moduleName.toString().split("/")[1].split("/")[0].toString()}`;
    }
  }
  if (moduleName.includes("@mui")) {
    if (moduleName.includes("@mui/matererial")) {
      return `vendor_@mui_material_${moduleName.toString().split("@mui/material/")[1].split("/")[0].toString()}`;
    } else if (moduleName.includes("@mui/x-date-pickers")) {
      return `vendor_@mui_x-date-pickers_${moduleName.toString().split("@mui/x-date-pickers/")[1].split("/")[0].toString()}`;
    }
    return `vendor_@mui_${moduleName.toString().split("@mui/")[1].split("/")[0].toString()}`;
  }
  if (moduleName.includes("@dimforge")) {
    return `vendor_@dimforge_${moduleName.toString().split("rapier3d-compat/")[1].split("/")[0].toString()}`;
  }
  return `vendor_${moduleName.toString().split("node_modules/")[1].split("/")[0].toString()}`;
};
var merge = (src, dest) => mergeWith({}, src, dest, function(a, b) {
  if (isArray(a)) {
    return b.concat(a);
  }
});
import("file:///home/hanzlamateen/etherealengine/node_modules/ts-node/dist/index.js").then((tsnode) => {
  tsnode.register({
    project: "./tsconfig.json"
  });
});
var getProjectConfigExtensions = async (config) => {
  const projects = fs.readdirSync(path.resolve(__vite_injected_original_dirname, "../projects/projects/"), { withFileTypes: true }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
  for (const project of projects) {
    const staticPath = path.resolve(__vite_injected_original_dirname, `../projects/projects/`, project, "vite.config.extension.ts");
    if (fs.existsSync(staticPath)) {
      try {
        const { default: viteConfigExtension } = await globImport_projects_projects_vite_config_extension_ts(`../projects/projects/${project}/vite.config.extension.ts`);
        if (typeof viteConfigExtension === "function") {
          const configExtension = await viteConfigExtension(config);
          if (configExtension?.plugins) {
            config.plugins = [...config.plugins, ...configExtension.plugins];
            delete configExtension.plugins;
          }
          config = merge(config, configExtension);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
  return config;
};
function mediapipe_workaround() {
  return {
    name: "mediapipe_workaround",
    load(id) {
      const MEDIAPIPE_EXPORT_NAMES = {
        "pose.js": [
          "POSE_LANDMARKS",
          "POSE_CONNECTIONS",
          "POSE_LANDMARKS_LEFT",
          "POSE_LANDMARKS_RIGHT",
          "POSE_LANDMARKS_NEUTRAL",
          "Pose",
          "VERSION"
        ],
        "hands.js": ["VERSION", "HAND_CONNECTIONS", "Hands"],
        "camera_utils.js": ["Camera"],
        "drawing_utils.js": ["drawConnectors", "drawLandmarks", "lerp"],
        "control_utils.js": [
          "drawConnectors",
          "FPS",
          "ControlPanel",
          "StaticText",
          "Toggle",
          "SourcePicker",
          // 'InputImage', not working with this export. Is defined in index.d.ts
          // but is not defined in control_utils.js
          "InputImage",
          "Slider"
        ]
      };
      const fileName = path.basename(id);
      if (!(fileName in MEDIAPIPE_EXPORT_NAMES))
        return null;
      let code = fs.readFileSync(id, "utf-8");
      for (const name of MEDIAPIPE_EXPORT_NAMES[fileName]) {
        code += `exports.${name} = ${name};`;
      }
      return { code };
    }
  };
}
var deleteDirFilesUsingPattern = (pattern, dirPath) => {
  fs.readdir(dirPath, (err, fileNames) => {
    if (err)
      throw err;
    for (const name of fileNames) {
      if (pattern.test(name)) {
        fs.unlink(path.resolve(dirPath, name), (err2) => {
          if (err2)
            throw err2;
          console.log(`Deleted ${name}`);
        });
      }
    }
  });
};
var resetSWFiles = () => {
  deleteDirFilesUsingPattern(/webmanifest/, "./public/");
  deleteDirFilesUsingPattern(/service-/, "./public/");
  deleteDirFilesUsingPattern(/workbox-/, "./public/");
};
var vite_config_default = defineConfig(async () => {
  dotenv.config({
    path: packageRoot.path + "/.env.local"
  });
  const clientSetting = await getClientSetting();
  const coilSetting = await getCoilSetting();
  resetSWFiles();
  const isDevOrLocal = process.env.APP_ENV === "development" || process.env.VITE_LOCAL_BUILD === "true";
  let base = `https://${process.env["APP_HOST"] ? process.env["APP_HOST"] : process.env["VITE_APP_HOST"]}/`;
  if (process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER === "true") {
    if (process.env.STORAGE_PROVIDER === "s3") {
    } else if (process.env.STORAGE_PROVIDER === "local") {
      base = `https://${process.env.LOCAL_STORAGE_PROVIDER}/client/`;
    }
  }
  const define = { __IR_ENGINE_VERSION__: JSON.stringify(package_default.version) };
  for (const [key, value] of Object.entries(process.env)) {
    define[`globalThis.process.env.${key}`] = JSON.stringify(value);
  }
  const returned = {
    define,
    server: {
      proxy: {},
      cors: isDevOrLocal ? false : true,
      hmr: process.env.VITE_HMR === "true" ? {
        port: process.env["VITE_APP_PORT"],
        host: process.env["VITE_APP_HOST"],
        overlay: false
      } : false,
      host: process.env["VITE_APP_HOST"],
      port: process.env["VITE_APP_PORT"],
      headers: {
        "Origin-Agent-Cluster": "?1"
      },
      ...isDevOrLocal ? {
        https: {
          key: fs.readFileSync(path.join(packageRoot.path, process.env.KEY || "certs/key.pem")),
          cert: fs.readFileSync(path.join(packageRoot.path, process.env.CERT || "certs/cert.pem"))
        }
      } : {}
    },
    base,
    optimizeDeps: {
      entries: ["./src/main.tsx"],
      include: ["@reactflow/core", "@reactflow/minimap", "@reactflow/controls", "@reactflow/background"],
      esbuildOptions: {
        target: "es2020"
      }
    },
    plugins: [
      svgr(),
      nodePolyfills(),
      mediapipe_workaround(),
      process.env.VITE_PWA_ENABLED === "true" ? pwa_config_default(clientSetting) : void 0,
      ViteEjsPlugin({
        ...manifest_default_default,
        title: clientSetting.title || "iR Engine",
        description: clientSetting?.siteDescription || "Connected Worlds for Everyone",
        // short_name: clientSetting?.shortName || 'EE',
        // theme_color: clientSetting?.themeColor || '#ffffff',
        // background_color: clientSetting?.backgroundColor || '#000000',
        appleTouchIcon: clientSetting.appleTouchIcon || "/apple-touch-icon.png",
        favicon32px: clientSetting.favicon32px || "/favicon-32x32.png",
        favicon16px: clientSetting.favicon16px || "/favicon-16x16.png",
        icon192px: clientSetting.icon192px || "/android-chrome-192x192.png",
        icon512px: clientSetting.icon512px || "/android-chrome-512x512.png",
        webmanifestLink: clientSetting.webmanifestLink || "/manifest.webmanifest",
        siteManifest: clientSetting.siteManifest || "/site.webmanifest",
        safariPinnedTab: clientSetting.safariPinnedTab || "/safari-pinned-tab.svg",
        favicon: clientSetting.favicon || "/favicon.ico",
        swScriptLink: clientSetting.swScriptLink || process.env.VITE_PWA_ENABLED === "true" ? process.env.APP_ENV === "development" ? "dev-sw.js?dev-sw" : "service-worker.js" : "",
        paymentPointer: coilSetting?.paymentPointer || ""
      }),
      viteCompression({
        filter: /\.(js|mjs|json|css)$/i,
        algorithm: "brotliCompress",
        deleteOriginFile: true
      }),
      viteCommonjs({
        include: ["use-sync-external-store"]
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        "react-json-tree": "react-json-tree/lib/umd/react-json-tree"
      }
    },
    build: {
      target: "esnext",
      sourcemap: process.env.VITE_SOURCEMAPS === "true" ? true : false,
      minify: "terser",
      terserOptions: {
        mangle: {
          // This is a work-around for a terser bug which occurs when a local variable named `fetch` is
          // used in a function that also references the global `fetch` function as a default parameter value
          // In this case, terser was mangling the local `fetch` variable a different name (which is fine),
          // however it also updated the default parameter to the same mangled name (uh-oh), causing a runtime error.
          reserved: ["fetch"]
        }
      },
      dynamicImportVarsOptions: {
        warnOnError: true
      },
      rollupOptions: {
        output: {
          dir: "dist",
          format: "es",
          // 'commonjs' | 'esm' | 'module' | 'systemjs'
          // ignore files under 1mb
          experimentalMinChunkSize: 1e6,
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              return parseModuleName(id);
            }
          }
        }
      }
    }
  };
  return await getProjectConfigExtensions(returned);
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcHJvamVjdHMvcHJvamVjdHMvZWUtYm90L3ZpdGUuY29uZmlnLmV4dGVuc2lvbi50cyIsICIuLi9wcm9qZWN0cy9wcm9qZWN0cy9lZXByby1tdWx0aXRlbmFuY3kvdml0ZS5jb25maWcuZXh0ZW5zaW9uLnRzIiwgInZpdGUuY29uZmlnLnRzIiwgIm1hbmlmZXN0LmRlZmF1bHQuanNvbiIsICJwYWNrYWdlLmpzb24iLCAicHdhLmNvbmZpZy50cyIsICIuLi9jb21tb24vc3JjL3NjaGVtYXMvc2V0dGluZy9jbGllbnQtc2V0dGluZy5zY2hlbWEudHMiLCAiLi4vY29tbW9uL3NyYy9zY2hlbWFzL3ZhbGlkYXRvcnMudHMiLCAic2NyaXB0cy9nZXRDbGllbnRTZXR0aW5ncy50cyIsICIuLi9zZXJ2ZXItY29yZS9zcmMvc2V0dGluZy9jbGllbnQtc2V0dGluZy9jbGllbnQtc2V0dGluZy5yZXNvbHZlcnMudHMiLCAiLi4vY29tbW9uL3NyYy91dGlscy9kYXRldGltZS1zcWwudHMiLCAic2NyaXB0cy9nZXRDb2lsU2V0dGluZ3MudHMiLCAiLi4vY29tbW9uL3NyYy9zY2hlbWFzL3NldHRpbmcvY29pbC1zZXR0aW5nLnNjaGVtYS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL2hhbnpsYW1hdGVlbi9ldGhlcmVhbGVuZ2luZS9wYWNrYWdlcy9wcm9qZWN0cy9wcm9qZWN0cy9lZS1ib3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2hhbnpsYW1hdGVlbi9ldGhlcmVhbGVuZ2luZS9wYWNrYWdlcy9wcm9qZWN0cy9wcm9qZWN0cy9lZS1ib3Qvdml0ZS5jb25maWcuZXh0ZW5zaW9uLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2hhbnpsYW1hdGVlbi9ldGhlcmVhbGVuZ2luZS9wYWNrYWdlcy9wcm9qZWN0cy9wcm9qZWN0cy9lZS1ib3Qvdml0ZS5jb25maWcuZXh0ZW5zaW9uLnRzXCI7ZXhwb3J0IGRlZmF1bHQgKCkgPT4ge1xuICByZXR1cm4ge1xuICAgIGRlZmF1bHQ6IHtcbiAgICAgIGJ1aWxkOiB7XG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICBleHRlcm5hbDogWydwdXBwZXRlZXInXVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcGx1Z2luczogW11cbiAgICB9XG4gIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvaGFuemxhbWF0ZWVuL2V0aGVyZWFsZW5naW5lL3BhY2thZ2VzL3Byb2plY3RzL3Byb2plY3RzL2VlcHJvLW11bHRpdGVuYW5jeVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvaGFuemxhbWF0ZWVuL2V0aGVyZWFsZW5naW5lL3BhY2thZ2VzL3Byb2plY3RzL3Byb2plY3RzL2VlcHJvLW11bHRpdGVuYW5jeS92aXRlLmNvbmZpZy5leHRlbnNpb24udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvaGFuemxhbWF0ZWVuL2V0aGVyZWFsZW5naW5lL3BhY2thZ2VzL3Byb2plY3RzL3Byb2plY3RzL2VlcHJvLW11bHRpdGVuYW5jeS92aXRlLmNvbmZpZy5leHRlbnNpb24udHNcIjtpbXBvcnQgeyBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSdcblxuY29uc3QgY3VzdG9tSW1wb3J0ID0gYGltcG9ydCAnZWVwcm8tbXVsdGl0ZW5hbmN5L21haW4udHN4JztgXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uICgpOiBQcm9taXNlPFVzZXJDb25maWc+IHtcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICd0cmFuc2Zvcm0tb3ZlcnJpZGUtbWFpbi10c3gnLFxuICAgICAgICBsb2FkKGNvZGUsIGlkKSB7XG4gICAgICAgICAgaWYgKGNvZGUuZW5kc1dpdGgoJ3BhY2thZ2VzL2NsaWVudC9zcmMvbWFpbi50c3gnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY29kZTogY3VzdG9tSW1wb3J0LFxuICAgICAgICAgICAgICBtYXA6IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdXG4gIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvaGFuemxhbWF0ZWVuL2V0aGVyZWFsZW5naW5lL3BhY2thZ2VzL2NsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvaGFuemxhbWF0ZWVuL2V0aGVyZWFsZW5naW5lL3BhY2thZ2VzL2NsaWVudC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9oYW56bGFtYXRlZW4vZXRoZXJlYWxlbmdpbmUvcGFja2FnZXMvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7LypcbkNQQUwtMS4wIExpY2Vuc2VcblxuVGhlIGNvbnRlbnRzIG9mIHRoaXMgZmlsZSBhcmUgc3ViamVjdCB0byB0aGUgQ29tbW9uIFB1YmxpYyBBdHRyaWJ1dGlvbiBMaWNlbnNlXG5WZXJzaW9uIDEuMC4gKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbndpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuaHR0cHM6Ly9naXRodWIuY29tL0V0aGVyZWFsRW5naW5lL2V0aGVyZWFsZW5naW5lL2Jsb2IvZGV2L0xJQ0VOU0UuXG5UaGUgTGljZW5zZSBpcyBiYXNlZCBvbiB0aGUgTW96aWxsYSBQdWJsaWMgTGljZW5zZSBWZXJzaW9uIDEuMSwgYnV0IFNlY3Rpb25zIDE0XG5hbmQgMTUgaGF2ZSBiZWVuIGFkZGVkIHRvIGNvdmVyIHVzZSBvZiBzb2Z0d2FyZSBvdmVyIGEgY29tcHV0ZXIgbmV0d29yayBhbmRcbnByb3ZpZGUgZm9yIGxpbWl0ZWQgYXR0cmlidXRpb24gZm9yIHRoZSBPcmlnaW5hbCBEZXZlbG9wZXIuIEluIGFkZGl0aW9uLFxuRXhoaWJpdCBBIGhhcyBiZWVuIG1vZGlmaWVkIHRvIGJlIGNvbnNpc3RlbnQgd2l0aCBFeGhpYml0IEIuXG5cblNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBiYXNpcyxcbldJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlXG5zcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcmlnaHRzIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuVGhlIE9yaWdpbmFsIENvZGUgaXMgRXRoZXJlYWwgRW5naW5lLlxuXG5UaGUgT3JpZ2luYWwgRGV2ZWxvcGVyIGlzIHRoZSBJbml0aWFsIERldmVsb3Blci4gVGhlIEluaXRpYWwgRGV2ZWxvcGVyIG9mIHRoZVxuT3JpZ2luYWwgQ29kZSBpcyB0aGUgRXRoZXJlYWwgRW5naW5lIHRlYW0uXG5cbkFsbCBwb3J0aW9ucyBvZiB0aGUgY29kZSB3cml0dGVuIGJ5IHRoZSBFdGhlcmVhbCBFbmdpbmUgdGVhbSBhcmUgQ29weXJpZ2h0IFx1MDBBOSAyMDIxLTIwMjNcbkV0aGVyZWFsIEVuZ2luZS4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiovXG5cbmltcG9ydCB7IHZpdGVDb21tb25qcyB9IGZyb20gJ0BvcmlnaW5qcy92aXRlLXBsdWdpbi1jb21tb25qcydcbmltcG9ydCBwYWNrYWdlUm9vdCBmcm9tICdhcHAtcm9vdC1wYXRoJ1xuaW1wb3J0IGRvdGVudiBmcm9tICdkb3RlbnYnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgbG9kYXNoIGZyb20gJ2xvZGFzaCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIFVzZXJDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZpdGVDb21wcmVzc2lvbiBmcm9tICd2aXRlLXBsdWdpbi1jb21wcmVzc2lvbidcbmltcG9ydCB7IFZpdGVFanNQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1lanMnXG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnXG5pbXBvcnQgc3ZnciBmcm9tICd2aXRlLXBsdWdpbi1zdmdyJ1xuXG5pbXBvcnQgbWFuaWZlc3QgZnJvbSAnLi9tYW5pZmVzdC5kZWZhdWx0Lmpzb24nXG5pbXBvcnQgcGFja2FnZUpzb24gZnJvbSAnLi9wYWNrYWdlLmpzb24nXG5pbXBvcnQgUFdBIGZyb20gJy4vcHdhLmNvbmZpZydcbmltcG9ydCB7IGdldENsaWVudFNldHRpbmcgfSBmcm9tICcuL3NjcmlwdHMvZ2V0Q2xpZW50U2V0dGluZ3MnXG5pbXBvcnQgeyBnZXRDb2lsU2V0dGluZyB9IGZyb20gJy4vc2NyaXB0cy9nZXRDb2lsU2V0dGluZ3MnXG5cbmNvbnN0IHsgaXNBcnJheSwgbWVyZ2VXaXRoIH0gPSBsb2Rhc2hcblxuY29uc3QgcGFyc2VNb2R1bGVOYW1lID0gKG1vZHVsZU5hbWU6IHN0cmluZykgPT4ge1xuICAvLyAvLyBjaHVuayBtZWRpc291cC1jbGllbnRcbiAgaWYgKG1vZHVsZU5hbWUuaW5jbHVkZXMoJ21lZGlzb3VwJykpIHtcbiAgICByZXR1cm4gYHZlbmRvcl9tZWRpc291cC1jbGllbnRfJHttb2R1bGVOYW1lLnRvU3RyaW5nKCkuc3BsaXQoJ2NsaWVudC9saWIvJylbMV0uc3BsaXQoJy8nKVswXS50b1N0cmluZygpfWBcbiAgfVxuICAvLyBjaHVuayBhcGV4Y2hhcnRzXG4gIGlmIChtb2R1bGVOYW1lLmluY2x1ZGVzKCdhcGV4Y2hhcnRzJykpIHtcbiAgICByZXR1cm4gYHZlbmRvcl9hcGV4Y2hhcnRzXyR7bW9kdWxlTmFtZS50b1N0cmluZygpLnNwbGl0KCdkaXN0LycpWzFdLnNwbGl0KCcvJylbMF0udG9TdHJpbmcoKX1gXG4gIH1cbiAgLy8gY2h1bmsgQGZlYXRoZXJzanNcbiAgaWYgKG1vZHVsZU5hbWUuaW5jbHVkZXMoJ0BmZWF0aGVyc2pzJykpIHtcbiAgICByZXR1cm4gYHZlbmRvcl9mZWF0aGVyc2pzXyR7bW9kdWxlTmFtZS50b1N0cmluZygpLnNwbGl0KCdAZmVhdGhlcnNqcy8nKVsxXS5zcGxpdCgnLycpWzBdLnRvU3RyaW5nKCl9YFxuICB9XG5cbiAgLy8gY2h1bmsgQHJlYWN0Zmxvd1xuICBpZiAobW9kdWxlTmFtZS5pbmNsdWRlcygnQHJlYWN0ZmxvdycpKSB7XG4gICAgcmV0dXJuIGB2ZW5kb3JfcmVhY3RmbG93XyR7bW9kdWxlTmFtZS50b1N0cmluZygpLnNwbGl0KCdAcmVhY3RmbG93LycpWzFdLnNwbGl0KCcvJylbMF0udG9TdHJpbmcoKX1gXG4gIH1cbiAgLy8gY2h1bmsgcmVhY3QtZG9tXG4gIGlmIChtb2R1bGVOYW1lLmluY2x1ZGVzKCdyZWFjdC1kb20nKSkge1xuICAgIHJldHVybiBgdmVuZG9yX3JlYWN0LWRvbV8ke21vZHVsZU5hbWUudG9TdHJpbmcoKS5zcGxpdCgncmVhY3QtZG9tLycpWzFdLnNwbGl0KCcvJylbMF0udG9TdHJpbmcoKX1gXG4gIH1cblxuICAvLyBjaHVuayByZWFjdC1pY29uc1xuICBpZiAobW9kdWxlTmFtZS5pbmNsdWRlcygncmVhY3QtaWNvbnMnKSkge1xuICAgIHJldHVybiBgdmVuZG9yX3JlYWN0LWljb25zXyR7bW9kdWxlTmFtZS50b1N0cmluZygpLnNwbGl0KCdyZWFjdC1pY29ucy8nKVsxXS5zcGxpdCgnLycpWzBdLnRvU3RyaW5nKCl9YFxuICB9XG5cbiAgLy8gY2h1bmsgQHBpeGl2IHZybVxuICBpZiAobW9kdWxlTmFtZS5pbmNsdWRlcygnQHBpeGl2JykpIHtcbiAgICBpZiAobW9kdWxlTmFtZS5pbmNsdWRlcygnQHBpeGl2L3RocmVlLXZybScpKSB7XG4gICAgICByZXR1cm4gYHZlbmRvcl9AcGl4aXZfdGhyZWUtdnJtXyR7bW9kdWxlTmFtZS50b1N0cmluZygpLnNwbGl0KCd0aHJlZS12cm0nKVsxXS5zcGxpdCgnLycpWzBdLnRvU3RyaW5nKCl9YFxuICAgIH1cbiAgICByZXR1cm4gYHZlbmRvcl9AcGl4aXZfJHttb2R1bGVOYW1lLnRvU3RyaW5nKCkuc3BsaXQoJ0BwaXhpdi8nKVsxXS5zcGxpdCgnLycpWzBdLnRvU3RyaW5nKCl9YFxuICB9XG4gIC8vIGNodW5rIHRocmVlXG4gIGlmIChtb2R1bGVOYW1lLmluY2x1ZGVzKCd0aHJlZScpKSB7XG4gICAgaWYgKG1vZHVsZU5hbWUuaW5jbHVkZXMoJ3F1YXJrcy9kaXN0JykpIHtcbiAgICAgIHJldHVybiBgdmVuZG9yX3RocmVlX3F1YXJrc18ke21vZHVsZU5hbWUudG9TdHJpbmcoKS5zcGxpdCgnZGlzdC8nKVsxXS5zcGxpdCgnLycpWzBdLnRvU3RyaW5nKCl9YFxuICAgIH1cbiAgICBpZiAobW9kdWxlTmFtZS5pbmNsdWRlcygndGhyZWUnKSkge1xuICAgICAgcmV0dXJuIGB2ZW5kb3JfdGhyZWVfYnVpbGRfJHttb2R1bGVOYW1lLnRvU3RyaW5nKCkuc3BsaXQoJy8nKVsxXS5zcGxpdCgnLycpWzBdLnRvU3RyaW5nKCl9YFxuICAgIH1cbiAgfVxuICAvLyBjaHVuayBtdWlcbiAgaWYgKG1vZHVsZU5hbWUuaW5jbHVkZXMoJ0BtdWknKSkge1xuICAgIGlmIChtb2R1bGVOYW1lLmluY2x1ZGVzKCdAbXVpL21hdGVyZXJpYWwnKSkge1xuICAgICAgcmV0dXJuIGB2ZW5kb3JfQG11aV9tYXRlcmlhbF8ke21vZHVsZU5hbWUudG9TdHJpbmcoKS5zcGxpdCgnQG11aS9tYXRlcmlhbC8nKVsxXS5zcGxpdCgnLycpWzBdLnRvU3RyaW5nKCl9YFxuICAgIH0gZWxzZSBpZiAobW9kdWxlTmFtZS5pbmNsdWRlcygnQG11aS94LWRhdGUtcGlja2VycycpKSB7XG4gICAgICByZXR1cm4gYHZlbmRvcl9AbXVpX3gtZGF0ZS1waWNrZXJzXyR7bW9kdWxlTmFtZVxuICAgICAgICAudG9TdHJpbmcoKVxuICAgICAgICAuc3BsaXQoJ0BtdWkveC1kYXRlLXBpY2tlcnMvJylbMV1cbiAgICAgICAgLnNwbGl0KCcvJylbMF1cbiAgICAgICAgLnRvU3RyaW5nKCl9YFxuICAgIH1cbiAgICByZXR1cm4gYHZlbmRvcl9AbXVpXyR7bW9kdWxlTmFtZS50b1N0cmluZygpLnNwbGl0KCdAbXVpLycpWzFdLnNwbGl0KCcvJylbMF0udG9TdHJpbmcoKX1gXG4gIH1cbiAgLy8gY2h1bmsgQGRpbWZvcmdlXG4gIGlmIChtb2R1bGVOYW1lLmluY2x1ZGVzKCdAZGltZm9yZ2UnKSkge1xuICAgIHJldHVybiBgdmVuZG9yX0BkaW1mb3JnZV8ke21vZHVsZU5hbWUudG9TdHJpbmcoKS5zcGxpdCgncmFwaWVyM2QtY29tcGF0LycpWzFdLnNwbGl0KCcvJylbMF0udG9TdHJpbmcoKX1gXG4gIH1cblxuICAvLyBDaHVuayBhbGwgb3RoZXIgbm9kZV9tb2R1bGVzXG4gIHJldHVybiBgdmVuZG9yXyR7bW9kdWxlTmFtZS50b1N0cmluZygpLnNwbGl0KCdub2RlX21vZHVsZXMvJylbMV0uc3BsaXQoJy8nKVswXS50b1N0cmluZygpfWBcbn1cblxuY29uc3QgbWVyZ2UgPSAoc3JjLCBkZXN0KSA9PlxuICBtZXJnZVdpdGgoe30sIHNyYywgZGVzdCwgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBpZiAoaXNBcnJheShhKSkge1xuICAgICAgcmV0dXJuIGIuY29uY2F0KGEpXG4gICAgfVxuICB9KVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuaW1wb3J0KCd0cy1ub2RlJykudGhlbigodHNub2RlKSA9PiB7XG4gIHRzbm9kZS5yZWdpc3Rlcih7XG4gICAgcHJvamVjdDogJy4vdHNjb25maWcuanNvbidcbiAgfSlcbn0pXG5cbmNvbnN0IGdldFByb2plY3RDb25maWdFeHRlbnNpb25zID0gYXN5bmMgKGNvbmZpZzogVXNlckNvbmZpZykgPT4ge1xuICBjb25zdCBwcm9qZWN0cyA9IGZzXG4gICAgLnJlYWRkaXJTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9wcm9qZWN0cy9wcm9qZWN0cy8nKSwgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pXG4gICAgLmZpbHRlcigoZGlyZW50KSA9PiBkaXJlbnQuaXNEaXJlY3RvcnkoKSlcbiAgICAubWFwKChkaXJlbnQpID0+IGRpcmVudC5uYW1lKVxuICBmb3IgKGNvbnN0IHByb2plY3Qgb2YgcHJvamVjdHMpIHtcbiAgICBjb25zdCBzdGF0aWNQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgYC4uL3Byb2plY3RzL3Byb2plY3RzL2AsIHByb2plY3QsICd2aXRlLmNvbmZpZy5leHRlbnNpb24udHMnKVxuICAgIGlmIChmcy5leGlzdHNTeW5jKHN0YXRpY1BhdGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICAgICAgICBjb25zdCB7IGRlZmF1bHQ6IHZpdGVDb25maWdFeHRlbnNpb24gfSA9IGF3YWl0IGltcG9ydChcbiAgICAgICAgICBgLi4vcHJvamVjdHMvcHJvamVjdHMvJHtwcm9qZWN0fS92aXRlLmNvbmZpZy5leHRlbnNpb24udHNgXG4gICAgICAgIClcbiAgICAgICAgaWYgKHR5cGVvZiB2aXRlQ29uZmlnRXh0ZW5zaW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29uc3QgY29uZmlnRXh0ZW5zaW9uID0gKGF3YWl0IHZpdGVDb25maWdFeHRlbnNpb24oY29uZmlnKSkgYXMgVXNlckNvbmZpZ1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgICAgaWYgKGNvbmZpZ0V4dGVuc2lvbj8ucGx1Z2lucykge1xuICAgICAgICAgICAgY29uZmlnLnBsdWdpbnMgPSBbLi4uY29uZmlnLnBsdWdpbnMhLCAuLi5jb25maWdFeHRlbnNpb24ucGx1Z2luc11cbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWdFeHRlbnNpb24ucGx1Z2luc1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25maWcgPSBtZXJnZShjb25maWcsIGNvbmZpZ0V4dGVuc2lvbilcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjb25maWcgYXMgVXNlckNvbmZpZ1xufVxuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL21lZGlhcGlwZS9pc3N1ZXMvNDEyMFxuZnVuY3Rpb24gbWVkaWFwaXBlX3dvcmthcm91bmQoKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ21lZGlhcGlwZV93b3JrYXJvdW5kJyxcbiAgICBsb2FkKGlkKSB7XG4gICAgICBjb25zdCBNRURJQVBJUEVfRVhQT1JUX05BTUVTID0ge1xuICAgICAgICAncG9zZS5qcyc6IFtcbiAgICAgICAgICAnUE9TRV9MQU5ETUFSS1MnLFxuICAgICAgICAgICdQT1NFX0NPTk5FQ1RJT05TJyxcbiAgICAgICAgICAnUE9TRV9MQU5ETUFSS1NfTEVGVCcsXG4gICAgICAgICAgJ1BPU0VfTEFORE1BUktTX1JJR0hUJyxcbiAgICAgICAgICAnUE9TRV9MQU5ETUFSS1NfTkVVVFJBTCcsXG4gICAgICAgICAgJ1Bvc2UnLFxuICAgICAgICAgICdWRVJTSU9OJ1xuICAgICAgICBdLFxuICAgICAgICAnaGFuZHMuanMnOiBbJ1ZFUlNJT04nLCAnSEFORF9DT05ORUNUSU9OUycsICdIYW5kcyddLFxuICAgICAgICAnY2FtZXJhX3V0aWxzLmpzJzogWydDYW1lcmEnXSxcbiAgICAgICAgJ2RyYXdpbmdfdXRpbHMuanMnOiBbJ2RyYXdDb25uZWN0b3JzJywgJ2RyYXdMYW5kbWFya3MnLCAnbGVycCddLFxuICAgICAgICAnY29udHJvbF91dGlscy5qcyc6IFtcbiAgICAgICAgICAnZHJhd0Nvbm5lY3RvcnMnLFxuICAgICAgICAgICdGUFMnLFxuICAgICAgICAgICdDb250cm9sUGFuZWwnLFxuICAgICAgICAgICdTdGF0aWNUZXh0JyxcbiAgICAgICAgICAnVG9nZ2xlJyxcbiAgICAgICAgICAnU291cmNlUGlja2VyJyxcblxuICAgICAgICAgIC8vICdJbnB1dEltYWdlJywgbm90IHdvcmtpbmcgd2l0aCB0aGlzIGV4cG9ydC4gSXMgZGVmaW5lZCBpbiBpbmRleC5kLnRzXG4gICAgICAgICAgLy8gYnV0IGlzIG5vdCBkZWZpbmVkIGluIGNvbnRyb2xfdXRpbHMuanNcbiAgICAgICAgICAnSW5wdXRJbWFnZScsXG5cbiAgICAgICAgICAnU2xpZGVyJ1xuICAgICAgICBdXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShpZClcbiAgICAgIGlmICghKGZpbGVOYW1lIGluIE1FRElBUElQRV9FWFBPUlRfTkFNRVMpKSByZXR1cm4gbnVsbFxuICAgICAgbGV0IGNvZGUgPSBmcy5yZWFkRmlsZVN5bmMoaWQsICd1dGYtOCcpXG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgTUVESUFQSVBFX0VYUE9SVF9OQU1FU1tmaWxlTmFtZV0pIHtcbiAgICAgICAgY29kZSArPSBgZXhwb3J0cy4ke25hbWV9ID0gJHtuYW1lfTtgXG4gICAgICB9XG4gICAgICByZXR1cm4geyBjb2RlIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzQ0MDc4MzQ3XG5jb25zdCBkZWxldGVEaXJGaWxlc1VzaW5nUGF0dGVybiA9IChwYXR0ZXJuLCBkaXJQYXRoKSA9PiB7XG4gIC8vIGdldCBhbGwgZmlsZSBuYW1lcyBpbiBkaXJlY3RvcnlcbiAgZnMucmVhZGRpcihkaXJQYXRoLCAoZXJyLCBmaWxlTmFtZXMpID0+IHtcbiAgICBpZiAoZXJyKSB0aHJvdyBlcnJcbiAgICAvLyBpdGVyYXRlIHRocm91Z2ggdGhlIGZvdW5kIGZpbGUgbmFtZXNcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgZmlsZU5hbWVzKSB7XG4gICAgICAvLyBpZiBmaWxlIG5hbWUgbWF0Y2hlcyB0aGUgcGF0dGVyblxuICAgICAgaWYgKHBhdHRlcm4udGVzdChuYW1lKSkge1xuICAgICAgICAvLyB0cnkgdG8gcmVtb3ZlIHRoZSBmaWxlIGFuZCBsb2cgdGhlIHJlc3VsdFxuICAgICAgICBmcy51bmxpbmsocGF0aC5yZXNvbHZlKGRpclBhdGgsIG5hbWUpLCAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikgdGhyb3cgZXJyXG4gICAgICAgICAgY29uc29sZS5sb2coYERlbGV0ZWQgJHtuYW1lfWApXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG5jb25zdCByZXNldFNXRmlsZXMgPSAoKSA9PiB7XG4gIC8vIERlbGV0ZSBvbGQgbWFuaWZlc3QgZmlsZXNcbiAgZGVsZXRlRGlyRmlsZXNVc2luZ1BhdHRlcm4oL3dlYm1hbmlmZXN0LywgJy4vcHVibGljLycpXG4gIC8vIERlbGV0ZSBvbGQgc2VydmljZSB3b3JrZXIgZmlsZXNcbiAgZGVsZXRlRGlyRmlsZXNVc2luZ1BhdHRlcm4oL3NlcnZpY2UtLywgJy4vcHVibGljLycpXG4gIC8vIERlbGV0ZSBvbGQgd29ya2JveCBmaWxlc1xuICBkZWxldGVEaXJGaWxlc1VzaW5nUGF0dGVybigvd29ya2JveC0vLCAnLi9wdWJsaWMvJylcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICgpID0+IHtcbiAgZG90ZW52LmNvbmZpZyh7XG4gICAgcGF0aDogcGFja2FnZVJvb3QucGF0aCArICcvLmVudi5sb2NhbCdcbiAgfSlcbiAgY29uc3QgY2xpZW50U2V0dGluZyA9IGF3YWl0IGdldENsaWVudFNldHRpbmcoKVxuICBjb25zdCBjb2lsU2V0dGluZyA9IGF3YWl0IGdldENvaWxTZXR0aW5nKClcblxuICByZXNldFNXRmlsZXMoKVxuXG4gIGNvbnN0IGlzRGV2T3JMb2NhbCA9IHByb2Nlc3MuZW52LkFQUF9FTlYgPT09ICdkZXZlbG9wbWVudCcgfHwgcHJvY2Vzcy5lbnYuVklURV9MT0NBTF9CVUlMRCA9PT0gJ3RydWUnXG5cbiAgbGV0IGJhc2UgPSBgaHR0cHM6Ly8ke3Byb2Nlc3MuZW52WydBUFBfSE9TVCddID8gcHJvY2Vzcy5lbnZbJ0FQUF9IT1NUJ10gOiBwcm9jZXNzLmVudlsnVklURV9BUFBfSE9TVCddfS9gXG5cbiAgaWYgKHByb2Nlc3MuZW52LlNFUlZFX0NMSUVOVF9GUk9NX1NUT1JBR0VfUFJPVklERVIgPT09ICd0cnVlJykge1xuICAgIGlmIChwcm9jZXNzLmVudi5TVE9SQUdFX1BST1ZJREVSID09PSAnczMnKSB7XG4gICAgICAvLyBiYXNlID0gYCR7cGF0aC5qb2luKGNsaWVudFNldHRpbmcudXJsLCAnY2xpZW50JywgJy8nKX1gXG4gICAgfSBlbHNlIGlmIChwcm9jZXNzLmVudi5TVE9SQUdFX1BST1ZJREVSID09PSAnbG9jYWwnKSB7XG4gICAgICBiYXNlID0gYGh0dHBzOi8vJHtwcm9jZXNzLmVudi5MT0NBTF9TVE9SQUdFX1BST1ZJREVSfS9jbGllbnQvYFxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGRlZmluZSA9IHsgX19JUl9FTkdJTkVfVkVSU0lPTl9fOiBKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbi52ZXJzaW9uKSB9XG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHByb2Nlc3MuZW52KSkge1xuICAgIGRlZmluZVtgZ2xvYmFsVGhpcy5wcm9jZXNzLmVudi4ke2tleX1gXSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxuICB9XG5cbiAgY29uc3QgcmV0dXJuZWQgPSB7XG4gICAgZGVmaW5lOiBkZWZpbmUsXG4gICAgc2VydmVyOiB7XG4gICAgICBwcm94eToge30sXG4gICAgICBjb3JzOiBpc0Rldk9yTG9jYWwgPyBmYWxzZSA6IHRydWUsXG4gICAgICBobXI6XG4gICAgICAgIHByb2Nlc3MuZW52LlZJVEVfSE1SID09PSAndHJ1ZSdcbiAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgcG9ydDogcHJvY2Vzcy5lbnZbJ1ZJVEVfQVBQX1BPUlQnXSxcbiAgICAgICAgICAgICAgaG9zdDogcHJvY2Vzcy5lbnZbJ1ZJVEVfQVBQX0hPU1QnXSxcbiAgICAgICAgICAgICAgb3ZlcmxheTogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IGZhbHNlLFxuICAgICAgaG9zdDogcHJvY2Vzcy5lbnZbJ1ZJVEVfQVBQX0hPU1QnXSxcbiAgICAgIHBvcnQ6IHByb2Nlc3MuZW52WydWSVRFX0FQUF9QT1JUJ10sXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdPcmlnaW4tQWdlbnQtQ2x1c3Rlcic6ICc/MSdcbiAgICAgIH0sXG4gICAgICAuLi4oaXNEZXZPckxvY2FsXG4gICAgICAgID8ge1xuICAgICAgICAgICAgaHR0cHM6IHtcbiAgICAgICAgICAgICAga2V5OiBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHBhY2thZ2VSb290LnBhdGgsIHByb2Nlc3MuZW52LktFWSB8fCAnY2VydHMva2V5LnBlbScpKSxcbiAgICAgICAgICAgICAgY2VydDogZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihwYWNrYWdlUm9vdC5wYXRoLCBwcm9jZXNzLmVudi5DRVJUIHx8ICdjZXJ0cy9jZXJ0LnBlbScpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgOiB7fSlcbiAgICB9LFxuICAgIGJhc2UsXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBlbnRyaWVzOiBbJy4vc3JjL21haW4udHN4J10sXG4gICAgICBpbmNsdWRlOiBbJ0ByZWFjdGZsb3cvY29yZScsICdAcmVhY3RmbG93L21pbmltYXAnLCAnQHJlYWN0Zmxvdy9jb250cm9scycsICdAcmVhY3RmbG93L2JhY2tncm91bmQnXSxcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAgIHRhcmdldDogJ2VzMjAyMCdcbiAgICAgIH1cbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHN2Z3IoKSxcbiAgICAgIG5vZGVQb2x5ZmlsbHMoKSxcbiAgICAgIG1lZGlhcGlwZV93b3JrYXJvdW5kKCksXG4gICAgICBwcm9jZXNzLmVudi5WSVRFX1BXQV9FTkFCTEVEID09PSAndHJ1ZScgPyBQV0EoY2xpZW50U2V0dGluZykgOiB1bmRlZmluZWQsXG4gICAgICBWaXRlRWpzUGx1Z2luKHtcbiAgICAgICAgLi4ubWFuaWZlc3QsXG4gICAgICAgIHRpdGxlOiBjbGllbnRTZXR0aW5nLnRpdGxlIHx8ICdpUiBFbmdpbmUnLFxuICAgICAgICBkZXNjcmlwdGlvbjogY2xpZW50U2V0dGluZz8uc2l0ZURlc2NyaXB0aW9uIHx8ICdDb25uZWN0ZWQgV29ybGRzIGZvciBFdmVyeW9uZScsXG4gICAgICAgIC8vIHNob3J0X25hbWU6IGNsaWVudFNldHRpbmc/LnNob3J0TmFtZSB8fCAnRUUnLFxuICAgICAgICAvLyB0aGVtZV9jb2xvcjogY2xpZW50U2V0dGluZz8udGhlbWVDb2xvciB8fCAnI2ZmZmZmZicsXG4gICAgICAgIC8vIGJhY2tncm91bmRfY29sb3I6IGNsaWVudFNldHRpbmc/LmJhY2tncm91bmRDb2xvciB8fCAnIzAwMDAwMCcsXG4gICAgICAgIGFwcGxlVG91Y2hJY29uOiBjbGllbnRTZXR0aW5nLmFwcGxlVG91Y2hJY29uIHx8ICcvYXBwbGUtdG91Y2gtaWNvbi5wbmcnLFxuICAgICAgICBmYXZpY29uMzJweDogY2xpZW50U2V0dGluZy5mYXZpY29uMzJweCB8fCAnL2Zhdmljb24tMzJ4MzIucG5nJyxcbiAgICAgICAgZmF2aWNvbjE2cHg6IGNsaWVudFNldHRpbmcuZmF2aWNvbjE2cHggfHwgJy9mYXZpY29uLTE2eDE2LnBuZycsXG4gICAgICAgIGljb24xOTJweDogY2xpZW50U2V0dGluZy5pY29uMTkycHggfHwgJy9hbmRyb2lkLWNocm9tZS0xOTJ4MTkyLnBuZycsXG4gICAgICAgIGljb241MTJweDogY2xpZW50U2V0dGluZy5pY29uNTEycHggfHwgJy9hbmRyb2lkLWNocm9tZS01MTJ4NTEyLnBuZycsXG4gICAgICAgIHdlYm1hbmlmZXN0TGluazogY2xpZW50U2V0dGluZy53ZWJtYW5pZmVzdExpbmsgfHwgJy9tYW5pZmVzdC53ZWJtYW5pZmVzdCcsXG4gICAgICAgIHNpdGVNYW5pZmVzdDogY2xpZW50U2V0dGluZy5zaXRlTWFuaWZlc3QgfHwgJy9zaXRlLndlYm1hbmlmZXN0JyxcbiAgICAgICAgc2FmYXJpUGlubmVkVGFiOiBjbGllbnRTZXR0aW5nLnNhZmFyaVBpbm5lZFRhYiB8fCAnL3NhZmFyaS1waW5uZWQtdGFiLnN2ZycsXG4gICAgICAgIGZhdmljb246IGNsaWVudFNldHRpbmcuZmF2aWNvbiB8fCAnL2Zhdmljb24uaWNvJyxcbiAgICAgICAgc3dTY3JpcHRMaW5rOlxuICAgICAgICAgIGNsaWVudFNldHRpbmcuc3dTY3JpcHRMaW5rIHx8IHByb2Nlc3MuZW52LlZJVEVfUFdBX0VOQUJMRUQgPT09ICd0cnVlJ1xuICAgICAgICAgICAgPyBwcm9jZXNzLmVudi5BUFBfRU5WID09PSAnZGV2ZWxvcG1lbnQnXG4gICAgICAgICAgICAgID8gJ2Rldi1zdy5qcz9kZXYtc3cnXG4gICAgICAgICAgICAgIDogJ3NlcnZpY2Utd29ya2VyLmpzJ1xuICAgICAgICAgICAgOiAnJyxcbiAgICAgICAgcGF5bWVudFBvaW50ZXI6IGNvaWxTZXR0aW5nPy5wYXltZW50UG9pbnRlciB8fCAnJ1xuICAgICAgfSksXG4gICAgICB2aXRlQ29tcHJlc3Npb24oe1xuICAgICAgICBmaWx0ZXI6IC9cXC4oanN8bWpzfGpzb258Y3NzKSQvaSxcbiAgICAgICAgYWxnb3JpdGhtOiAnYnJvdGxpQ29tcHJlc3MnLFxuICAgICAgICBkZWxldGVPcmlnaW5GaWxlOiB0cnVlXG4gICAgICB9KSxcbiAgICAgIHZpdGVDb21tb25qcyh7XG4gICAgICAgIGluY2x1ZGU6IFsndXNlLXN5bmMtZXh0ZXJuYWwtc3RvcmUnXVxuICAgICAgfSlcbiAgICBdLmZpbHRlcihCb29sZWFuKSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAncmVhY3QtanNvbi10cmVlJzogJ3JlYWN0LWpzb24tdHJlZS9saWIvdW1kL3JlYWN0LWpzb24tdHJlZSdcbiAgICAgIH1cbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgICAgc291cmNlbWFwOiBwcm9jZXNzLmVudi5WSVRFX1NPVVJDRU1BUFMgPT09ICd0cnVlJyA/IHRydWUgOiBmYWxzZSxcbiAgICAgIG1pbmlmeTogJ3RlcnNlcicsXG4gICAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICAgIG1hbmdsZToge1xuICAgICAgICAgIC8vIFRoaXMgaXMgYSB3b3JrLWFyb3VuZCBmb3IgYSB0ZXJzZXIgYnVnIHdoaWNoIG9jY3VycyB3aGVuIGEgbG9jYWwgdmFyaWFibGUgbmFtZWQgYGZldGNoYCBpc1xuICAgICAgICAgIC8vIHVzZWQgaW4gYSBmdW5jdGlvbiB0aGF0IGFsc28gcmVmZXJlbmNlcyB0aGUgZ2xvYmFsIGBmZXRjaGAgZnVuY3Rpb24gYXMgYSBkZWZhdWx0IHBhcmFtZXRlciB2YWx1ZVxuICAgICAgICAgIC8vIEluIHRoaXMgY2FzZSwgdGVyc2VyIHdhcyBtYW5nbGluZyB0aGUgbG9jYWwgYGZldGNoYCB2YXJpYWJsZSBhIGRpZmZlcmVudCBuYW1lICh3aGljaCBpcyBmaW5lKSxcbiAgICAgICAgICAvLyBob3dldmVyIGl0IGFsc28gdXBkYXRlZCB0aGUgZGVmYXVsdCBwYXJhbWV0ZXIgdG8gdGhlIHNhbWUgbWFuZ2xlZCBuYW1lICh1aC1vaCksIGNhdXNpbmcgYSBydW50aW1lIGVycm9yLlxuICAgICAgICAgIHJlc2VydmVkOiBbJ2ZldGNoJ11cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGR5bmFtaWNJbXBvcnRWYXJzT3B0aW9uczoge1xuICAgICAgICB3YXJuT25FcnJvcjogdHJ1ZVxuICAgICAgfSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgZGlyOiAnZGlzdCcsXG4gICAgICAgICAgZm9ybWF0OiAnZXMnLCAvLyAnY29tbW9uanMnIHwgJ2VzbScgfCAnbW9kdWxlJyB8ICdzeXN0ZW1qcydcbiAgICAgICAgICAvLyBpZ25vcmUgZmlsZXMgdW5kZXIgMW1iXG4gICAgICAgICAgZXhwZXJpbWVudGFsTWluQ2h1bmtTaXplOiAxMDAwMDAwLFxuICAgICAgICAgIG1hbnVhbENodW5rczogKGlkKSA9PiB7XG4gICAgICAgICAgICAvLyBjaHVuayBkZXBlbmRlbmNpZXNcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlTW9kdWxlTmFtZShpZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gYXMgVXNlckNvbmZpZ1xuXG4gIHJldHVybiBhd2FpdCBnZXRQcm9qZWN0Q29uZmlnRXh0ZW5zaW9ucyhyZXR1cm5lZClcbn0pXG4iLCAie1xuICBcIm5hbWVcIjogXCJFdGhlcmVhbCBFbmdpbmVcIixcbiAgXCJzdGFydF91cmxcIjpcIi9cIixcbiAgXCJpZFwiOiBcIkV0aGVyZWFsRW5naW5lXCIsXG4gIFwic2hvcnRfbmFtZVwiOiBcIkVFXCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJDb25uZWN0ZWQgV29ybGRzIGZvciBFdmVyeW9uZVwiLFxuICBcInRoZW1lX2NvbG9yXCI6IFwiI2ZmZmZmZlwiLFxuICBcImJhY2tncm91bmRfY29sb3JcIjpcIiNmZmZmZmZcIixcbiAgXCJkaXNwbGF5XCI6XCJzdGFuZGFsb25lXCIsXG4gIFwiaWNvbnNcIjogW1xuICAgIHtcbiAgICAgIFwic3JjXCI6IFwiYW5kcm9pZC1jaHJvbWUtMTkyeDE5Mi5wbmdcIixcbiAgICAgIFwic2l6ZXNcIjogXCIxOTJ4MTkyXCIsXG4gICAgICBcInR5cGVcIjogXCJpbWFnZS9wbmdcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJzcmNcIjogXCJhbmRyb2lkLWNocm9tZS01MTJ4NTEyLnBuZ1wiLFxuICAgICAgXCJzaXplc1wiOiBcIjUxMng1MTJcIixcbiAgICAgIFwidHlwZVwiOiBcImltYWdlL3BuZ1wiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInNyY1wiOiBcImFwcGxlLXRvdWNoLWljb24ucG5nXCIsXG4gICAgICBcInNpemVzXCI6IFwiMTgweDE4MFwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwic3JjXCI6IFwiZmF2aWNvbi0xNngxNi5wbmdcIixcbiAgICAgIFwic2l6ZXNcIjogXCIxNngxNlwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwic3JjXCI6IFwiZmF2aWNvbi0zMngzMi5wbmdcIixcbiAgICAgIFwic2l6ZXNcIjogXCIzMngzMlwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwic3JjXCI6IFwibXN0aWxlLTE1MHgxNTAucG5nXCIsXG4gICAgICBcInNpemVzXCI6IFwiMTUweDE1MFwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCJcbiAgICB9XG4gIF1cbn0iLCAie1xuICBcIm5hbWVcIjogXCJAZXRoZXJlYWxlbmdpbmUvY2xpZW50XCIsXG4gIFwidmVyc2lvblwiOiBcIjEuNi4wXCIsXG4gIFwicHJpdmF0ZVwiOiB0cnVlLFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImdpdDovL2dpdGh1Yi5jb20vZXRoZXJlYWxlbmdpbmUvZXRoZXJlYWxlbmdpbmUuZ2l0XCJcbiAgfSxcbiAgXCJlbmdpbmVzXCI6IHtcbiAgICBcIm5vZGVcIjogXCI+PSAxOC4xMi4wXCJcbiAgfSxcbiAgXCJucG1DbGllbnRcIjogXCJucG1cIixcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImNoZWNrLWVycm9yc1wiOiBcInRzYyAtLW5vZW1pdFwiLFxuICAgIFwiZGV2XCI6IFwiY3Jvc3MtZW52IEFQUF9FTlY9ZGV2ZWxvcG1lbnQgTk9ERV9PUFRJT05TPS0tbWF4X29sZF9zcGFjZV9zaXplPTIwNDgwIHZpdGVcIixcbiAgICBcImJ1aWxkXCI6IFwiY3Jvc3MtZW52IE5PREVfT1BUSU9OUz0tLW1heF9vbGRfc3BhY2Vfc2l6ZT0xMDI0MCB2aXRlIGJ1aWxkXCIsXG4gICAgXCJwcmV2aWV3XCI6IFwiY3Jvc3MtZW52IE5PREVfT1BUSU9OUz0tLW1heF9vbGRfc3BhY2Vfc2l6ZT02MTQ0IHZpdGUgcHJldmlld1wiLFxuICAgIFwic3RhcnRcIjogXCJub2RlIHNlcnZlci5qc1wiLFxuICAgIFwidmFsaWRhdGVcIjogXCJucG0gcnVuIHRlc3RcIixcbiAgICBcInRlc3RcIjogXCJleGl0IDBcIixcbiAgICBcImxvY2FsXCI6IFwibnBtIHJ1biBsb2NhbGJ1aWxkICYmIG5wbSBydW4gbG9jYWxzdGFydFwiLFxuICAgIFwibG9jYWxidWlsZFwiOiBcImNyb3NzLWVudiBBUFBfRU5WPXByb2R1Y3Rpb24gVklURV9MT0NBTF9CVUlMRD10cnVlIG5wbSBydW4gYnVpbGQgJiYgcm0gLXJmIC4uL3NlcnZlci91cGxvYWQvY2xpZW50ICYmIGNwIC1yIC4vZGlzdCAuLi9zZXJ2ZXIvdXBsb2FkL2NsaWVudFwiLFxuICAgIFwibG9jYWxzdGFydFwiOiBcImNyb3NzLWVudiBBUFBfRU5WPXByb2R1Y3Rpb24gVklURV9MT0NBTF9CVUlMRD10cnVlIG5wbSBydW4gc3RhcnRcIlxuICB9LFxuICBcInJlc29sdXRpb25zXCI6IHtcbiAgICBcIkB0eXBlcy9yZWFjdFwiOiBcIjE4LjIuMFwiLFxuICAgIFwicmVhY3RcIjogXCIxOC4yLjBcIlxuICB9LFxuICBcInBlZXJEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHR5cGVzL3JlYWN0XCI6IFwiMTguMi4wXCIsXG4gICAgXCJyZWFjdFwiOiBcIjE4LjIuMFwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBldGhlcmVhbGVuZ2luZS9jbGllbnQtY29yZVwiOiBcIl4xLjYuMFwiLFxuICAgIFwiQGV0aGVyZWFsZW5naW5lL2NvbW1vblwiOiBcIl4xLjYuMFwiLFxuICAgIFwiQGV0aGVyZWFsZW5naW5lL2VkaXRvclwiOiBcIl4xLjYuMFwiLFxuICAgIFwiQGV0aGVyZWFsZW5naW5lL2VuZ2luZVwiOiBcIl4xLjYuMFwiLFxuICAgIFwiQGV0aGVyZWFsZW5naW5lL2h5cGVyZmx1eFwiOiBcIl4xLjYuMFwiLFxuICAgIFwiQGV0aGVyZWFsZW5naW5lL3Byb2plY3RzXCI6IFwiXjEuNi4wXCIsXG4gICAgXCJAZXRoZXJlYWxlbmdpbmUvdWlcIjogXCJeMS42LjBcIixcbiAgICBcIkBob29rc3RhdGUvY29yZVwiOiBcIm5wbTpAc3BlaWdnL2hvb2tzdGF0ZUA0LjAuMS1maXgtMTExLTEwNi4yXCIsXG4gICAgXCJAbXVpL2ljb25zLW1hdGVyaWFsXCI6IFwiNS4xNS4xNVwiLFxuICAgIFwiQG11aS9tYXRlcmlhbFwiOiBcIjUuMTEuMTNcIixcbiAgICBcIkBvcmlnaW5qcy92aXRlLXBsdWdpbi1jb21tb25qc1wiOiBcIl4xLjAuM1wiLFxuICAgIFwiQHN3Yy9jb3JlXCI6IFwiMS4zLjQxXCIsXG4gICAgXCJhcHAtcm9vdC1wYXRoXCI6IFwiMy4xLjBcIixcbiAgICBcImNsYXNzbmFtZXNcIjogXCIyLjMuMlwiLFxuICAgIFwiY2xpXCI6IFwiMS4wLjFcIixcbiAgICBcImNyZWRlbnRpYWwtaGFuZGxlci1wb2x5ZmlsbFwiOiBcIl4zLjIuMFwiLFxuICAgIFwiaGlzdG9yeVwiOiBcIl41LjMuMFwiLFxuICAgIFwiaTE4bmV4dFwiOiBcIjIxLjYuMTZcIixcbiAgICBcImkxOG5leHQtYnJvd3Nlci1sYW5ndWFnZWRldGVjdG9yXCI6IFwiNi4xLjNcIixcbiAgICBcImtuZXhcIjogXCIyLjQuMlwiLFxuICAgIFwia29hXCI6IFwiMi4xNC4yXCIsXG4gICAgXCJrb2EtYm9keVwiOiBcIjYuMC4xXCIsXG4gICAgXCJrb2EtcXNcIjogXCIzLjAuMFwiLFxuICAgIFwia29hLXNlbmRcIjogXCI1LjAuMVwiLFxuICAgIFwia29hLXN0YXRpY1wiOiBcIjUuMC4wXCIsXG4gICAgXCJsb2Rhc2hcIjogXCI0LjE3LjIxXCIsXG4gICAgXCJtb21lbnRcIjogXCIyLjI5LjRcIixcbiAgICBcIm5vdGlzdGFja1wiOiBcIl4zLjAuMVwiLFxuICAgIFwicmVhY3RcIjogXCIxOC4yLjBcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIjE4LjIuMFwiLFxuICAgIFwicmVhY3QtZmlsZS1kcm9wXCI6IFwiMy4xLjZcIixcbiAgICBcInJlYWN0LWkxOG5leHRcIjogXCIxMS4xNi42XCIsXG4gICAgXCJyZWFjdC1pY29uc1wiOiBcIl41LjAuMVwiLFxuICAgIFwicmVhY3QtanNvbi10cmVlXCI6IFwiXjAuMTguMFwiLFxuICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiOiBcIjYuOS4wXCIsXG4gICAgXCJzYXNzXCI6IFwiMS41OS4zXCIsXG4gICAgXCJ0YWlsd2luZC1tZXJnZVwiOiBcIl4xLjEzLjJcIixcbiAgICBcInRhaWx3aW5kY3NzXCI6IFwiXjMuMy4yXCIsXG4gICAgXCJ0cy1ub2RlXCI6IFwiMTAuOS4xXCIsXG4gICAgXCJ2aXRlXCI6IFwiNS4xLjdcIixcbiAgICBcInZpdGUtcGx1Z2luLWNvbXByZXNzaW9uXCI6IFwiMC41LjFcIixcbiAgICBcInZpdGUtcGx1Z2luLWVqc1wiOiBcIl4xLjYuNFwiLFxuICAgIFwidml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHNcIjogXCJeMC45LjBcIixcbiAgICBcInZpdGUtcGx1Z2luLXB3YVwiOiBcIl4wLjE0LjdcIixcbiAgICBcInZpdGUtcGx1Z2luLXN2Z3JcIjogXCJeNC4xLjBcIlxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAdHlwZXMvbm9kZVwiOiBcIjE4LjE1LjVcIixcbiAgICBcIkB0eXBlcy9yZWFjdFwiOiBcIjE4LjIuMFwiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIjE4LjIuMFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tYmFzaWMtc3NsXCI6IFwiXjEuMC4xXCIsXG4gICAgXCJhdXRvcHJlZml4ZXJcIjogXCJeMTAuNC4xNFwiLFxuICAgIFwiY2xpXCI6IFwiMS4wLjFcIixcbiAgICBcImNvbmZpZ1wiOiBcIjMuMy45XCIsXG4gICAgXCJjcm9zcy1lbnZcIjogXCI3LjAuM1wiLFxuICAgIFwibm9kZS1mZXRjaFwiOiBcIjIuNi45XCIsXG4gICAgXCJwb3N0Y3NzXCI6IFwiXjguNC4yM1wiLFxuICAgIFwidHJhY2UtdW5oYW5kbGVkXCI6IFwiMi4wLjFcIixcbiAgICBcIndvcmtib3gtY29yZVwiOiBcIl42LjUuNFwiXG4gIH0sXG4gIFwibGljZW5zZVwiOiBcIklTQ1wiXG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL2hhbnpsYW1hdGVlbi9ldGhlcmVhbGVuZ2luZS9wYWNrYWdlcy9jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2hhbnpsYW1hdGVlbi9ldGhlcmVhbGVuZ2luZS9wYWNrYWdlcy9jbGllbnQvcHdhLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9oYW56bGFtYXRlZW4vZXRoZXJlYWxlbmdpbmUvcGFja2FnZXMvY2xpZW50L3B3YS5jb25maWcudHNcIjsvKlxuQ1BBTC0xLjAgTGljZW5zZVxuXG5UaGUgY29udGVudHMgb2YgdGhpcyBmaWxlIGFyZSBzdWJqZWN0IHRvIHRoZSBDb21tb24gUHVibGljIEF0dHJpYnV0aW9uIExpY2Vuc2VcblZlcnNpb24gMS4wLiAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxud2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5odHRwczovL2dpdGh1Yi5jb20vRXRoZXJlYWxFbmdpbmUvZXRoZXJlYWxlbmdpbmUvYmxvYi9kZXYvTElDRU5TRS5cblRoZSBMaWNlbnNlIGlzIGJhc2VkIG9uIHRoZSBNb3ppbGxhIFB1YmxpYyBMaWNlbnNlIFZlcnNpb24gMS4xLCBidXQgU2VjdGlvbnMgMTRcbmFuZCAxNSBoYXZlIGJlZW4gYWRkZWQgdG8gY292ZXIgdXNlIG9mIHNvZnR3YXJlIG92ZXIgYSBjb21wdXRlciBuZXR3b3JrIGFuZCBcbnByb3ZpZGUgZm9yIGxpbWl0ZWQgYXR0cmlidXRpb24gZm9yIHRoZSBPcmlnaW5hbCBEZXZlbG9wZXIuIEluIGFkZGl0aW9uLCBcbkV4aGliaXQgQSBoYXMgYmVlbiBtb2RpZmllZCB0byBiZSBjb25zaXN0ZW50IHdpdGggRXhoaWJpdCBCLlxuXG5Tb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsXG5XSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZVxuc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHJpZ2h0cyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cblRoZSBPcmlnaW5hbCBDb2RlIGlzIEV0aGVyZWFsIEVuZ2luZS5cblxuVGhlIE9yaWdpbmFsIERldmVsb3BlciBpcyB0aGUgSW5pdGlhbCBEZXZlbG9wZXIuIFRoZSBJbml0aWFsIERldmVsb3BlciBvZiB0aGVcbk9yaWdpbmFsIENvZGUgaXMgdGhlIEV0aGVyZWFsIEVuZ2luZSB0ZWFtLlxuXG5BbGwgcG9ydGlvbnMgb2YgdGhlIGNvZGUgd3JpdHRlbiBieSB0aGUgRXRoZXJlYWwgRW5naW5lIHRlYW0gYXJlIENvcHlyaWdodCBcdTAwQTkgMjAyMS0yMDIzIFxuRXRoZXJlYWwgRW5naW5lLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuKi9cblxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcblxuaW1wb3J0IG1hbmlmZXN0IGZyb20gJy4vbWFuaWZlc3QuZGVmYXVsdC5qc29uJ1xuXG5jb25zdCBXSUxEQ0FSRF9SRUdFWCA9IC9eXFwvLiokL1xuY29uc3QgTE9DQUxfRklMRVNZU1RFTV9SRUdFWCA9IC9eXFwvQGZzXFwvLiokL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIFZpdGVQV0EgcGx1Z2luIGZvciBWaXRlLmpzLlxuICogQHBhcmFtIHtPYmplY3R9IGNsaWVudFNldHRpbmcgLSBBbiBvYmplY3QgY29udGFpbmluZyBjdXN0b20gc2V0dGluZ3MgZm9yIHRoZSBQV0EuXG4gKiBAcGFyYW0ge3N0cmluZ30gY2xpZW50U2V0dGluZy50aXRsZSAtIFRoZSB0aXRsZSBvZiB0aGUgUFdBLlxuICogQHBhcmFtIHtzdHJpbmd9IGNsaWVudFNldHRpbmcuc2l0ZURlc2NyaXB0aW9uIC0gVGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBQV0EuXG4gKiBAcGFyYW0ge3N0cmluZ30gY2xpZW50U2V0dGluZy5zaG9ydE5hbWUgLSBUaGUgc2hvcnQgbmFtZSBvZiB0aGUgUFdBLlxuICogQHBhcmFtIHtzdHJpbmd9IGNsaWVudFNldHRpbmcudGhlbWVDb2xvciAtIFRoZSB0aGVtZSBjb2xvciBvZiB0aGUgUFdBLlxuICogQHBhcmFtIHtzdHJpbmd9IGNsaWVudFNldHRpbmcuYmFja2dyb3VuZENvbG9yIC0gVGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIFBXQS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IC0gQSBWaXRlIHBsdWdpbiBvYmplY3QuXG4gKi9cbmNvbnN0IFBXQSA9IChjbGllbnRTZXR0aW5nKSA9PlxuICBWaXRlUFdBKHtcbiAgICBzcmNEaXI6ICdwdWJsaWMnLFxuICAgIGZpbGVuYW1lOiAnc2VydmljZS13b3JrZXIuanMnLFxuICAgIC8vIE1lcmdlIGN1c3RvbSBjbGllbnQgc2V0dGluZ3Mgd2l0aCBkZWZhdWx0IHZhbHVlcyBmcm9tIG1hbmlmZXN0LmRlZmF1bHQuanNvblxuICAgIG1hbmlmZXN0OiB7XG4gICAgICAuLi5tYW5pZmVzdCxcbiAgICAgIG5hbWU6IGNsaWVudFNldHRpbmc/LnRpdGxlIHx8ICdFdGhlcmVhbCBFbmdpbmUnLFxuICAgICAgZGVzY3JpcHRpb246IGNsaWVudFNldHRpbmc/LnNpdGVEZXNjcmlwdGlvbiB8fCAnQ29ubmVjdGVkIFdvcmxkcyBmb3IgRXZlcnlvbmUnLFxuICAgICAgc2hvcnRfbmFtZTogY2xpZW50U2V0dGluZz8uc2hvcnROYW1lIHx8ICdFRScsXG4gICAgICB0aGVtZV9jb2xvcjogY2xpZW50U2V0dGluZz8udGhlbWVDb2xvciB8fCAnI2ZmZmZmZicsXG4gICAgICBiYWNrZ3JvdW5kX2NvbG9yOiBjbGllbnRTZXR0aW5nPy5iYWNrZ3JvdW5kQ29sb3IgfHwgJyMwMDAwMDAnLFxuICAgICAgc3RhcnRfdXJsOlxuICAgICAgICBwcm9jZXNzLmVudi5BUFBfRU5WID09PSAnZGV2ZWxvcG1lbnQnIHx8IHByb2Nlc3MuZW52LlZJVEVfTE9DQUxfQlVJTEQgPT09ICd0cnVlJyA/ICcvJyA6IHByb2Nlc3MuZW52LkFQUF9VUkwsXG4gICAgICBzY29wZTogYC4vYCxcbiAgICAgIGlkOiBgRVRIRVJFQUxfRU5HSU5FYCxcbiAgICAgIHByb3RvY29sX2hhbmRsZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm90b2NvbDogJ3dlYitldGhlcmVhbGVuZ2luZScsXG4gICAgICAgICAgdXJsOiAnLz9kZWVwbGluaz0lcydcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgdXNlQ3JlZGVudGlhbHM6IHRydWUsXG4gICAgLy8gVXNlIGdlbmVyYXRlU1cgd2hlbiBidWlsZGluZ1xuICAgIHN0cmF0ZWdpZXM6ICdnZW5lcmF0ZVNXJyxcbiAgICAvLyBTZXQgbW9kZSB0byBkZXZlbG9wbWVudCBvciBwcm9kdWN0aW9uIGRlcGVuZGluZyBvbiBlbnZpcm9ubWVudCB2YXJpYWJsZVxuICAgIG1vZGU6IHByb2Nlc3MuZW52LkFQUF9FTlYgPT09ICdkZXZlbG9wbWVudCcgPyAnZGV2ZWxvcG1lbnQnIDogJ3Byb2R1Y3Rpb24nLFxuICAgIGluamVjdFJlZ2lzdGVyOiBudWxsLFxuICAgIGluY2x1ZGVNYW5pZmVzdEljb25zOiB0cnVlLFxuICAgIGRldk9wdGlvbnM6IHtcbiAgICAgIC8vIEVuYWJsZSBkZXYgb3B0aW9ucyBvbmx5IGR1cmluZyBkZXZlbG9wbWVudFxuICAgICAgZW5hYmxlZDogcHJvY2Vzcy5lbnYuQVBQX0VOViA9PT0gJ2RldmVsb3BtZW50JyA/IHRydWUgOiBmYWxzZSxcbiAgICAgIC8vIE5hdmlnYXRlIHRvIGluZGV4Lmh0bWwgZm9yIGFsbCA0MDQgZXJyb3JzIGR1cmluZyBkZXZlbG9wbWVudFxuICAgICAgbmF2aWdhdGVGYWxsYmFjazogdW5kZWZpbmVkLFxuICAgICAgLy8gQWxsb3dsaXN0IGFsbCBwYXRocyBmb3IgbmF2aWdhdGVGYWxsYmFjayBkdXJpbmcgZGV2ZWxvcG1lbnRcbiAgICAgIG5hdmlnYXRlRmFsbGJhY2tBbGxvd2xpc3Q6IFtcbiAgICAgICAgLy8gYWxsb3cgZXZlcnl0aGluZ1xuICAgICAgICBXSUxEQ0FSRF9SRUdFWCxcbiAgICAgICAgLy8gYWxsb3cgQGZzXG4gICAgICAgIExPQ0FMX0ZJTEVTWVNURU1fUkVHRVhcbiAgICAgIF1cbiAgICB9LFxuICAgIHdvcmtib3g6IHtcbiAgICAgIC8vIGRvbid0IHdhaXQgZm9yIHNlcnZpY2Ugd29ya2VyIHRvIGJlY29tZSBhY3RpdmVcbiAgICAgIHNraXBXYWl0aW5nOiB0cnVlLFxuICAgICAgLy8gY2xhaW0gY2xpZW50cyBpbW1lZGlhdGVseVxuICAgICAgY2xpZW50c0NsYWltOiB0cnVlLFxuICAgICAgLy8gc2hvdyBzb3VyY2UgbWFwc1xuICAgICAgc291cmNlbWFwOiBwcm9jZXNzLmVudi5BUFBfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8gZmFsc2UgOiB0cnVlLFxuICAgICAgLy8gU2V0IHRoZSBwYXRoIGZvciB0aGUgc2VydmljZSB3b3JrZXIgZmlsZVxuICAgICAgc3dEZXN0OiBwcm9jZXNzLmVudi5BUFBfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8gJ3B1YmxpYy9zZXJ2aWNlLXdvcmtlci5qcycgOiAnZGlzdC9zZXJ2aWNlLXdvcmtlci5qcycsXG4gICAgICAvLyBOYXZpZ2F0ZSB0byBpbmRleC5odG1sIGZvciBhbGwgNDA0IGVycm9ycyBkdXJpbmcgcHJvZHVjdGlvblxuICAgICAgbmF2aWdhdGVGYWxsYmFjazogbnVsbCxcbiAgICAgIC8vIEFsbG93bGlzdCBhbGwgcGF0aHMgZm9yIG5hdmlnYXRlRmFsbGJhY2sgZHVyaW5nIHByb2R1Y3Rpb25cbiAgICAgIG5hdmlnYXRlRmFsbGJhY2tBbGxvd2xpc3Q6IFtcbiAgICAgICAgLy8gYWxsb3cgZXZlcnl0aGluZ1xuICAgICAgICBXSUxEQ0FSRF9SRUdFWFxuICAgICAgXSxcbiAgICAgIC8vIFNldCB0aGUgZ2xvYiBkaXJlY3RvcnkgYW5kIHBhdHRlcm5zIGZvciB0aGUgY2FjaGVcbiAgICAgIGdsb2JEaXJlY3Rvcnk6IHByb2Nlc3MuZW52LkFQUF9FTlYgPT09ICdkZXZlbG9wbWVudCcgPyAnLi9wdWJsaWMnIDogJy4vZGlzdCcsXG4gICAgICBnbG9iUGF0dGVybnM6IFtcbiAgICAgICAgLy8gZm9udHNcbiAgICAgICAgJyoqLyoue3dvZmYyLHdvZmYsdHRmLGVvdH0nLFxuICAgICAgICAvLyBpbWFnZXNcbiAgICAgICAgJyoqLyoue3BuZyxqcGcsanBlZyxnaWYsc3ZnLGljb30nLFxuICAgICAgICAvLyBtZWRpYVxuICAgICAgICAnKiovKi57bXAzLG1wNCx3ZWJtfScsXG4gICAgICAgIC8vIGNvZGVcbiAgICAgICAgJyoqLyoue2pzLCBjc3N9JyxcbiAgICAgICAgLy8gZG9jc1xuICAgICAgICAnKiovKi57dHh0LHhtbCxqc29uLHBkZn0nLFxuICAgICAgICAvLyAzZCBvYmplY3RzXG4gICAgICAgICcqKi8qLntnbHRmLGdsYixiaW4sbXRsfScsXG4gICAgICAgIC8vIGNvbXByZXNzZWRcbiAgICAgICAgJyoqLyoue2JyLCBnemlwLCB6aXAscmFyLDd6fScsXG4gICAgICAgIC8vIHdlYmFzc2VtYmx5XG4gICAgICAgICcqKi8qLnt3YXNtfScsXG4gICAgICAgIC8vIGt0eDJcbiAgICAgICAgJyoqLyoue2t0eDJ9J1xuICAgICAgXSxcbiAgICAgIGdsb2JJZ25vcmVzOiBbXG4gICAgICAgIC8vIGZvbnRzXG4gICAgICAgICcqKi9wcm9qZWN0cy8qKi8qLnt3b2ZmMix3b2ZmLHR0Zixlb3R9JyxcbiAgICAgICAgLy8gaW1hZ2VzXG4gICAgICAgICcqKi9wcm9qZWN0cy8qKi8qLntwbmcsanBnLGpwZWcsZ2lmLHN2ZyxpY299JyxcbiAgICAgICAgLy8gbWVkaWFcbiAgICAgICAgJyoqL3Byb2plY3RzLyoqLyoue21wMyxtcDQsd2VibX0nLFxuICAgICAgICAvLyBjb2RlXG4gICAgICAgICcqKi9wcm9qZWN0cy8qKi8qLntqcywgY3NzfScsXG4gICAgICAgIC8vIGRvY3NcbiAgICAgICAgJyoqL3Byb2plY3RzLyoqLyoue3R4dCx4bWwsanNvbixwZGZ9JyxcbiAgICAgICAgLy8gM2Qgb2JqZWN0c1xuICAgICAgICAnKiovcHJvamVjdHMvKiovKi57Z2x0ZixnbGIsYmluLG10bH0nLFxuICAgICAgICAvLyBjb21wcmVzc2VkXG4gICAgICAgICcqKi9wcm9qZWN0cy8qKi8qLnticiwgZ3ppcCwgemlwLHJhciw3en0nLFxuICAgICAgICAvLyB3ZWJhc3NlbWJseVxuICAgICAgICAnKiovcHJvamVjdHMvKiovKi57d2FzbX0nLFxuICAgICAgICAvLyBrdHgyXG4gICAgICAgICcqKi9wcm9qZWN0cy8qKi8qLntrdHgyfSdcbiAgICAgIF0sXG4gICAgICAvLyBFbmFibGUgY2xlYW51cCBvZiBvdXRkYXRlZCBjYWNoZXNcbiAgICAgIGNsZWFudXBPdXRkYXRlZENhY2hlczogdHJ1ZSxcbiAgICAgIC8vIFNldCBtYXhpbXVtIGNhY2hlIHNpemUgdG8gMTAgTUJcbiAgICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiAxMDAwICogMTAwMCAqIDEwLFxuICAgICAgcnVudGltZUNhY2hpbmc6IFtcbiAgICAgICAgLy8gQ2FjaGUgc3RhdGljXG4gICAgICAgIHtcbiAgICAgICAgICB1cmxQYXR0ZXJuOiAoeyB1cmwgfSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIC9cXC9zdGF0aWM/LiovaS50ZXN0KHVybC5ocmVmKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNhY2hlTmFtZTogJ3N0YXRpYy1jYWNoZScsXG4gICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwMCxcbiAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogMjQgKiA2MCAqIDYwICogMzAgLy8gPD09IDMwIGRheXNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xuICAgICAgICAgICAgICBzdGF0dXNlczogWzAsIDIwMF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIENhY2hlIHN0YXRpYyByZXNvdXJjZXNcbiAgICAgICAge1xuICAgICAgICAgIHVybFBhdHRlcm46ICh7IHVybCB9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gL1xcL3N0YXRpYy1yZXNvdXJjZXM/LiovaS50ZXN0KHVybC5ocmVmKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNhY2hlTmFtZTogJ3N0YXRpYy1hc3NldHMtY2FjaGUnLFxuICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMDAsXG4gICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDI0ICogNjAgKiA2MCAqIDMwIC8vIDw9PSAzMCBkYXlzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcbiAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyBDYWNoZSBzZnggYXNzZXRzXG4gICAgICAgIHtcbiAgICAgICAgICB1cmxQYXR0ZXJuOiAoeyB1cmwgfSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIC9cXC9zZng/LiovaS50ZXN0KHVybC5ocmVmKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNhY2hlTmFtZTogJ3NmeC1hc3NldHMtY2FjaGUnLFxuICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMDAsXG4gICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDI0ICogNjAgKiA2MCAqIDMwIC8vIDw9PSAzMCBkYXlzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcbiAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyBDYWNoZSBsb2NhbCBhc3NldHNcbiAgICAgICAge1xuICAgICAgICAgIHVybFBhdHRlcm46ICh7IHVybCB9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gL1xcL2Fzc2V0cz8uKi9pLnRlc3QodXJsLmhyZWYpICYmICEvXFwvcHJvamVjdHNcXC8vaS50ZXN0KHVybC5ocmVmKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNhY2hlTmFtZTogJ2J1aWxkLWFzc2V0cy1jYWNoZScsXG4gICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwMCxcbiAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogMjQgKiA2MCAqIDYwICogMzAgLy8gPD09IDMwIGRheXNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xuICAgICAgICAgICAgICBzdGF0dXNlczogWzAsIDIwMF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIENhY2hlIGxvY2FsIGZvbnRzXG4gICAgICAgIHtcbiAgICAgICAgICB1cmxQYXR0ZXJuOiAoeyB1cmwgfSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIC9cXC9mb250cz8uKi9pLnRlc3QodXJsLmhyZWYpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG4gICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgY2FjaGVOYW1lOiAnZm9udHMtYXNzZXRzLWNhY2hlJyxcbiAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgbWF4RW50cmllczogMTAwLFxuICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiAyNCAqIDYwICogNjAgKiAzMCAvLyA8PT0gMzAgZGF5c1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7XG4gICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gQ2FjaGUgbG9jYWwgaWNvbnNcbiAgICAgICAge1xuICAgICAgICAgIHVybFBhdHRlcm46ICh7IHVybCB9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gL1xcL2ljb25zPy4qLy50ZXN0KHVybC5ocmVmKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNhY2hlTmFtZTogJ2ljb25zLWFzc2V0cy1jYWNoZScsXG4gICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwMCxcbiAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogMjQgKiA2MCAqIDYwICogMzAgLy8gPD09IDMwIGRheXNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xuICAgICAgICAgICAgICBzdGF0dXNlczogWzAsIDIwMF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIENhY2hlIGxvY2FsIHN0YXRpYyBhc3NldHNcbiAgICAgICAge1xuICAgICAgICAgIHVybFBhdHRlcm46ICh7IHVybCB9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gL1xcL3N0YXRpYz8uKi9pLnRlc3QodXJsLmhyZWYpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG4gICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgY2FjaGVOYW1lOiAnc3RhdGljLWFzc2V0cy1jYWNoZScsXG4gICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwMCxcbiAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogMjQgKiA2MCAqIDYwICogMzAgLy8gPD09IDMwIGRheXNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xuICAgICAgICAgICAgICBzdGF0dXNlczogWzAsIDIwMF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIENhY2hlIGdvb2dsZSBmb250IHJlcXVlc3RzXG4gICAgICAgIHtcbiAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ29vZ2xlYXBpc1xcLmNvbVxcLy4qL2ksXG4gICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNhY2hlTmFtZTogJ2dvb2dsZS1mb250cy1jYWNoZScsXG4gICAgICAgICAgICBleHBpcmF0aW9uOiB7XG4gICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxuICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzNjUgLy8gPD09IDM2NSBkYXlzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcbiAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdzdGF0aWNcXC5jb21cXC8uKi9pLFxuICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcbiAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBjYWNoZU5hbWU6ICdnc3RhdGljLWZvbnRzLWNhY2hlJyxcbiAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgbWF4RW50cmllczogMTAsXG4gICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDM2NSAvLyA8PT0gMzY1IGRheXNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xuICAgICAgICAgICAgICBzdGF0dXNlczogWzAsIDIwMF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIENhY2hlIGFsbCByZXF1ZXN0c1xuICAgICAgICB7XG4gICAgICAgICAgdXJsUGF0dGVybjogL15odHRwcz86XFwvXFwvLipcXC4uKi9pLFxuICAgICAgICAgIGhhbmRsZXI6ICdOZXR3b3JrRmlyc3QnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGNhY2hlTmFtZTogJ2FsbC1jb250ZW50LWNhY2hlJyxcbiAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgbWF4RW50cmllczogMTAwMCxcbiAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogMjQgKiA2MCAqIDYwIC8vIDw9PSAyNCBob3Vyc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7XG4gICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5ldHdvcmtUaW1lb3V0U2Vjb25kczogMTBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIENhY2hlIGV2ZXJ5dGhpbmcgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgdXJsUGF0dGVybjogL15cXC8qLyxcbiAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG4gICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgY2FjaGVOYW1lOiAnYWxsLWxvY2FsLWNhY2hlJyxcbiAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgbWF4RW50cmllczogMTAwLFxuICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiAyNCAqIDYwICogNjAgKiAzMCAvLyA8PT0gMzAgZGF5c1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7XG4gICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgfSlcblxuZXhwb3J0IGRlZmF1bHQgUFdBXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL2hhbnpsYW1hdGVlbi9ldGhlcmVhbGVuZ2luZS9wYWNrYWdlcy9jb21tb24vc3JjL3NjaGVtYXMvc2V0dGluZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvaGFuemxhbWF0ZWVuL2V0aGVyZWFsZW5naW5lL3BhY2thZ2VzL2NvbW1vbi9zcmMvc2NoZW1hcy9zZXR0aW5nL2NsaWVudC1zZXR0aW5nLnNjaGVtYS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9oYW56bGFtYXRlZW4vZXRoZXJlYWxlbmdpbmUvcGFja2FnZXMvY29tbW9uL3NyYy9zY2hlbWFzL3NldHRpbmcvY2xpZW50LXNldHRpbmcuc2NoZW1hLnRzXCI7LypcbkNQQUwtMS4wIExpY2Vuc2VcblxuVGhlIGNvbnRlbnRzIG9mIHRoaXMgZmlsZSBhcmUgc3ViamVjdCB0byB0aGUgQ29tbW9uIFB1YmxpYyBBdHRyaWJ1dGlvbiBMaWNlbnNlXG5WZXJzaW9uIDEuMC4gKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbndpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuaHR0cHM6Ly9naXRodWIuY29tL0V0aGVyZWFsRW5naW5lL2V0aGVyZWFsZW5naW5lL2Jsb2IvZGV2L0xJQ0VOU0UuXG5UaGUgTGljZW5zZSBpcyBiYXNlZCBvbiB0aGUgTW96aWxsYSBQdWJsaWMgTGljZW5zZSBWZXJzaW9uIDEuMSwgYnV0IFNlY3Rpb25zIDE0XG5hbmQgMTUgaGF2ZSBiZWVuIGFkZGVkIHRvIGNvdmVyIHVzZSBvZiBzb2Z0d2FyZSBvdmVyIGEgY29tcHV0ZXIgbmV0d29yayBhbmQgXG5wcm92aWRlIGZvciBsaW1pdGVkIGF0dHJpYnV0aW9uIGZvciB0aGUgT3JpZ2luYWwgRGV2ZWxvcGVyLiBJbiBhZGRpdGlvbiwgXG5FeGhpYml0IEEgaGFzIGJlZW4gbW9kaWZpZWQgdG8gYmUgY29uc2lzdGVudCB3aXRoIEV4aGliaXQgQi5cblxuU29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIGJhc2lzLFxuV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGVcbnNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyByaWdodHMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG5UaGUgT3JpZ2luYWwgQ29kZSBpcyBFdGhlcmVhbCBFbmdpbmUuXG5cblRoZSBPcmlnaW5hbCBEZXZlbG9wZXIgaXMgdGhlIEluaXRpYWwgRGV2ZWxvcGVyLiBUaGUgSW5pdGlhbCBEZXZlbG9wZXIgb2YgdGhlXG5PcmlnaW5hbCBDb2RlIGlzIHRoZSBFdGhlcmVhbCBFbmdpbmUgdGVhbS5cblxuQWxsIHBvcnRpb25zIG9mIHRoZSBjb2RlIHdyaXR0ZW4gYnkgdGhlIEV0aGVyZWFsIEVuZ2luZSB0ZWFtIGFyZSBDb3B5cmlnaHQgXHUwMEE5IDIwMjEtMjAyMyBcbkV0aGVyZWFsIEVuZ2luZS4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiovXG5cbi8vIEZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IHRoaXMgZmlsZSBzZWUgaHR0cHM6Ly9kb3ZlLmZlYXRoZXJzanMuY29tL2d1aWRlcy9jbGkvc2VydmljZS5zY2hlbWFzLmh0bWxcbmltcG9ydCB0eXBlIHsgU3RhdGljIH0gZnJvbSAnQGZlYXRoZXJzanMvdHlwZWJveCdcbmltcG9ydCB7IGdldFZhbGlkYXRvciwgcXVlcnlTeW50YXgsIFR5cGUgfSBmcm9tICdAZmVhdGhlcnNqcy90eXBlYm94J1xuXG5pbXBvcnQgeyBkYXRhVmFsaWRhdG9yLCBxdWVyeVZhbGlkYXRvciB9IGZyb20gJy4uL3ZhbGlkYXRvcnMnXG5cbmV4cG9ydCBjb25zdCBjbGllbnRTZXR0aW5nUGF0aCA9ICdjbGllbnQtc2V0dGluZydcblxuZXhwb3J0IGNvbnN0IGNsaWVudFNldHRpbmdNZXRob2RzID0gWydmaW5kJywgJ2dldCcsICdwYXRjaCddIGFzIGNvbnN0XG5cbmV4cG9ydCBjb25zdCBjbGllbnRTb2NpYWxMaW5rU2NoZW1hID0gVHlwZS5PYmplY3QoXG4gIHtcbiAgICBsaW5rOiBUeXBlLlN0cmluZygpLFxuICAgIGljb246IFR5cGUuU3RyaW5nKClcbiAgfSxcbiAgeyAkaWQ6ICdDbGllbnRTb2NpYWxMaW5rJywgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlIH1cbilcbmV4cG9ydCBpbnRlcmZhY2UgQ2xpZW50U29jaWFsTGlua1R5cGUgZXh0ZW5kcyBTdGF0aWM8dHlwZW9mIGNsaWVudFNvY2lhbExpbmtTY2hlbWE+IHt9XG5cbmV4cG9ydCBjb25zdCBhdWRpb1NldHRpbmdzU2NoZW1hID0gVHlwZS5PYmplY3QoXG4gIHtcbiAgICBtYXhCaXRyYXRlOiBUeXBlLk51bWJlcigpXG4gIH0sXG4gIHsgJGlkOiAnQXVkaW9TZXR0aW5nc1NjaGVtYScsIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSB9XG4pXG5cbmV4cG9ydCBpbnRlcmZhY2UgQXVkaW9TZXR0aW5nc1R5cGUgZXh0ZW5kcyBTdGF0aWM8dHlwZW9mIGF1ZGlvU2V0dGluZ3NTY2hlbWE+IHt9XG5cbmV4cG9ydCBjb25zdCB2aWRlb1NldHRpbmdzU2NoZW1hID0gVHlwZS5PYmplY3QoXG4gIHtcbiAgICBjb2RlYzogVHlwZS5TdHJpbmcoKSxcbiAgICBtYXhSZXNvbHV0aW9uOiBUeXBlLlN0cmluZygpLFxuICAgIGxvd1Jlc01heEJpdHJhdGU6IFR5cGUuTnVtYmVyKCksXG4gICAgbWlkUmVzTWF4Qml0cmF0ZTogVHlwZS5OdW1iZXIoKSxcbiAgICBoaWdoUmVzTWF4Qml0cmF0ZTogVHlwZS5OdW1iZXIoKVxuICB9LFxuICB7ICRpZDogJ1ZpZGVvU2V0dGluZ3NTY2hlbWEnLCBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UgfVxuKVxuXG5leHBvcnQgY29uc3Qgc2NyZWVuc2hhcmVTZXR0aW5nc1NjaGVtYSA9IFR5cGUuT2JqZWN0KFxuICB7XG4gICAgY29kZWM6IFR5cGUuU3RyaW5nKCksXG4gICAgbG93UmVzTWF4Qml0cmF0ZTogVHlwZS5OdW1iZXIoKSxcbiAgICBtaWRSZXNNYXhCaXRyYXRlOiBUeXBlLk51bWJlcigpLFxuICAgIGhpZ2hSZXNNYXhCaXRyYXRlOiBUeXBlLk51bWJlcigpXG4gIH0sXG4gIHsgJGlkOiAnU2NyZWVuc2hhcmVTZXR0aW5nc1NjaGVtYScsIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSB9XG4pXG5cbmV4cG9ydCBpbnRlcmZhY2UgVmlkZW9TZXR0aW5nc1R5cGUgZXh0ZW5kcyBTdGF0aWM8dHlwZW9mIHZpZGVvU2V0dGluZ3NTY2hlbWE+IHt9XG5cbmV4cG9ydCBjb25zdCBtZWRpYVNldHRpbmdzU2NoZW1hID0gVHlwZS5PYmplY3QoXG4gIHtcbiAgICBhdWRpbzogVHlwZS5SZWYoYXVkaW9TZXR0aW5nc1NjaGVtYSksXG4gICAgdmlkZW86IFR5cGUuUmVmKHZpZGVvU2V0dGluZ3NTY2hlbWEpLFxuICAgIHNjcmVlbnNoYXJlOiBUeXBlLlJlZihzY3JlZW5zaGFyZVNldHRpbmdzU2NoZW1hKVxuICB9LFxuICB7ICRpZDogJ01lZGlhU2V0dGluZ3NTY2hlbWEnLCBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UgfVxuKVxuXG5leHBvcnQgaW50ZXJmYWNlIE1lZGlhU2V0dGluZ3NUeXBlIGV4dGVuZHMgU3RhdGljPHR5cGVvZiBtZWRpYVNldHRpbmdzU2NoZW1hPiB7fVxuXG5leHBvcnQgY29uc3QgY2xpZW50VGhlbWVPcHRpb25zU2NoZW1hID0gVHlwZS5PYmplY3QoXG4gIHtcbiAgICB0ZXh0Q29sb3I6IFR5cGUuU3RyaW5nKCksXG4gICAgbmF2YmFyQmFja2dyb3VuZDogVHlwZS5TdHJpbmcoKSxcbiAgICBzaWRlYmFyQmFja2dyb3VuZDogVHlwZS5TdHJpbmcoKSxcbiAgICBzaWRlYmFyU2VsZWN0ZWRCYWNrZ3JvdW5kOiBUeXBlLlN0cmluZygpLFxuICAgIG1haW5CYWNrZ3JvdW5kOiBUeXBlLlN0cmluZygpLFxuICAgIHBhbmVsQmFja2dyb3VuZDogVHlwZS5TdHJpbmcoKSxcbiAgICBwYW5lbENhcmRzOiBUeXBlLlN0cmluZygpLFxuICAgIHBhbmVsQ2FyZEhvdmVyT3V0bGluZTogVHlwZS5TdHJpbmcoKSxcbiAgICBwYW5lbENhcmRJY29uOiBUeXBlLlN0cmluZygpLFxuICAgIHRleHRIZWFkaW5nOiBUeXBlLlN0cmluZygpLFxuICAgIHRleHRTdWJoZWFkaW5nOiBUeXBlLlN0cmluZygpLFxuICAgIHRleHREZXNjcmlwdGlvbjogVHlwZS5TdHJpbmcoKSxcbiAgICBpY29uQnV0dG9uQ29sb3I6IFR5cGUuU3RyaW5nKCksXG4gICAgaWNvbkJ1dHRvbkhvdmVyQ29sb3I6IFR5cGUuU3RyaW5nKCksXG4gICAgaWNvbkJ1dHRvbkJhY2tncm91bmQ6IFR5cGUuU3RyaW5nKCksXG4gICAgaWNvbkJ1dHRvblNlbGVjdGVkQmFja2dyb3VuZDogVHlwZS5TdHJpbmcoKSxcbiAgICBidXR0b25PdXRsaW5lZDogVHlwZS5TdHJpbmcoKSxcbiAgICBidXR0b25GaWxsZWQ6IFR5cGUuU3RyaW5nKCksXG4gICAgYnV0dG9uR3JhZGllbnRTdGFydDogVHlwZS5TdHJpbmcoKSxcbiAgICBidXR0b25HcmFkaWVudEVuZDogVHlwZS5TdHJpbmcoKSxcbiAgICBidXR0b25UZXh0Q29sb3I6IFR5cGUuU3RyaW5nKCksXG4gICAgc2Nyb2xsYmFyVGh1bWJYQXhpc1N0YXJ0OiBUeXBlLlN0cmluZygpLFxuICAgIHNjcm9sbGJhclRodW1iWEF4aXNFbmQ6IFR5cGUuU3RyaW5nKCksXG4gICAgc2Nyb2xsYmFyVGh1bWJZQXhpc1N0YXJ0OiBUeXBlLlN0cmluZygpLFxuICAgIHNjcm9sbGJhclRodW1iWUF4aXNFbmQ6IFR5cGUuU3RyaW5nKCksXG4gICAgc2Nyb2xsYmFyQ29ybmVyOiBUeXBlLlN0cmluZygpLFxuICAgIGlucHV0T3V0bGluZTogVHlwZS5TdHJpbmcoKSxcbiAgICBpbnB1dEJhY2tncm91bmQ6IFR5cGUuU3RyaW5nKCksXG4gICAgcHJpbWFyeUhpZ2hsaWdodDogVHlwZS5TdHJpbmcoKSxcbiAgICBkcm9wZG93bk1lbnVCYWNrZ3JvdW5kOiBUeXBlLlN0cmluZygpLFxuICAgIGRyb3Bkb3duTWVudUhvdmVyQmFja2dyb3VuZDogVHlwZS5TdHJpbmcoKSxcbiAgICBkcm9wZG93bk1lbnVTZWxlY3RlZEJhY2tncm91bmQ6IFR5cGUuU3RyaW5nKCksXG4gICAgZHJhd2VyQmFja2dyb3VuZDogVHlwZS5TdHJpbmcoKSxcbiAgICBwb3B1cEJhY2tncm91bmQ6IFR5cGUuU3RyaW5nKCksXG4gICAgdGFibGVIZWFkZXJCYWNrZ3JvdW5kOiBUeXBlLlN0cmluZygpLFxuICAgIHRhYmxlQ2VsbEJhY2tncm91bmQ6IFR5cGUuU3RyaW5nKCksXG4gICAgdGFibGVGb290ZXJCYWNrZ3JvdW5kOiBUeXBlLlN0cmluZygpLFxuICAgIGRvY2tCYWNrZ3JvdW5kOiBUeXBlLlN0cmluZygpXG4gIH0sXG4gIHsgJGlkOiAnQ2xpZW50VGhlbWVPcHRpb25zJywgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlIH1cbilcbmV4cG9ydCBpbnRlcmZhY2UgQ2xpZW50VGhlbWVPcHRpb25zVHlwZSBleHRlbmRzIFN0YXRpYzx0eXBlb2YgY2xpZW50VGhlbWVPcHRpb25zU2NoZW1hPiB7fVxuXG4vLyBNYWluIGRhdGEgbW9kZWwgc2NoZW1hXG5leHBvcnQgY29uc3QgY2xpZW50U2V0dGluZ1NjaGVtYSA9IFR5cGUuT2JqZWN0KFxuICB7XG4gICAgaWQ6IFR5cGUuU3RyaW5nKHtcbiAgICAgIGZvcm1hdDogJ3V1aWQnXG4gICAgfSksXG4gICAgbG9nbzogVHlwZS5TdHJpbmcoKSxcbiAgICB0aXRsZTogVHlwZS5TdHJpbmcoKSxcbiAgICBzaG9ydFRpdGxlOiBUeXBlLlN0cmluZygpLFxuICAgIHN0YXJ0UGF0aDogVHlwZS5TdHJpbmcoKSxcbiAgICB1cmw6IFR5cGUuU3RyaW5nKCksXG4gICAgcmVsZWFzZU5hbWU6IFR5cGUuU3RyaW5nKCksXG4gICAgc2l0ZURlc2NyaXB0aW9uOiBUeXBlLlN0cmluZygpLFxuICAgIGFwcGxlVG91Y2hJY29uOiBUeXBlLlN0cmluZygpLFxuICAgIGZhdmljb24zMnB4OiBUeXBlLlN0cmluZygpLFxuICAgIGZhdmljb24xNnB4OiBUeXBlLlN0cmluZygpLFxuICAgIGljb24xOTJweDogVHlwZS5TdHJpbmcoKSxcbiAgICBpY29uNTEycHg6IFR5cGUuU3RyaW5nKCksXG4gICAgc2l0ZU1hbmlmZXN0OiBUeXBlLlN0cmluZygpLFxuICAgIHNhZmFyaVBpbm5lZFRhYjogVHlwZS5TdHJpbmcoKSxcbiAgICBmYXZpY29uOiBUeXBlLlN0cmluZygpLFxuICAgIHdlYm1hbmlmZXN0TGluazogVHlwZS5TdHJpbmcoKSxcbiAgICBzd1NjcmlwdExpbms6IFR5cGUuU3RyaW5nKCksXG4gICAgYXBwQmFja2dyb3VuZDogVHlwZS5TdHJpbmcoKSxcbiAgICBhcHBUaXRsZTogVHlwZS5TdHJpbmcoKSxcbiAgICBhcHBTdWJ0aXRsZTogVHlwZS5TdHJpbmcoKSxcbiAgICBhcHBEZXNjcmlwdGlvbjogVHlwZS5TdHJpbmcoKSxcbiAgICBhcHBTb2NpYWxMaW5rczogVHlwZS5BcnJheShUeXBlLlJlZihjbGllbnRTb2NpYWxMaW5rU2NoZW1hKSksXG4gICAgdGhlbWVTZXR0aW5nczogVHlwZS5SZWNvcmQoVHlwZS5TdHJpbmcoKSwgVHlwZS5SZWYoY2xpZW50VGhlbWVPcHRpb25zU2NoZW1hKSksXG4gICAgdGhlbWVNb2RlczogVHlwZS5SZWNvcmQoVHlwZS5TdHJpbmcoKSwgVHlwZS5TdHJpbmcoKSksXG4gICAga2V5OHRoV2FsbDogVHlwZS5TdHJpbmcoKSxcbiAgICBwcml2YWN5UG9saWN5OiBUeXBlLlN0cmluZygpLFxuICAgIGhvbWVwYWdlTGlua0J1dHRvbkVuYWJsZWQ6IFR5cGUuQm9vbGVhbigpLFxuICAgIGhvbWVwYWdlTGlua0J1dHRvblJlZGlyZWN0OiBUeXBlLlN0cmluZygpLFxuICAgIGhvbWVwYWdlTGlua0J1dHRvblRleHQ6IFR5cGUuU3RyaW5nKCksXG4gICAgY3JlYXRlZEF0OiBUeXBlLlN0cmluZyh7IGZvcm1hdDogJ2RhdGUtdGltZScgfSksXG4gICAgdXBkYXRlZEF0OiBUeXBlLlN0cmluZyh7IGZvcm1hdDogJ2RhdGUtdGltZScgfSksXG4gICAgbWVkaWFTZXR0aW5nczogVHlwZS5SZWYobWVkaWFTZXR0aW5nc1NjaGVtYSlcbiAgfSxcbiAgeyAkaWQ6ICdDbGllbnRTZXR0aW5nJywgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlIH1cbilcbmV4cG9ydCBpbnRlcmZhY2UgQ2xpZW50U2V0dGluZ1R5cGUgZXh0ZW5kcyBTdGF0aWM8dHlwZW9mIGNsaWVudFNldHRpbmdTY2hlbWE+IHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpZW50U2V0dGluZ0RhdGFiYXNlVHlwZVxuICBleHRlbmRzIE9taXQ8Q2xpZW50U2V0dGluZ1R5cGUsICdhcHBTb2NpYWxMaW5rcycgfCAndGhlbWVTZXR0aW5ncycgfCAndGhlbWVNb2Rlcyc+IHtcbiAgYXBwU29jaWFsTGlua3M6IHN0cmluZ1xuICB0aGVtZVNldHRpbmdzOiBzdHJpbmdcbiAgdGhlbWVNb2Rlczogc3RyaW5nXG59XG5cbi8vIFNjaGVtYSBmb3IgY3JlYXRpbmcgbmV3IGVudHJpZXNcbmV4cG9ydCBjb25zdCBjbGllbnRTZXR0aW5nRGF0YVNjaGVtYSA9IFR5cGUuUGljayhcbiAgY2xpZW50U2V0dGluZ1NjaGVtYSxcbiAgW1xuICAgICdsb2dvJyxcbiAgICAndGl0bGUnLFxuICAgICdzaG9ydFRpdGxlJyxcbiAgICAnc3RhcnRQYXRoJyxcbiAgICAndXJsJyxcbiAgICAncmVsZWFzZU5hbWUnLFxuICAgICdzaXRlRGVzY3JpcHRpb24nLFxuICAgICdmYXZpY29uMzJweCcsXG4gICAgJ2Zhdmljb24xNnB4JyxcbiAgICAnaWNvbjE5MnB4JyxcbiAgICAnaWNvbjUxMnB4JyxcbiAgICAnd2VibWFuaWZlc3RMaW5rJyxcbiAgICAnc3dTY3JpcHRMaW5rJyxcbiAgICAnYXBwQmFja2dyb3VuZCcsXG4gICAgJ2FwcFRpdGxlJyxcbiAgICAnYXBwU3VidGl0bGUnLFxuICAgICdhcHBEZXNjcmlwdGlvbicsXG4gICAgJ2FwcFNvY2lhbExpbmtzJyxcbiAgICAndGhlbWVTZXR0aW5ncycsXG4gICAgJ3RoZW1lTW9kZXMnLFxuICAgICdrZXk4dGhXYWxsJyxcbiAgICAncHJpdmFjeVBvbGljeScsXG4gICAgJ2hvbWVwYWdlTGlua0J1dHRvbkVuYWJsZWQnLFxuICAgICdob21lcGFnZUxpbmtCdXR0b25SZWRpcmVjdCcsXG4gICAgJ2hvbWVwYWdlTGlua0J1dHRvblRleHQnLFxuICAgICdtZWRpYVNldHRpbmdzJ1xuICBdLFxuICB7XG4gICAgJGlkOiAnQ2xpZW50U2V0dGluZ0RhdGEnXG4gIH1cbilcbmV4cG9ydCBpbnRlcmZhY2UgQ2xpZW50U2V0dGluZ0RhdGEgZXh0ZW5kcyBTdGF0aWM8dHlwZW9mIGNsaWVudFNldHRpbmdEYXRhU2NoZW1hPiB7fVxuXG4vLyBTY2hlbWEgZm9yIHVwZGF0aW5nIGV4aXN0aW5nIGVudHJpZXNcbmV4cG9ydCBjb25zdCBjbGllbnRTZXR0aW5nUGF0Y2hTY2hlbWEgPSBUeXBlLlBhcnRpYWwoY2xpZW50U2V0dGluZ1NjaGVtYSwge1xuICAkaWQ6ICdDbGllbnRTZXR0aW5nUGF0Y2gnXG59KVxuZXhwb3J0IGludGVyZmFjZSBDbGllbnRTZXR0aW5nUGF0Y2ggZXh0ZW5kcyBTdGF0aWM8dHlwZW9mIGNsaWVudFNldHRpbmdQYXRjaFNjaGVtYT4ge31cblxuLy8gU2NoZW1hIGZvciBhbGxvd2VkIHF1ZXJ5IHByb3BlcnRpZXNcbmV4cG9ydCBjb25zdCBjbGllbnRTZXR0aW5nUXVlcnlQcm9wZXJ0aWVzID0gVHlwZS5QaWNrKGNsaWVudFNldHRpbmdTY2hlbWEsIFtcbiAgJ2lkJyxcbiAgJ2xvZ28nLFxuICAndGl0bGUnLFxuICAnc2hvcnRUaXRsZScsXG4gICdzdGFydFBhdGgnLFxuICAndXJsJyxcbiAgJ3JlbGVhc2VOYW1lJyxcbiAgJ3NpdGVEZXNjcmlwdGlvbicsXG4gICdmYXZpY29uMzJweCcsXG4gICdmYXZpY29uMTZweCcsXG4gICdpY29uMTkycHgnLFxuICAnaWNvbjUxMnB4JyxcbiAgJ3dlYm1hbmlmZXN0TGluaycsXG4gICdzd1NjcmlwdExpbmsnLFxuICAnYXBwQmFja2dyb3VuZCcsXG4gICdhcHBUaXRsZScsXG4gICdhcHBTdWJ0aXRsZScsXG4gICdhcHBEZXNjcmlwdGlvbicsXG4gIC8vICdhcHBTb2NpYWxMaW5rcycsIENvbW1lbnRlZCBvdXQgYmVjYXVzZTogaHR0cHM6Ly9kaXNjb3JkLmNvbS9jaGFubmVscy81MDk4NDg0ODA3NjA3MjU1MTQvMTA5MzkxNDQwNTU0NjIyOTg0MC8xMDk1MTAxNTM2MTIxNjY3Njk0XG4gIC8vICd0aGVtZVNldHRpbmdzJyxcbiAgLy8gJ3RoZW1lTW9kZXMnLFxuICAna2V5OHRoV2FsbCcsXG4gICdwcml2YWN5UG9saWN5JyxcbiAgJ2hvbWVwYWdlTGlua0J1dHRvbkVuYWJsZWQnLFxuICAnaG9tZXBhZ2VMaW5rQnV0dG9uUmVkaXJlY3QnLFxuICAnaG9tZXBhZ2VMaW5rQnV0dG9uVGV4dCdcbl0pXG5leHBvcnQgY29uc3QgY2xpZW50U2V0dGluZ1F1ZXJ5U2NoZW1hID0gVHlwZS5JbnRlcnNlY3QoXG4gIFtcbiAgICBxdWVyeVN5bnRheChjbGllbnRTZXR0aW5nUXVlcnlQcm9wZXJ0aWVzKSxcbiAgICAvLyBBZGQgYWRkaXRpb25hbCBxdWVyeSBwcm9wZXJ0aWVzIGhlcmVcbiAgICBUeXBlLk9iamVjdCh7fSwgeyBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UgfSlcbiAgXSxcbiAgeyBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UgfVxuKVxuZXhwb3J0IGludGVyZmFjZSBDbGllbnRTZXR0aW5nUXVlcnkgZXh0ZW5kcyBTdGF0aWM8dHlwZW9mIGNsaWVudFNldHRpbmdRdWVyeVNjaGVtYT4ge31cblxuZXhwb3J0IGNvbnN0IGF1ZGlvU2V0dGluZ3NWYWxpZGF0b3IgPSAvKiBAX19QVVJFX18gKi8gZ2V0VmFsaWRhdG9yKGF1ZGlvU2V0dGluZ3NTY2hlbWEsIGRhdGFWYWxpZGF0b3IpXG5leHBvcnQgY29uc3QgdmlkZW9TZXR0aW5nc1ZhbGlkYXRvciA9IC8qIEBfX1BVUkVfXyAqLyBnZXRWYWxpZGF0b3IodmlkZW9TZXR0aW5nc1NjaGVtYSwgZGF0YVZhbGlkYXRvcilcbmV4cG9ydCBjb25zdCBzY3JlZW5zaGFyZVNldHRpbmdzVmFsaWRhdG9yID0gLyogQF9fUFVSRV9fICovIGdldFZhbGlkYXRvcihzY3JlZW5zaGFyZVNldHRpbmdzU2NoZW1hLCBkYXRhVmFsaWRhdG9yKVxuZXhwb3J0IGNvbnN0IG1lZGlhU2V0dGluZ3NWYWxpZGF0b3IgPSAvKiBAX19QVVJFX18gKi8gZ2V0VmFsaWRhdG9yKG1lZGlhU2V0dGluZ3NTY2hlbWEsIGRhdGFWYWxpZGF0b3IpXG5leHBvcnQgY29uc3QgY2xpZW50U29jaWFsTGlua1ZhbGlkYXRvciA9IC8qIEBfX1BVUkVfXyAqLyBnZXRWYWxpZGF0b3IoY2xpZW50U29jaWFsTGlua1NjaGVtYSwgZGF0YVZhbGlkYXRvcilcbmV4cG9ydCBjb25zdCBjbGllbnRUaGVtZU9wdGlvbnNWYWxpZGF0b3IgPSAvKiBAX19QVVJFX18gKi8gZ2V0VmFsaWRhdG9yKGNsaWVudFRoZW1lT3B0aW9uc1NjaGVtYSwgZGF0YVZhbGlkYXRvcilcbmV4cG9ydCBjb25zdCBjbGllbnRTZXR0aW5nVmFsaWRhdG9yID0gLyogQF9fUFVSRV9fICovIGdldFZhbGlkYXRvcihjbGllbnRTZXR0aW5nU2NoZW1hLCBkYXRhVmFsaWRhdG9yKVxuZXhwb3J0IGNvbnN0IGNsaWVudFNldHRpbmdEYXRhVmFsaWRhdG9yID0gLyogQF9fUFVSRV9fICovIGdldFZhbGlkYXRvcihjbGllbnRTZXR0aW5nRGF0YVNjaGVtYSwgZGF0YVZhbGlkYXRvcilcbmV4cG9ydCBjb25zdCBjbGllbnRTZXR0aW5nUGF0Y2hWYWxpZGF0b3IgPSAvKiBAX19QVVJFX18gKi8gZ2V0VmFsaWRhdG9yKGNsaWVudFNldHRpbmdQYXRjaFNjaGVtYSwgZGF0YVZhbGlkYXRvcilcbmV4cG9ydCBjb25zdCBjbGllbnRTZXR0aW5nUXVlcnlWYWxpZGF0b3IgPSAvKiBAX19QVVJFX18gKi8gZ2V0VmFsaWRhdG9yKGNsaWVudFNldHRpbmdRdWVyeVNjaGVtYSwgcXVlcnlWYWxpZGF0b3IpXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL2hhbnpsYW1hdGVlbi9ldGhlcmVhbGVuZ2luZS9wYWNrYWdlcy9jb21tb24vc3JjL3NjaGVtYXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2hhbnpsYW1hdGVlbi9ldGhlcmVhbGVuZ2luZS9wYWNrYWdlcy9jb21tb24vc3JjL3NjaGVtYXMvdmFsaWRhdG9ycy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9oYW56bGFtYXRlZW4vZXRoZXJlYWxlbmdpbmUvcGFja2FnZXMvY29tbW9uL3NyYy9zY2hlbWFzL3ZhbGlkYXRvcnMudHNcIjsvKlxuQ1BBTC0xLjAgTGljZW5zZVxuXG5UaGUgY29udGVudHMgb2YgdGhpcyBmaWxlIGFyZSBzdWJqZWN0IHRvIHRoZSBDb21tb24gUHVibGljIEF0dHJpYnV0aW9uIExpY2Vuc2VcblZlcnNpb24gMS4wLiAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxud2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5odHRwczovL2dpdGh1Yi5jb20vRXRoZXJlYWxFbmdpbmUvZXRoZXJlYWxlbmdpbmUvYmxvYi9kZXYvTElDRU5TRS5cblRoZSBMaWNlbnNlIGlzIGJhc2VkIG9uIHRoZSBNb3ppbGxhIFB1YmxpYyBMaWNlbnNlIFZlcnNpb24gMS4xLCBidXQgU2VjdGlvbnMgMTRcbmFuZCAxNSBoYXZlIGJlZW4gYWRkZWQgdG8gY292ZXIgdXNlIG9mIHNvZnR3YXJlIG92ZXIgYSBjb21wdXRlciBuZXR3b3JrIGFuZCBcbnByb3ZpZGUgZm9yIGxpbWl0ZWQgYXR0cmlidXRpb24gZm9yIHRoZSBPcmlnaW5hbCBEZXZlbG9wZXIuIEluIGFkZGl0aW9uLCBcbkV4aGliaXQgQSBoYXMgYmVlbiBtb2RpZmllZCB0byBiZSBjb25zaXN0ZW50IHdpdGggRXhoaWJpdCBCLlxuXG5Tb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsXG5XSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZVxuc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHJpZ2h0cyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cblRoZSBPcmlnaW5hbCBDb2RlIGlzIEV0aGVyZWFsIEVuZ2luZS5cblxuVGhlIE9yaWdpbmFsIERldmVsb3BlciBpcyB0aGUgSW5pdGlhbCBEZXZlbG9wZXIuIFRoZSBJbml0aWFsIERldmVsb3BlciBvZiB0aGVcbk9yaWdpbmFsIENvZGUgaXMgdGhlIEV0aGVyZWFsIEVuZ2luZSB0ZWFtLlxuXG5BbGwgcG9ydGlvbnMgb2YgdGhlIGNvZGUgd3JpdHRlbiBieSB0aGUgRXRoZXJlYWwgRW5naW5lIHRlYW0gYXJlIENvcHlyaWdodCBcdTAwQTkgMjAyMS0yMDIzIFxuRXRoZXJlYWwgRW5naW5lLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuKi9cblxuLy8gRm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBmaWxlIHNlZSBodHRwczovL2RvdmUuZmVhdGhlcnNqcy5jb20vZ3VpZGVzL2NsaS92YWxpZGF0b3JzLmh0bWxcbmltcG9ydCB0eXBlIHsgRm9ybWF0c1BsdWdpbk9wdGlvbnMgfSBmcm9tICdAZmVhdGhlcnNqcy9zY2hlbWEnXG5pbXBvcnQgeyBhZGRGb3JtYXRzLCBBanYgfSBmcm9tICdAZmVhdGhlcnNqcy9zY2hlbWEnXG5cbmNvbnN0IGZvcm1hdHM6IEZvcm1hdHNQbHVnaW5PcHRpb25zID0gW1xuICAnZGF0ZS10aW1lJyxcbiAgJ3RpbWUnLFxuICAnZGF0ZScsXG4gICdlbWFpbCcsXG4gICdob3N0bmFtZScsXG4gICdpcHY0JyxcbiAgJ2lwdjYnLFxuICAndXJpJyxcbiAgJ3VyaS1yZWZlcmVuY2UnLFxuICAndXVpZCcsXG4gICd1cmktdGVtcGxhdGUnLFxuICAnanNvbi1wb2ludGVyJyxcbiAgJ3JlbGF0aXZlLWpzb24tcG9pbnRlcicsXG4gICdyZWdleCdcbl1cblxuZXhwb3J0IGNvbnN0IGRhdGFWYWxpZGF0b3I6IEFqdiA9IGFkZEZvcm1hdHMobmV3IEFqdih7fSksIGZvcm1hdHMpXG5cbmV4cG9ydCBjb25zdCBxdWVyeVZhbGlkYXRvcjogQWp2ID0gYWRkRm9ybWF0cyhcbiAgbmV3IEFqdih7XG4gICAgY29lcmNlVHlwZXM6IHRydWVcbiAgfSksXG4gIGZvcm1hdHNcbilcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvaGFuemxhbWF0ZWVuL2V0aGVyZWFsZW5naW5lL3BhY2thZ2VzL2NsaWVudC9zY3JpcHRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9oYW56bGFtYXRlZW4vZXRoZXJlYWxlbmdpbmUvcGFja2FnZXMvY2xpZW50L3NjcmlwdHMvZ2V0Q2xpZW50U2V0dGluZ3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvaGFuemxhbWF0ZWVuL2V0aGVyZWFsZW5naW5lL3BhY2thZ2VzL2NsaWVudC9zY3JpcHRzL2dldENsaWVudFNldHRpbmdzLnRzXCI7LypcbkNQQUwtMS4wIExpY2Vuc2VcblxuVGhlIGNvbnRlbnRzIG9mIHRoaXMgZmlsZSBhcmUgc3ViamVjdCB0byB0aGUgQ29tbW9uIFB1YmxpYyBBdHRyaWJ1dGlvbiBMaWNlbnNlXG5WZXJzaW9uIDEuMC4gKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2VcbndpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuaHR0cHM6Ly9naXRodWIuY29tL0V0aGVyZWFsRW5naW5lL2V0aGVyZWFsZW5naW5lL2Jsb2IvZGV2L0xJQ0VOU0UuXG5UaGUgTGljZW5zZSBpcyBiYXNlZCBvbiB0aGUgTW96aWxsYSBQdWJsaWMgTGljZW5zZSBWZXJzaW9uIDEuMSwgYnV0IFNlY3Rpb25zIDE0XG5hbmQgMTUgaGF2ZSBiZWVuIGFkZGVkIHRvIGNvdmVyIHVzZSBvZiBzb2Z0d2FyZSBvdmVyIGEgY29tcHV0ZXIgbmV0d29yayBhbmQgXG5wcm92aWRlIGZvciBsaW1pdGVkIGF0dHJpYnV0aW9uIGZvciB0aGUgT3JpZ2luYWwgRGV2ZWxvcGVyLiBJbiBhZGRpdGlvbiwgXG5FeGhpYml0IEEgaGFzIGJlZW4gbW9kaWZpZWQgdG8gYmUgY29uc2lzdGVudCB3aXRoIEV4aGliaXQgQi5cblxuU29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIGJhc2lzLFxuV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGVcbnNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyByaWdodHMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG5UaGUgT3JpZ2luYWwgQ29kZSBpcyBFdGhlcmVhbCBFbmdpbmUuXG5cblRoZSBPcmlnaW5hbCBEZXZlbG9wZXIgaXMgdGhlIEluaXRpYWwgRGV2ZWxvcGVyLiBUaGUgSW5pdGlhbCBEZXZlbG9wZXIgb2YgdGhlXG5PcmlnaW5hbCBDb2RlIGlzIHRoZSBFdGhlcmVhbCBFbmdpbmUgdGVhbS5cblxuQWxsIHBvcnRpb25zIG9mIHRoZSBjb2RlIHdyaXR0ZW4gYnkgdGhlIEV0aGVyZWFsIEVuZ2luZSB0ZWFtIGFyZSBDb3B5cmlnaHQgXHUwMEE5IDIwMjEtMjAyMyBcbkV0aGVyZWFsIEVuZ2luZS4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiovXG5cbmltcG9ydCB7IENsaWVudFNldHRpbmdEYXRhYmFzZVR5cGUsIGNsaWVudFNldHRpbmdQYXRoIH0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy9zY2hlbWFzL3NldHRpbmcvY2xpZW50LXNldHRpbmcuc2NoZW1hJ1xuXG5pbXBvcnQga25leCBmcm9tICdrbmV4J1xuaW1wb3J0IHsgY2xpZW50RGJUb1NjaGVtYSB9IGZyb20gJy4uLy4uL3NlcnZlci1jb3JlL3NyYy9zZXR0aW5nL2NsaWVudC1zZXR0aW5nL2NsaWVudC1zZXR0aW5nLnJlc29sdmVycydcblxuZXhwb3J0IGNvbnN0IGdldENsaWVudFNldHRpbmcgPSBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGtuZXhDbGllbnQgPSBrbmV4KHtcbiAgICBjbGllbnQ6ICdteXNxbCcsXG4gICAgY29ubmVjdGlvbjoge1xuICAgICAgdXNlcjogcHJvY2Vzcy5lbnYuTVlTUUxfVVNFUiA/PyAnc2VydmVyJyxcbiAgICAgIHBhc3N3b3JkOiBwcm9jZXNzLmVudi5NWVNRTF9QQVNTV09SRCA/PyAncGFzc3dvcmQnLFxuICAgICAgaG9zdDogcHJvY2Vzcy5lbnYuTVlTUUxfSE9TVCA/PyAnMTI3LjAuMC4xJyxcbiAgICAgIHBvcnQ6IHBhcnNlSW50KHByb2Nlc3MuZW52Lk1ZU1FMX1BPUlQgfHwgJzMzMDYnKSxcbiAgICAgIGRhdGFiYXNlOiBwcm9jZXNzLmVudi5NWVNRTF9EQVRBQkFTRSA/PyAnZXRoZXJlYWxlbmdpbmUnLFxuICAgICAgY2hhcnNldDogJ3V0ZjhtYjQnXG4gICAgfVxuICB9KVxuXG4gIGNvbnN0IGNsaWVudFNldHRpbmcgPSBhd2FpdCBrbmV4Q2xpZW50XG4gICAgLnNlbGVjdCgpXG4gICAgLmZyb208Q2xpZW50U2V0dGluZ0RhdGFiYXNlVHlwZT4oY2xpZW50U2V0dGluZ1BhdGgpXG4gICAgLnRoZW4oKFtkYkNsaWVudF0pID0+IHtcbiAgICAgIGNvbnN0IGRiQ2xpZW50Q29uZmlnID0gY2xpZW50RGJUb1NjaGVtYShkYkNsaWVudCkgfHwge1xuICAgICAgICBsb2dvOiAnLi9sb2dvLnN2ZycsXG4gICAgICAgIHRpdGxlOiAnSVIgRW5naW5lJyxcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9sb2NhbC5ldGhlcmVhbGVuZ2luZS5vcmcnLFxuICAgICAgICByZWxlYXNlTmFtZTogJ2xvY2FsJyxcbiAgICAgICAgc2l0ZURlc2NyaXB0aW9uOiAnQ29ubmVjdGVkIFdvcmxkcyBmb3IgRXZlcnlvbmUnLFxuICAgICAgICBmYXZpY29uMzJweDogJy9mYXZpY29uLTMyeDMyLnBuZycsXG4gICAgICAgIGZhdmljb24xNnB4OiAnL2Zhdmljb24tMTZ4MTYucG5nJyxcbiAgICAgICAgaWNvbjE5MnB4OiAnL2FuZHJvaWQtY2hyb21lLTE5MngxOTIucG5nJyxcbiAgICAgICAgaWNvbjUxMnB4OiAnL2FuZHJvaWQtY2hyb21lLTUxMng1MTIucG5nJ1xuICAgICAgfVxuICAgICAgaWYgKGRiQ2xpZW50Q29uZmlnKSB7XG4gICAgICAgIHJldHVybiBkYkNsaWVudENvbmZpZ1xuICAgICAgfVxuICAgIH0pXG4gICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oJ1t2aXRlLmNvbmZpZ106IEZhaWxlZCB0byByZWFkIGNsaWVudFNldHRpbmcnKVxuICAgICAgY29uc29sZS53YXJuKGUpXG4gICAgfSlcblxuICBhd2FpdCBrbmV4Q2xpZW50LmRlc3Ryb3koKVxuXG4gIHJldHVybiBjbGllbnRTZXR0aW5nIVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9oYW56bGFtYXRlZW4vZXRoZXJlYWxlbmdpbmUvcGFja2FnZXMvc2VydmVyLWNvcmUvc3JjL3NldHRpbmcvY2xpZW50LXNldHRpbmdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2hhbnpsYW1hdGVlbi9ldGhlcmVhbGVuZ2luZS9wYWNrYWdlcy9zZXJ2ZXItY29yZS9zcmMvc2V0dGluZy9jbGllbnQtc2V0dGluZy9jbGllbnQtc2V0dGluZy5yZXNvbHZlcnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvaGFuemxhbWF0ZWVuL2V0aGVyZWFsZW5naW5lL3BhY2thZ2VzL3NlcnZlci1jb3JlL3NyYy9zZXR0aW5nL2NsaWVudC1zZXR0aW5nL2NsaWVudC1zZXR0aW5nLnJlc29sdmVycy50c1wiOy8qXG5DUEFMLTEuMCBMaWNlbnNlXG5cblRoZSBjb250ZW50cyBvZiB0aGlzIGZpbGUgYXJlIHN1YmplY3QgdG8gdGhlIENvbW1vbiBQdWJsaWMgQXR0cmlidXRpb24gTGljZW5zZVxuVmVyc2lvbiAxLjAuICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG53aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbmh0dHBzOi8vZ2l0aHViLmNvbS9FdGhlcmVhbEVuZ2luZS9ldGhlcmVhbGVuZ2luZS9ibG9iL2Rldi9MSUNFTlNFLlxuVGhlIExpY2Vuc2UgaXMgYmFzZWQgb24gdGhlIE1vemlsbGEgUHVibGljIExpY2Vuc2UgVmVyc2lvbiAxLjEsIGJ1dCBTZWN0aW9ucyAxNFxuYW5kIDE1IGhhdmUgYmVlbiBhZGRlZCB0byBjb3ZlciB1c2Ugb2Ygc29mdHdhcmUgb3ZlciBhIGNvbXB1dGVyIG5ldHdvcmsgYW5kIFxucHJvdmlkZSBmb3IgbGltaXRlZCBhdHRyaWJ1dGlvbiBmb3IgdGhlIE9yaWdpbmFsIERldmVsb3Blci4gSW4gYWRkaXRpb24sIFxuRXhoaWJpdCBBIGhhcyBiZWVuIG1vZGlmaWVkIHRvIGJlIGNvbnNpc3RlbnQgd2l0aCBFeGhpYml0IEIuXG5cblNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBiYXNpcyxcbldJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlXG5zcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcmlnaHRzIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuVGhlIE9yaWdpbmFsIENvZGUgaXMgRXRoZXJlYWwgRW5naW5lLlxuXG5UaGUgT3JpZ2luYWwgRGV2ZWxvcGVyIGlzIHRoZSBJbml0aWFsIERldmVsb3Blci4gVGhlIEluaXRpYWwgRGV2ZWxvcGVyIG9mIHRoZVxuT3JpZ2luYWwgQ29kZSBpcyB0aGUgRXRoZXJlYWwgRW5naW5lIHRlYW0uXG5cbkFsbCBwb3J0aW9ucyBvZiB0aGUgY29kZSB3cml0dGVuIGJ5IHRoZSBFdGhlcmVhbCBFbmdpbmUgdGVhbSBhcmUgQ29weXJpZ2h0IFx1MDBBOSAyMDIxLTIwMjMgXG5FdGhlcmVhbCBFbmdpbmUuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4qL1xuXG4vLyBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIGZpbGUgc2VlIGh0dHBzOi8vZG92ZS5mZWF0aGVyc2pzLmNvbS9ndWlkZXMvY2xpL3NlcnZpY2Uuc2NoZW1hcy5odG1sXG5pbXBvcnQgeyByZXNvbHZlLCB2aXJ0dWFsIH0gZnJvbSAnQGZlYXRoZXJzanMvc2NoZW1hJ1xuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCdcblxuaW1wb3J0IHtcbiAgQ2xpZW50U2V0dGluZ0RhdGFiYXNlVHlwZSxcbiAgQ2xpZW50U2V0dGluZ1F1ZXJ5LFxuICBDbGllbnRTZXR0aW5nVHlwZSxcbiAgQ2xpZW50U29jaWFsTGlua1R5cGUsXG4gIENsaWVudFRoZW1lT3B0aW9uc1R5cGVcbn0gZnJvbSAnQGV0aGVyZWFsZW5naW5lL2NvbW1vbi9zcmMvc2NoZW1hcy9zZXR0aW5nL2NsaWVudC1zZXR0aW5nLnNjaGVtYSdcbmltcG9ydCB0eXBlIHsgSG9va0NvbnRleHQgfSBmcm9tICdAZXRoZXJlYWxlbmdpbmUvc2VydmVyLWNvcmUvZGVjbGFyYXRpb25zJ1xuXG5pbXBvcnQgeyBmcm9tRGF0ZVRpbWVTcWwsIGdldERhdGVUaW1lU3FsIH0gZnJvbSAnLi4vLi4vLi4vLi4vY29tbW9uL3NyYy91dGlscy9kYXRldGltZS1zcWwnXG5cbmV4cG9ydCBjb25zdCBjbGllbnREYlRvU2NoZW1hID0gKHJhd0RhdGE6IENsaWVudFNldHRpbmdEYXRhYmFzZVR5cGUpOiBDbGllbnRTZXR0aW5nVHlwZSA9PiB7XG4gIGxldCBhcHBTb2NpYWxMaW5rcyA9IEpTT04ucGFyc2UocmF3RGF0YS5hcHBTb2NpYWxMaW5rcykgYXMgQ2xpZW50U29jaWFsTGlua1R5cGVbXVxuXG4gIC8vIFVzdWFsbHkgYWJvdmUgSlNPTi5wYXJzZSBzaG91bGQgYmUgZW5vdWdoLiBCdXQgc2luY2Ugb3VyIHByZS1mZWF0aGVycyA1IGRhdGFcbiAgLy8gd2FzIHNlcmlhbGl6ZWQgbXVsdGlwbGUgdGltZXMsIHRoZXJlZm9yZSB3ZSBuZWVkIHRvIHBhcnNlIGl0IHR3aWNlLlxuICBpZiAodHlwZW9mIGFwcFNvY2lhbExpbmtzID09PSAnc3RyaW5nJykge1xuICAgIGFwcFNvY2lhbExpbmtzID0gSlNPTi5wYXJzZShhcHBTb2NpYWxMaW5rcylcbiAgfVxuXG4gIGxldCB0aGVtZVNldHRpbmdzID0gSlNPTi5wYXJzZShyYXdEYXRhLnRoZW1lU2V0dGluZ3MpIGFzIFJlY29yZDxzdHJpbmcsIENsaWVudFRoZW1lT3B0aW9uc1R5cGU+XG5cbiAgLy8gVXN1YWxseSBhYm92ZSBKU09OLnBhcnNlIHNob3VsZCBiZSBlbm91Z2guIEJ1dCBzaW5jZSBvdXIgcHJlLWZlYXRoZXJzIDUgZGF0YVxuICAvLyB3YXMgc2VyaWFsaXplZCBtdWx0aXBsZSB0aW1lcywgdGhlcmVmb3JlIHdlIG5lZWQgdG8gcGFyc2UgaXQgdHdpY2UuXG4gIGlmICh0eXBlb2YgdGhlbWVTZXR0aW5ncyA9PT0gJ3N0cmluZycpIHtcbiAgICB0aGVtZVNldHRpbmdzID0gSlNPTi5wYXJzZSh0aGVtZVNldHRpbmdzKVxuICB9XG5cbiAgbGV0IHRoZW1lTW9kZXMgPSBKU09OLnBhcnNlKHJhd0RhdGEudGhlbWVNb2RlcykgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPlxuXG4gIC8vIFVzdWFsbHkgYWJvdmUgSlNPTi5wYXJzZSBzaG91bGQgYmUgZW5vdWdoLiBCdXQgc2luY2Ugb3VyIHByZS1mZWF0aGVycyA1IGRhdGFcbiAgLy8gd2FzIHNlcmlhbGl6ZWQgbXVsdGlwbGUgdGltZXMsIHRoZXJlZm9yZSB3ZSBuZWVkIHRvIHBhcnNlIGl0IHR3aWNlLlxuICBpZiAodHlwZW9mIHRoZW1lTW9kZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgdGhlbWVNb2RlcyA9IEpTT04ucGFyc2UodGhlbWVNb2RlcylcbiAgfVxuXG4gIGlmICh0eXBlb2YgcmF3RGF0YS5tZWRpYVNldHRpbmdzID09PSAnc3RyaW5nJykgcmF3RGF0YS5tZWRpYVNldHRpbmdzID0gSlNPTi5wYXJzZShyYXdEYXRhLm1lZGlhU2V0dGluZ3MpXG5cbiAgcmV0dXJuIHtcbiAgICAuLi5yYXdEYXRhLFxuICAgIGFwcFNvY2lhbExpbmtzLFxuICAgIHRoZW1lU2V0dGluZ3MsXG4gICAgdGhlbWVNb2Rlc1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBjbGllbnRTZXR0aW5nUmVzb2x2ZXIgPSByZXNvbHZlPENsaWVudFNldHRpbmdUeXBlLCBIb29rQ29udGV4dD4oXG4gIHtcbiAgICBjcmVhdGVkQXQ6IHZpcnR1YWwoYXN5bmMgKGNsaWVudFNldHRpbmcpID0+IGZyb21EYXRlVGltZVNxbChjbGllbnRTZXR0aW5nLmNyZWF0ZWRBdCkpLFxuICAgIHVwZGF0ZWRBdDogdmlydHVhbChhc3luYyAoY2xpZW50U2V0dGluZykgPT4gZnJvbURhdGVUaW1lU3FsKGNsaWVudFNldHRpbmcudXBkYXRlZEF0KSlcbiAgfSxcbiAge1xuICAgIC8vIENvbnZlcnQgdGhlIHJhdyBkYXRhIGludG8gYSBuZXcgc3RydWN0dXJlIGJlZm9yZSBydW5uaW5nIHByb3BlcnR5IHJlc29sdmVyc1xuICAgIGNvbnZlcnRlcjogYXN5bmMgKHJhd0RhdGEsIGNvbnRleHQpID0+IHtcbiAgICAgIHJldHVybiBjbGllbnREYlRvU2NoZW1hKHJhd0RhdGEpXG4gICAgfVxuICB9XG4pXG5cbmV4cG9ydCBjb25zdCBjbGllbnRTZXR0aW5nRXh0ZXJuYWxSZXNvbHZlciA9IHJlc29sdmU8Q2xpZW50U2V0dGluZ1R5cGUsIEhvb2tDb250ZXh0Pih7fSlcblxuZXhwb3J0IGNvbnN0IGNsaWVudFNldHRpbmdEYXRhUmVzb2x2ZXIgPSByZXNvbHZlPENsaWVudFNldHRpbmdEYXRhYmFzZVR5cGUsIEhvb2tDb250ZXh0PihcbiAge1xuICAgIGlkOiBhc3luYyAoKSA9PiB7XG4gICAgICByZXR1cm4gdXVpZHY0KClcbiAgICB9LFxuICAgIGNyZWF0ZWRBdDogZ2V0RGF0ZVRpbWVTcWwsXG4gICAgdXBkYXRlZEF0OiBnZXREYXRlVGltZVNxbFxuICB9LFxuICB7XG4gICAgLy8gQ29udmVydCB0aGUgcmF3IGRhdGEgaW50byBhIG5ldyBzdHJ1Y3R1cmUgYmVmb3JlIHJ1bm5pbmcgcHJvcGVydHkgcmVzb2x2ZXJzXG4gICAgY29udmVydGVyOiBhc3luYyAocmF3RGF0YSwgY29udGV4dCkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4ucmF3RGF0YSxcbiAgICAgICAgYXBwU29jaWFsTGlua3M6IEpTT04uc3RyaW5naWZ5KHJhd0RhdGEuYXBwU29jaWFsTGlua3MpLFxuICAgICAgICB0aGVtZVNldHRpbmdzOiBKU09OLnN0cmluZ2lmeShyYXdEYXRhLnRoZW1lU2V0dGluZ3MpLFxuICAgICAgICB0aGVtZU1vZGVzOiBKU09OLnN0cmluZ2lmeShyYXdEYXRhLnRoZW1lTW9kZXMpLFxuICAgICAgICBtZWRpYVNldHRpbmdzOiBKU09OLnN0cmluZ2lmeShyYXdEYXRhLm1lZGlhU2V0dGluZ3MpXG4gICAgICB9XG4gICAgfVxuICB9XG4pXG5cbmV4cG9ydCBjb25zdCBjbGllbnRTZXR0aW5nUGF0Y2hSZXNvbHZlciA9IHJlc29sdmU8Q2xpZW50U2V0dGluZ1R5cGUsIEhvb2tDb250ZXh0PihcbiAge1xuICAgIHVwZGF0ZWRBdDogZ2V0RGF0ZVRpbWVTcWxcbiAgfSxcbiAge1xuICAgIC8vIENvbnZlcnQgdGhlIHJhdyBkYXRhIGludG8gYSBuZXcgc3RydWN0dXJlIGJlZm9yZSBydW5uaW5nIHByb3BlcnR5IHJlc29sdmVyc1xuICAgIGNvbnZlcnRlcjogYXN5bmMgKHJhd0RhdGEsIGNvbnRleHQpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnJhd0RhdGEsXG4gICAgICAgIGFwcFNvY2lhbExpbmtzOiBKU09OLnN0cmluZ2lmeShyYXdEYXRhLmFwcFNvY2lhbExpbmtzKSxcbiAgICAgICAgdGhlbWVTZXR0aW5nczogSlNPTi5zdHJpbmdpZnkocmF3RGF0YS50aGVtZVNldHRpbmdzKSxcbiAgICAgICAgdGhlbWVNb2RlczogSlNPTi5zdHJpbmdpZnkocmF3RGF0YS50aGVtZU1vZGVzKSxcbiAgICAgICAgbWVkaWFTZXR0aW5nczogSlNPTi5zdHJpbmdpZnkocmF3RGF0YS5tZWRpYVNldHRpbmdzKVxuICAgICAgfVxuICAgIH1cbiAgfVxuKVxuXG5leHBvcnQgY29uc3QgY2xpZW50U2V0dGluZ1F1ZXJ5UmVzb2x2ZXIgPSByZXNvbHZlPENsaWVudFNldHRpbmdRdWVyeSwgSG9va0NvbnRleHQ+KHt9KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9oYW56bGFtYXRlZW4vZXRoZXJlYWxlbmdpbmUvcGFja2FnZXMvY29tbW9uL3NyYy91dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvaGFuemxhbWF0ZWVuL2V0aGVyZWFsZW5naW5lL3BhY2thZ2VzL2NvbW1vbi9zcmMvdXRpbHMvZGF0ZXRpbWUtc3FsLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2hhbnpsYW1hdGVlbi9ldGhlcmVhbGVuZ2luZS9wYWNrYWdlcy9jb21tb24vc3JjL3V0aWxzL2RhdGV0aW1lLXNxbC50c1wiOy8qXG5DUEFMLTEuMCBMaWNlbnNlXG5cblRoZSBjb250ZW50cyBvZiB0aGlzIGZpbGUgYXJlIHN1YmplY3QgdG8gdGhlIENvbW1vbiBQdWJsaWMgQXR0cmlidXRpb24gTGljZW5zZVxuVmVyc2lvbiAxLjAuICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG53aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbmh0dHBzOi8vZ2l0aHViLmNvbS9FdGhlcmVhbEVuZ2luZS9ldGhlcmVhbGVuZ2luZS9ibG9iL2Rldi9MSUNFTlNFLlxuVGhlIExpY2Vuc2UgaXMgYmFzZWQgb24gdGhlIE1vemlsbGEgUHVibGljIExpY2Vuc2UgVmVyc2lvbiAxLjEsIGJ1dCBTZWN0aW9ucyAxNFxuYW5kIDE1IGhhdmUgYmVlbiBhZGRlZCB0byBjb3ZlciB1c2Ugb2Ygc29mdHdhcmUgb3ZlciBhIGNvbXB1dGVyIG5ldHdvcmsgYW5kIFxucHJvdmlkZSBmb3IgbGltaXRlZCBhdHRyaWJ1dGlvbiBmb3IgdGhlIE9yaWdpbmFsIERldmVsb3Blci4gSW4gYWRkaXRpb24sIFxuRXhoaWJpdCBBIGhhcyBiZWVuIG1vZGlmaWVkIHRvIGJlIGNvbnNpc3RlbnQgd2l0aCBFeGhpYml0IEIuXG5cblNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBiYXNpcyxcbldJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlXG5zcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcmlnaHRzIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuVGhlIE9yaWdpbmFsIENvZGUgaXMgRXRoZXJlYWwgRW5naW5lLlxuXG5UaGUgT3JpZ2luYWwgRGV2ZWxvcGVyIGlzIHRoZSBJbml0aWFsIERldmVsb3Blci4gVGhlIEluaXRpYWwgRGV2ZWxvcGVyIG9mIHRoZVxuT3JpZ2luYWwgQ29kZSBpcyB0aGUgRXRoZXJlYWwgRW5naW5lIHRlYW0uXG5cbkFsbCBwb3J0aW9ucyBvZiB0aGUgY29kZSB3cml0dGVuIGJ5IHRoZSBFdGhlcmVhbCBFbmdpbmUgdGVhbSBhcmUgQ29weXJpZ2h0IFx1MDBBOSAyMDIxLTIwMjMgXG5FdGhlcmVhbCBFbmdpbmUuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4qL1xuXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTExNTA3MjdcbmV4cG9ydCBjb25zdCBnZXREYXRlVGltZVNxbCA9IGFzeW5jICgpID0+IHtcbiAgcmV0dXJuIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxOSkucmVwbGFjZSgnVCcsICcgJylcbn1cblxuZXhwb3J0IGNvbnN0IHRvRGF0ZVRpbWVTcWwgPSAoZGF0ZTogRGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDE5KS5yZXBsYWNlKCdUJywgJyAnKVxufVxuXG5leHBvcnQgY29uc3QgdG9EaXNwbGF5RGF0ZVRpbWUgPSAoZGF0ZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4ge1xuICByZXR1cm4gZGF0ZVxuICAgID8gbmV3IERhdGUoZGF0ZSkudG9Mb2NhbGVTdHJpbmcoJ2VuLXVzJywge1xuICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgICAgICBkYXk6ICdudW1lcmljJyxcbiAgICAgICAgaG91cjogJ251bWVyaWMnLFxuICAgICAgICBtaW51dGU6ICdudW1lcmljJ1xuICAgICAgfSlcbiAgICA6ICctJ1xufVxuXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTExNTA3MjdcbmV4cG9ydCBjb25zdCBmcm9tRGF0ZVRpbWVTcWwgPSAoZGF0ZTogc3RyaW5nKSA9PiB7XG4gIGxldCBkYXRlT2JqOiBEYXRlXG4gIGlmICh0eXBlb2YgZGF0ZSA9PT0gJ3N0cmluZycpIHtcbiAgICBkYXRlT2JqID0gbmV3IERhdGUoZGF0ZSlcbiAgfSBlbHNlIHtcbiAgICBkYXRlT2JqID0gZGF0ZVxuICB9XG4gIHJldHVybiAoXG4gICAgZGF0ZU9iai5nZXRGdWxsWWVhcigpICtcbiAgICAnLScgK1xuICAgICgnMDAnICsgKGRhdGVPYmouZ2V0TW9udGgoKSArIDEpKS5zbGljZSgtMikgK1xuICAgICctJyArXG4gICAgKCcwMCcgKyBkYXRlT2JqLmdldERhdGUoKSkuc2xpY2UoLTIpICtcbiAgICAnVCcgK1xuICAgICgnMDAnICsgZGF0ZU9iai5nZXRIb3VycygpKS5zbGljZSgtMikgK1xuICAgICc6JyArXG4gICAgKCcwMCcgKyBkYXRlT2JqLmdldE1pbnV0ZXMoKSkuc2xpY2UoLTIpICtcbiAgICAnOicgK1xuICAgICgnMDAnICsgZGF0ZU9iai5nZXRTZWNvbmRzKCkpLnNsaWNlKC0yKSArXG4gICAgJy4wMDBaJ1xuICApXG59XG5cbmV4cG9ydCBjb25zdCBjb252ZXJ0RGF0ZVRpbWVTcWxUb0xvY2FsID0gKGRhdGVTcWw6IHN0cmluZykgPT4ge1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUoZGF0ZVNxbClcblxuICBjb25zdCB5ZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpXG4gIGNvbnN0IG1vbnRoID0gKGRhdGUuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKVxuICBjb25zdCBkYXkgPSBkYXRlLmdldERhdGUoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJylcbiAgY29uc3QgaG91cnMgPSBkYXRlLmdldEhvdXJzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpXG4gIGNvbnN0IG1pbnV0ZXMgPSBkYXRlLmdldE1pbnV0ZXMoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJylcblxuICByZXR1cm4gYCR7eWVhcn0tJHttb250aH0tJHtkYXl9VCR7aG91cnN9OiR7bWludXRlc31gXG59XG5cbmV4cG9ydCBjb25zdCB0aW1lQWdvID0gKGRhdGU6IERhdGUpID0+IHtcbiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKVxuXG4gIGNvbnN0IGRpZmZlcmVuY2UgPSBub3cgLSBkYXRlLmdldFRpbWUoKVxuXG4gIGNvbnN0IHNlY29uZHMgPSBNYXRoLmZsb29yKGRpZmZlcmVuY2UgLyAxMDAwKSAlIDYwXG4gIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKGRpZmZlcmVuY2UgLyAoMTAwMCAqIDYwKSkgJSA2MFxuICBjb25zdCBob3VycyA9IE1hdGguZmxvb3IoZGlmZmVyZW5jZSAvICgxMDAwICogNjAgKiA2MCkpICUgMjRcbiAgY29uc3QgZGF5cyA9IE1hdGguZmxvb3IoZGlmZmVyZW5jZSAvICgxMDAwICogNjAgKiA2MCAqIDI0KSlcblxuICBpZiAoZGF5cyA+IDApIHtcbiAgICByZXR1cm4gYCR7ZGF5c30gZGF5JHtkYXlzID4gMSA/ICdzJyA6ICcnfWBcbiAgfVxuICBpZiAoaG91cnMgPiAwKSB7XG4gICAgcmV0dXJuIGAke2hvdXJzfSBob3VyJHtob3VycyA+IDEgPyAncycgOiAnJ31gXG4gIH1cbiAgaWYgKG1pbnV0ZXMgPiAwKSB7XG4gICAgcmV0dXJuIGAke21pbnV0ZXN9IG1pbnV0ZSR7bWludXRlcyA+IDEgPyAncycgOiAnJ31gXG4gIH1cbiAgaWYgKHNlY29uZHMgPiAwKSB7XG4gICAgcmV0dXJuIGAke3NlY29uZHN9IHNlY29uZCR7c2Vjb25kcyA+IDEgPyAncycgOiAnJ31gXG4gIH1cblxuICByZXR1cm4gJydcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvaGFuemxhbWF0ZWVuL2V0aGVyZWFsZW5naW5lL3BhY2thZ2VzL2NsaWVudC9zY3JpcHRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9oYW56bGFtYXRlZW4vZXRoZXJlYWxlbmdpbmUvcGFja2FnZXMvY2xpZW50L3NjcmlwdHMvZ2V0Q29pbFNldHRpbmdzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2hhbnpsYW1hdGVlbi9ldGhlcmVhbGVuZ2luZS9wYWNrYWdlcy9jbGllbnQvc2NyaXB0cy9nZXRDb2lsU2V0dGluZ3MudHNcIjsvKlxuQ1BBTC0xLjAgTGljZW5zZVxuXG5UaGUgY29udGVudHMgb2YgdGhpcyBmaWxlIGFyZSBzdWJqZWN0IHRvIHRoZSBDb21tb24gUHVibGljIEF0dHJpYnV0aW9uIExpY2Vuc2VcblZlcnNpb24gMS4wLiAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZVxud2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5odHRwczovL2dpdGh1Yi5jb20vRXRoZXJlYWxFbmdpbmUvZXRoZXJlYWxlbmdpbmUvYmxvYi9kZXYvTElDRU5TRS5cblRoZSBMaWNlbnNlIGlzIGJhc2VkIG9uIHRoZSBNb3ppbGxhIFB1YmxpYyBMaWNlbnNlIFZlcnNpb24gMS4xLCBidXQgU2VjdGlvbnMgMTRcbmFuZCAxNSBoYXZlIGJlZW4gYWRkZWQgdG8gY292ZXIgdXNlIG9mIHNvZnR3YXJlIG92ZXIgYSBjb21wdXRlciBuZXR3b3JrIGFuZCBcbnByb3ZpZGUgZm9yIGxpbWl0ZWQgYXR0cmlidXRpb24gZm9yIHRoZSBPcmlnaW5hbCBEZXZlbG9wZXIuIEluIGFkZGl0aW9uLCBcbkV4aGliaXQgQSBoYXMgYmVlbiBtb2RpZmllZCB0byBiZSBjb25zaXN0ZW50IHdpdGggRXhoaWJpdCBCLlxuXG5Tb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgYmFzaXMsXG5XSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZVxuc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHJpZ2h0cyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cblRoZSBPcmlnaW5hbCBDb2RlIGlzIEV0aGVyZWFsIEVuZ2luZS5cblxuVGhlIE9yaWdpbmFsIERldmVsb3BlciBpcyB0aGUgSW5pdGlhbCBEZXZlbG9wZXIuIFRoZSBJbml0aWFsIERldmVsb3BlciBvZiB0aGVcbk9yaWdpbmFsIENvZGUgaXMgdGhlIEV0aGVyZWFsIEVuZ2luZSB0ZWFtLlxuXG5BbGwgcG9ydGlvbnMgb2YgdGhlIGNvZGUgd3JpdHRlbiBieSB0aGUgRXRoZXJlYWwgRW5naW5lIHRlYW0gYXJlIENvcHlyaWdodCBcdTAwQTkgMjAyMS0yMDIzIFxuRXRoZXJlYWwgRW5naW5lLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuKi9cblxuaW1wb3J0IGtuZXggZnJvbSAna25leCdcblxuaW1wb3J0IHsgY29pbFNldHRpbmdQYXRoLCBDb2lsU2V0dGluZ1R5cGUgfSBmcm9tICcuLi8uLi9jb21tb24vc3JjL3NjaGVtYXMvc2V0dGluZy9jb2lsLXNldHRpbmcuc2NoZW1hJ1xuXG5leHBvcnQgY29uc3QgZ2V0Q29pbFNldHRpbmcgPSBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGtuZXhDbGllbnQgPSBrbmV4KHtcbiAgICBjbGllbnQ6ICdteXNxbCcsXG4gICAgY29ubmVjdGlvbjoge1xuICAgICAgdXNlcjogcHJvY2Vzcy5lbnYuTVlTUUxfVVNFUiA/PyAnc2VydmVyJyxcbiAgICAgIHBhc3N3b3JkOiBwcm9jZXNzLmVudi5NWVNRTF9QQVNTV09SRCA/PyAncGFzc3dvcmQnLFxuICAgICAgaG9zdDogcHJvY2Vzcy5lbnYuTVlTUUxfSE9TVCA/PyAnMTI3LjAuMC4xJyxcbiAgICAgIHBvcnQ6IHBhcnNlSW50KHByb2Nlc3MuZW52Lk1ZU1FMX1BPUlQgfHwgJzMzMDYnKSxcbiAgICAgIGRhdGFiYXNlOiBwcm9jZXNzLmVudi5NWVNRTF9EQVRBQkFTRSA/PyAnZXRoZXJlYWxlbmdpbmUnLFxuICAgICAgY2hhcnNldDogJ3V0ZjhtYjQnXG4gICAgfVxuICB9KVxuXG4gIGNvbnN0IGNvaWxTZXR0aW5nID0gYXdhaXQga25leENsaWVudFxuICAgIC5zZWxlY3QoKVxuICAgIC5mcm9tPENvaWxTZXR0aW5nVHlwZT4oY29pbFNldHRpbmdQYXRoKVxuICAgIC50aGVuKChbZGJDb2lsXSkgPT4ge1xuICAgICAgaWYgKGRiQ29pbCkge1xuICAgICAgICByZXR1cm4gZGJDb2lsXG4gICAgICB9XG4gICAgfSlcbiAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgIGNvbnNvbGUud2FybignW3ZpdGUuY29uZmlnXTogRmFpbGVkIHRvIHJlYWQgY29pbFNldHRpbmcnKVxuICAgICAgY29uc29sZS53YXJuKGUpXG4gICAgfSlcblxuICBhd2FpdCBrbmV4Q2xpZW50LmRlc3Ryb3koKVxuXG4gIHJldHVybiBjb2lsU2V0dGluZyFcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvaGFuemxhbWF0ZWVuL2V0aGVyZWFsZW5naW5lL3BhY2thZ2VzL2NvbW1vbi9zcmMvc2NoZW1hcy9zZXR0aW5nXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9oYW56bGFtYXRlZW4vZXRoZXJlYWxlbmdpbmUvcGFja2FnZXMvY29tbW9uL3NyYy9zY2hlbWFzL3NldHRpbmcvY29pbC1zZXR0aW5nLnNjaGVtYS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9oYW56bGFtYXRlZW4vZXRoZXJlYWxlbmdpbmUvcGFja2FnZXMvY29tbW9uL3NyYy9zY2hlbWFzL3NldHRpbmcvY29pbC1zZXR0aW5nLnNjaGVtYS50c1wiOy8qXG5DUEFMLTEuMCBMaWNlbnNlXG5cblRoZSBjb250ZW50cyBvZiB0aGlzIGZpbGUgYXJlIHN1YmplY3QgdG8gdGhlIENvbW1vbiBQdWJsaWMgQXR0cmlidXRpb24gTGljZW5zZVxuVmVyc2lvbiAxLjAuICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlXG53aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbmh0dHBzOi8vZ2l0aHViLmNvbS9FdGhlcmVhbEVuZ2luZS9ldGhlcmVhbGVuZ2luZS9ibG9iL2Rldi9MSUNFTlNFLlxuVGhlIExpY2Vuc2UgaXMgYmFzZWQgb24gdGhlIE1vemlsbGEgUHVibGljIExpY2Vuc2UgVmVyc2lvbiAxLjEsIGJ1dCBTZWN0aW9ucyAxNFxuYW5kIDE1IGhhdmUgYmVlbiBhZGRlZCB0byBjb3ZlciB1c2Ugb2Ygc29mdHdhcmUgb3ZlciBhIGNvbXB1dGVyIG5ldHdvcmsgYW5kIFxucHJvdmlkZSBmb3IgbGltaXRlZCBhdHRyaWJ1dGlvbiBmb3IgdGhlIE9yaWdpbmFsIERldmVsb3Blci4gSW4gYWRkaXRpb24sIFxuRXhoaWJpdCBBIGhhcyBiZWVuIG1vZGlmaWVkIHRvIGJlIGNvbnNpc3RlbnQgd2l0aCBFeGhpYml0IEIuXG5cblNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBiYXNpcyxcbldJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlXG5zcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcmlnaHRzIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuVGhlIE9yaWdpbmFsIENvZGUgaXMgRXRoZXJlYWwgRW5naW5lLlxuXG5UaGUgT3JpZ2luYWwgRGV2ZWxvcGVyIGlzIHRoZSBJbml0aWFsIERldmVsb3Blci4gVGhlIEluaXRpYWwgRGV2ZWxvcGVyIG9mIHRoZVxuT3JpZ2luYWwgQ29kZSBpcyB0aGUgRXRoZXJlYWwgRW5naW5lIHRlYW0uXG5cbkFsbCBwb3J0aW9ucyBvZiB0aGUgY29kZSB3cml0dGVuIGJ5IHRoZSBFdGhlcmVhbCBFbmdpbmUgdGVhbSBhcmUgQ29weXJpZ2h0IFx1MDBBOSAyMDIxLTIwMjMgXG5FdGhlcmVhbCBFbmdpbmUuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4qL1xuXG4vLyBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIGZpbGUgc2VlIGh0dHBzOi8vZG92ZS5mZWF0aGVyc2pzLmNvbS9ndWlkZXMvY2xpL3NlcnZpY2Uuc2NoZW1hcy5odG1sXG5pbXBvcnQgdHlwZSB7IFN0YXRpYyB9IGZyb20gJ0BmZWF0aGVyc2pzL3R5cGVib3gnXG5pbXBvcnQgeyBnZXRWYWxpZGF0b3IsIHF1ZXJ5U3ludGF4LCBUeXBlIH0gZnJvbSAnQGZlYXRoZXJzanMvdHlwZWJveCdcblxuaW1wb3J0IHsgZGF0YVZhbGlkYXRvciwgcXVlcnlWYWxpZGF0b3IgfSBmcm9tICcuLi92YWxpZGF0b3JzJ1xuXG5leHBvcnQgY29uc3QgY29pbFNldHRpbmdQYXRoID0gJ2NvaWwtc2V0dGluZydcblxuZXhwb3J0IGNvbnN0IGNvaWxTZXR0aW5nTWV0aG9kcyA9IFsnZmluZCcsICdnZXQnLCAnY3JlYXRlJywgJ3BhdGNoJywgJ3JlbW92ZSddIGFzIGNvbnN0XG5cbi8vIE1haW4gZGF0YSBtb2RlbCBzY2hlbWFcbmV4cG9ydCBjb25zdCBjb2lsU2V0dGluZ1NjaGVtYSA9IFR5cGUuT2JqZWN0KFxuICB7XG4gICAgaWQ6IFR5cGUuU3RyaW5nKHtcbiAgICAgIGZvcm1hdDogJ3V1aWQnXG4gICAgfSksXG4gICAgcGF5bWVudFBvaW50ZXI6IFR5cGUuU3RyaW5nKCksXG4gICAgY2xpZW50SWQ6IFR5cGUuU3RyaW5nKCksXG4gICAgY2xpZW50U2VjcmV0OiBUeXBlLlN0cmluZygpLFxuICAgIGNyZWF0ZWRBdDogVHlwZS5TdHJpbmcoeyBmb3JtYXQ6ICdkYXRlLXRpbWUnIH0pLFxuICAgIHVwZGF0ZWRBdDogVHlwZS5TdHJpbmcoeyBmb3JtYXQ6ICdkYXRlLXRpbWUnIH0pXG4gIH0sXG4gIHsgJGlkOiAnQ29pbFNldHRpbmcnLCBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UgfVxuKVxuZXhwb3J0IGludGVyZmFjZSBDb2lsU2V0dGluZ1R5cGUgZXh0ZW5kcyBTdGF0aWM8dHlwZW9mIGNvaWxTZXR0aW5nU2NoZW1hPiB7fVxuXG4vLyBTY2hlbWEgZm9yIGNyZWF0aW5nIG5ldyBlbnRyaWVzXG5leHBvcnQgY29uc3QgY29pbFNldHRpbmdEYXRhU2NoZW1hID0gVHlwZS5QaWNrKGNvaWxTZXR0aW5nU2NoZW1hLCBbJ3BheW1lbnRQb2ludGVyJywgJ2NsaWVudElkJywgJ2NsaWVudFNlY3JldCddLCB7XG4gICRpZDogJ0NvaWxTZXR0aW5nRGF0YSdcbn0pXG5leHBvcnQgaW50ZXJmYWNlIENvaWxTZXR0aW5nRGF0YSBleHRlbmRzIFN0YXRpYzx0eXBlb2YgY29pbFNldHRpbmdEYXRhU2NoZW1hPiB7fVxuXG4vLyBTY2hlbWEgZm9yIHVwZGF0aW5nIGV4aXN0aW5nIGVudHJpZXNcbmV4cG9ydCBjb25zdCBjb2lsU2V0dGluZ1BhdGNoU2NoZW1hID0gVHlwZS5QYXJ0aWFsKGNvaWxTZXR0aW5nU2NoZW1hLCB7XG4gICRpZDogJ0NvaWxTZXR0aW5nUGF0Y2gnXG59KVxuZXhwb3J0IGludGVyZmFjZSBDb2lsU2V0dGluZ1BhdGNoIGV4dGVuZHMgU3RhdGljPHR5cGVvZiBjb2lsU2V0dGluZ1BhdGNoU2NoZW1hPiB7fVxuXG4vLyBTY2hlbWEgZm9yIGFsbG93ZWQgcXVlcnkgcHJvcGVydGllc1xuZXhwb3J0IGNvbnN0IGNvaWxTZXR0aW5nUXVlcnlQcm9wZXJ0aWVzID0gVHlwZS5QaWNrKGNvaWxTZXR0aW5nU2NoZW1hLCBbXG4gICdpZCcsXG4gICdwYXltZW50UG9pbnRlcicsXG4gICdjbGllbnRJZCcsXG4gICdjbGllbnRTZWNyZXQnXG5dKVxuZXhwb3J0IGNvbnN0IGNvaWxTZXR0aW5nUXVlcnlTY2hlbWEgPSBUeXBlLkludGVyc2VjdChcbiAgW1xuICAgIHF1ZXJ5U3ludGF4KGNvaWxTZXR0aW5nUXVlcnlQcm9wZXJ0aWVzKSxcbiAgICAvLyBBZGQgYWRkaXRpb25hbCBxdWVyeSBwcm9wZXJ0aWVzIGhlcmVcbiAgICBUeXBlLk9iamVjdCh7fSwgeyBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UgfSlcbiAgXSxcbiAgeyBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UgfVxuKVxuZXhwb3J0IGludGVyZmFjZSBDb2lsU2V0dGluZ1F1ZXJ5IGV4dGVuZHMgU3RhdGljPHR5cGVvZiBjb2lsU2V0dGluZ1F1ZXJ5U2NoZW1hPiB7fVxuXG5leHBvcnQgY29uc3QgY29pbFNldHRpbmdWYWxpZGF0b3IgPSAvKiBAX19QVVJFX18gKi8gZ2V0VmFsaWRhdG9yKGNvaWxTZXR0aW5nU2NoZW1hLCBkYXRhVmFsaWRhdG9yKVxuZXhwb3J0IGNvbnN0IGNvaWxTZXR0aW5nRGF0YVZhbGlkYXRvciA9IC8qIEBfX1BVUkVfXyAqLyBnZXRWYWxpZGF0b3IoY29pbFNldHRpbmdEYXRhU2NoZW1hLCBkYXRhVmFsaWRhdG9yKVxuZXhwb3J0IGNvbnN0IGNvaWxTZXR0aW5nUGF0Y2hWYWxpZGF0b3IgPSAvKiBAX19QVVJFX18gKi8gZ2V0VmFsaWRhdG9yKGNvaWxTZXR0aW5nUGF0Y2hTY2hlbWEsIGRhdGFWYWxpZGF0b3IpXG5leHBvcnQgY29uc3QgY29pbFNldHRpbmdRdWVyeVZhbGlkYXRvciA9IC8qIEBfX1BVUkVfXyAqLyBnZXRWYWxpZGF0b3IoY29pbFNldHRpbmdRdWVyeVNjaGVtYSwgcXVlcnlWYWxpZGF0b3IpXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBc1o7QUFBdFo7QUFBQTtBQUErWSxJQUFPLGdDQUFRLE1BQU07QUFDbGEsYUFBTztBQUFBLFFBQ0wsU0FBUztBQUFBLFVBQ1AsT0FBTztBQUFBLFlBQ0wsZUFBZTtBQUFBLGNBQ2IsVUFBVSxDQUFDLFdBQVc7QUFBQSxZQUN4QjtBQUFBLFVBQ0Y7QUFBQSxVQUNBLFNBQVMsQ0FBQztBQUFBLFFBQ1o7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUE7OztBQ1hBLElBQUFBLGlDQUFBO0FBQUEsU0FBQUEsZ0NBQUE7QUFBQSxpQkFBQUM7QUFBQTtBQUlBLGVBQU9BLGlDQUErQztBQUNwRCxTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUDtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sS0FBSyxNQUFNLElBQUk7QUFDYixjQUFJLEtBQUssU0FBUyw4QkFBOEIsR0FBRztBQUNqRCxtQkFBTztBQUFBLGNBQ0wsTUFBTTtBQUFBLGNBQ04sS0FBSztBQUFBLFlBQ1A7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBcEJBLElBRU07QUFGTixJQUFBQyw4QkFBQTtBQUFBO0FBRUEsSUFBTSxlQUFlO0FBQUE7QUFBQTs7O0FDdUJyQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFlBQVk7QUFDbkIsT0FBTyxRQUFRO0FBQ2YsT0FBTyxZQUFZO0FBQ25CLE9BQU8sVUFBVTtBQUNqQixTQUFTLG9CQUFnQztBQUN6QyxPQUFPLHFCQUFxQjtBQUM1QixTQUFTLHFCQUFxQjtBQUM5QixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLFVBQVU7OztBQ25DakI7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLFdBQVk7QUFBQSxFQUNaLElBQU07QUFBQSxFQUNOLFlBQWM7QUFBQSxFQUNkLGFBQWU7QUFBQSxFQUNmLGFBQWU7QUFBQSxFQUNmLGtCQUFtQjtBQUFBLEVBQ25CLFNBQVU7QUFBQSxFQUNWLE9BQVM7QUFBQSxJQUNQO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxPQUFTO0FBQUEsTUFDVCxNQUFRO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLE9BQVM7QUFBQSxNQUNULE1BQVE7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsT0FBUztBQUFBLE1BQ1QsTUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxLQUFPO0FBQUEsTUFDUCxPQUFTO0FBQUEsTUFDVCxNQUFRO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxNQUNFLEtBQU87QUFBQSxNQUNQLE9BQVM7QUFBQSxNQUNULE1BQVE7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLE1BQ0UsS0FBTztBQUFBLE1BQ1AsT0FBUztBQUFBLE1BQ1QsTUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQ0Y7OztBQ3pDQTtBQUFBLEVBQ0UsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsU0FBVztBQUFBLEVBQ1gsTUFBUTtBQUFBLEVBQ1IsWUFBYztBQUFBLElBQ1osTUFBUTtBQUFBLElBQ1IsS0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLFNBQVc7QUFBQSxJQUNULE1BQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxXQUFhO0FBQUEsRUFDYixTQUFXO0FBQUEsSUFDVCxnQkFBZ0I7QUFBQSxJQUNoQixLQUFPO0FBQUEsSUFDUCxPQUFTO0FBQUEsSUFDVCxTQUFXO0FBQUEsSUFDWCxPQUFTO0FBQUEsSUFDVCxVQUFZO0FBQUEsSUFDWixNQUFRO0FBQUEsSUFDUixPQUFTO0FBQUEsSUFDVCxZQUFjO0FBQUEsSUFDZCxZQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBLGFBQWU7QUFBQSxJQUNiLGdCQUFnQjtBQUFBLElBQ2hCLE9BQVM7QUFBQSxFQUNYO0FBQUEsRUFDQSxrQkFBb0I7QUFBQSxJQUNsQixnQkFBZ0I7QUFBQSxJQUNoQixPQUFTO0FBQUEsRUFDWDtBQUFBLEVBQ0EsY0FBZ0I7QUFBQSxJQUNkLCtCQUErQjtBQUFBLElBQy9CLDBCQUEwQjtBQUFBLElBQzFCLDBCQUEwQjtBQUFBLElBQzFCLDBCQUEwQjtBQUFBLElBQzFCLDZCQUE2QjtBQUFBLElBQzdCLDRCQUE0QjtBQUFBLElBQzVCLHNCQUFzQjtBQUFBLElBQ3RCLG1CQUFtQjtBQUFBLElBQ25CLHVCQUF1QjtBQUFBLElBQ3ZCLGlCQUFpQjtBQUFBLElBQ2pCLGtDQUFrQztBQUFBLElBQ2xDLGFBQWE7QUFBQSxJQUNiLGlCQUFpQjtBQUFBLElBQ2pCLFlBQWM7QUFBQSxJQUNkLEtBQU87QUFBQSxJQUNQLCtCQUErQjtBQUFBLElBQy9CLFNBQVc7QUFBQSxJQUNYLFNBQVc7QUFBQSxJQUNYLG9DQUFvQztBQUFBLElBQ3BDLE1BQVE7QUFBQSxJQUNSLEtBQU87QUFBQSxJQUNQLFlBQVk7QUFBQSxJQUNaLFVBQVU7QUFBQSxJQUNWLFlBQVk7QUFBQSxJQUNaLGNBQWM7QUFBQSxJQUNkLFFBQVU7QUFBQSxJQUNWLFFBQVU7QUFBQSxJQUNWLFdBQWE7QUFBQSxJQUNiLE9BQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLG1CQUFtQjtBQUFBLElBQ25CLGlCQUFpQjtBQUFBLElBQ2pCLGVBQWU7QUFBQSxJQUNmLG1CQUFtQjtBQUFBLElBQ25CLG9CQUFvQjtBQUFBLElBQ3BCLE1BQVE7QUFBQSxJQUNSLGtCQUFrQjtBQUFBLElBQ2xCLGFBQWU7QUFBQSxJQUNmLFdBQVc7QUFBQSxJQUNYLE1BQVE7QUFBQSxJQUNSLDJCQUEyQjtBQUFBLElBQzNCLG1CQUFtQjtBQUFBLElBQ25CLDhCQUE4QjtBQUFBLElBQzlCLG1CQUFtQjtBQUFBLElBQ25CLG9CQUFvQjtBQUFBLEVBQ3RCO0FBQUEsRUFDQSxpQkFBbUI7QUFBQSxJQUNqQixlQUFlO0FBQUEsSUFDZixnQkFBZ0I7QUFBQSxJQUNoQixvQkFBb0I7QUFBQSxJQUNwQiw0QkFBNEI7QUFBQSxJQUM1QixjQUFnQjtBQUFBLElBQ2hCLEtBQU87QUFBQSxJQUNQLFFBQVU7QUFBQSxJQUNWLGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLFNBQVc7QUFBQSxJQUNYLG1CQUFtQjtBQUFBLElBQ25CLGdCQUFnQjtBQUFBLEVBQ2xCO0FBQUEsRUFDQSxTQUFXO0FBQ2I7OztBQ3RFQSxTQUFTLGVBQWU7QUFJeEIsSUFBTSxpQkFBaUI7QUFDdkIsSUFBTSx5QkFBeUI7QUFZL0IsSUFBTSxNQUFNLENBQUMsa0JBQ1gsUUFBUTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsVUFBVTtBQUFBO0FBQUEsRUFFVixVQUFVO0FBQUEsSUFDUixHQUFHO0FBQUEsSUFDSCxNQUFNLGVBQWUsU0FBUztBQUFBLElBQzlCLGFBQWEsZUFBZSxtQkFBbUI7QUFBQSxJQUMvQyxZQUFZLGVBQWUsYUFBYTtBQUFBLElBQ3hDLGFBQWEsZUFBZSxjQUFjO0FBQUEsSUFDMUMsa0JBQWtCLGVBQWUsbUJBQW1CO0FBQUEsSUFDcEQsV0FDRSxRQUFRLElBQUksWUFBWSxpQkFBaUIsUUFBUSxJQUFJLHFCQUFxQixTQUFTLE1BQU0sUUFBUSxJQUFJO0FBQUEsSUFDdkcsT0FBTztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osbUJBQW1CO0FBQUEsTUFDakI7QUFBQSxRQUNFLFVBQVU7QUFBQSxRQUNWLEtBQUs7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGdCQUFnQjtBQUFBO0FBQUEsRUFFaEIsWUFBWTtBQUFBO0FBQUEsRUFFWixNQUFNLFFBQVEsSUFBSSxZQUFZLGdCQUFnQixnQkFBZ0I7QUFBQSxFQUM5RCxnQkFBZ0I7QUFBQSxFQUNoQixzQkFBc0I7QUFBQSxFQUN0QixZQUFZO0FBQUE7QUFBQSxJQUVWLFNBQVMsUUFBUSxJQUFJLFlBQVksZ0JBQWdCLE9BQU87QUFBQTtBQUFBLElBRXhELGtCQUFrQjtBQUFBO0FBQUEsSUFFbEIsMkJBQTJCO0FBQUE7QUFBQSxNQUV6QjtBQUFBO0FBQUEsTUFFQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUE7QUFBQSxJQUVQLGFBQWE7QUFBQTtBQUFBLElBRWIsY0FBYztBQUFBO0FBQUEsSUFFZCxXQUFXLFFBQVEsSUFBSSxZQUFZLGdCQUFnQixRQUFRO0FBQUE7QUFBQSxJQUUzRCxRQUFRLFFBQVEsSUFBSSxZQUFZLGdCQUFnQiw2QkFBNkI7QUFBQTtBQUFBLElBRTdFLGtCQUFrQjtBQUFBO0FBQUEsSUFFbEIsMkJBQTJCO0FBQUE7QUFBQSxNQUV6QjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsZUFBZSxRQUFRLElBQUksWUFBWSxnQkFBZ0IsYUFBYTtBQUFBLElBQ3BFLGNBQWM7QUFBQTtBQUFBLE1BRVo7QUFBQTtBQUFBLE1BRUE7QUFBQTtBQUFBLE1BRUE7QUFBQTtBQUFBLE1BRUE7QUFBQTtBQUFBLE1BRUE7QUFBQTtBQUFBLE1BRUE7QUFBQTtBQUFBLE1BRUE7QUFBQTtBQUFBLE1BRUE7QUFBQTtBQUFBLE1BRUE7QUFBQSxJQUNGO0FBQUEsSUFDQSxhQUFhO0FBQUE7QUFBQSxNQUVYO0FBQUE7QUFBQSxNQUVBO0FBQUE7QUFBQSxNQUVBO0FBQUE7QUFBQSxNQUVBO0FBQUE7QUFBQSxNQUVBO0FBQUE7QUFBQSxNQUVBO0FBQUE7QUFBQSxNQUVBO0FBQUE7QUFBQSxNQUVBO0FBQUE7QUFBQSxNQUVBO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSx1QkFBdUI7QUFBQTtBQUFBLElBRXZCLCtCQUErQixNQUFPLE1BQU87QUFBQSxJQUM3QyxnQkFBZ0I7QUFBQTtBQUFBLE1BRWQ7QUFBQSxRQUNFLFlBQVksQ0FBQyxFQUFFLElBQUksTUFBTTtBQUN2QixpQkFBTyxlQUFlLEtBQUssSUFBSSxJQUFJO0FBQUEsUUFDckM7QUFBQSxRQUNBLFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxVQUNQLFdBQVc7QUFBQSxVQUNYLFlBQVk7QUFBQSxZQUNWLFlBQVk7QUFBQSxZQUNaLGVBQWUsS0FBSyxLQUFLLEtBQUs7QUFBQTtBQUFBLFVBQ2hDO0FBQUEsVUFDQSxtQkFBbUI7QUFBQSxZQUNqQixVQUFVLENBQUMsR0FBRyxHQUFHO0FBQUEsVUFDbkI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBO0FBQUEsTUFFQTtBQUFBLFFBQ0UsWUFBWSxDQUFDLEVBQUUsSUFBSSxNQUFNO0FBQ3ZCLGlCQUFPLHlCQUF5QixLQUFLLElBQUksSUFBSTtBQUFBLFFBQy9DO0FBQUEsUUFDQSxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsVUFDUCxXQUFXO0FBQUEsVUFDWCxZQUFZO0FBQUEsWUFDVixZQUFZO0FBQUEsWUFDWixlQUFlLEtBQUssS0FBSyxLQUFLO0FBQUE7QUFBQSxVQUNoQztBQUFBLFVBQ0EsbUJBQW1CO0FBQUEsWUFDakIsVUFBVSxDQUFDLEdBQUcsR0FBRztBQUFBLFVBQ25CO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUE7QUFBQSxRQUNFLFlBQVksQ0FBQyxFQUFFLElBQUksTUFBTTtBQUN2QixpQkFBTyxZQUFZLEtBQUssSUFBSSxJQUFJO0FBQUEsUUFDbEM7QUFBQSxRQUNBLFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxVQUNQLFdBQVc7QUFBQSxVQUNYLFlBQVk7QUFBQSxZQUNWLFlBQVk7QUFBQSxZQUNaLGVBQWUsS0FBSyxLQUFLLEtBQUs7QUFBQTtBQUFBLFVBQ2hDO0FBQUEsVUFDQSxtQkFBbUI7QUFBQSxZQUNqQixVQUFVLENBQUMsR0FBRyxHQUFHO0FBQUEsVUFDbkI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBO0FBQUEsTUFFQTtBQUFBLFFBQ0UsWUFBWSxDQUFDLEVBQUUsSUFBSSxNQUFNO0FBQ3ZCLGlCQUFPLGVBQWUsS0FBSyxJQUFJLElBQUksS0FBSyxDQUFDLGdCQUFnQixLQUFLLElBQUksSUFBSTtBQUFBLFFBQ3hFO0FBQUEsUUFDQSxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsVUFDUCxXQUFXO0FBQUEsVUFDWCxZQUFZO0FBQUEsWUFDVixZQUFZO0FBQUEsWUFDWixlQUFlLEtBQUssS0FBSyxLQUFLO0FBQUE7QUFBQSxVQUNoQztBQUFBLFVBQ0EsbUJBQW1CO0FBQUEsWUFDakIsVUFBVSxDQUFDLEdBQUcsR0FBRztBQUFBLFVBQ25CO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUE7QUFBQSxRQUNFLFlBQVksQ0FBQyxFQUFFLElBQUksTUFBTTtBQUN2QixpQkFBTyxjQUFjLEtBQUssSUFBSSxJQUFJO0FBQUEsUUFDcEM7QUFBQSxRQUNBLFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxVQUNQLFdBQVc7QUFBQSxVQUNYLFlBQVk7QUFBQSxZQUNWLFlBQVk7QUFBQSxZQUNaLGVBQWUsS0FBSyxLQUFLLEtBQUs7QUFBQTtBQUFBLFVBQ2hDO0FBQUEsVUFDQSxtQkFBbUI7QUFBQSxZQUNqQixVQUFVLENBQUMsR0FBRyxHQUFHO0FBQUEsVUFDbkI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBO0FBQUEsTUFFQTtBQUFBLFFBQ0UsWUFBWSxDQUFDLEVBQUUsSUFBSSxNQUFNO0FBQ3ZCLGlCQUFPLGFBQWEsS0FBSyxJQUFJLElBQUk7QUFBQSxRQUNuQztBQUFBLFFBQ0EsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFVBQ1AsV0FBVztBQUFBLFVBQ1gsWUFBWTtBQUFBLFlBQ1YsWUFBWTtBQUFBLFlBQ1osZUFBZSxLQUFLLEtBQUssS0FBSztBQUFBO0FBQUEsVUFDaEM7QUFBQSxVQUNBLG1CQUFtQjtBQUFBLFlBQ2pCLFVBQVUsQ0FBQyxHQUFHLEdBQUc7QUFBQSxVQUNuQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBO0FBQUEsUUFDRSxZQUFZLENBQUMsRUFBRSxJQUFJLE1BQU07QUFDdkIsaUJBQU8sZUFBZSxLQUFLLElBQUksSUFBSTtBQUFBLFFBQ3JDO0FBQUEsUUFDQSxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsVUFDUCxXQUFXO0FBQUEsVUFDWCxZQUFZO0FBQUEsWUFDVixZQUFZO0FBQUEsWUFDWixlQUFlLEtBQUssS0FBSyxLQUFLO0FBQUE7QUFBQSxVQUNoQztBQUFBLFVBQ0EsbUJBQW1CO0FBQUEsWUFDakIsVUFBVSxDQUFDLEdBQUcsR0FBRztBQUFBLFVBQ25CO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUE7QUFBQSxRQUNFLFlBQVk7QUFBQSxRQUNaLFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxVQUNQLFdBQVc7QUFBQSxVQUNYLFlBQVk7QUFBQSxZQUNWLFlBQVk7QUFBQSxZQUNaLGVBQWUsS0FBSyxLQUFLLEtBQUs7QUFBQTtBQUFBLFVBQ2hDO0FBQUEsVUFDQSxtQkFBbUI7QUFBQSxZQUNqQixVQUFVLENBQUMsR0FBRyxHQUFHO0FBQUEsVUFDbkI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLFlBQVk7QUFBQSxRQUNaLFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxVQUNQLFdBQVc7QUFBQSxVQUNYLFlBQVk7QUFBQSxZQUNWLFlBQVk7QUFBQSxZQUNaLGVBQWUsS0FBSyxLQUFLLEtBQUs7QUFBQTtBQUFBLFVBQ2hDO0FBQUEsVUFDQSxtQkFBbUI7QUFBQSxZQUNqQixVQUFVLENBQUMsR0FBRyxHQUFHO0FBQUEsVUFDbkI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBO0FBQUEsTUFFQTtBQUFBLFFBQ0UsWUFBWTtBQUFBLFFBQ1osU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFVBQ1AsV0FBVztBQUFBLFVBQ1gsWUFBWTtBQUFBLFlBQ1YsWUFBWTtBQUFBLFlBQ1osZUFBZSxLQUFLLEtBQUs7QUFBQTtBQUFBLFVBQzNCO0FBQUEsVUFDQSxtQkFBbUI7QUFBQSxZQUNqQixVQUFVLENBQUMsR0FBRyxHQUFHO0FBQUEsVUFDbkI7QUFBQSxVQUNBLHVCQUF1QjtBQUFBLFFBQ3pCO0FBQUEsTUFDRjtBQUFBO0FBQUEsTUFFQTtBQUFBLFFBQ0UsWUFBWTtBQUFBLFFBQ1osU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFVBQ1AsV0FBVztBQUFBLFVBQ1gsWUFBWTtBQUFBLFlBQ1YsWUFBWTtBQUFBLFlBQ1osZUFBZSxLQUFLLEtBQUssS0FBSztBQUFBO0FBQUEsVUFDaEM7QUFBQSxVQUNBLG1CQUFtQjtBQUFBLFlBQ2pCLFVBQVUsQ0FBQyxHQUFHLEdBQUc7QUFBQSxVQUNuQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDO0FBRUgsSUFBTyxxQkFBUTs7O0FDaFRmLFNBQVMsY0FBYyxhQUFhLFlBQVk7OztBQ0FoRCxTQUFTLFlBQVksV0FBVztBQUVoQyxJQUFNLFVBQWdDO0FBQUEsRUFDcEM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0Y7QUFFTyxJQUFNLGdCQUFxQixXQUFXLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxPQUFPO0FBRTFELElBQU0saUJBQXNCO0FBQUEsRUFDakMsSUFBSSxJQUFJO0FBQUEsSUFDTixhQUFhO0FBQUEsRUFDZixDQUFDO0FBQUEsRUFDRDtBQUNGOzs7QUR0Qk8sSUFBTSxvQkFBb0I7QUFJMUIsSUFBTSx5QkFBeUIsS0FBSztBQUFBLEVBQ3pDO0FBQUEsSUFDRSxNQUFNLEtBQUssT0FBTztBQUFBLElBQ2xCLE1BQU0sS0FBSyxPQUFPO0FBQUEsRUFDcEI7QUFBQSxFQUNBLEVBQUUsS0FBSyxvQkFBb0Isc0JBQXNCLE1BQU07QUFDekQ7QUFHTyxJQUFNLHNCQUFzQixLQUFLO0FBQUEsRUFDdEM7QUFBQSxJQUNFLFlBQVksS0FBSyxPQUFPO0FBQUEsRUFDMUI7QUFBQSxFQUNBLEVBQUUsS0FBSyx1QkFBdUIsc0JBQXNCLE1BQU07QUFDNUQ7QUFJTyxJQUFNLHNCQUFzQixLQUFLO0FBQUEsRUFDdEM7QUFBQSxJQUNFLE9BQU8sS0FBSyxPQUFPO0FBQUEsSUFDbkIsZUFBZSxLQUFLLE9BQU87QUFBQSxJQUMzQixrQkFBa0IsS0FBSyxPQUFPO0FBQUEsSUFDOUIsa0JBQWtCLEtBQUssT0FBTztBQUFBLElBQzlCLG1CQUFtQixLQUFLLE9BQU87QUFBQSxFQUNqQztBQUFBLEVBQ0EsRUFBRSxLQUFLLHVCQUF1QixzQkFBc0IsTUFBTTtBQUM1RDtBQUVPLElBQU0sNEJBQTRCLEtBQUs7QUFBQSxFQUM1QztBQUFBLElBQ0UsT0FBTyxLQUFLLE9BQU87QUFBQSxJQUNuQixrQkFBa0IsS0FBSyxPQUFPO0FBQUEsSUFDOUIsa0JBQWtCLEtBQUssT0FBTztBQUFBLElBQzlCLG1CQUFtQixLQUFLLE9BQU87QUFBQSxFQUNqQztBQUFBLEVBQ0EsRUFBRSxLQUFLLDZCQUE2QixzQkFBc0IsTUFBTTtBQUNsRTtBQUlPLElBQU0sc0JBQXNCLEtBQUs7QUFBQSxFQUN0QztBQUFBLElBQ0UsT0FBTyxLQUFLLElBQUksbUJBQW1CO0FBQUEsSUFDbkMsT0FBTyxLQUFLLElBQUksbUJBQW1CO0FBQUEsSUFDbkMsYUFBYSxLQUFLLElBQUkseUJBQXlCO0FBQUEsRUFDakQ7QUFBQSxFQUNBLEVBQUUsS0FBSyx1QkFBdUIsc0JBQXNCLE1BQU07QUFDNUQ7QUFJTyxJQUFNLDJCQUEyQixLQUFLO0FBQUEsRUFDM0M7QUFBQSxJQUNFLFdBQVcsS0FBSyxPQUFPO0FBQUEsSUFDdkIsa0JBQWtCLEtBQUssT0FBTztBQUFBLElBQzlCLG1CQUFtQixLQUFLLE9BQU87QUFBQSxJQUMvQiwyQkFBMkIsS0FBSyxPQUFPO0FBQUEsSUFDdkMsZ0JBQWdCLEtBQUssT0FBTztBQUFBLElBQzVCLGlCQUFpQixLQUFLLE9BQU87QUFBQSxJQUM3QixZQUFZLEtBQUssT0FBTztBQUFBLElBQ3hCLHVCQUF1QixLQUFLLE9BQU87QUFBQSxJQUNuQyxlQUFlLEtBQUssT0FBTztBQUFBLElBQzNCLGFBQWEsS0FBSyxPQUFPO0FBQUEsSUFDekIsZ0JBQWdCLEtBQUssT0FBTztBQUFBLElBQzVCLGlCQUFpQixLQUFLLE9BQU87QUFBQSxJQUM3QixpQkFBaUIsS0FBSyxPQUFPO0FBQUEsSUFDN0Isc0JBQXNCLEtBQUssT0FBTztBQUFBLElBQ2xDLHNCQUFzQixLQUFLLE9BQU87QUFBQSxJQUNsQyw4QkFBOEIsS0FBSyxPQUFPO0FBQUEsSUFDMUMsZ0JBQWdCLEtBQUssT0FBTztBQUFBLElBQzVCLGNBQWMsS0FBSyxPQUFPO0FBQUEsSUFDMUIscUJBQXFCLEtBQUssT0FBTztBQUFBLElBQ2pDLG1CQUFtQixLQUFLLE9BQU87QUFBQSxJQUMvQixpQkFBaUIsS0FBSyxPQUFPO0FBQUEsSUFDN0IsMEJBQTBCLEtBQUssT0FBTztBQUFBLElBQ3RDLHdCQUF3QixLQUFLLE9BQU87QUFBQSxJQUNwQywwQkFBMEIsS0FBSyxPQUFPO0FBQUEsSUFDdEMsd0JBQXdCLEtBQUssT0FBTztBQUFBLElBQ3BDLGlCQUFpQixLQUFLLE9BQU87QUFBQSxJQUM3QixjQUFjLEtBQUssT0FBTztBQUFBLElBQzFCLGlCQUFpQixLQUFLLE9BQU87QUFBQSxJQUM3QixrQkFBa0IsS0FBSyxPQUFPO0FBQUEsSUFDOUIsd0JBQXdCLEtBQUssT0FBTztBQUFBLElBQ3BDLDZCQUE2QixLQUFLLE9BQU87QUFBQSxJQUN6QyxnQ0FBZ0MsS0FBSyxPQUFPO0FBQUEsSUFDNUMsa0JBQWtCLEtBQUssT0FBTztBQUFBLElBQzlCLGlCQUFpQixLQUFLLE9BQU87QUFBQSxJQUM3Qix1QkFBdUIsS0FBSyxPQUFPO0FBQUEsSUFDbkMscUJBQXFCLEtBQUssT0FBTztBQUFBLElBQ2pDLHVCQUF1QixLQUFLLE9BQU87QUFBQSxJQUNuQyxnQkFBZ0IsS0FBSyxPQUFPO0FBQUEsRUFDOUI7QUFBQSxFQUNBLEVBQUUsS0FBSyxzQkFBc0Isc0JBQXNCLE1BQU07QUFDM0Q7QUFJTyxJQUFNLHNCQUFzQixLQUFLO0FBQUEsRUFDdEM7QUFBQSxJQUNFLElBQUksS0FBSyxPQUFPO0FBQUEsTUFDZCxRQUFRO0FBQUEsSUFDVixDQUFDO0FBQUEsSUFDRCxNQUFNLEtBQUssT0FBTztBQUFBLElBQ2xCLE9BQU8sS0FBSyxPQUFPO0FBQUEsSUFDbkIsWUFBWSxLQUFLLE9BQU87QUFBQSxJQUN4QixXQUFXLEtBQUssT0FBTztBQUFBLElBQ3ZCLEtBQUssS0FBSyxPQUFPO0FBQUEsSUFDakIsYUFBYSxLQUFLLE9BQU87QUFBQSxJQUN6QixpQkFBaUIsS0FBSyxPQUFPO0FBQUEsSUFDN0IsZ0JBQWdCLEtBQUssT0FBTztBQUFBLElBQzVCLGFBQWEsS0FBSyxPQUFPO0FBQUEsSUFDekIsYUFBYSxLQUFLLE9BQU87QUFBQSxJQUN6QixXQUFXLEtBQUssT0FBTztBQUFBLElBQ3ZCLFdBQVcsS0FBSyxPQUFPO0FBQUEsSUFDdkIsY0FBYyxLQUFLLE9BQU87QUFBQSxJQUMxQixpQkFBaUIsS0FBSyxPQUFPO0FBQUEsSUFDN0IsU0FBUyxLQUFLLE9BQU87QUFBQSxJQUNyQixpQkFBaUIsS0FBSyxPQUFPO0FBQUEsSUFDN0IsY0FBYyxLQUFLLE9BQU87QUFBQSxJQUMxQixlQUFlLEtBQUssT0FBTztBQUFBLElBQzNCLFVBQVUsS0FBSyxPQUFPO0FBQUEsSUFDdEIsYUFBYSxLQUFLLE9BQU87QUFBQSxJQUN6QixnQkFBZ0IsS0FBSyxPQUFPO0FBQUEsSUFDNUIsZ0JBQWdCLEtBQUssTUFBTSxLQUFLLElBQUksc0JBQXNCLENBQUM7QUFBQSxJQUMzRCxlQUFlLEtBQUssT0FBTyxLQUFLLE9BQU8sR0FBRyxLQUFLLElBQUksd0JBQXdCLENBQUM7QUFBQSxJQUM1RSxZQUFZLEtBQUssT0FBTyxLQUFLLE9BQU8sR0FBRyxLQUFLLE9BQU8sQ0FBQztBQUFBLElBQ3BELFlBQVksS0FBSyxPQUFPO0FBQUEsSUFDeEIsZUFBZSxLQUFLLE9BQU87QUFBQSxJQUMzQiwyQkFBMkIsS0FBSyxRQUFRO0FBQUEsSUFDeEMsNEJBQTRCLEtBQUssT0FBTztBQUFBLElBQ3hDLHdCQUF3QixLQUFLLE9BQU87QUFBQSxJQUNwQyxXQUFXLEtBQUssT0FBTyxFQUFFLFFBQVEsWUFBWSxDQUFDO0FBQUEsSUFDOUMsV0FBVyxLQUFLLE9BQU8sRUFBRSxRQUFRLFlBQVksQ0FBQztBQUFBLElBQzlDLGVBQWUsS0FBSyxJQUFJLG1CQUFtQjtBQUFBLEVBQzdDO0FBQUEsRUFDQSxFQUFFLEtBQUssaUJBQWlCLHNCQUFzQixNQUFNO0FBQ3REO0FBV08sSUFBTSwwQkFBMEIsS0FBSztBQUFBLEVBQzFDO0FBQUEsRUFDQTtBQUFBLElBQ0U7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLEtBQUs7QUFBQSxFQUNQO0FBQ0Y7QUFJTyxJQUFNLDJCQUEyQixLQUFLLFFBQVEscUJBQXFCO0FBQUEsRUFDeEUsS0FBSztBQUNQLENBQUM7QUFJTSxJQUFNLCtCQUErQixLQUFLLEtBQUsscUJBQXFCO0FBQUEsRUFDekU7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSUE7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQUNNLElBQU0sMkJBQTJCLEtBQUs7QUFBQSxFQUMzQztBQUFBLElBQ0UsWUFBWSw0QkFBNEI7QUFBQTtBQUFBLElBRXhDLEtBQUssT0FBTyxDQUFDLEdBQUcsRUFBRSxzQkFBc0IsTUFBTSxDQUFDO0FBQUEsRUFDakQ7QUFBQSxFQUNBLEVBQUUsc0JBQXNCLE1BQU07QUFDaEM7OztBRTFPQSxPQUFPLFVBQVU7OztBQ0RqQixTQUFTLFNBQVMsZUFBZTtBQUNqQyxTQUFTLE1BQU0sY0FBYzs7O0FDRHRCLElBQU0saUJBQWlCLFlBQVk7QUFDeEMsVUFBTyxvQkFBSSxLQUFLLEdBQUUsWUFBWSxFQUFFLE1BQU0sR0FBRyxFQUFFLEVBQUUsUUFBUSxLQUFLLEdBQUc7QUFDL0Q7QUFtQk8sSUFBTSxrQkFBa0IsQ0FBQyxTQUFpQjtBQUMvQyxNQUFJO0FBQ0osTUFBSSxPQUFPLFNBQVMsVUFBVTtBQUM1QixjQUFVLElBQUksS0FBSyxJQUFJO0FBQUEsRUFDekIsT0FBTztBQUNMLGNBQVU7QUFBQSxFQUNaO0FBQ0EsU0FDRSxRQUFRLFlBQVksSUFDcEIsT0FDQyxRQUFRLFFBQVEsU0FBUyxJQUFJLElBQUksTUFBTSxFQUFFLElBQzFDLE9BQ0MsT0FBTyxRQUFRLFFBQVEsR0FBRyxNQUFNLEVBQUUsSUFDbkMsT0FDQyxPQUFPLFFBQVEsU0FBUyxHQUFHLE1BQU0sRUFBRSxJQUNwQyxPQUNDLE9BQU8sUUFBUSxXQUFXLEdBQUcsTUFBTSxFQUFFLElBQ3RDLE9BQ0MsT0FBTyxRQUFRLFdBQVcsR0FBRyxNQUFNLEVBQUUsSUFDdEM7QUFFSjs7O0FENUJPLElBQU0sbUJBQW1CLENBQUMsWUFBMEQ7QUFDekYsTUFBSSxpQkFBaUIsS0FBSyxNQUFNLFFBQVEsY0FBYztBQUl0RCxNQUFJLE9BQU8sbUJBQW1CLFVBQVU7QUFDdEMscUJBQWlCLEtBQUssTUFBTSxjQUFjO0FBQUEsRUFDNUM7QUFFQSxNQUFJLGdCQUFnQixLQUFLLE1BQU0sUUFBUSxhQUFhO0FBSXBELE1BQUksT0FBTyxrQkFBa0IsVUFBVTtBQUNyQyxvQkFBZ0IsS0FBSyxNQUFNLGFBQWE7QUFBQSxFQUMxQztBQUVBLE1BQUksYUFBYSxLQUFLLE1BQU0sUUFBUSxVQUFVO0FBSTlDLE1BQUksT0FBTyxlQUFlLFVBQVU7QUFDbEMsaUJBQWEsS0FBSyxNQUFNLFVBQVU7QUFBQSxFQUNwQztBQUVBLE1BQUksT0FBTyxRQUFRLGtCQUFrQjtBQUFVLFlBQVEsZ0JBQWdCLEtBQUssTUFBTSxRQUFRLGFBQWE7QUFFdkcsU0FBTztBQUFBLElBQ0wsR0FBRztBQUFBLElBQ0g7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDRjtBQUVPLElBQU0sd0JBQXdCO0FBQUEsRUFDbkM7QUFBQSxJQUNFLFdBQVcsUUFBUSxPQUFPLGtCQUFrQixnQkFBZ0IsY0FBYyxTQUFTLENBQUM7QUFBQSxJQUNwRixXQUFXLFFBQVEsT0FBTyxrQkFBa0IsZ0JBQWdCLGNBQWMsU0FBUyxDQUFDO0FBQUEsRUFDdEY7QUFBQSxFQUNBO0FBQUE7QUFBQSxJQUVFLFdBQVcsT0FBTyxTQUFTLFlBQVk7QUFDckMsYUFBTyxpQkFBaUIsT0FBTztBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUNGO0FBRU8sSUFBTSxnQ0FBZ0MsUUFBd0MsQ0FBQyxDQUFDO0FBRWhGLElBQU0sNEJBQTRCO0FBQUEsRUFDdkM7QUFBQSxJQUNFLElBQUksWUFBWTtBQUNkLGFBQU8sT0FBTztBQUFBLElBQ2hCO0FBQUEsSUFDQSxXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0E7QUFBQTtBQUFBLElBRUUsV0FBVyxPQUFPLFNBQVMsWUFBWTtBQUNyQyxhQUFPO0FBQUEsUUFDTCxHQUFHO0FBQUEsUUFDSCxnQkFBZ0IsS0FBSyxVQUFVLFFBQVEsY0FBYztBQUFBLFFBQ3JELGVBQWUsS0FBSyxVQUFVLFFBQVEsYUFBYTtBQUFBLFFBQ25ELFlBQVksS0FBSyxVQUFVLFFBQVEsVUFBVTtBQUFBLFFBQzdDLGVBQWUsS0FBSyxVQUFVLFFBQVEsYUFBYTtBQUFBLE1BQ3JEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUVPLElBQU0sNkJBQTZCO0FBQUEsRUFDeEM7QUFBQSxJQUNFLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQTtBQUFBO0FBQUEsSUFFRSxXQUFXLE9BQU8sU0FBUyxZQUFZO0FBQ3JDLGFBQU87QUFBQSxRQUNMLEdBQUc7QUFBQSxRQUNILGdCQUFnQixLQUFLLFVBQVUsUUFBUSxjQUFjO0FBQUEsUUFDckQsZUFBZSxLQUFLLFVBQVUsUUFBUSxhQUFhO0FBQUEsUUFDbkQsWUFBWSxLQUFLLFVBQVUsUUFBUSxVQUFVO0FBQUEsUUFDN0MsZUFBZSxLQUFLLFVBQVUsUUFBUSxhQUFhO0FBQUEsTUFDckQ7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBRU8sSUFBTSw2QkFBNkIsUUFBeUMsQ0FBQyxDQUFDOzs7QURwRzlFLElBQU0sbUJBQW1CLFlBQVk7QUFDMUMsUUFBTSxhQUFhLEtBQUs7QUFBQSxJQUN0QixRQUFRO0FBQUEsSUFDUixZQUFZO0FBQUEsTUFDVixNQUFNLFFBQVEsSUFBSSxjQUFjO0FBQUEsTUFDaEMsVUFBVSxRQUFRLElBQUksa0JBQWtCO0FBQUEsTUFDeEMsTUFBTSxRQUFRLElBQUksY0FBYztBQUFBLE1BQ2hDLE1BQU0sU0FBUyxRQUFRLElBQUksY0FBYyxNQUFNO0FBQUEsTUFDL0MsVUFBVSxRQUFRLElBQUksa0JBQWtCO0FBQUEsTUFDeEMsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGLENBQUM7QUFFRCxRQUFNLGdCQUFnQixNQUFNLFdBQ3pCLE9BQU8sRUFDUCxLQUFnQyxpQkFBaUIsRUFDakQsS0FBSyxDQUFDLENBQUMsUUFBUSxNQUFNO0FBQ3BCLFVBQU0saUJBQWlCLGlCQUFpQixRQUFRLEtBQUs7QUFBQSxNQUNuRCxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxLQUFLO0FBQUEsTUFDTCxhQUFhO0FBQUEsTUFDYixpQkFBaUI7QUFBQSxNQUNqQixhQUFhO0FBQUEsTUFDYixhQUFhO0FBQUEsTUFDYixXQUFXO0FBQUEsTUFDWCxXQUFXO0FBQUEsSUFDYjtBQUNBLFFBQUksZ0JBQWdCO0FBQ2xCLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRixDQUFDLEVBQ0EsTUFBTSxDQUFDLE1BQU07QUFDWixZQUFRLEtBQUssNkNBQTZDO0FBQzFELFlBQVEsS0FBSyxDQUFDO0FBQUEsRUFDaEIsQ0FBQztBQUVILFFBQU0sV0FBVyxRQUFRO0FBRXpCLFNBQU87QUFDVDs7O0FHN0NBLE9BQU9DLFdBQVU7OztBQ0VqQixTQUFTLGdCQUFBQyxlQUFjLGVBQUFDLGNBQWEsUUFBQUMsYUFBWTtBQUl6QyxJQUFNLGtCQUFrQjtBQUt4QixJQUFNLG9CQUFvQkMsTUFBSztBQUFBLEVBQ3BDO0FBQUEsSUFDRSxJQUFJQSxNQUFLLE9BQU87QUFBQSxNQUNkLFFBQVE7QUFBQSxJQUNWLENBQUM7QUFBQSxJQUNELGdCQUFnQkEsTUFBSyxPQUFPO0FBQUEsSUFDNUIsVUFBVUEsTUFBSyxPQUFPO0FBQUEsSUFDdEIsY0FBY0EsTUFBSyxPQUFPO0FBQUEsSUFDMUIsV0FBV0EsTUFBSyxPQUFPLEVBQUUsUUFBUSxZQUFZLENBQUM7QUFBQSxJQUM5QyxXQUFXQSxNQUFLLE9BQU8sRUFBRSxRQUFRLFlBQVksQ0FBQztBQUFBLEVBQ2hEO0FBQUEsRUFDQSxFQUFFLEtBQUssZUFBZSxzQkFBc0IsTUFBTTtBQUNwRDtBQUlPLElBQU0sd0JBQXdCQSxNQUFLLEtBQUssbUJBQW1CLENBQUMsa0JBQWtCLFlBQVksY0FBYyxHQUFHO0FBQUEsRUFDaEgsS0FBSztBQUNQLENBQUM7QUFJTSxJQUFNLHlCQUF5QkEsTUFBSyxRQUFRLG1CQUFtQjtBQUFBLEVBQ3BFLEtBQUs7QUFDUCxDQUFDO0FBSU0sSUFBTSw2QkFBNkJBLE1BQUssS0FBSyxtQkFBbUI7QUFBQSxFQUNyRTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFDTSxJQUFNLHlCQUF5QkEsTUFBSztBQUFBLEVBQ3pDO0FBQUEsSUFDRUMsYUFBWSwwQkFBMEI7QUFBQTtBQUFBLElBRXRDRCxNQUFLLE9BQU8sQ0FBQyxHQUFHLEVBQUUsc0JBQXNCLE1BQU0sQ0FBQztBQUFBLEVBQ2pEO0FBQUEsRUFDQSxFQUFFLHNCQUFzQixNQUFNO0FBQ2hDOzs7QURoRE8sSUFBTSxpQkFBaUIsWUFBWTtBQUN4QyxRQUFNLGFBQWFFLE1BQUs7QUFBQSxJQUN0QixRQUFRO0FBQUEsSUFDUixZQUFZO0FBQUEsTUFDVixNQUFNLFFBQVEsSUFBSSxjQUFjO0FBQUEsTUFDaEMsVUFBVSxRQUFRLElBQUksa0JBQWtCO0FBQUEsTUFDeEMsTUFBTSxRQUFRLElBQUksY0FBYztBQUFBLE1BQ2hDLE1BQU0sU0FBUyxRQUFRLElBQUksY0FBYyxNQUFNO0FBQUEsTUFDL0MsVUFBVSxRQUFRLElBQUksa0JBQWtCO0FBQUEsTUFDeEMsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGLENBQUM7QUFFRCxRQUFNLGNBQWMsTUFBTSxXQUN2QixPQUFPLEVBQ1AsS0FBc0IsZUFBZSxFQUNyQyxLQUFLLENBQUMsQ0FBQyxNQUFNLE1BQU07QUFDbEIsUUFBSSxRQUFRO0FBQ1YsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGLENBQUMsRUFDQSxNQUFNLENBQUMsTUFBTTtBQUNaLFlBQVEsS0FBSywyQ0FBMkM7QUFDeEQsWUFBUSxLQUFLLENBQUM7QUFBQSxFQUNoQixDQUFDO0FBRUgsUUFBTSxXQUFXLFFBQVE7QUFFekIsU0FBTztBQUNUOzs7Ozs7Ozs7QVQxREEsSUFBTSxtQ0FBbUM7QUEyQ3pDLElBQU0sRUFBRSxTQUFTLFVBQVUsSUFBSTtBQUUvQixJQUFNLGtCQUFrQixDQUFDLGVBQXVCO0FBRTlDLE1BQUksV0FBVyxTQUFTLFVBQVUsR0FBRztBQUNuQyxXQUFPLDBCQUEwQixXQUFXLFNBQVMsRUFBRSxNQUFNLGFBQWEsRUFBRSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQztBQUFBLEVBQ3pHO0FBRUEsTUFBSSxXQUFXLFNBQVMsWUFBWSxHQUFHO0FBQ3JDLFdBQU8scUJBQXFCLFdBQVcsU0FBUyxFQUFFLE1BQU0sT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDO0FBQUEsRUFDOUY7QUFFQSxNQUFJLFdBQVcsU0FBUyxhQUFhLEdBQUc7QUFDdEMsV0FBTyxxQkFBcUIsV0FBVyxTQUFTLEVBQUUsTUFBTSxjQUFjLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUM7QUFBQSxFQUNyRztBQUdBLE1BQUksV0FBVyxTQUFTLFlBQVksR0FBRztBQUNyQyxXQUFPLG9CQUFvQixXQUFXLFNBQVMsRUFBRSxNQUFNLGFBQWEsRUFBRSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQztBQUFBLEVBQ25HO0FBRUEsTUFBSSxXQUFXLFNBQVMsV0FBVyxHQUFHO0FBQ3BDLFdBQU8sb0JBQW9CLFdBQVcsU0FBUyxFQUFFLE1BQU0sWUFBWSxFQUFFLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDO0FBQUEsRUFDbEc7QUFHQSxNQUFJLFdBQVcsU0FBUyxhQUFhLEdBQUc7QUFDdEMsV0FBTyxzQkFBc0IsV0FBVyxTQUFTLEVBQUUsTUFBTSxjQUFjLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUM7QUFBQSxFQUN0RztBQUdBLE1BQUksV0FBVyxTQUFTLFFBQVEsR0FBRztBQUNqQyxRQUFJLFdBQVcsU0FBUyxrQkFBa0IsR0FBRztBQUMzQyxhQUFPLDJCQUEyQixXQUFXLFNBQVMsRUFBRSxNQUFNLFdBQVcsRUFBRSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQztBQUFBLElBQ3hHO0FBQ0EsV0FBTyxpQkFBaUIsV0FBVyxTQUFTLEVBQUUsTUFBTSxTQUFTLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUM7QUFBQSxFQUM1RjtBQUVBLE1BQUksV0FBVyxTQUFTLE9BQU8sR0FBRztBQUNoQyxRQUFJLFdBQVcsU0FBUyxhQUFhLEdBQUc7QUFDdEMsYUFBTyx1QkFBdUIsV0FBVyxTQUFTLEVBQUUsTUFBTSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUM7QUFBQSxJQUNoRztBQUNBLFFBQUksV0FBVyxTQUFTLE9BQU8sR0FBRztBQUNoQyxhQUFPLHNCQUFzQixXQUFXLFNBQVMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQztBQUFBLElBQzNGO0FBQUEsRUFDRjtBQUVBLE1BQUksV0FBVyxTQUFTLE1BQU0sR0FBRztBQUMvQixRQUFJLFdBQVcsU0FBUyxpQkFBaUIsR0FBRztBQUMxQyxhQUFPLHdCQUF3QixXQUFXLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixFQUFFLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDO0FBQUEsSUFDMUcsV0FBVyxXQUFXLFNBQVMscUJBQXFCLEdBQUc7QUFDckQsYUFBTyw4QkFBOEIsV0FDbEMsU0FBUyxFQUNULE1BQU0sc0JBQXNCLEVBQUUsQ0FBQyxFQUMvQixNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQ1osU0FBUyxDQUFDO0FBQUEsSUFDZjtBQUNBLFdBQU8sZUFBZSxXQUFXLFNBQVMsRUFBRSxNQUFNLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQztBQUFBLEVBQ3hGO0FBRUEsTUFBSSxXQUFXLFNBQVMsV0FBVyxHQUFHO0FBQ3BDLFdBQU8sb0JBQW9CLFdBQVcsU0FBUyxFQUFFLE1BQU0sa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUM7QUFBQSxFQUN4RztBQUdBLFNBQU8sVUFBVSxXQUFXLFNBQVMsRUFBRSxNQUFNLGVBQWUsRUFBRSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQztBQUMzRjtBQUVBLElBQU0sUUFBUSxDQUFDLEtBQUssU0FDbEIsVUFBVSxDQUFDLEdBQUcsS0FBSyxNQUFNLFNBQVUsR0FBRyxHQUFHO0FBQ3ZDLE1BQUksUUFBUSxDQUFDLEdBQUc7QUFDZCxXQUFPLEVBQUUsT0FBTyxDQUFDO0FBQUEsRUFDbkI7QUFDRixDQUFDO0FBR0gsT0FBTyw2RUFBUyxFQUFFLEtBQUssQ0FBQyxXQUFXO0FBQ2pDLFNBQU8sU0FBUztBQUFBLElBQ2QsU0FBUztBQUFBLEVBQ1gsQ0FBQztBQUNILENBQUM7QUFFRCxJQUFNLDZCQUE2QixPQUFPLFdBQXVCO0FBQy9ELFFBQU0sV0FBVyxHQUNkLFlBQVksS0FBSyxRQUFRLGtDQUFXLHVCQUF1QixHQUFHLEVBQUUsZUFBZSxLQUFLLENBQUMsRUFDckYsT0FBTyxDQUFDLFdBQVcsT0FBTyxZQUFZLENBQUMsRUFDdkMsSUFBSSxDQUFDLFdBQVcsT0FBTyxJQUFJO0FBQzlCLGFBQVcsV0FBVyxVQUFVO0FBQzlCLFVBQU0sYUFBYSxLQUFLLFFBQVEsa0NBQVcseUJBQXlCLFNBQVMsMEJBQTBCO0FBQ3ZHLFFBQUksR0FBRyxXQUFXLFVBQVUsR0FBRztBQUM3QixVQUFJO0FBRUYsY0FBTSxFQUFFLFNBQVMsb0JBQW9CLElBQUksTUFDdkMsOEVBQXdCLE9BQU87QUFFakMsWUFBSSxPQUFPLHdCQUF3QixZQUFZO0FBQzdDLGdCQUFNLGtCQUFtQixNQUFNLG9CQUFvQixNQUFNO0FBRXpELGNBQUksaUJBQWlCLFNBQVM7QUFDNUIsbUJBQU8sVUFBVSxDQUFDLEdBQUcsT0FBTyxTQUFVLEdBQUcsZ0JBQWdCLE9BQU87QUFDaEUsbUJBQU8sZ0JBQWdCO0FBQUEsVUFDekI7QUFDQSxtQkFBUyxNQUFNLFFBQVEsZUFBZTtBQUFBLFFBQ3hDO0FBQUEsTUFDRixTQUFTLEdBQUc7QUFDVixnQkFBUSxNQUFNLENBQUM7QUFBQSxNQUNqQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUNUO0FBR0EsU0FBUyx1QkFBdUI7QUFDOUIsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sS0FBSyxJQUFJO0FBQ1AsWUFBTSx5QkFBeUI7QUFBQSxRQUM3QixXQUFXO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxRQUNBLFlBQVksQ0FBQyxXQUFXLG9CQUFvQixPQUFPO0FBQUEsUUFDbkQsbUJBQW1CLENBQUMsUUFBUTtBQUFBLFFBQzVCLG9CQUFvQixDQUFDLGtCQUFrQixpQkFBaUIsTUFBTTtBQUFBLFFBQzlELG9CQUFvQjtBQUFBLFVBQ2xCO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQTtBQUFBO0FBQUEsVUFJQTtBQUFBLFVBRUE7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUVBLFlBQU0sV0FBVyxLQUFLLFNBQVMsRUFBRTtBQUNqQyxVQUFJLEVBQUUsWUFBWTtBQUF5QixlQUFPO0FBQ2xELFVBQUksT0FBTyxHQUFHLGFBQWEsSUFBSSxPQUFPO0FBQ3RDLGlCQUFXLFFBQVEsdUJBQXVCLFFBQVEsR0FBRztBQUNuRCxnQkFBUSxXQUFXLElBQUksTUFBTSxJQUFJO0FBQUEsTUFDbkM7QUFDQSxhQUFPLEVBQUUsS0FBSztBQUFBLElBQ2hCO0FBQUEsRUFDRjtBQUNGO0FBR0EsSUFBTSw2QkFBNkIsQ0FBQyxTQUFTLFlBQVk7QUFFdkQsS0FBRyxRQUFRLFNBQVMsQ0FBQyxLQUFLLGNBQWM7QUFDdEMsUUFBSTtBQUFLLFlBQU07QUFFZixlQUFXLFFBQVEsV0FBVztBQUU1QixVQUFJLFFBQVEsS0FBSyxJQUFJLEdBQUc7QUFFdEIsV0FBRyxPQUFPLEtBQUssUUFBUSxTQUFTLElBQUksR0FBRyxDQUFDQyxTQUFRO0FBQzlDLGNBQUlBO0FBQUssa0JBQU1BO0FBQ2Ysa0JBQVEsSUFBSSxXQUFXLElBQUksRUFBRTtBQUFBLFFBQy9CLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRUEsSUFBTSxlQUFlLE1BQU07QUFFekIsNkJBQTJCLGVBQWUsV0FBVztBQUVyRCw2QkFBMkIsWUFBWSxXQUFXO0FBRWxELDZCQUEyQixZQUFZLFdBQVc7QUFDcEQ7QUFFQSxJQUFPLHNCQUFRLGFBQWEsWUFBWTtBQUN0QyxTQUFPLE9BQU87QUFBQSxJQUNaLE1BQU0sWUFBWSxPQUFPO0FBQUEsRUFDM0IsQ0FBQztBQUNELFFBQU0sZ0JBQWdCLE1BQU0saUJBQWlCO0FBQzdDLFFBQU0sY0FBYyxNQUFNLGVBQWU7QUFFekMsZUFBYTtBQUViLFFBQU0sZUFBZSxRQUFRLElBQUksWUFBWSxpQkFBaUIsUUFBUSxJQUFJLHFCQUFxQjtBQUUvRixNQUFJLE9BQU8sV0FBVyxRQUFRLElBQUksVUFBVSxJQUFJLFFBQVEsSUFBSSxVQUFVLElBQUksUUFBUSxJQUFJLGVBQWUsQ0FBQztBQUV0RyxNQUFJLFFBQVEsSUFBSSx1Q0FBdUMsUUFBUTtBQUM3RCxRQUFJLFFBQVEsSUFBSSxxQkFBcUIsTUFBTTtBQUFBLElBRTNDLFdBQVcsUUFBUSxJQUFJLHFCQUFxQixTQUFTO0FBQ25ELGFBQU8sV0FBVyxRQUFRLElBQUksc0JBQXNCO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBRUEsUUFBTSxTQUFTLEVBQUUsdUJBQXVCLEtBQUssVUFBVSxnQkFBWSxPQUFPLEVBQUU7QUFDNUUsYUFBVyxDQUFDLEtBQUssS0FBSyxLQUFLLE9BQU8sUUFBUSxRQUFRLEdBQUcsR0FBRztBQUN0RCxXQUFPLDBCQUEwQixHQUFHLEVBQUUsSUFBSSxLQUFLLFVBQVUsS0FBSztBQUFBLEVBQ2hFO0FBRUEsUUFBTSxXQUFXO0FBQUEsSUFDZjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sT0FBTyxDQUFDO0FBQUEsTUFDUixNQUFNLGVBQWUsUUFBUTtBQUFBLE1BQzdCLEtBQ0UsUUFBUSxJQUFJLGFBQWEsU0FDckI7QUFBQSxRQUNFLE1BQU0sUUFBUSxJQUFJLGVBQWU7QUFBQSxRQUNqQyxNQUFNLFFBQVEsSUFBSSxlQUFlO0FBQUEsUUFDakMsU0FBUztBQUFBLE1BQ1gsSUFDQTtBQUFBLE1BQ04sTUFBTSxRQUFRLElBQUksZUFBZTtBQUFBLE1BQ2pDLE1BQU0sUUFBUSxJQUFJLGVBQWU7QUFBQSxNQUNqQyxTQUFTO0FBQUEsUUFDUCx3QkFBd0I7QUFBQSxNQUMxQjtBQUFBLE1BQ0EsR0FBSSxlQUNBO0FBQUEsUUFDRSxPQUFPO0FBQUEsVUFDTCxLQUFLLEdBQUcsYUFBYSxLQUFLLEtBQUssWUFBWSxNQUFNLFFBQVEsSUFBSSxPQUFPLGVBQWUsQ0FBQztBQUFBLFVBQ3BGLE1BQU0sR0FBRyxhQUFhLEtBQUssS0FBSyxZQUFZLE1BQU0sUUFBUSxJQUFJLFFBQVEsZ0JBQWdCLENBQUM7QUFBQSxRQUN6RjtBQUFBLE1BQ0YsSUFDQSxDQUFDO0FBQUEsSUFDUDtBQUFBLElBQ0E7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQyxnQkFBZ0I7QUFBQSxNQUMxQixTQUFTLENBQUMsbUJBQW1CLHNCQUFzQix1QkFBdUIsdUJBQXVCO0FBQUEsTUFDakcsZ0JBQWdCO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLEtBQUs7QUFBQSxNQUNMLGNBQWM7QUFBQSxNQUNkLHFCQUFxQjtBQUFBLE1BQ3JCLFFBQVEsSUFBSSxxQkFBcUIsU0FBUyxtQkFBSSxhQUFhLElBQUk7QUFBQSxNQUMvRCxjQUFjO0FBQUEsUUFDWixHQUFHO0FBQUEsUUFDSCxPQUFPLGNBQWMsU0FBUztBQUFBLFFBQzlCLGFBQWEsZUFBZSxtQkFBbUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUkvQyxnQkFBZ0IsY0FBYyxrQkFBa0I7QUFBQSxRQUNoRCxhQUFhLGNBQWMsZUFBZTtBQUFBLFFBQzFDLGFBQWEsY0FBYyxlQUFlO0FBQUEsUUFDMUMsV0FBVyxjQUFjLGFBQWE7QUFBQSxRQUN0QyxXQUFXLGNBQWMsYUFBYTtBQUFBLFFBQ3RDLGlCQUFpQixjQUFjLG1CQUFtQjtBQUFBLFFBQ2xELGNBQWMsY0FBYyxnQkFBZ0I7QUFBQSxRQUM1QyxpQkFBaUIsY0FBYyxtQkFBbUI7QUFBQSxRQUNsRCxTQUFTLGNBQWMsV0FBVztBQUFBLFFBQ2xDLGNBQ0UsY0FBYyxnQkFBZ0IsUUFBUSxJQUFJLHFCQUFxQixTQUMzRCxRQUFRLElBQUksWUFBWSxnQkFDdEIscUJBQ0Esc0JBQ0Y7QUFBQSxRQUNOLGdCQUFnQixhQUFhLGtCQUFrQjtBQUFBLE1BQ2pELENBQUM7QUFBQSxNQUNELGdCQUFnQjtBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsV0FBVztBQUFBLFFBQ1gsa0JBQWtCO0FBQUEsTUFDcEIsQ0FBQztBQUFBLE1BQ0QsYUFBYTtBQUFBLFFBQ1gsU0FBUyxDQUFDLHlCQUF5QjtBQUFBLE1BQ3JDLENBQUM7QUFBQSxJQUNILEVBQUUsT0FBTyxPQUFPO0FBQUEsSUFDaEIsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsbUJBQW1CO0FBQUEsTUFDckI7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixXQUFXLFFBQVEsSUFBSSxvQkFBb0IsU0FBUyxPQUFPO0FBQUEsTUFDM0QsUUFBUTtBQUFBLE1BQ1IsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFLTixVQUFVLENBQUMsT0FBTztBQUFBLFFBQ3BCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsMEJBQTBCO0FBQUEsUUFDeEIsYUFBYTtBQUFBLE1BQ2Y7QUFBQSxNQUNBLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLEtBQUs7QUFBQSxVQUNMLFFBQVE7QUFBQTtBQUFBO0FBQUEsVUFFUiwwQkFBMEI7QUFBQSxVQUMxQixjQUFjLENBQUMsT0FBTztBQUVwQixnQkFBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLHFCQUFPLGdCQUFnQixFQUFFO0FBQUEsWUFDM0I7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLFNBQU8sTUFBTSwyQkFBMkIsUUFBUTtBQUNsRCxDQUFDOyIsCiAgIm5hbWVzIjogWyJ2aXRlX2NvbmZpZ19leHRlbnNpb25fZXhwb3J0cyIsICJ2aXRlX2NvbmZpZ19leHRlbnNpb25fZGVmYXVsdCIsICJpbml0X3ZpdGVfY29uZmlnX2V4dGVuc2lvbiIsICJrbmV4IiwgImdldFZhbGlkYXRvciIsICJxdWVyeVN5bnRheCIsICJUeXBlIiwgIlR5cGUiLCAicXVlcnlTeW50YXgiLCAia25leCIsICJlcnIiXQp9Cg==
