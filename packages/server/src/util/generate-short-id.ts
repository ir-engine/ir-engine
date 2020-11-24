import { nanoid } from 'nanoid';

/**
 * Generate unique string ID based on given character length
 * Default length is 8
 */
export default (length = 8): string => {
  return nanoid(length);
};
