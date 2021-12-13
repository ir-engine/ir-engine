export const clientSeed = {
  path: 'client-setting',
  templates: [
    {
      logo: process.env.APP_LOGO,
      title: process.env.APP_TITLE,
      releaseName: process.env.RELEASE_NAME || null,
      enabled: process.env.CLIENT_ENABLED === 'true',
      siteDescription: 'Connected Worlds for Everyone',
      url:
        process.env.APP_URL ||
        (process.env.LOCAL_BUILD
          ? 'http://' + process.env.APP_HOST + ':' + process.env.APP_PORT
          : 'https://' + process.env.APP_HOST + ':' + process.env.APP_PORT),
      favicon32px: '/favicon-32x32.png',
      favicon16px: '/favicon-16x16.png',
      icon192px: 'https://xrengine-static-resources.s3.us-west-1.amazonaws.com/test/guinea-pig.jpg',
      icon512px: 'https://xrengine-static-resources.s3.us-west-1.amazonaws.com/test/guinea-pig.jpg'
    }
  ]
}
