---
id: "editor_nodes_skyboxnode.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/nodes/SkyboxNode](../modules/editor_nodes_skyboxnode.md).default

## Hierarchy

* *\_\_class*<this\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, ...`args`: *any*[]): [*default*](editor_nodes_skyboxnode.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`...args` | *any*[] |

**Returns:** [*default*](editor_nodes_skyboxnode.default.md)

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:53](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L53)

## Properties

### disableTransform

▪ `Static` **disableTransform**: *boolean*= true

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L6)

___

### hideInElementsPanel

▪ `Static` **hideInElementsPanel**: *boolean*= false

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L20)

___

### ignoreRaycast

▪ `Static` **ignoreRaycast**: *boolean*= true

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L7)

___

### initialElementProps

▪ `Static` **initialElementProps**: *object*

#### Type declaration:

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L19)

___

### legacyComponentName

▪ `Static` **legacyComponentName**: *string*= "skybox"

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L5)

___

### nodeName

▪ `Static` **nodeName**: *string*= "Skybox"

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L8)

___

### textureID

▪ `Static` **textureID**: *string*= ''

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L9)

___

### useMultiplePlacementMode

▪ `Static` **useMultiplePlacementMode**: *boolean*= false

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L16)

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

▸ **copy**(`source`: *any*, `recursive?`: *boolean*): [*default*](editor_nodes_skyboxnode.default.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`source` | *any* | - |
`recursive` | *boolean* | true |

**Returns:** [*default*](editor_nodes_skyboxnode.default.md)

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L73)

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

### getTexture

▸ **getTexture**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L76)

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

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:50](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L50)

___

### onChange

▸ **onChange**(): *any*

**Returns:** *any*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:56](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L56)

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

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L72)

___

### onRendererChanged

▸ **onRendererChanged**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:47](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L47)

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

▸ **prepareForExport**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:130](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L130)

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
`components` | ({ `name`: *string* = "transform"; `props`: { `position`: { `x`: *any* ; `y`: *any* ; `z`: *any*  } ; `rotation`: { `x`: *any* ; `y`: *any* ; `z`: *any*  } ; `scale`: { `x`: *any* ; `y`: *any* ; `z`: *any*  } ; `visible`: *undefined*  }  } \| { `name`: *string* = "visible"; `props`: { `position`: *undefined* ; `rotation`: *undefined* ; `scale`: *undefined* ; `visible`: *any*  }  })[] |
`name` | *any* |

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:104](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L104)

___

### showErrorIcon

▸ **showErrorIcon**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:222](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L222)

___

### updateEnvironmentMap

▸ **updateEnvironmentMap**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:100](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L100)

___

### canAddNode

▸ `Static`**canAddNode**(`editor`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |

**Returns:** *boolean*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L10)

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

Defined in: [packages/engine/src/editor/nodes/SkyboxNode.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/SkyboxNode.ts#L13)

___

### load

▸ `Static`**load**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L24)

___

### shouldDeserialize

▸ `Static`**shouldDeserialize**(`entityJson`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`entityJson` | *any* |

**Returns:** *boolean*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L27)
