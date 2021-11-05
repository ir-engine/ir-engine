export interface EmailSetting {
  id: string
  smtp: EmailSmtp
  from: string
  subject: EmailSubject
  smsNameCharacterLimit: number
}

export interface EmailSubject {
  login: string
  friend: string
  group: string
  party: string
}

export interface EmailSmtp {
  host: string
  port: string | number
  secure: boolean
  auth: EmailAuth
}

export interface EmailAuth {
  user: string
  pass: string
}
