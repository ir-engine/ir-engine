import config from '../../appconfig'

export const authenticationSeed = {
  path: 'authentication-setting',
  templates: [
    {
      service: 'identity-provider',
      entity: 'identity-provider',
      secret: process.env.AUTH_SECRET || 'test',
      authStrategies: JSON.stringify([
        { jwt: true },
        { smsMagicLink: true },
        { emailMagicLink: true },
        { local: true },
        { facebook: true },
        { github: true },
        { google: true },
        { linkedin: true },
        { twitter: true }
      ]),
      local: JSON.stringify({
        usernameField: 'email',
        passwordField: 'password'
      }),
      jwtOptions: JSON.stringify({
        expiresIn: '30 days'
      }),
      bearerToken: JSON.stringify({
        numBytes: 16
      }),
      callback: JSON.stringify({
        facebook: process.env.FACEBOOK_CALLBACK_URL || `${config.client.url}/auth/oauth/facebook`,
        github: process.env.GITHUB_CALLBACK_URL || `${config.client.url}/auth/oauth/github`,
        google: process.env.GOOGLE_CALLBACK_URL || `${config.client.url}/auth/oauth/google`,
        linkedin: process.env.LINKEDIN_CALLBACK_URL || `${config.client.url}/auth/oauth/linkedin`,
        twitter: process.env.TWITTER_CALLBACK_URL || `${config.client.url}/auth/oauth/twitter`
      }),
      oauth: JSON.stringify({
        defaults: JSON.stringify({
          host:
            config.server.hostname !== '127.0.0.1' && config.server.hostname !== 'localhost'
              ? config.server.hostname
              : config.server.hostname + ':' + config.server.port,
          protocol: 'https'
        }),
        facebook: JSON.stringify({
          key: process.env.FACEBOOK_CLIENT_ID,
          secret: process.env.FACEBOOK_CLIENT_SECRET
        }),
        github: JSON.stringify({
          appid: process.env.GITHUB_APP_ID,
          key: process.env.GITHUB_CLIENT_ID,
          secret: process.env.GITHUB_CLIENT_SECRET
        }),
        google: JSON.stringify({
          key: process.env.GOOGLE_CLIENT_ID,
          secret: process.env.GOOGLE_CLIENT_SECRET,
          scope: ['profile', 'email']
        }),
        linkedin: JSON.stringify({
          key: process.env.LINKEDIN_CLIENT_ID,
          secret: process.env.LINKEDIN_CLIENT_SECRET,
          scope: ['r_liteprofile', 'r_emailaddress']
        }),
        twitter: JSON.stringify({
          key: process.env.TWITTER_CLIENT_ID,
          secret: process.env.TWITTER_CLIENT_SECRET
        })
      })
    }
  ]
}
