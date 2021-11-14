import assert from 'assert'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { parseSceneDataCacheURLs, cleanSceneDataCacheURLs, sceneRelativePathIdentifier } from './scene-parser'
import _ from 'lodash'

const storageProvider = useStorageProvider()
const mockValue = `abcdef2144536`
const mockValue2 = `08723ikjbolicujhc0asc`

const savedMockData = {
  value: `${sceneRelativePathIdentifier}/${mockValue}`,
  property: {
    nestedValue: `${sceneRelativePathIdentifier}/${mockValue2}`
  }
}

const parsedMockData = {
  value: `https://${storageProvider.cacheDomain}/projects/${mockValue}`,
  property: {
    nestedValue: `https://${storageProvider.cacheDomain}/projects/${mockValue2}`
  }
}

describe('Scene Helper Functions', () => {

  it("should parse saved data", async function () {
    const parsedData = parseSceneDataCacheURLs(_.cloneDeep(savedMockData) as any, storageProvider.cacheDomain)
    assert.deepStrictEqual(parsedMockData, parsedData)
  })

  it("should unparse parsed data", async function () {
    const unparsedData = cleanSceneDataCacheURLs(_.cloneDeep(parsedMockData) as any, storageProvider.cacheDomain)
    assert.deepStrictEqual(savedMockData, unparsedData)
  })

})
