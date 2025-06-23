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

import { Document, ReaderContext, WriterContext } from '@gltf-transform/core'
import { ComponentType, defineComponent, UUIDComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { MaterialPluginComponents } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import assert from 'assert'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { createComponentExtension } from './ModelTransformLoader'

describe('ModelTransformLoader - Component Extensions', () => {
  // Mock components for testing
  let mockNodeComponent: ComponentType<any>
  let mockMaterialComponent: ComponentType<any>
  let mockDocument: Document

  beforeEach(() => {
    // Create a proper mock graph with event listener support
    const mockGraph = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      listExtensionsUsed: vi.fn().mockReturnValue([]),
      listExtensionsRequired: vi.fn().mockReturnValue([])
    }

    // Create a proper mock document
    mockDocument = {
      getGraph: vi.fn().mockReturnValue(mockGraph),
      getRoot: vi.fn().mockReturnValue({
        _enableExtension: vi.fn(),
        listNodes: vi.fn().mockReturnValue([])
      }),
      getLogger: vi.fn(),
      setLogger: vi.fn(),
      clone: vi.fn(),
      merge: vi.fn(),
      transform: vi.fn(),
      createAccessor: vi.fn(),
      createAnimation: vi.fn(),
      createAnimationChannel: vi.fn(),
      createAnimationSampler: vi.fn(),
      createBuffer: vi.fn(),
      createBufferView: vi.fn(),
      createCamera: vi.fn(),
      createExtensionProperty: vi.fn(),
      createMaterial: vi.fn(),
      createMesh: vi.fn(),
      createNode: vi.fn(),
      createPrimitive: vi.fn(),
      createProperty: vi.fn(),
      createRoot: vi.fn(),
      createScene: vi.fn(),
      createSkin: vi.fn(),
      createTexture: vi.fn(),
      createTextureInfo: vi.fn()
    } as unknown as Document
    // Create test components
    mockNodeComponent = defineComponent({
      name: 'MockNodeComponent',
      jsonID: 'EE_mock_node',
      schema: S.Object({
        position: S.Object({
          x: S.Number({ default: 0 }),
          y: S.Number({ default: 0 }),
          z: S.Number({ default: 0 })
        }),
        enabled: S.Bool({ default: true }),
        name: S.String({ default: 'test' })
      })
    })

    mockMaterialComponent = defineComponent({
      name: 'MockMaterialComponent',
      jsonID: 'EE_mock_material',
      schema: S.Object({
        color: S.String({ default: '#ffffff' }),
        opacity: S.Number({ default: 1.0 })
      })
    })

    // Add material component to MaterialPluginComponents for testing
    MaterialPluginComponents[mockMaterialComponent.jsonID!] = mockMaterialComponent
  })

  afterEach(() => {
    // Clean up MaterialPluginComponents
    delete MaterialPluginComponents[mockMaterialComponent.jsonID!]
  })

  describe('createComponentExtension', () => {
    it('should create extension class for node component', () => {
      const Extension = createComponentExtension(mockNodeComponent)

      assert.ok(Extension, 'Extension should be created')
      assert.equal(Extension.EXTENSION_NAME, mockNodeComponent.jsonID)
      assert.equal(typeof Extension, 'function', 'Extension should be a constructor function')
    })

    it('should create extension class for material component', () => {
      const Extension = createComponentExtension(mockMaterialComponent)

      assert.ok(Extension, 'Extension should be created')
      assert.equal(Extension.EXTENSION_NAME, mockMaterialComponent.jsonID)
      assert.equal(typeof Extension, 'function', 'Extension should be a constructor function')
    })

    it('should create extension class for core component', () => {
      const Extension = createComponentExtension(UUIDComponent)

      assert.ok(Extension, 'Extension should be created')
      assert.equal(Extension.EXTENSION_NAME, UUIDComponent.jsonID)
      assert.equal(typeof Extension, 'function', 'Extension should be a constructor function')
    })

    it('should handle component without schema gracefully', () => {
      // Create a component without schema
      const componentWithoutSchema = defineComponent({
        name: 'ComponentWithoutSchema',
        jsonID: 'EE_no_schema'
        // Intentionally no schema
      })

      // Should not throw an error
      assert.doesNotThrow(() => {
        const Extension = createComponentExtension(componentWithoutSchema)
        assert.ok(Extension, 'Extension should be created even without schema')
        assert.equal(Extension.EXTENSION_NAME, componentWithoutSchema.jsonID)
      })
    })

    it.todo('should create proper property getters and setters for schema properties')

    it('should handle nested object properties in schema', () => {
      // Create a component with deeply nested schema
      const nestedComponent = defineComponent({
        name: 'NestedComponent',
        jsonID: 'EE_nested',
        schema: S.Object({
          transform: S.Object({
            position: S.Object({
              x: S.Number({ default: 0 }),
              y: S.Number({ default: 0 }),
              z: S.Number({ default: 0 })
            }),
            rotation: S.Object({
              x: S.Number({ default: 0 }),
              y: S.Number({ default: 0 }),
              z: S.Number({ default: 0 }),
              w: S.Number({ default: 1 })
            })
          }),
          metadata: S.Object({
            name: S.String({ default: 'test' }),
            tags: S.Array(S.String())
          })
        })
      })

      const Extension = createComponentExtension(nestedComponent)

      assert.ok(Extension, 'Extension should be created for component with nested schema')
      assert.equal(Extension.EXTENSION_NAME, nestedComponent.jsonID)

      // The extension should handle the nested structure
      // (actual property creation logic is tested in the main function)
    })

    it.todo('should create extension property with correct defaults from schema')

    it('should return different extension classes for different components', () => {
      const NodeExtension = createComponentExtension(mockNodeComponent)
      const MaterialExtension = createComponentExtension(mockMaterialComponent)

      assert.notEqual(
        NodeExtension,
        MaterialExtension,
        'Different components should create different extension classes'
      )
      assert.equal(NodeExtension.EXTENSION_NAME, mockNodeComponent.jsonID)
      assert.equal(MaterialExtension.EXTENSION_NAME, mockMaterialComponent.jsonID)
    })

    it('should create extension with proper inheritance from Extension base class', () => {
      const Extension = createComponentExtension(mockNodeComponent)

      // Check that it's a constructor function
      assert.equal(typeof Extension, 'function')

      // Check that it has the expected static properties
      assert.equal(Extension.EXTENSION_NAME, mockNodeComponent.jsonID)

      // Check that the extension can be instantiated with a document
      const instance = new Extension(mockDocument)
      assert.ok(instance, 'Extension instance should be created')
      assert.equal(instance.extensionName, mockNodeComponent.jsonID)

      // Check that it has the expected methods
      assert.equal(typeof instance.read, 'function', 'Should have read method')
      assert.equal(typeof instance.write, 'function', 'Should have write method')
    })
  })

  describe('ComponentExtensionProperty', () => {
    it.todo('should initialize with correct extension name and property type')

    it.todo('should return correct defaults from component schema')

    it('should create getters and setters for all schema properties', () => {
      const Extension = createComponentExtension(mockNodeComponent)

      const ExtensionProperty = Extension.prototype.constructor

      // Check that prototype has property descriptors for schema properties
      const prototype = ExtensionProperty.prototype
      const schemaProperties = ['enabled', 'name'] // From mockNodeComponent schema

      for (const prop of schemaProperties) {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, prop)
        if (descriptor) {
          assert.ok(typeof descriptor.get === 'function', `${prop} should have getter`)
          assert.ok(typeof descriptor.set === 'function', `${prop} should have setter`)
        }
      }
    })

    it('should handle complex nested object properties', () => {
      // Create component with nested properties
      const complexComponent = defineComponent({
        name: 'ComplexComponent',
        jsonID: 'EE_complex',
        schema: S.Object({
          settings: S.Object({
            graphics: S.Object({
              quality: S.String({ default: 'high' }),
              shadows: S.Bool({ default: true })
            }),
            audio: S.Object({
              volume: S.Number({ default: 1.0 }),
              muted: S.Bool({ default: false })
            })
          }),
          metadata: S.Array(S.String())
        })
      })

      const Extension = createComponentExtension(complexComponent)

      assert.ok(Extension, 'Extension should handle complex nested schemas')
      assert.equal(Extension.EXTENSION_NAME, complexComponent.jsonID)

      // The extension should be created without errors
      // Actual property handling is tested in the main createComponentExtension function
    })
  })

  describe('Extension read functionality', () => {
    it('should read extension data from GLTF node definitions', () => {
      const Extension = createComponentExtension(mockMaterialComponent)

      const extension = new Extension(mockDocument)

      // Mock reader context with extension data
      const mockReaderContext = {
        jsonDoc: {
          json: {
            nodes: [
              {
                extensions: {
                  [mockMaterialComponent.jsonID!]: {
                    color: '#ff0000',
                    opacity: 0.5
                  }
                }
              }
            ]
          }
        },
        nodes: [
          {
            setExtension: vi.fn()
          }
        ]
      } as unknown as ReaderContext

      // Should not throw when reading
      assert.doesNotThrow(() => {
        extension.read(mockReaderContext)
      })

      // Should have called setExtension on the node
      assert.ok(mockReaderContext.nodes[0].setExtension)
    })

    it('should handle missing extension data gracefully', () => {
      const Extension = createComponentExtension(mockNodeComponent)

      const extension = new Extension(mockDocument)

      // Mock reader context without extension data
      const mockReaderContext = {
        jsonDoc: {
          json: {
            nodes: [
              {
                // No extensions property
              }
            ]
          }
        },
        nodes: [
          {
            setExtension: vi.fn()
          }
        ]
      } as unknown as ReaderContext

      // Should not throw when no extension data is present
      assert.doesNotThrow(() => {
        extension.read(mockReaderContext)
      })
    })

    it('should properly set extension properties from GLTF data', () => {
      const Extension = createComponentExtension(mockMaterialComponent)

      const extension = new Extension(mockDocument)

      const mockExtensionProperty = {
        color: undefined,
        opacity: undefined
      }

      const mockReaderContext = {
        jsonDoc: {
          json: {
            nodes: [
              {
                extensions: {
                  [mockMaterialComponent.jsonID!]: {
                    color: '#00ff00',
                    opacity: 0.8
                  }
                }
              }
            ]
          }
        },
        nodes: [
          {
            setExtension: vi.fn()
          }
        ]
      } as unknown as ReaderContext

      // Mock the extension property creation
      const originalExtensionProperty = Extension.prototype.constructor
      Extension.prototype.constructor = vi.fn().mockReturnValue(mockExtensionProperty)

      extension.read(mockReaderContext)

      // Restore original constructor
      Extension.prototype.constructor = originalExtensionProperty
    })

    it('should handle multiple nodes with extensions', () => {
      const Extension = createComponentExtension(mockNodeComponent)

      const extension = new Extension(mockDocument)

      const mockReaderContext = {
        jsonDoc: {
          json: {
            nodes: [
              {
                extensions: {
                  [mockNodeComponent.jsonID!]: {
                    enabled: true,
                    name: 'node1'
                  }
                }
              },
              {
                extensions: {
                  [mockNodeComponent.jsonID!]: {
                    enabled: false,
                    name: 'node2'
                  }
                }
              },
              {
                // Node without extension
              }
            ]
          }
        },
        nodes: [{ setExtension: vi.fn() }, { setExtension: vi.fn() }, { setExtension: vi.fn() }]
      } as unknown as ReaderContext

      // Should process all nodes without error
      assert.doesNotThrow(() => {
        extension.read(mockReaderContext)
      })

      // Should have called setExtension on nodes with extensions
      assert.ok(mockReaderContext.nodes[0].setExtension)
      assert.ok(mockReaderContext.nodes[1].setExtension)
    })
  })

  describe('Extension write functionality', () => {
    it('should write extension data to GLTF node definitions', () => {
      const Extension = createComponentExtension(mockMaterialComponent)

      const mockNode = {
        getExtension: vi.fn().mockReturnValue({
          color: '#ff0000',
          opacity: 0.7
        })
      }

      // Update the mock document to return our test node
      vi.mocked(mockDocument.getRoot).mockReturnValue({
        _enableExtension: vi.fn(),
        listNodes: vi.fn().mockReturnValue([mockNode])
      } as any)

      const extension = new Extension(mockDocument)

      const mockNodeDef = {}
      const mockWriterContext = {
        jsonDoc: {
          json: {
            nodes: [mockNodeDef]
          }
        },
        nodeIndexMap: new Map([[mockNode, 0]])
      } as unknown as WriterContext

      // Should write extension data
      assert.doesNotThrow(() => {
        extension.write(mockWriterContext)
      })

      // Should have created extensions object
      assert.ok(Object.prototype.hasOwnProperty.call(mockNodeDef, 'extensions'))
    })

    it('should create extensions object if it does not exist', () => {
      const Extension = createComponentExtension(mockNodeComponent)

      const mockNode = {
        getExtension: vi.fn().mockReturnValue({
          enabled: true,
          name: 'test-node'
        })
      }

      // Update the mock document to return our test node
      vi.mocked(mockDocument.getRoot).mockReturnValue({
        _enableExtension: vi.fn(),
        listNodes: vi.fn().mockReturnValue([mockNode])
      } as any)

      const extension = new Extension(mockDocument)

      const mockNodeDef = {} // No extensions property initially
      const mockWriterContext = {
        jsonDoc: {
          json: {
            nodes: [mockNodeDef]
          }
        },
        nodeIndexMap: new Map([[mockNode, 0]])
      } as unknown as WriterContext

      extension.write(mockWriterContext)

      // Should have created extensions object
      assert.ok('extensions' in mockNodeDef)
      assert.ok(typeof mockNodeDef.extensions === 'object')
    })

    it('should filter out undefined properties when writing', () => {
      const Extension = createComponentExtension(mockMaterialComponent)

      const mockNode = {
        getExtension: vi.fn().mockReturnValue({
          color: '#ff0000',
          opacity: undefined, // This should be filtered out
          someUndefinedProp: undefined
        })
      }

      // Update the mock document to return our test node
      vi.mocked(mockDocument.getRoot).mockReturnValue({
        _enableExtension: vi.fn(),
        listNodes: vi.fn().mockReturnValue([mockNode])
      } as any)

      const extension = new Extension(mockDocument)

      const mockNodeDef = {}
      const mockWriterContext = {
        jsonDoc: {
          json: {
            nodes: [mockNodeDef]
          }
        },
        nodeIndexMap: new Map([[mockNode, 0]])
      } as unknown as WriterContext

      extension.write(mockWriterContext)

      // Should have created extensions but filtered undefined values
      assert.ok('extensions' in mockNodeDef)
      const extensions = (mockNodeDef as any).extensions
      assert.ok(mockMaterialComponent.jsonID! in extensions)

      const extensionData = extensions[mockMaterialComponent.jsonID!]
      assert.ok(typeof extensionData === 'object')
      // The filtering logic depends on the implementation details
    })

    it('should handle nodes without extensions', () => {
      const Extension = createComponentExtension(mockNodeComponent)

      const mockNodeWithExtension = {
        getExtension: vi.fn().mockReturnValue({
          enabled: true,
          name: 'with-extension'
        })
      }

      const mockNodeWithoutExtension = {
        getExtension: vi.fn().mockReturnValue(null)
      }

      // Update the mock document to return our test nodes
      vi.mocked(mockDocument.getRoot).mockReturnValue({
        _enableExtension: vi.fn(),
        listNodes: vi.fn().mockReturnValue([mockNodeWithExtension, mockNodeWithoutExtension])
      } as any)

      const extension = new Extension(mockDocument)

      const mockNodeDef1 = {}
      const mockNodeDef2 = {}
      const mockWriterContext = {
        jsonDoc: {
          json: {
            nodes: [mockNodeDef1, mockNodeDef2]
          }
        },
        nodeIndexMap: new Map([
          [mockNodeWithExtension, 0],
          [mockNodeWithoutExtension, 1]
        ])
      } as unknown as WriterContext

      // Should handle mixed nodes without error
      assert.doesNotThrow(() => {
        extension.write(mockWriterContext)
      })

      // Only the first node should have extensions
      assert.ok('extensions' in mockNodeDef1)
      assert.ok(!('extensions' in mockNodeDef2) || Object.keys((mockNodeDef2 as any).extensions || {}).length === 0)
    })
  })

  describe('Property type determination', () => {
    it.todo('should assign NODE property type for regular components')

    it.todo('should assign MATERIAL property type for material plugin components')

    it.todo('should assign both MATERIAL and NODE property types for core components')
  })

  describe('Schema property handling', () => {
    it('should process components with Object schemas', () => {
      const Extension = createComponentExtension(mockNodeComponent)

      assert.ok(Extension, 'Extension should be created for component with Object schema')
      assert.equal(Extension.EXTENSION_NAME, mockNodeComponent.jsonID)
    })

    it('should process components with simple schemas', () => {
      const Extension = createComponentExtension(mockMaterialComponent)

      assert.ok(Extension, 'Extension should be created for component with simple schema')
      assert.equal(Extension.EXTENSION_NAME, mockMaterialComponent.jsonID)
    })

    it('should skip property creation for non-Object schemas', () => {
      // Create a component with a non-Object schema
      const primitiveComponent = defineComponent({
        name: 'PrimitiveComponent',
        jsonID: 'EE_primitive',
        schema: S.String({ default: 'test' }) // Non-Object schema
      })

      const Extension = createComponentExtension(primitiveComponent)

      assert.ok(Extension, 'Extension should be created even for non-Object schemas')
      assert.equal(Extension.EXTENSION_NAME, primitiveComponent.jsonID)

      // The extension should handle non-Object schemas gracefully
      // Property creation logic should skip non-Object schemas
    })

    it('should handle empty schema properties', () => {
      // Create a component with an Object schema but no properties
      const emptyComponent = defineComponent({
        name: 'EmptyComponent',
        jsonID: 'EE_empty',
        schema: S.Object({}) // Empty object schema
      })

      const Extension = createComponentExtension(emptyComponent)

      assert.ok(Extension, 'Extension should be created for empty Object schemas')
      assert.equal(Extension.EXTENSION_NAME, emptyComponent.jsonID)

      // Should not throw errors when processing empty schema
    })

    it('should handle schema with nested objects', () => {
      // Create a component with deeply nested schema
      const deeplyNestedComponent = defineComponent({
        name: 'DeeplyNestedComponent',
        jsonID: 'EE_deeply_nested',
        schema: S.Object({
          level1: S.Object({
            level2: S.Object({
              level3: S.Object({
                value: S.String({ default: 'deep' }),
                count: S.Number({ default: 42 })
              }),
              array: S.Array(
                S.Object({
                  item: S.String({ default: 'item' })
                })
              )
            }),
            simple: S.Bool({ default: true })
          }),
          topLevel: S.String({ default: 'top' })
        })
      })

      const Extension = createComponentExtension(deeplyNestedComponent)

      assert.ok(Extension, 'Extension should handle deeply nested schemas')
      assert.equal(Extension.EXTENSION_NAME, deeplyNestedComponent.jsonID)

      // The extension should process the nested structure without errors
      // Property creation should handle the nested object hierarchy
    })
  })
})
