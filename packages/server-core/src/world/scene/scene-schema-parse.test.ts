import assert from 'assert'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { parseSceneDataCacheURLs, cleanSceneDataCacheURLs, sceneRelativePathIdentifier, corsPath } from './scene-parser'
import _ from 'lodash'

describe('Scene Helper Functions', () => {
  const storageProvider = useStorageProvider()
  describe('should replace cache domain', () => {

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
    
    it("should parse saved data", async function () {
      const parsedData = parseSceneDataCacheURLs(_.cloneDeep(savedMockData) as any, storageProvider.cacheDomain)
      assert.deepStrictEqual(parsedMockData, parsedData)
    })
    
    it("should unparse parsed data", async function () {
      const unparsedData = cleanSceneDataCacheURLs(_.cloneDeep(parsedMockData) as any, storageProvider.cacheDomain)
      assert.deepStrictEqual(savedMockData, unparsedData)
    })
  })

  describe('should replace cors proxy', () => {

    const mockDomain = `https://mydomain.com/something`
    
    const savedMockData = {
      value: mockDomain,
    }
    
    const parsedMockData = {
      value: `${corsPath}/${mockDomain}`,
    }
    
    it("should parse saved data", async function () {
      const parsedData = parseSceneDataCacheURLs(_.cloneDeep(savedMockData) as any, storageProvider.cacheDomain)
      assert.deepStrictEqual(parsedMockData, parsedData)
    })
    
    it("should unparse parsed data", async function () {
      const unparsedData = cleanSceneDataCacheURLs(_.cloneDeep(parsedMockData) as any, storageProvider.cacheDomain)
      assert.deepStrictEqual(savedMockData, unparsedData)
    })
  })

})
