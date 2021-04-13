---
id: "editor_nodes_imagenode.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/nodes/ImageNode](../modules/editor_nodes_imagenode.md).default

## Hierarchy

* *\_\_class*<this\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*): [*default*](editor_nodes_imagenode.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |

**Returns:** [*default*](editor_nodes_imagenode.default.md)

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L31)

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

Name | Type |
:------ | :------ |
`src` | *string* |

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L8)

___

### legacyComponentName

▪ `Static` **legacyComponentName**: *string*= "image"

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L6)

___

### nodeName

▪ `Static` **nodeName**: *string*= "Image"

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L7)

___

### useMultiplePlacementMode

▪ `Static` **useMultiplePlacementMode**: *boolean*= false

Inherited from: void

Defined in: [packages/engine/src/editor/nodes/EditorNodeMixin.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/EditorNodeMixin.ts#L16)

## Accessors

### src

• get **src**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:37](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L37)

• set **src**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L40)

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

▸ **copy**(`source`: *any*, `recursive?`: *boolean*): [*default*](editor_nodes_imagenode.default.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`source` | *any* | - |
`recursive` | *boolean* | true |

**Returns:** [*default*](editor_nodes_imagenode.default.md)

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L78)

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

▸ **load**(`src`: *any*, `onError?`: *any*): *Promise*<[*default*](editor_nodes_imagenode.default.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |
`onError?` | *any* |

**Returns:** *Promise*<[*default*](editor_nodes_imagenode.default.md)\>

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L49)

___

### loadTexture

▸ **loadTexture**(`src`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:46](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L46)

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

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L43)

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

▸ **prepareForExport**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:97](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L97)

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

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:86](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L86)

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

Defined in: [packages/engine/src/editor/nodes/ImageNode.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/nodes/ImageNode.ts#L11)

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
