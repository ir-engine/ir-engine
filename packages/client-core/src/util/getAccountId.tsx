import jwtDecode from 'jwt-decode'
import { getToken } from './getToken'

/**
 * getAccountId used to get accountId using token.
 *
 * @return {string}    [returns accountId]
 */

export const getAccountId = (): string => {
  const token = getToken()?.authData?.authUser?.accessToken
  return (jwtDecode(token) as any).sub
}
