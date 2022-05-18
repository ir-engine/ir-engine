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
        entryPoints: ['../client-core'],
        tsconfig: '../client-core/tsconfig.json',
        exclude: [
          ...commonExludePaths,
          '../client-core/build.js',
          '../client-core/rollup.config.js',
          '../client-core/jest.config.js',
          '../client-core/scripts/**',
        ],
        out: 'docs-client-core',
        readme: 'none',
        sidebar: {
          sidebarFile: 'sidebar/typedoc-client-core.js',
        },
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'client',
        entryPoints: ['../client'],
        tsconfig: '../client/tsconfig.json',
        exclude: [
          ...commonExludePaths,
          '../client/vite.config.js',
          '../client/jest.config.js',
          '../client/public/**',
          '../client/lib/**',
          '../client/scripts/**'
        ],
        out: 'docs-client',
        readme: 'none',
        sidebar: {
          sidebarFile: 'sidebar/typedoc-client.js',
        },
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'server',
        entryPoints: ['../server'],
        tsconfig: '../server/tsconfig.json',
        exclude: [
          ...commonExludePaths,
          '../server/.eslintrc.js',
          '../server/vite.config.js',
          '../server/jest.config.js',
          '../server/public/**',
          '../server/scripts/**',
          '../server/tests old/**'
        ],
        out: 'docs-server',
        readme: 'none',
        sidebar: {
          sidebarFile: 'sidebar/typedoc-server.js',
        },
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'common',
        entryPoints: ['../common'],
        tsconfig: '../common/tsconfig.json',
        exclude: [
          ...commonExludePaths,
          '../common/rollup.config.js',
          '../common/scripts/**'
        ],
        out: 'docs-common',
        readme: 'none',
        sidebar: {
          sidebarFile: 'sidebar/typedoc-common.js',
        },
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'engine',
        entryPoints: ['../engine/src/'],
        tsconfig: '../engine/tsconfig.json',
        exclude: [
          ...commonExludePaths,
          '../engine/src/physics/functions/physx.release.cjs.js',
        ],
        out: 'docs-engine',
        readme: 'none',
        sidebar: {
          sidebarFile: 'sidebar/typedoc-engine.js',
        },
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'gameserver',
        entryPoints: ['../gameserver/src/'],
        tsconfig: '../gameserver/tsconfig.json',
        exclude: [
          ...commonExludePaths,
          '../gameserver/src/physx/physx.release.cjs.js',
          '../gameserver/src/physx/physx.release.esm.js',
        ],
        out: 'docs-gameserver',
        readme: 'none',
        sidebar: {
          sidebarFile: 'sidebar/typedoc-gameserver.js',
        },
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'server-core',
        entryPoints: ['../server-core/src/'],
        tsconfig: '../server-core/tsconfig.json',
        exclude: [ ...commonExludePaths ],
        out: 'docs-server-core',
        readme: 'none',
        sidebar: {
          sidebarFile: 'sidebar/typedoc-server-core.js',
        },
      },
    ],
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
        {to: 'blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/XRFoundation/XREngine',
          label: 'GitHub',
          position: 'right',
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
        blog: {
          showReadingTime: true,
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
