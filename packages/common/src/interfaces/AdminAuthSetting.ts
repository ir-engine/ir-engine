export interface AdminAuthSetting {
  id: string
  service: string
  entity: string
  secret: string
  authStrategies: AuthStrategies[]
  local: Local
  jwtOptions: JwtOptions
  bearerToken: BearerToken
  callback: Callback
  oauth: Oauth
  createdAt: string
  updatedAt: string
}

interface AuthStrategies {
  jwt?: boolean
  local?: boolean
  facebook?: boolean
  github?: boolean
  google?: boolean
  linkedin?: boolean
  twitter?: boolean
}

interface Local {
  usernameField: string
  passwordField: string
}

interface JwtOptions {
  expiresIn: string
}

interface BearerToken {
  numBytes: number
}

interface Callback {
  facebook: string
  github: string
  google: string
  linkedin: string
  twitter: string
  discord: string
}

interface Oauth {
  defaults: Defaults
  facebook: Facebook
  github: Github
  google: Google
  linkedin: Linkedin
  twitter: Twitter
  discord: Discord
}

interface Defaults {
  host: string
  protocol: string
}
interface Discord {
  key: string
  secret: string
}

interface Facebook {
  key: string
  secret: string
}

interface Github {
  appid: string
  key: string
  secret: string
}

interface Google {
  key: string
  secret: string
  scope: string[]
}

interface Linkedin {
  key: string
  secret: string
  scope: string[]
}

interface Twitter {
  key: string
  secret: string
}
