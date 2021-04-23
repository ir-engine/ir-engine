---
id: "editor_nodes_scenenode.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/nodes/SceneNode](../modules/editor_nodes_scenenode.md).default

## Hierarchy

* *\_\_class*<this\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*): [*default*](editor_nodes_scenenode.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |

**Returns:** [*default*](editor_nodes_scenenode.default.md)

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:252](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L252)

## Properties

### disableTransform

▪ `Static` **disableTransform**: *boolean*= true

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:136](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L136)

___

### hideInElementsPanel

▪ `Static` **hideInElementsPanel**: *boolean*= false

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L20)

___

### ignoreRaycast

▪ `Static` **ignoreRaycast**: *boolean*= false

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L17)

___

### initialElementProps

▪ `Static` **initialElementProps**: *object*

#### Type declaration:

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L19)

___

### nodeName

▪ `Static` **nodeName**: *string*= "Scene"

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L135)

___

### useMultiplePlacementMode

▪ `Static` **useMultiplePlacementMode**: *boolean*= false

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L16)

## Accessors

### environmentMap

• get **environmentMap**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:320](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L320)

___

### fogColor

• get **fogColor**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:295](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L295)

___

### fogDensity

• get **fogDensity**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:302](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L302)

• set **fogDensity**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:305](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L305)

___

### fogFarDistance

• get **fogFarDistance**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:314](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L314)

• set **fogFarDistance**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:317](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L317)

___

### fogNearDistance

• get **fogNearDistance**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:308](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L308)

• set **fogNearDistance**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:311](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L311)

___

### fogType

• get **fogType**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:278](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L278)

• set **fogType**(`type`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:281](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L281)

## Methods

### addGLTFComponent

▸ **addGLTFComponent**(`name`: *any*, `props?`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`name` | *any* |
`props?` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:163](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L163)

___

### clearMetadata

▸ **clearMetadata**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:537](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L537)

___

### clone

▸ **clone**(`recursive`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`recursive` | *any* |

**Returns:** *any*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:70](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L70)

___

### combineMeshes

▸ **combineMeshes**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:470](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L470)

___

### computeAndSetStaticModes

▸ **computeAndSetStaticModes**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:212](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L212)

___

### computeAndSetVisible

▸ **computeAndSetVisible**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:215](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L215)

___

### computeStaticMode

▸ **computeStaticMode**(): *any*

**Returns:** *any*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:209](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L209)

___

### copy

▸ **copy**(`source`: *any*, `recursive?`: *boolean*): [*default*](editor_nodes_scenenode.default.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`source` | *any* | - |
`recursive` | *boolean* | true |

**Returns:** [*default*](editor_nodes_scenenode.default.md)

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:332](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L332)

___

### findNodeByType

▸ **findNodeByType**(`nodeType`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`nodeType` | *any* |

**Returns:** *any*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:253](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L253)

___

### getAnimationClips

▸ **getAnimationClips**(): *any*[]

**Returns:** *any*[]

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:508](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L508)

___

### getContentAttributions

▸ **getContentAttributions**(): *any*[]

**Returns:** *any*[]

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:520](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L520)

___

### getNodesByType

▸ **getNodesByType**(`nodeType`: *any*): *any*[]

#### Parameters:

Name | Type |
:------ | :------ |
`nodeType` | *any* |

**Returns:** *any*[]

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:267](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L267)

___

### getObjectByUUID

▸ **getObjectByUUID**(`uuid`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`uuid` | *any* |

**Returns:** *any*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:206](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L206)

___

### gltfIndexForUUID

▸ **gltfIndexForUUID**(`nodeUUID`: *any*): *object*

#### Parameters:

Name | Type |
:------ | :------ |
`nodeUUID` | *any* |

**Returns:** *object*

Name | Type |
:------ | :------ |
`__gltfIndexForUUID` | *any* |

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:203](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L203)

___

### hideErrorIcon

▸ **hideErrorIcon**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:238](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L238)

___

### isDynamic

▸ **isDynamic**(): *boolean*

**Returns:** *boolean*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:250](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L250)

___

### isInherits

▸ **isInherits**(): *boolean*

**Returns:** *boolean*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:244](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L244)

___

### isStatic

▸ **isStatic**(): *boolean*

**Returns:** *boolean*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:247](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L247)

___

### onAdd

▸ **onAdd**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:93](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L93)

___

### onChange

▸ **onChange**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:94](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L94)

___

### onDeselect

▸ **onDeselect**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:97](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L97)

___

### onPause

▸ **onPause**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L92)

___

### onPlay

▸ **onPlay**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L89)

___

### onRemove

▸ **onRemove**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:95](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L95)

___

### onRendererChanged

▸ **onRendererChanged**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L98)

___

### onSelect

▸ **onSelect**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:96](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L96)

___

### onUpdate

▸ **onUpdate**(`dt`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`dt` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:90](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L90)

___

### prepareForExport

▸ **prepareForExport**(`ctx`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`ctx` | *any* |

**Returns:** *void*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:425](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L425)

___

### removeUnusedObjects

▸ **removeUnusedObjects**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:473](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L473)

___

### replaceObject

▸ **replaceObject**(`replacementObject?`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`replacementObject?` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:185](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L185)

___

### serialize

▸ **serialize**(): *object*

**Returns:** *object*

Name | Type |
:------ | :------ |
`entities` | *object* |
`metadata` | *any* |
`root` | *any* |
`version` | *number* |

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:358](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L358)

___

### setMetadata

▸ **setMetadata**(`newMetadata`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`newMetadata` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:540](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L540)

___

### showErrorIcon

▸ **showErrorIcon**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:222](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L222)

___

### updateEnvironmentMap

▸ **updateEnvironmentMap**(`environmentMap`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`environmentMap` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:323](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L323)

___

### canAddNode

▸ `Static`**canAddNode**(): *boolean*

**Returns:** *boolean*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:137](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L137)

___

### deserialize

▸ `Static`**deserialize**(`editor`: *any*, `json`: *any*): *Promise*<\_\_class\>

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`json` | *any* |

**Returns:** *Promise*<\_\_class\>

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:214](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L214)

___

### load

▸ `Static`**load**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L24)

___

### loadProject

▸ `Static`**loadProject**(`editor`: *any*, `json`: *any*): *Promise*<any[]\>

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`json` | *any* |

**Returns:** *Promise*<any[]\>

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:140](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L140)

___

### shouldDeserialize

▸ `Static`**shouldDeserialize**(`entityJson`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`entityJson` | *any* |

**Returns:** *boolean*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SceneNode.ts:211](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SceneNode.ts#L211)
