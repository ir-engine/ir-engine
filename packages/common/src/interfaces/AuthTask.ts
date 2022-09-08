import { AuthError } from '../enums/AuthError'

export type AuthTask = {
  status: 'success' | 'fail' | 'pending'
  error?: AuthError
}
