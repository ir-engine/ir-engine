import { GUID_ID_REGEX } from '../regex'

/**
 * Method used to validate if the given id is a valid guid
 * @param id
 * @returns
 */
export const isValidId = (id: string) => {
  return GUID_ID_REGEX.test(id)
}
