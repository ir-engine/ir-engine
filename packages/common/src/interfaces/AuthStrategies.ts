export interface AuthStrategies {
  jwt?: boolean
  local?: boolean
  facebook?: boolean
  github?: boolean
  google?: boolean
  linkedin?: boolean
  twitter?: boolean
  emailMagicLink: boolean
  smsMagicLink: boolean
  didWallet: boolean
}
