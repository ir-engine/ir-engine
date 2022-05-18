import assert from 'assert'
import _ from 'lodash'

import { createDefaultStorageProvider, getStorageProvider } from '../../media/storageprovider/storageprovider'
import {
  cleanSceneDataCacheURLs,
  corsPath,
  parseSceneDataCacheURLs,
  sceneCorsPathIdentifier,
  sceneRelativePathIdentifier
} from './scene-parser'

describe('Scene Helper Functions', () => {
  describe('should replace cache domain', () => {
    const storageProvider = createDefaultStorageProvider()
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

    it('should parse saved data', async function () {
      const parsedData = parseSceneDataCacheURLs(_.cloneDeep(savedMockData) as any, storageProvider.cacheDomain)
      assert.deepStrictEqual(parsedMockData, parsedData)
    })

    it('should unparse parsed data', async function () {
      const unparsedData = cleanSceneDataCacheURLs(_.cloneDeep(parsedMockData) as any, storageProvider.cacheDomain)
      assert.deepStrictEqual(savedMockData, unparsedData)
    })
  })

  describe('should replace cors proxy', () => {
    const mockDomain = `https://mydomain.com/something`

    const savedMockData = {
      value: `${sceneCorsPathIdentifier}/${mockDomain}`
    }

    const parsedMockData = {
      value: `${corsPath}/${mockDomain}`
    }

    it('should parse saved data', async function () {
      const storageProvider = getStorageProvider()
      const parsedData = parseSceneDataCacheURLs(_.cloneDeep(savedMockData) as any, storageProvider.cacheDomain)
      assert.deepStrictEqual(parsedMockData, parsedData)
    })

    it('should unparse parsed data', async function () {
      const storageProvider = getStorageProvider()
      const unparsedData = cleanSceneDataCacheURLs(_.cloneDeep(parsedMockData) as any, storageProvider.cacheDomain)
      assert.deepStrictEqual(savedMockData, unparsedData)
    })
  })
})
