/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'xr3ngine',
  tagline: 'An end-to-end solution for hosting humans and AI in a virtual space, built on top of react, three.js and express/feathers.',
  url: 'http://localhost',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'jsdoc-docusaurus', // Usually your repo name.
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        id:'api-1',
        excludeExternals: true,
        entryPoints: [
                        '../client-core/index.ts',
                     ],
        tsconfig: '../client-core/tsconfig.json',
        exclude: [
            '**/node_modules/**', '*.d.ts', /node_modules/
        ],
        out: 'docs-client-core',
        readme: 'none',
        sidebar: {
           sidebarFile: 'sidebar/typedoc-client-core.js',
        }
      },
    ],
    [
        'docusaurus-plugin-typedoc',
        {
          id:'api-2',
          excludeExternals: true,
          entryPoints: [
                          '../client'
                       ],
          tsconfig: '../client/tsconfig.json',
          exclude: [
              '**/node_modules/**', /node_modules/
          ],
          out: 'docs-client',
          readme: 'none',
          sidebar: {
             sidebarFile: 'sidebar/typedoc-client.js',
          }
        },
      ],
      [
          'docusaurus-plugin-typedoc',
          {
            id:'api-4',
            excludeExternals: true,
            entryPoints: [
                            '../server'
                         ],
            tsconfig: '../server/tsconfig.json',
            exclude: [
                '**/node_modules/**', /node_modules/        
            ],
            out: 'docs-server',
            readme: 'none',
            sidebar: {
               sidebarFile: 'sidebar/typedoc-server.js',
            }
          },
        ],
        [
          'docusaurus-plugin-typedoc',
          {
            id:'api-3',
            excludeExternals: true,
            entryPoints: [
                            '../server-core'
                         ],
            tsconfig: '../server-core/tsconfig.json',
            exclude: [
                '**/node_modules/**', /node_modules/
            ],
            out: 'docs-server-core',
            readme: 'none',
            sidebar: {
               sidebarFile: 'sidebar/typedoc-server-core.js',
            }
          },
        ],
  ],
  themeConfig: {
    navbar: {
      // title: 'xr3ngine',
      logo: {
        alt: 'Logo',
        src: 'https://github.com/xr3ngine/xr3ngine/raw/dev/xrengine%20black.png',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        // {to: 'blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/xr3ngine/xr3ngine',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: 'docs/doc1/',
            },
            {
              label: 'Installation',
              to: 'docs/doc2/',
            },
            {
              label: 'Deployment',
              to: 'docs/doc3/',
            },
            {
              label: 'Configurations',
              to: 'docs/doc4/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/mQ3D4FE',
            },
            {
              label: 'Github',
              href: 'https://github.com/xr3ngine/xr3ngine',
            }
          ],
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} THEOVERLAY, Inc. Built with LAGUNA LABS.`,
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
            'https://github.com/xr3ngine/xr3ngine/edit/jsdoc/packages/docs/',
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        // },
        theme: {
         customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
