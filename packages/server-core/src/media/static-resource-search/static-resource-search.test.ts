/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  StaticResourceSearchFieldType,
  staticResourceSearchPath
} from '@ir-engine/common/src/schemas/media/static-resource-search.schema'
import { staticResourceVectorPath } from '@ir-engine/common/src/schemas/media/static-resource-vector.schema'
import { staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import { v4 as uuidv4 } from 'uuid'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

describe('static-resource-search service', () => {
  let app: Application
  let testStaticResourceId: string
  let testVectorEntryId: string

  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterAll(async () => {
    // Clean up test data
    if (testVectorEntryId) {
      try {
        await app.service(staticResourceVectorPath).remove(testVectorEntryId)
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    if (testStaticResourceId) {
      try {
        await app.service(staticResourcePath).remove(testStaticResourceId)
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    await app.teardown()
  })

  beforeEach(async () => {
    // Create test static resource
    testStaticResourceId = uuidv4()
    const testStaticResource = {
      id: testStaticResourceId,
      key: 'test/red-sports-car.glb',
      name: 'red-sports-car.glb',
      description: 'A beautiful red sports car model',
      type: 'model',
      mimeType: 'model/gltf-binary',
      project: 'test-project',
      hash: 'test-hash-123'
    }

    await app.service(staticResourcePath).create(testStaticResource, { isInternal: true })

    // Create corresponding vector entry
    const testVectorEntry = {
      staticResourceId: testStaticResourceId,
      caption: 'A beautiful red sports car model',
      material: 'metal',
      style: 'modern',
      type: 'model',
      color: 'red'
    }

    const vectorResult = await app.service(staticResourceVectorPath).create(testVectorEntry, { isInternal: true })
    testVectorEntryId = vectorResult.id
  })

  afterEach(async () => {
    // Clean up after each test
    if (testVectorEntryId) {
      try {
        await app.service(staticResourceVectorPath).remove(testVectorEntryId)
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    if (testStaticResourceId) {
      try {
        await app.service(staticResourcePath).remove(testStaticResourceId)
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  })

  it('should be registered', () => {
    const service = app.service(staticResourceSearchPath)
    expect(service).toBeTruthy()
  })

  it('should perform basic semantic search', async () => {
    const searchService = app.service(staticResourceSearchPath)

    const results = await searchService.find({
      query: {
        query: 'red car',
        $limit: 10
      },
      isInternal: true
    })

    expect(results).toBeTruthy()
    expect(results.data).toBeDefined()
    expect(Array.isArray(results.data)).toBe(true)
    expect(results.total).toBeGreaterThanOrEqual(0)
    expect(results.limit).toBe(10)
    expect(results.skip).toBe(0)
  })

  it('should return search results with proper structure', async () => {
    const searchService = app.service(staticResourceSearchPath)

    const results = await searchService.find({
      query: {
        query: 'sports car',
        searchField: 'caption',
        $limit: 5
      },
      isInternal: true
    })

    if (results.data.length > 0) {
      const result = results.data[0]

      // Check static resource fields
      expect(result.id).toBeDefined()
      expect(result.key).toBeDefined()
      expect(result.name).toBeDefined()
      expect(result.type).toBeDefined()
      expect(result.hash).toBeDefined()
      expect(result.url).toBeDefined()
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()

      // Check search metadata
      expect(result.searchScore).toBeDefined()
      expect(typeof result.searchScore).toBe('number')
      expect(result.searchScore).toBeGreaterThanOrEqual(0)
      expect(result.searchScore).toBeLessThanOrEqual(1)
      expect(result.matchedField).toBeDefined()
    }
  })

  it('should handle different search fields', async () => {
    const searchService = app.service(staticResourceSearchPath)

    const searchFields = ['caption', 'material', 'style', 'type', 'color', 'combined']

    for (const field of searchFields) {
      const results = await searchService.find({
        query: {
          query: 'test',
          searchField: field as StaticResourceSearchFieldType,
          $limit: 5
        },
        isInternal: true
      })

      expect(results).toBeTruthy()
      expect(results.data).toBeDefined()
      expect(Array.isArray(results.data)).toBe(true)
    }
  })

  it('should handle pagination parameters', async () => {
    const searchService = app.service(staticResourceSearchPath)

    const results = await searchService.find({
      query: {
        query: 'model',
        $limit: 3,
        $skip: 1
      },
      isInternal: true
    })

    expect(results.limit).toBe(3)
    expect(results.skip).toBe(1)
    expect(results.data.length).toBeLessThanOrEqual(3)
  })

  it('should handle similarity threshold', async () => {
    const searchService = app.service(staticResourceSearchPath)

    const results = await searchService.find({
      query: {
        query: 'car',
        similarityThreshold: 0.9, // High threshold
        $limit: 10
      },
      isInternal: true
    })

    expect(results).toBeTruthy()
    expect(results.data).toBeDefined()
    // With high threshold, we might get fewer results
  })

  it('should handle additional filters', async () => {
    const searchService = app.service(staticResourceSearchPath)

    const results = await searchService.find({
      query: {
        query: 'model',
        type: 'model',
        project: 'test-project',
        $limit: 10
      },
      isInternal: true
    })

    expect(results).toBeTruthy()
    expect(results.data).toBeDefined()

    // All results should match the filters
    results.data.forEach((result) => {
      expect(result.type).toBe('model')
      expect(result.project).toBe('test-project')
    })
  })

  it('should throw error for empty query', async () => {
    const searchService = app.service(staticResourceSearchPath)

    await expect(
      searchService.find({
        query: {
          query: '',
          $limit: 10
        },
        isInternal: true
      })
    ).rejects.toThrow()
  })

  it('should throw error for missing query', async () => {
    const searchService = app.service(staticResourceSearchPath)

    await expect(
      searchService.find({
        //@ts-ignore
        query: {
          $limit: 10
        },
        isInternal: true
      })
    ).rejects.toThrow()
  })

  it('should handle query length limits', async () => {
    const searchService = app.service(staticResourceSearchPath)

    // Test very long query
    const longQuery = 'a'.repeat(600) // Exceeds 500 char limit

    await expect(
      searchService.find({
        query: {
          query: longQuery,
          $limit: 10
        },
        isInternal: true
      })
    ).rejects.toThrow()
  })

  it('should not support unsupported methods', async () => {
    const searchService = app.service(staticResourceSearchPath)

    await expect(searchService.get('test-id')).rejects.toThrow('NotImplemented')
    await expect(searchService.create({})).rejects.toThrow('NotImplemented')
    await expect(searchService.update('test-id', {})).rejects.toThrow('NotImplemented')
    await expect(searchService.patch('test-id', {})).rejects.toThrow('NotImplemented')
    await expect(searchService.remove('test-id')).rejects.toThrow('NotImplemented')
  })
})
