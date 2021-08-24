import { fetchUrl } from './fetchUrl'
import { serverURL } from './projectFunctions'

/**
 * getScene used to Calling api to get scene data using id.
 *
 * @author Robert Long
 */

export const getScene = async (sceneId): Promise<JSON> => {
  const headers = {
    'content-type': 'application/json'
  }

  const response = await fetchUrl(`${serverURL}/project/${sceneId}`, {
    headers
  })

  console.log('Response: ' + Object.values(response))

  const json = await response.json()

  return json.scenes[0]
}
