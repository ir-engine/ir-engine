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
        (process.env.LOCAL_BUILD
          ? 'http://' + process.env.APP_HOST + ':' + process.env.APP_PORT
          : 'https://' + process.env.APP_HOST + ':' + process.env.APP_PORT),
      favicon32px: '/favicon-32x32.png',
      favicon16px: '/favicon-16x16.png',
      icon192px: '/android-chrome-192x192.png',
      icon512px: '/android-chrome-512x512.png'
    }
  ]
}
