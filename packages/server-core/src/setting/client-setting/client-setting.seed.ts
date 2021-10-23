export const clientSeed = {
  path: 'client-setting',
  randomize: false,
  templates: [
    {
      enabled: process.env.CLIENT_ENABLED === 'true',
      logo: process.env.APP_LOGO,
      title: process.env.APP_TITLE,
      url:
        process.env.APP_URL ||
        (process.env.LOCAL_BUILD
          ? 'http://' + process.env.APP_HOST + ':' + process.env.APP_PORT
          : 'https://' + process.env.APP_HOST + ':' + process.env.APP_PORT),
      releaseName: process.env.RELEASE_NAME || null
    }
  ]
}
