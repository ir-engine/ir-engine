/**
 * @typedef {object} PostProcessingSchema
 *
 * Declare Indexable Types
 * when PostProcessingSchema is indexed with a string, it will return object
 * @param {string} key is always string type
 *
 */
export interface PostProcessingSchema {
  [key: string]: {
    [key: string]: any
  }
}
