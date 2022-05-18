import defaultThemeSettings from '@xrengine/common/src/constants/DefaultThemeSettings'

export const clientSeed = {
  path: 'client-setting',
  templates: [
    {
      logo: process.env.APP_LOGO,
      title: process.env.APP_TITLE,
      releaseName: process.env.RELEASE_NAME || null,
      siteDescription: process.env.SITE_DESC,
      url:
        process.env.APP_URL ||
        (process.env.VITE_LOCAL_BUILD
          ? 'http://' + process.env.APP_HOST + ':' + process.env.APP_PORT
          : 'https://' + process.env.APP_HOST + ':' + process.env.APP_PORT),
      favicon32px: '/favicon-32x32.png',
      favicon16px: '/favicon-16x16.png',
      icon192px: '/android-chrome-192x192.png',
      icon512px: '/android-chrome-512x512.png',
      appBackground: 'static/main-background.png',
      appTitle: 'static/overlay_mark.svg',
      appSubtitle: 'by XR Foundation',
      appDescription: 'Realtime 3D social application for everyone to enjoy.',
      appSocialLinks: JSON.stringify([
        { icon: 'static/discord.svg', link: 'https://discord.gg/xrf' },
        { icon: 'static/github.svg', link: 'https://github.com/XRFoundation' }
      ]),
      themeSettings: JSON.stringify(defaultThemeSettings)
    }
  ]
}
