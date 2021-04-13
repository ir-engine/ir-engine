---
id: "editor_nodes_audionode.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/nodes/AudioNode](../modules/editor_nodes_audionode.md).default

## Hierarchy

* *\_\_class*<this\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*): [*default*](editor_nodes_audionode.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |

**Returns:** [*default*](editor_nodes_audionode.default.md)

Overrides: void

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L55)

## Properties

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

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L19)

___

### legacyComponentName

▪ `Static` **legacyComponentName**: *string*= "audio"

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L15)

___

### nodeName

▪ `Static` **nodeName**: *string*= "Audio"

Overrides: void

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L16)

___

### useMultiplePlacementMode

▪ `Static` **useMultiplePlacementMode**: *boolean*= false

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L16)

## Accessors

### autoPlay

• get **autoPlay**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:77](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L77)

• set **autoPlay**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:80](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L80)

___

### src

• get **src**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L71)

• set **src**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L74)

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

Overrides: void

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:128](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L128)

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

▸ **copy**(`source`: *any*, `recursive?`: *boolean*): [*default*](editor_nodes_audionode.default.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`source` | *any* | - |
`recursive` | *boolean* | true |

**Returns:** [*default*](editor_nodes_audionode.default.md)

Overrides: void

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:134](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L134)

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

▸ **load**(`src`: *any*, `onError?`: *any*): *Promise*<[*default*](editor_nodes_audionode.default.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |
`onError?` | *any* |

**Returns:** *Promise*<[*default*](editor_nodes_audionode.default.md)\>

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:83](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L83)

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

Overrides: void

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:124](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L124)

___

### onPlay

▸ **onPlay**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:119](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L119)

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

▸ **prepareForExport**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:170](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L170)

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

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:151](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L151)

___

### showErrorIcon

▸ **showErrorIcon**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:222](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L222)

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

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L20)

___

### load

▸ `Static`**load**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Overrides: void

Defined in: [packages/engine/src/editor/nodes/AudioNode.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/AudioNode.ts#L17)

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
