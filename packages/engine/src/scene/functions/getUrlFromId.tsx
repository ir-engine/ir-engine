/**
 * getUrlFromId is used to get url of the static resource from its ID
 * @author Abhishek Pathak
 * @param {any} contentID
 * @returns {Promise}
 */

export const getUrlFromId = async (contentID): Promise<any> => {
  try {
    const response = await globalThis.Editor.feathersClient.service('static-resource-url').get(contentID)
    return response
  } catch (error) {
    console.log("Can't get URL from id" + error)
    throw new Error(error)
  }
  throw new Error("Can't get URL from id")
}
