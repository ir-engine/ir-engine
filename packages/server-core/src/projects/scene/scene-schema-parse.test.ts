/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import assert from 'assert'
import _ from 'lodash'

import config from '@etherealengine/common/src/config'

import { createDefaultStorageProvider, getStorageProvider } from '../../media/storageprovider/storageprovider'
import {
  cleanSceneDataCacheURLs,
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
      value: `${config.client.cors.proxyUrl}/${mockDomain}`
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
