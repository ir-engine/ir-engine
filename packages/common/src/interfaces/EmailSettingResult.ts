import { EmailSetting } from './EmailSetting'

export type EmailSettingResult = {
  data: EmailSetting[]
  total: number
  limit: number
  skip: number
}
