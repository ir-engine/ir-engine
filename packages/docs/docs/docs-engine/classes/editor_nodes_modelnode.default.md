---
id: "editor_nodes_modelnode.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/nodes/ModelNode](../modules/editor_nodes_modelnode.md).default

## Hierarchy

* *\_\_class*<this\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*): [*default*](editor_nodes_modelnode.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |

**Returns:** [*default*](editor_nodes_modelnode.default.md)

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:85](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L85)

## Properties

### meshColliders

• **meshColliders**: *any*[]

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L19)

___

### vehicleObject

• **vehicleObject**: *any*[]

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L20)

___

### disableTransform

▪ `Static` **disableTransform**: *boolean*= false

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L15)

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

Name | Type |
:------ | :------ |
`initialScale` | *string* |
`src` | *string* |

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L14)

___

### legacyComponentName

▪ `Static` **legacyComponentName**: *string*= "gltf-model"

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L13)

___

### nodeName

▪ `Static` **nodeName**: *string*= "Model"

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L12)

___

### useMultiplePlacementMode

▪ `Static` **useMultiplePlacementMode**: *boolean*= false

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L16)

## Accessors

### src

• get **src**(): *string*

**Returns:** *string*

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:100](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L100)

• set **src**(`value`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *string* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:104](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L104)

## Methods

### addEditorParametersToCollider

▸ **addEditorParametersToCollider**(`collider`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`collider` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:309](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L309)

___

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

▸ **copy**(`source`: *any*, `recursive?`: *boolean*): [*default*](editor_nodes_modelnode.default.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`source` | *any* | - |
`recursive` | *boolean* | true |

**Returns:** [*default*](editor_nodes_modelnode.default.md)

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:392](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L392)

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

### load

▸ **load**(`src`: *any*, `onError?`: *any*): *Promise*<[*default*](editor_nodes_modelnode.default.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |
`onError?` | *any* |

**Returns:** *Promise*<[*default*](editor_nodes_modelnode.default.md)\>

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:116](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L116)

___

### loadGLTF

▸ **loadGLTF**(`src`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:108](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L108)

___

### onAdd

▸ **onAdd**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:191](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L191)

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

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:204](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L204)

___

### onPlay

▸ **onPlay**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:201](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L201)

___

### onRemove

▸ **onRemove**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L196)

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

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:207](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L207)

___

### parseAndSaveColliders

▸ **parseAndSaveColliders**(`components`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`components` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:272](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L272)

___

### parseColliders

▸ **parseColliders**(`data`: *any*, `type`: *any*, `mass`: *any*, `position`: *any*, `quaternion`: *any*, `scale`: *any*, `mesh`: *any*): *object*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |
`type` | *any* |
`mass` | *any* |
`position` | *any* |
`quaternion` | *any* |
`scale` | *any* |
`mesh` | *any* |

**Returns:** *object*

Name | Type |
:------ | :------ |
`data` | *any* |
`indices` | *unknown*[] |
`mass` | *any* |
`position` | *object* |
`position.x` | *any* |
`position.y` | *any* |
`position.z` | *any* |
`quaternion` | *object* |
`quaternion.w` | *any* |
`quaternion.x` | *any* |
`quaternion.y` | *any* |
`quaternion.z` | *any* |
`scale` | *object* |
`scale.x` | *any* |
`scale.y` | *any* |
`scale.z` | *any* |
`type` | *any* |
`vertices` | *number*[] |

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:237](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L237)

___

### parseVehicle

▸ **parseVehicle**(`group`: *any*): (*any*[] \| { `arrayWheelsPosition`: *any*[] ; `entrancesArray`: *any*[] ; `interactionPartsPosition`: *any*[] ; `mass`: *number* ; `seatsArray`: *any*[] ; `startPosition`: *any* ; `startQuaternion`: *any* ; `suspensionRestLength`: *number*  })[]

#### Parameters:

Name | Type |
:------ | :------ |
`group` | *any* |

**Returns:** (*any*[] \| { `arrayWheelsPosition`: *any*[] ; `entrancesArray`: *any*[] ; `interactionPartsPosition`: *any*[] ; `mass`: *number* ; `seatsArray`: *any*[] ; `startPosition`: *any* ; `startQuaternion`: *any* ; `suspensionRestLength`: *number*  })[]

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:216](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L216)

___

### prepareForExport

▸ **prepareForExport**(`ctx`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`ctx` | *any* |

**Returns:** *void*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:409](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L409)

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

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:353](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L353)

___

### showErrorIcon

▸ **showErrorIcon**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:222](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L222)

___

### simplyfyFloat

▸ **simplyfyFloat**(`arr`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`arr` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:213](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L213)

___

### updateStaticModes

▸ **updateStaticModes**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:333](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L333)

___

### canAddNode

▸ `Static`**canAddNode**(`_editor`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`_editor` | *any* |

**Returns:** *boolean*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L21)

___

### deserialize

▸ `Static`**deserialize**(`editor`: *any*, `json`: *any*, `loadAsync`: *any*, `onError`: *any*): *Promise*<\_\_class\>

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`json` | *any* |
`loadAsync` | *any* |
`onError` | *any* |

**Returns:** *Promise*<\_\_class\>

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ModelNode.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ModelNode.ts#L22)

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
