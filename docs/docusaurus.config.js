/** @type {import('@docusaurus/types').DocusaurusConfig} */

const commonExludePaths = [
  '**/node_modules/**',
  '**/dist/**',
  '**/tests/**'
];

/**
 *
 * @author Abhinav Shah
 */
module.exports = {
  title: 'xrengine',
  tagline:
    'An end-to-end solution for hosting humans and AI in a virtual space, built on top of react, three.js and express/feathers.',
  url: 'https://xrfoundation.github.io',
  baseUrl: '/xrengine-docs/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon:
    'https://github.com/xrfoundation/xrengine/raw/dev/xrengine%20black.png',
  organizationName: 'XRFoundation', // Usually your GitHub org/user name.
  projectName: 'xrengine-docs', // Usually your repo name.
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'client-core',
        entryPoints: ['../test/src/index.tsx'],
        tsconfig: '../test/tsconfig.json',
        exclude: [
          ...commonExludePaths,
          '../test/build.js',
          '../test/rollup.config.js',
          '../test/jest.config.js',
          '../test/scripts/**',
        ],
        out: 'docs-client-core',
        readme: 'none',
        // sidebar: {
        //   // sidebarFile: 'sidebar/typedoc-client-core.js',
        //   categoryLabel: 'API XYZ',
        //   position: 0,
        //   fullNames: true
        // },
      },
    ],
    // [
    //   'docusaurus-plugin-typedoc',
    //   {
    //     id: 'client-core',
    //     entryPoints: ['../packages/client-core'],
    //     tsconfig: '../packages/client-core/tsconfig.json',
    //     exclude: [
    //       ...commonExludePaths,
    //       '../packages/client-core/build.js',
    //       '../packages/client-core/rollup.config.js',
    //       '../packages/client-core/jest.config.js',
    //       '../packages/client-core/scripts/**',
    //     ],
    //     out: 'docs-client-core',
    //     readme: 'none',
    //     sidebar: {
    //       sidebarFile: 'sidebar/typedoc-client-core.js',
    //     },
    //   },
    // ],
    // [
    //   'docusaurus-plugin-typedoc',
    //   {
    //     id: 'client',
    //     entryPoints: ['../packages/client/src/main.tsx'],
    //     tsconfig: '../packages/client/tsconfig.json',
    //     exclude: [
    //       ...commonExludePaths,
    //       '../packages/client/vite.config.js',
    //       '../packages/client/jest.config.js',
    //       '../packages/client/public/**',
    //       '../packages/client/lib/**',
    //       '../packages/client/scripts/**'
    //     ],
    //     out: 'docs-client',
    //     readme: 'none',
    //     sidebar: {
    //       sidebarFile: 'sidebar/typedoc-client.js',
    //     },
    //   },
    // ],
    // [
    //   'docusaurus-plugin-typedoc',
    //   {
    //     id: 'server',
    //     entryPoints: ['../packages/server'],
    //     tsconfig: '../packages/server/tsconfig.json',
    //     exclude: [
    //       ...commonExludePaths,
    //       '../packages/server/.eslintrc.js',
    //       '../packages/server/vite.config.js',
    //       '../packages/server/jest.config.js',
    //       '../packages/server/public/**',
    //       '../packages/server/scripts/**',
    //       '../packages/server/tests old/**'
    //     ],
    //     out: 'docs-server',
    //     readme: 'none',
    //     sidebar: {
    //       sidebarFile: 'sidebar/typedoc-server.js',
    //     },
    //   },
    // ],
    // [
    //   'docusaurus-plugin-typedoc',
    //   {
    //     id: 'common',
    //     entryPoints: ['../packages/common'],
    //     tsconfig: '../packages/common/tsconfig.json',
    //     exclude: [
    //       ...commonExludePaths,
    //       '../packages/common/rollup.config.js',
    //       '../packages/common/scripts/**'
    //     ],
    //     out: 'docs-common',
    //     readme: 'none',
    //     sidebar: {
    //       sidebarFile: 'sidebar/typedoc-common.js',
    //     },
    //   },
    // ],
    // [
    //   'docusaurus-plugin-typedoc',
    //   {
    //     id: 'engine',
    //     entryPoints: ['../packages/engine/src/'],
    //     tsconfig: '../packages/engine/tsconfig.json',
    //     exclude: [
    //       ...commonExludePaths,
    //       '../packages/engine/src/physics/functions/physx.release.cjs.js',
    //     ],
    //     out: 'docs-engine',
    //     readme: 'none',
    //     sidebar: {
    //       sidebarFile: 'sidebar/typedoc-engine.js',
    //     },
    //   },
    // ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'gameserver',
        entryPoints: ['../packages/gameserver/src/'],
        tsconfig: '../packages/gameserver/tsconfig.json',
        exclude: [
          ...commonExludePaths,
          '../packages/gameserver/src/physx/physx.release.cjs.js',
          '../packages/gameserver/src/physx/physx.release.esm.js',
        ],
        out: 'docs-gameserver',
        readme: 'none',
        // sidebar: {
        //   sidebarFile: 'sidebar/typedoc-gameserver.js',
        // },
      },
    ],
    // [
    //   'docusaurus-plugin-typedoc',
    //   {
    //     id: 'server-core',
    //     entryPoints: ['../packages/server-core/src/'],
    //     tsconfig: '../packages/server-core/tsconfig.json',
    //     exclude: [ ...commonExludePaths ],
    //     out: 'docs-server-core',
    //     readme: 'none',
    //     sidebar: {
    //       sidebarFile: 'sidebar/typedoc-server-core.js',
    //     },
    //   },
    // ],
  ],
  themeConfig: {
    navbar: {
      title: 'XREngine',
      logo: {
        alt: 'Logo',
        src: 'https://github.com/XRFoundation/XREngine/raw/dev/xrengine%20black.png',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/mQ3D4FE',
            },
            {
              label: 'Github',
              href: 'https://github.com/XRFoundation/XREngine',
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} XRFoundation.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/XRFoundation/XREngine/packages/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
}
