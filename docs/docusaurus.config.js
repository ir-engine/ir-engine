// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

// const commonExludePaths = [
//   '**/node_modules/**',
//   '**/dist/**',
//   '**/tests/**',
//   '**/packages/engine/src/assets/loaders/fbx/fflate.module.js'
// ]

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'xrengine',
  tagline:
    'An end-to-end solution for hosting humans and AI in a virtual space, built on top of react, three.js and express/feathers.',
  url: 'https://xrfoundation.github.io',
  baseUrl: '/xrengine-docs/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'XRFoundation', // Usually your GitHub org/user name.
  projectName: 'xrengine-docs', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  // plugins: [
  //   // [
  //   //   'docusaurus-plugin-typedoc',
  //   //   {
  //   //     id: 'client',
  //   //     entryPoints: ['../packages/client/src/main.tsx'],
  //   //     entryPointStrategy: 'expand',
  //   //     tsconfig: '../packages/client/tsconfig.json',
  //   //     exclude: [
  //   //       ...commonExludePaths,
  //   //       '../packages/client/vite.config.js',
  //   //       '../packages/client/jest.config.js',
  //   //       '../packages/client/public/**',
  //   //       '../packages/client/lib/**',
  //   //       '../packages/client/scripts/**'
  //   //     ],
  //   //     out: 'generated/client',
  //   //     readme: 'none',
  //   //   },
  //   // ],
  //   // [
  //   //   'docusaurus-plugin-typedoc',
  //   //   {
  //   //     id: 'client-core',
  //   //     entryPoints: ['../packages/client-core'],
  //   //     entryPointStrategy: 'expand',
  //   //     tsconfig: '../packages/client-core/tsconfig.json',
  //   //     exclude: [
  //   //       ...commonExludePaths,
  //   //       '../packages/client-core/build.js',
  //   //       '../packages/client-core/rollup.config.js',
  //   //       '../packages/client-core/jest.config.js',
  //   //       '../packages/client-core/scripts/**',
  //   //     ],
  //   //     out: 'generated/client-core',
  //   //     readme: 'none',
  //   //   },
  //   // ],
  //   [
  //     'docusaurus-plugin-typedoc',
  //     {
  //       id: 'server',
  //       entryPoints: ['../packages/server'],
  //       entryPointStrategy: 'expand',
  //       tsconfig: '../packages/server/tsconfig.json',
  //       exclude: [
  //         ...commonExludePaths,
  //         '../packages/server/public/**',
  //         '../packages/server/scripts/**',
  //         '../packages/server/tests old/**',
  //         '../packages/engine/src/assets/loaders/fbx/fflate.module.js'
  //       ],
  //       out: 'generated/server',
  //       readme: 'none',
  //     },
  //   ],
  //   [
  //     'docusaurus-plugin-typedoc',
  //     {
  //       id: 'server-core',
  //       entryPoints: ['../packages/server-core/src/'],
  //       entryPointStrategy: 'expand',
  //       tsconfig: '../packages/server-core/tsconfig.json',
  //       exclude: [
  //         ...commonExludePaths,
  //         '../packages/server-core/scripts/**',
  //         '../packages/server-core/.mocharc.js',
  //         '../packages/server-core/rollup.config.js',
  //         '../packages/server-core/vite.build.js',
  //         '../packages/engine/src/assets/loaders/fbx/fflate.module.js'
  //       ],
  //       out: 'generated/server-core',
  //       readme: 'none',
  //     },
  //   ],
  //   [
  //     'docusaurus-plugin-typedoc',
  //     {
  //       id: 'common',
  //       entryPoints: ['../packages/common'],
  //       entryPointStrategy: 'expand',
  //       tsconfig: '../packages/common/tsconfig.json',
  //       exclude: [
  //         ...commonExludePaths,
  //         '../packages/common/scripts/**',
  //         '../packages/common/rollup.config.js',
  //         '../packages/common/vite.build.js',
  //         '../packages/engine/src/assets/loaders/fbx/fflate.module.js'
  //       ],
  //       out: 'generated/common',
  //       readme: 'none',
  //     },
  //   ],
  //   [
  //     'docusaurus-plugin-typedoc',
  //     {
  //       id: 'engine',
  //       entryPoints: ['../packages/engine/src/'],
  //       entryPointStrategy: 'expand',
  //       tsconfig: '../packages/engine/tsconfig.json',
  //       exclude: [
  //         ...commonExludePaths,
  //         '../packages/engine/scripts/**',
  //         '../packages/engine/.mocharc.js',
  //         '../packages/engine/rollup.config.js',
  //         '../packages/engine/vite.build.js',
  //         '../packages/engine/src/physics/physx/physx.release.cjs.js',
  //         '../packages/engine/src/physics/physx/physx.release.esm.js',
  //         '../packages/engine/src/assets/loaders/fbx/fflate.module.js'
  //       ],
  //       out: 'generated/engine',
  //       readme: 'none',
  //     },
  //   ],
  //   [
  //     'docusaurus-plugin-typedoc',
  //     {
  //       id: 'gameserver',
  //       entryPoints: ['../packages/gameserver/src/'],
  //       entryPointStrategy: 'expand',
  //       tsconfig: '../packages/gameserver/tsconfig.json',
  //       exclude: [
  //         ...commonExludePaths,
  //         '../packages/gameserver/.mocharc.js',
  //         '../packages/gameserver/vite.build.js'
  //       ],
  //       out: 'generated/gameserver',
  //       readme: 'none',
  //     },
  //   ],
  // ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/XRFoundation/XREngine/packages/docs/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'XREngine',
        logo: {
          alt: 'XREngine Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: 'docs/',
            activeBasePath: 'docs',
            label: 'Docs',
            position: 'left'
          },
          {
            href: 'https://xrfoundation.io/',
            label: 'XR Foundation',
            position: 'right'
          }
        ]
      },

      footer: {
        style: 'dark',
        links: [
          {
            title: 'Social',
            items: [
              {
                label: 'Twitter',
                href: 'https://twitter.com/xr_engine'
              },
              {
                label: 'Facebook',
                href: 'https://www.facebook.com/xrengine/'
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/xrf'
              }
            ]
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Github',
                href: 'https://github.com/XRFoundation/XREngine'
              },
              {
                label: 'Npm',
                href: 'https://www.npmjs.com/search?q=%40xrengine'
              }
            ]
          },
          {
            title: 'More',
            items: [
              {
                label: 'XR Foundation',
                href: 'https://www.xrfoundation.io/'
              },
              {
                label: 'Open Collective',
                href: 'https://opencollective.com/xrfoundation'
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} XRFoundation.`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
}

module.exports = config
