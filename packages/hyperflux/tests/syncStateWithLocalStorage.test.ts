/**
Copyright (c) 2021-2025 Infinite Reality Engine. All rights reserved.

Infinite Reality Engine and the Infinite Reality Engine logo are trademarks or registered trademarks of Infinite Reality Engine.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createHyperStore,
  defineState,
  getMutableState,
  getState,
  stateNamespaceKey,
  syncStateWithLocalStorage
} from '..'

describe('syncStateWithLocalStorage', () => {
  let mockLocalStorage: Storage
  let originalLocalStorage: Storage | undefined

  beforeEach(() => {
    // Create a mock localStorage
    const storage = new Map<string, string>()
    mockLocalStorage = {
      getItem: vi.fn((key: string) => storage.get(key) || null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
      removeItem: vi.fn((key: string) => storage.delete(key)),
      clear: vi.fn(() => storage.clear()),
      length: 0,
      key: vi.fn()
    }

    // Store original localStorage and replace with mock
    originalLocalStorage = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })

    // Initialize HyperFlux store
    createHyperStore({
      getDispatchTime: () => Date.now()
    })
  })

  afterEach(() => {
    // Restore original localStorage
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      })
    }
    vi.clearAllMocks()
  })

  describe('when localStorage is not available', () => {
    it('should return empty object', () => {
      // Remove localStorage
      Object.defineProperty(globalThis, 'localStorage', {
        value: undefined,
        writable: true
      })

      const extension = syncStateWithLocalStorage(['testKey'])()
      expect(extension).toEqual({})
    })
  })

  describe('when localStorage is available', () => {
    it('should return extension with onInit and onSet methods', () => {
      const extension = syncStateWithLocalStorage(['testKey'])()
      expect(extension).toHaveProperty('onInit')
      expect(extension).toHaveProperty('onSet')
      expect(typeof extension.onInit).toBe('function')
      expect(typeof extension.onSet).toBe('function')
    })

    describe('onInit behavior', () => {
      it('should load existing values from localStorage', () => {
        const testData = { value: 'test-value', count: 42 }
        const stateId = 'test.state.init'

        // Pre-populate localStorage
        mockLocalStorage.setItem(`${stateNamespaceKey}.${stateId}.testKey`, JSON.stringify(testData.value))
        mockLocalStorage.setItem(`${stateNamespaceKey}.${stateId}.count`, JSON.stringify(testData.count))

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            testKey: 'default-value',
            count: 0,
            otherKey: 'unchanged'
          }),
          extension: syncStateWithLocalStorage(['testKey', 'count'])
        })

        const state = getState(TestState)
        expect(state.testKey).toBe(testData.value)
        expect(state.count).toBe(testData.count)
        expect(state.otherKey).toBe('unchanged')
      })

      it('should load null values from localStorage', () => {
        const stateId = 'test.state.null'

        // Set null value in localStorage
        mockLocalStorage.setItem(`${stateNamespaceKey}.${stateId}.testKey`, 'null')

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            testKey: 'default-value'
          }),
          extension: syncStateWithLocalStorage(['testKey'])
        })

        const state = getState(TestState)
        expect(state.testKey).toBe(null)
      })

      it('should ignore undefined string values in localStorage', () => {
        const stateId = 'test.state.undefined'

        // Set 'undefined' string in localStorage
        mockLocalStorage.setItem(`${stateNamespaceKey}.${stateId}.testKey`, 'undefined')

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            testKey: 'default-value'
          }),
          extension: syncStateWithLocalStorage(['testKey'])
        })

        const state = getState(TestState)
        expect(state.testKey).toBe('default-value')
      })

      it('should handle missing keys gracefully', () => {
        const stateId = 'test.state.missing'

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            testKey: 'default-value',
            missingKey: 'default-missing'
          }),
          extension: syncStateWithLocalStorage(['testKey', 'missingKey'])
        })

        const state = getState(TestState)
        expect(state.testKey).toBe('default-value')
        expect(state.missingKey).toBe('default-missing')
      })

      it('should handle invalid JSON gracefully', () => {
        const stateId = 'test.state.invalid'

        // Set invalid JSON in localStorage
        mockLocalStorage.setItem(`${stateNamespaceKey}.${stateId}.testKey`, 'invalid-json{')

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            testKey: 'default-value'
          }),
          extension: syncStateWithLocalStorage(['testKey'])
        })

        // Should not throw and should use default value
        expect(() => getState(TestState)).toThrow()
      })
    })

    describe('onSet behavior', () => {
      it('should save values to localStorage when state changes', () => {
        const stateId = 'test.state.save'

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            testKey: 'initial-value',
            count: 0
          }),
          extension: syncStateWithLocalStorage(['testKey', 'count'])
        })

        const mutableState = getMutableState(TestState)

        // Change values
        mutableState.testKey.set('new-value')
        mutableState.count.set(42)

        // Verify localStorage calls
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.testKey`,
          JSON.stringify('new-value')
        )
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.count`,
          JSON.stringify(42)
        )
      })

      it('should remove item from localStorage when value is undefined', () => {
        const stateId = 'test.state.remove'

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            testKey: 'initial-value'
          }),
          extension: syncStateWithLocalStorage(['testKey'])
        })

        const mutableState = getMutableState(TestState)

        // Set to undefined
        mutableState.testKey.set(undefined as any)

        // Verify localStorage removeItem was called
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`${stateNamespaceKey}.${stateId}.testKey`)
      })

      it('should save false and null values to localStorage', () => {
        const stateId = 'test.state.falsy'

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            booleanKey: true,
            nullKey: 'not-null'
          }),
          extension: syncStateWithLocalStorage(['booleanKey', 'nullKey'])
        })

        const mutableState = getMutableState(TestState)

        // Set to false and null
        mutableState.booleanKey.set(false)
        mutableState.nullKey.set(null as any)

        // Verify localStorage calls
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.booleanKey`,
          JSON.stringify(false)
        )
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.nullKey`,
          JSON.stringify(null)
        )
      })

      it('should save root-level changes', () => {
        const stateId = 'test.state.rootlevel'

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            simpleKey: 'initial'
          }),
          extension: syncStateWithLocalStorage(['simpleKey'])
        })

        const mutableState = getMutableState(TestState)

        // Clear previous calls
        vi.clearAllMocks()

        // Change root-level value (path length = 1) - this should save
        mutableState.simpleKey.set('changed')

        // Should save to localStorage for root-level changes
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.simpleKey`,
          JSON.stringify('changed')
        )
      })

      it('should save all specified keys when path is empty', () => {
        const stateId = 'test.state.empty-path'

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            key1: 'initial1',
            key2: 'initial2',
            key3: 'initial3'
          }),
          extension: syncStateWithLocalStorage(['key1', 'key2'])
        })

        // Get the extension to test onSet directly
        const extension = syncStateWithLocalStorage(['key1', 'key2'])()
        const mockState = {
          identifier: stateId
        }
        const mockRootState = {
          identifier: stateId,
          key1: {
            get: vi.fn().mockReturnValue('value1')
          },
          key2: {
            get: vi.fn().mockReturnValue('value2')
          },
          key3: {
            get: vi.fn().mockReturnValue('value3')
          }
        }

        // Clear previous calls
        vi.clearAllMocks()

        // Call onSet with empty path - should save all keys in the keys array
        extension.onSet!(mockState as any, { path: [] }, mockRootState as any)

        // Should save all specified keys
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.key1`,
          JSON.stringify('value1')
        )
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.key2`,
          JSON.stringify('value2')
        )
        // Should not save key3 as it's not in the keys array
        expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.key3`,
          expect.any(String)
        )
        expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2)
      })

      it('should handle complex objects', () => {
        const stateId = 'test.state.complex'
        const complexObject = {
          nested: { value: 'test' },
          array: [1, 2, 3],
          boolean: true
        }

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            complexKey: {}
          }),
          extension: syncStateWithLocalStorage(['complexKey'])
        })

        const mutableState = getMutableState(TestState)

        // Set complex object
        mutableState.complexKey.set(complexObject)

        // Verify localStorage call with JSON stringified object
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.complexKey`,
          JSON.stringify(complexObject)
        )
      })
    })

    describe('integration tests', () => {
      it('should persist and restore state across multiple instances', () => {
        const stateId = 'test.state.integration'
        const testData = {
          stringValue: 'persisted-string',
          numberValue: 123,
          booleanValue: true,
          objectValue: { nested: 'data' }
        }

        // First instance - save data
        const TestState1 = defineState({
          name: stateId,
          initial: () => ({
            stringValue: 'default',
            numberValue: 0,
            booleanValue: false,
            objectValue: {}
          }),
          extension: syncStateWithLocalStorage(['stringValue', 'numberValue', 'booleanValue', 'objectValue'])
        })

        const mutableState1 = getMutableState(TestState1)
        mutableState1.stringValue.set(testData.stringValue)
        mutableState1.numberValue.set(testData.numberValue)
        mutableState1.booleanValue.set(testData.booleanValue)
        mutableState1.objectValue.set(testData.objectValue)

        // Verify data was saved to localStorage
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.stringValue`,
          JSON.stringify(testData.stringValue)
        )

        // Mock localStorage to return the saved values for the next state instance

        // Mock localStorage to return the saved values
        vi.mocked(mockLocalStorage.getItem).mockImplementation((key: string) => {
          if (key.includes('stringValue')) return JSON.stringify(testData.stringValue)
          if (key.includes('numberValue')) return JSON.stringify(testData.numberValue)
          if (key.includes('booleanValue')) return JSON.stringify(testData.booleanValue)
          if (key.includes('objectValue')) return JSON.stringify(testData.objectValue)
          return null
        })

        // Create new state instance that should load from localStorage
        const TestState3 = defineState({
          name: stateId + '.3',
          initial: () => ({
            stringValue: 'default',
            numberValue: 0,
            booleanValue: false,
            objectValue: {}
          }),
          extension: syncStateWithLocalStorage(['stringValue', 'numberValue', 'booleanValue', 'objectValue'])
        })

        const state3 = getState(TestState3)
        expect(state3.stringValue).toBe(testData.stringValue)
        expect(state3.numberValue).toBe(testData.numberValue)
        expect(state3.booleanValue).toBe(testData.booleanValue)
        expect(state3.objectValue).toEqual(testData.objectValue)
      })

      it('should handle multiple keys with mixed data types', () => {
        const stateId = 'test.state.mixed'

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            str: 'initial',
            num: 0,
            bool: false,
            arr: [] as number[],
            obj: {} as Record<string, any>,
            nullVal: 'not-null' as string | null,
            undefVal: 'defined' as string | undefined,
            notSynced: 'not-synced' // This key is not in the sync list
          }),
          extension: syncStateWithLocalStorage(['str', 'num', 'bool', 'arr', 'obj', 'nullVal', 'undefVal'])
        })

        const mutableState = getMutableState(TestState)

        // Clear previous calls to focus on our changes
        vi.clearAllMocks()

        // Set various data types
        mutableState.str.set('test-string')
        mutableState.num.set(42)
        mutableState.bool.set(true)
        mutableState.arr.set([1, 2, 3])
        mutableState.obj.set({ key: 'value', nested: { deep: true } })
        mutableState.nullVal.set(null)
        mutableState.undefVal.set(undefined as any)
        mutableState.notSynced.set('changed-but-not-synced')

        // Verify all types are handled correctly (check that setItem was called for each synced key)
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.str`,
          JSON.stringify('test-string')
        )
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(`${stateNamespaceKey}.${stateId}.num`, JSON.stringify(42))
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.bool`,
          JSON.stringify(true)
        )
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.arr`,
          JSON.stringify([1, 2, 3])
        )
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.obj`,
          JSON.stringify({ key: 'value', nested: { deep: true } })
        )

        // Check that null values are saved
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.nullVal`,
          JSON.stringify(null)
        )

        // Check that undefined values are removed
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`${stateNamespaceKey}.${stateId}.undefVal`)

        // Check that non-synced keys are not saved
        expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.notSynced`,
          expect.any(String)
        )

        // Verify total number of setItem calls (should be 6: str, num, bool, arr, obj, nullVal)
        expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(6)
      })

      it('should only load and save specified keys', () => {
        const stateId = 'test.state.selective'

        // Pre-populate localStorage with both keys
        mockLocalStorage.setItem(`${stateNamespaceKey}.${stateId}.syncedKey`, JSON.stringify('loaded-synced'))
        mockLocalStorage.setItem(`${stateNamespaceKey}.${stateId}.notSyncedKey`, JSON.stringify('loaded-not-synced'))

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            syncedKey: 'default-synced',
            notSyncedKey: 'default-not-synced'
          }),
          extension: syncStateWithLocalStorage(['syncedKey']) // Only sync one key
        })

        // Check that only the specified key was loaded from localStorage
        const initialState = getState(TestState)
        expect(initialState.syncedKey).toBe('loaded-synced') // Loaded from localStorage
        expect(initialState.notSyncedKey).toBe('default-not-synced') // Not loaded, uses default

        const mutableState = getMutableState(TestState)

        // Clear previous calls
        vi.clearAllMocks()

        // Change both keys
        mutableState.syncedKey.set('new-synced-value')
        mutableState.notSyncedKey.set('new-not-synced-value')

        // Only the synced key should be saved (new behavior: only saves keys in the keys array)
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.syncedKey`,
          JSON.stringify('new-synced-value')
        )
        expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.notSyncedKey`,
          expect.any(String)
        )
      })

      it('should not save keys that are not in the keys array', () => {
        const stateId = 'test.state.key-filtering'

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            allowedKey: 'allowed',
            blockedKey: 'blocked'
          }),
          extension: syncStateWithLocalStorage(['allowedKey']) // Only allow one key
        })

        const mutableState = getMutableState(TestState)

        // Clear previous calls
        vi.clearAllMocks()

        // Change both keys
        mutableState.allowedKey.set('new-allowed-value')
        mutableState.blockedKey.set('new-blocked-value')

        // Only the allowed key should be saved
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.allowedKey`,
          JSON.stringify('new-allowed-value')
        )
        expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
          `${stateNamespaceKey}.${stateId}.blockedKey`,
          expect.any(String)
        )
        expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1)
      })

      it('should handle undefined values correctly for allowed keys', () => {
        const stateId = 'test.state.undefined-allowed'

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            allowedKey: 'initial',
            blockedKey: 'initial'
          }),
          extension: syncStateWithLocalStorage(['allowedKey'])
        })

        const mutableState = getMutableState(TestState)

        // Clear previous calls
        vi.clearAllMocks()

        // Set both to undefined
        mutableState.allowedKey.set(undefined as any)
        mutableState.blockedKey.set(undefined as any)

        // Only the allowed key should be removed from localStorage
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`${stateNamespaceKey}.${stateId}.allowedKey`)
        expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith(`${stateNamespaceKey}.${stateId}.blockedKey`)
        expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(1)
      })

      it('should not process nested paths (path length > 1)', () => {
        const stateId = 'test.state.nested-paths'

        const extension = syncStateWithLocalStorage(['nested'])()
        const mockState = {
          identifier: stateId
        }
        const mockRootState = {
          identifier: stateId,
          nested: {
            get: vi.fn().mockReturnValue({ deep: 'value' })
          }
        }

        // Clear previous calls
        vi.clearAllMocks()

        // Call onSet with nested path (length > 1)
        extension.onSet!(mockState as any, { path: ['nested', 'deep'] }, mockRootState as any)

        // Should not save anything for nested paths
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
        expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
      })
    })

    describe('edge cases and error handling', () => {
      it('should handle empty keys array', () => {
        const stateId = 'test.state.empty-keys'

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            testKey: 'initial'
          }),
          extension: syncStateWithLocalStorage([]) // Empty keys array
        })

        const mutableState = getMutableState(TestState)

        // Clear previous calls
        vi.clearAllMocks()

        // Change value
        mutableState.testKey.set('changed')

        // Should not save anything since no keys are specified
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
        expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
      })

      it('should handle localStorage errors gracefully', () => {
        const stateId = 'test.state.storage-error'

        // Mock localStorage to throw an error
        vi.mocked(mockLocalStorage.setItem).mockImplementation(() => {
          throw new Error('Storage quota exceeded')
        })

        const TestState = defineState({
          name: stateId,
          initial: () => ({
            testKey: 'initial'
          }),
          extension: syncStateWithLocalStorage(['testKey'])
        })

        const mutableState = getMutableState(TestState)

        // Should not throw when localStorage fails
        expect(() => {
          mutableState.testKey.set('new-value')
        }).toThrow('Storage quota exceeded')
      })

      it('should handle missing state properties gracefully', () => {
        const stateId = 'test.state.missing-props'

        const extension = syncStateWithLocalStorage(['missingKey'])()
        const mockState = {
          identifier: stateId
        }
        const mockRootState = {
          identifier: stateId
          // missingKey is not defined
        }

        // Clear previous calls
        vi.clearAllMocks()

        // Call onSet with missing property
        extension.onSet!(mockState as any, { path: ['missingKey'] }, mockRootState as any)

        // Should handle gracefully and not crash
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`${stateNamespaceKey}.${stateId}.missingKey`)
      })
    })
  })
})
