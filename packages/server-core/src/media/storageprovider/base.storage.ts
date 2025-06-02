import { Forbidden } from '@feathersjs/errors'

/**
 * Base storage provider class with common functionality
 */
export abstract class BaseStorageProvider {
  /**
   * Checks if a prefix is blacklisted
   * @param prefix The prefix to check
   * @throws {Forbidden} If the prefix is blacklisted
   */
  protected checkBlacklistedPrefix(prefix: string): void {
    // Define blacklisted prefixes
    const blacklistedPrefixes = ['projects/']

    const normalizedPrefix = prefix.endsWith('/') ? prefix : prefix + '/'

    for (const blacklistedPrefix of blacklistedPrefixes) {
      if (normalizedPrefix === blacklistedPrefix) {
        throw new Forbidden(`Access to '${prefix}' is restricted`)
      }
    }
  }
}
