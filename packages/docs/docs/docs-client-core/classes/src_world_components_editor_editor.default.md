---
id: "src_world_components_editor_editor.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[src/world/components/editor/Editor](../modules/src_world_components_editor_editor.md).default

Editor used to provide the various tools and properties to create or edit scene.

**`author`** Robert Long

## Hierarchy

* *EventEmitter*

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`api`: *any*, `settings?`: {}, `Engine`: *any*): [*default*](src_world_components_editor_editor.default.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`api` | *any* | - |
`settings` | *object* | {} |
`Engine` | *any* | - |

**Returns:** [*default*](src_world_components_editor_editor.default.md)

Overrides: EventEmitter.constructor

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:146](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L146)

## Properties

### Engine

• **Engine**: *Engine*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:146](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L146)

___

### api

• **api**: [*default*](src_world_components_editor_api.default.md)

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:111](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L111)

___

### audioListener

• **audioListener**: *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:132](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L132)

___

### camera

• **camera**: *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:131](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L131)

___

### centerScreenSpace

• **centerScreenSpace**: *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:137](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L137)

___

### clock

• **clock**: *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:138](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L138)

___

### defaultUploadSource

• **defaultUploadSource**: *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:125](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L125)

___

### disableUpdate

• **disableUpdate**: *boolean*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:139](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L139)

___

### editorControls

• **editorControls**: *default*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:119](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L119)

___

### flyControls

• **flyControls**: *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:120](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L120)

___

### gltfCache

• **gltfCache**: *default*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:127](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L127)

___

### grid

• **grid**: *default*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:134](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L134)

___

### helperScene

• **helperScene**: *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:133](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L133)

___

### history

• **history**: *default*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:116](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L116)

___

### initialized

• **initialized**: *boolean*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:141](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L141)

___

### initializing

• **initializing**: *boolean*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:140](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L140)

___

### inputManager

• **inputManager**: *default*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:118](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L118)

___

### nodeEditors

• **nodeEditors**: *Map*<any, any\>

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:123](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L123)

___

### nodeTypes

• **nodeTypes**: *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:122](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L122)

___

### nodes

• **nodes**: *any*[]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:135](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L135)

___

### playModeControls

• **playModeControls**: *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:121](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L121)

___

### playing

• **playing**: *boolean*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:145](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L145)

___

### project

• **project**: *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:113](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L113)

___

### projectLoaded

• **projectLoaded**: *boolean*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:130](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L130)

___

### rafId

• **rafId**: *number*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:143](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L143)

___

### raycaster

• **raycaster**: *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:136](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L136)

___

### renderer

• **renderer**: *default*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:117](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L117)

___

### scene

• **scene**: *default*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:128](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L128)

___

### sceneLoading

• **sceneLoading**: *boolean*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:142](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L142)

___

### sceneModified

• **sceneModified**: *boolean*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:129](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L129)

___

### selected

• **selected**: *any*[]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:114](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L114)

___

### selectedTransformRoots

• **selectedTransformRoots**: *any*[]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:115](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L115)

___

### settings

• **settings**: *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:112](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L112)

___

### sources

• **sources**: *any*[]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:124](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L124)

___

### textureCache

• **textureCache**: *default*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:126](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L126)

___

### thumbnailRenderer

• **thumbnailRenderer**: *default*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:144](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L144)

___

### DefaultExportOptions

▪ `Static` **DefaultExportOptions**: *object*

DefaultExportOptions provides properties to export scene.

**`author`** Robert Long

#### Type declaration:

Name | Type |
:------ | :------ |
`combineMeshes` | *boolean* |
`removeUnusedObjects` | *boolean* |

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:487](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L487)

___

### prefixed

▪ `Static` **prefixed**: *string* \| *boolean*

Inherited from: EventEmitter.prefixed

Defined in: node_modules/eventemitter3/index.d.ts:9

## Methods

### \_addMultipleObjectsWithParentsAndBefores

▸ **_addMultipleObjectsWithParentsAndBefores**(`objects`: *any*, `parents`: *any*, `befores`: *any*, `oldNodes`: *any*, `emitEvent?`: *boolean*): *void*

Function to add multiple objects with parents and befores.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`parents` | *any* | - |
`befores` | *any* | - |
`oldNodes` | *any* | - |
`emitEvent` | *boolean* | true |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1241](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1241)

___

### addListener

▸ **addListener**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*default*](src_world_components_editor_editor.default.md)

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |
`fn` | (...`args`: *any*[]) => *void* |
`context?` | *any* |

**Returns:** [*default*](src_world_components_editor_editor.default.md)

Inherited from: EventEmitter.addListener

Defined in: node_modules/eventemitter3/index.d.ts:45

___

### addMedia

▸ **addMedia**(`url`: *any*, `parent`: *any*, `before`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |
`parent` | *any* |
`before` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2728](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2728)

___

### addMultipleObjects

▸ **addMultipleObjects**(`objects`: *any*, `parent`: *any*, `before`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `selectObjects?`: *boolean*, `useUniqueName?`: *boolean*): *any*

Function addMultipleObjects used to add multiple objects to the scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`parent` | *any* | - |
`before` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`selectObjects` | *boolean* | true |
`useUniqueName` | *boolean* | false |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1192](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1192)

___

### addObject

▸ **addObject**(`object`: *any*, `parent`: *any*, `before`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `selectObject?`: *boolean*, `useUniqueName?`: *boolean*): *any*

Function addObject used to add an object to the scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`parent` | *any* | - |
`before` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`selectObject` | *boolean* | true |
`useUniqueName` | *boolean* | false |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1114](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1114)

___

### clearCaches

▸ **clearCaches**(): *void*

Function clearCaches used to clear cashe.

**`author`** Robert Long

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:396](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L396)

___

### decrementGridHeight

▸ **decrementGridHeight**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2798](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2798)

___

### deselect

▸ **deselect**(`object`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `updateTransformRoots?`: *boolean*): *any*

Function deselect used to unselect the selected object.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`updateTransformRoots` | *boolean* | true |

**Returns:** *any*

[return selected object]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:927](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L927)

___

### deselectAll

▸ **deselectAll**(`useHistory?`: *boolean*, `emitEvent?`: *boolean*, `updateTransformRoots?`: *boolean*): *any*

Function deselectAll used to deselect all selected.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`updateTransformRoots` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1015](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1015)

___

### deselectMultiple

▸ **deselectMultiple**(`objects`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `updateTransformRoots?`: *boolean*): *any*

Function deselectMultiple  deselect multiple selected objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`updateTransformRoots` | *boolean* | true |

**Returns:** *any*

[selected object]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:970](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L970)

___

### dispose

▸ **dispose**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2812](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2812)

___

### duplicate

▸ **duplicate**(`object`: *any*, `parent`: *any*, `before`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `selectObject?`: *boolean*): *any*

Function duplicate used to create duplicate of selected object.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`parent` | *any* | - |
`before` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`selectObject` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1363](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1363)

___

### duplicateMultiple

▸ **duplicateMultiple**(`objects`: *any*, `parent`: *any*, `before`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `selectObjects?`: *boolean*): *any*

Function duplicateMultiple used to create duplicate of selected objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`parent` | *any* | - |
`before` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`selectObjects` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1415](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1415)

___

### duplicateSelected

▸ **duplicateSelected**(`parent?`: *any*, `before?`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `selectObject?`: *boolean*): *void*

Function duplicateSelected used to create duplicate of selected object.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`parent` | *any* | - |
`before` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`selectObject` | *boolean* | true |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1464](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1464)

___

### emit

▸ **emit**(`eventName`: *string* \| *symbol*, ...`args`: *any*[]): *boolean*

Emit overriding function to emit events to exicute functions.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`eventName` | *string* \| *symbol* |
`...args` | *any*[] |

**Returns:** *boolean*

[true if scene is not loading]

Overrides: EventEmitter.emit

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:282](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L282)

___

### enterPlayMode

▸ **enterPlayMode**(): *void*

Function enterPlayMode used to enable play mode.

**`author`** Robert Long

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:714](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L714)

___

### eventNames

▸ **eventNames**(): (*string* \| *symbol*)[]

Return an array listing the events for which the emitter has registered
listeners.

**Returns:** (*string* \| *symbol*)[]

Inherited from: EventEmitter.eventNames

Defined in: node_modules/eventemitter3/index.d.ts:15

___

### exportScene

▸ **exportScene**(`signal`: *any*, `options?`: {}): *Promise*<{ `chunks`: *any* ; `glbBlob`: Blob  }\>

Function exportScene used to export scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`signal` | *any* | - |
`options` | *object* | {} |

**Returns:** *Promise*<{ `chunks`: *any* ; `glbBlob`: Blob  }\>

[scene data as object]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:500](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L500)

___

### generateFileThumbnail

▸ **generateFileThumbnail**(`file`: *any*, `width`: *any*, `height`: *any*): *Promise*<any\>

Function generateFileThumbnail used to create thumbnail from audio as well video file.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`file` | *any* |
`width` | *any* |
`height` | *any* |

**Returns:** *Promise*<any\>

[generated thumbnail data as blob]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:684](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L684)

___

### getCursorSpawnPosition

▸ **getCursorSpawnPosition**(`mousePos`: *any*, `target`: *any*): *void*

Function provides the cursor spawn position.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`mousePos` | *any* |
`target` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:613](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L613)

___

### getNodeEditor

▸ **getNodeEditor**(`node`: *any*): *any*

Function getNodeEditor used to get properties of currently selected node.

**`author`** Robert Long

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`node` | *any* | contains properties of node    |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:222](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L222)

___

### getRootObjects

▸ **getRootObjects**(`objects`: *any*, `target?`: *any*[], `filterUnremovable?`: *boolean*, `filterUntransformable?`: *boolean*): *any*[]

Function getRootObjects used to find root objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`target` | *any*[] | [] |
`filterUnremovable` | *boolean* | true |
`filterUntransformable` | *boolean* | false |

**Returns:** *any*[]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2632](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2632)

___

### getScreenSpaceSpawnPosition

▸ **getScreenSpaceSpawnPosition**(`screenSpacePosition`: *any*, `target`: *any*): *void*

Function provides the screen space spawn position.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`screenSpacePosition` | *any* |
`target` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:628](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L628)

___

### getSource

▸ **getSource**(`sourceId`: *any*): *any*

Function getSource used to get source from sources array using sourceId.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`sourceId` | *any* |

**Returns:** *any*

source data

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:260](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L260)

___

### getSpawnPosition

▸ **getSpawnPosition**(`target`: *any*): *void*

Function getSpawnPosition provides the postion of object inside scene.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`target` | *any* |

**Returns:** *void*

[Spwan position]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:601](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L601)

___

### getTransformRoots

▸ **getTransformRoots**(`objects`: *any*, `target?`: *any*[]): *any*[]

Function getTransformRoots provides root objects

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`target` | *any*[] | [] |

**Returns:** *any*[]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2670](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2670)

___

### groupMultiple

▸ **groupMultiple**(`objects`: *any*, `groupParent`: *any*, `groupBefore`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `selectObject?`: *boolean*): *any*

Function groupMultiple used to group multiple objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`groupParent` | *any* | - |
`groupBefore` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`selectObject` | *boolean* | true |

**Returns:** *any*

[group node]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1616](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1616)

___

### groupSelected

▸ **groupSelected**(`groupParent?`: *any*, `groupBefore?`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `selectObject?`: *boolean*): *any*

Function groupSelected used to group selected objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`groupParent` | *any* | - |
`groupBefore` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`selectObject` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1659](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1659)

___

### incrementGridHeight

▸ **incrementGridHeight**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2794](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2794)

___

### init

▸ **init**(): *Promise*<void\>

init called when component get initialized.

**`author`** Robert Long

**Returns:** *Promise*<void\>

[void]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:296](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L296)

___

### initializeRenderer

▸ **initializeRenderer**(`canvas`: *any*): *void*

Function initializeRenderer used to render canvas.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`canvas` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:381](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L381)

___

### installAssetSource

▸ **installAssetSource**(`manifestUrl`: *any*): *Promise*<void\>

Function installAssetSource adding asset using url.

**`author`** Robert Long

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`manifestUrl` | *any* | contains url of source    |

**Returns:** *Promise*<void\>

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:246](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L246)

___

### leavePlayMode

▸ **leavePlayMode**(): *void*

Function leavePlayMode used to disable play mode.

**`author`** Robert Long

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:732](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L732)

___

### listenerCount

▸ **listenerCount**(`event`: *string* \| *symbol*): *number*

Return the number of listeners listening to a given event.

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |

**Returns:** *number*

Inherited from: EventEmitter.listenerCount

Defined in: node_modules/eventemitter3/index.d.ts:27

___

### listeners

▸ **listeners**<T\>(`event`: T): (...`args`: *any*[]) => *void*[]

Return the listeners registered for a given event.

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |

**Returns:** (...`args`: *any*[]) => *void*[]

Inherited from: EventEmitter.listeners

Defined in: node_modules/eventemitter3/index.d.ts:20

___

### loadMaterialSlot

▸ **loadMaterialSlot**(`object`: *any*, `subPieceId`: *any*, `materialSlotId`: *any*, `materialId`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function to loading meterial slots.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`subPieceId` | *any* | - |
`materialSlotId` | *any* | - |
`materialId` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2555](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2555)

___

### loadMaterialSlotMultiple

▸ **loadMaterialSlotMultiple**(`objects`: *any*, `subPieceId`: *any*, `materialSlotId`: *any*, `materialId`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function loadMaterialSlotMultiple used to load multiple material slots.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`subPieceId` | *any* | - |
`materialSlotId` | *any* | - |
`materialId` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2585](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2585)

___

### loadMaterialSlotSelected

▸ **loadMaterialSlotSelected**(`subPieceId`: *any*, `materialSlotId`: *any*, `materialId`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function to load selected material slot.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`subPieceId` | *any* | - |
`materialSlotId` | *any* | - |
`materialId` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2618](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2618)

___

### loadProject

▸ **loadProject**(`projectFile`: *any*): *Promise*<any\>

Function loadProject used to load the scene.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`projectFile` | *any* |

**Returns:** *Promise*<any\>

[scene to render]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:408](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L408)

___

### off

▸ **off**<T\>(`event`: T, `fn?`: (...`args`: *any*[]) => *void*, `context?`: *any*, `once?`: *boolean*): [*default*](src_world_components_editor_editor.default.md)

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |
`fn?` | (...`args`: *any*[]) => *void* |
`context?` | *any* |
`once?` | *boolean* |

**Returns:** [*default*](src_world_components_editor_editor.default.md)

Inherited from: EventEmitter.off

Defined in: node_modules/eventemitter3/index.d.ts:69

___

### on

▸ **on**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*default*](src_world_components_editor_editor.default.md)

Add a listener for a given event.

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |
`fn` | (...`args`: *any*[]) => *void* |
`context?` | *any* |

**Returns:** [*default*](src_world_components_editor_editor.default.md)

Inherited from: EventEmitter.on

Defined in: node_modules/eventemitter3/index.d.ts:40

___

### onCopy

▸ **onCopy**(`event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2683](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2683)

___

### onEmitSceneModified

▸ **onEmitSceneModified**(): *void*

Function onEmitSceneModified called when scene get modified.

**`author`** Robert Long

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:370](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L370)

___

### onPaste

▸ **onPaste**(`event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2699](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2699)

___

### onResize

▸ **onResize**(): *void*

Function onResize event handler for resize containers.

**`author`** Robert Long

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:782](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L782)

___

### once

▸ **once**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*default*](src_world_components_editor_editor.default.md)

Add a one-time listener for a given event.

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |
`fn` | (...`args`: *any*[]) => *void* |
`context?` | *any* |

**Returns:** [*default*](src_world_components_editor_editor.default.md)

Inherited from: EventEmitter.once

Defined in: node_modules/eventemitter3/index.d.ts:54

___

### redo

▸ **redo**(): *void*

Function redo used to redo changes on the basis of history of component.

**`author`** Robert Long

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:812](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L812)

___

### registerNode

▸ **registerNode**(`nodeConstructor`: *any*, `nodeEditor`: *any*): *void*

Function registerNode used to add new object to the scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`nodeConstructor` | *any* | contains constructor properties   |
`nodeEditor` | *any* | contains editor properties    |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:211](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L211)

___

### registerSource

▸ **registerSource**(`source`: *any*): *void*

Function registerSource used to add image, audio, video, asset files to the scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`source` | *any* | contains source file data    |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:232](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L232)

___

### removeAllListeners

▸ **removeAllListeners**(`event?`: *string* \| *symbol*): [*default*](src_world_components_editor_editor.default.md)

Remove all listeners, or those of the specified event.

#### Parameters:

Name | Type |
:------ | :------ |
`event?` | *string* \| *symbol* |

**Returns:** [*default*](src_world_components_editor_editor.default.md)

Inherited from: EventEmitter.removeAllListeners

Defined in: node_modules/eventemitter3/index.d.ts:79

___

### removeListener

▸ **removeListener**<T\>(`event`: T, `fn?`: (...`args`: *any*[]) => *void*, `context?`: *any*, `once?`: *boolean*): [*default*](src_world_components_editor_editor.default.md)

Remove the listeners of a given event.

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |
`fn?` | (...`args`: *any*[]) => *void* |
`context?` | *any* |
`once?` | *boolean* |

**Returns:** [*default*](src_world_components_editor_editor.default.md)

Inherited from: EventEmitter.removeListener

Defined in: node_modules/eventemitter3/index.d.ts:63

___

### removeMultipleObjects

▸ **removeMultipleObjects**(`objects`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `deselectObjects?`: *boolean*): *any*

Function removeMultipleObjects used to remove multiple objects from scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`deselectObjects` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1317](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1317)

___

### removeObject

▸ **removeObject**(`object`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `deselectObject?`: *boolean*): *any*

Function removeObject used to remove object from scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`deselectObject` | *boolean* | true |

**Returns:** *any*

[description]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1274](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1274)

___

### removeSelectedObjects

▸ **removeSelectedObjects**(`useHistory?`: *boolean*, `emitEvent?`: *boolean*, `deselectObjects?`: *boolean*): *any*

Function removeSelectedObjects used to remove selected objects from scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`deselectObjects` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1348](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1348)

___

### reparent

▸ **reparent**(`object`: *any*, `newParent`: *any*, `newBefore`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `selectObject?`: *boolean*): *any*

Function reparent used to change the parent object of selected object.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`newParent` | *any* | - |
`newBefore` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`selectObject` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1486](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1486)

___

### reparentMultiple

▸ **reparentMultiple**(`objects`: *any*, `newParent`: *any*, `newBefore`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `selectObjects?`: *boolean*): *any*

Function reparentMultiple used to change the parent objects of multiple selected  objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`newParent` | *any* | - |
`newBefore` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`selectObjects` | *boolean* | true |

**Returns:** *any*

[selected objects]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1560](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1560)

___

### reparentSelected

▸ **reparentSelected**(`newParent`: *any*, `newBefore`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `selectObjects?`: *boolean*): *any*

Function reparentSelected used to change the parent object of selected object.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`newParent` | *any* | - |
`newBefore` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`selectObjects` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1600](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1600)

___

### reparentToSceneAtCursorPosition

▸ **reparentToSceneAtCursorPosition**(`objects`: *any*, `mousePos`: *any*): *void*

Function reparentToSceneAtCursorPosition used to reparent scene at cursor position.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`objects` | *any* |
`mousePos` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:657](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L657)

___

### revert

▸ **revert**(`checkpointId`: *any*): *void*

Function revert used to revert back the recent changes on the basis of checkpoint.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`checkpointId` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:794](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L794)

___

### rotateAround

▸ **rotateAround**(`object`: *any*, `pivot`: *any*, `axis`: *any*, `angle`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

[rotateAround modifies both the position and the rotation of the object]

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`pivot` | *any* | - |
`axis` | *any* | - |
`angle` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2106](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2106)

___

### rotateAroundMultiple

▸ **rotateAroundMultiple**(`objects`: *any*, `pivot`: *any*, `axis`: *any*, `angle`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function rotateAroundMultiple modifies both the position and the rotation of the multiple objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`pivot` | *any* | - |
`axis` | *any* | - |
`angle` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2149](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2149)

___

### rotateAroundSelected

▸ **rotateAroundSelected**(`pivot`: *any*, `axis`: *any*, `angle`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function rotateAroundSelected used when multiple objects are selected.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`pivot` | *any* | - |
`axis` | *any* | - |
`angle` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2176](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2176)

___

### rotateOnAxis

▸ **rotateOnAxis**(`object`: *any*, `axis`: *any*, `angle`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function rotateOnAxis used to rotate selected object on given axis.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`axis` | *any* | - |
`angle` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2000](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2000)

___

### rotateOnAxisMultiple

▸ **rotateOnAxisMultiple**(`objects`: *any*, `axis`: *any*, `angle`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function rotateOnAxisMultiple multiple selected objects on the given axis.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`axis` | *any* | - |
`angle` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2055](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2055)

___

### rotateOnAxisSelected

▸ **rotateOnAxisSelected**(`axis`: *any*, `angle`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

FUnction rotateOnAxisSelected is used when multiple objects are selected to rotate.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`axis` | *any* | - |
`angle` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2092](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2092)

___

### scale

▸ **scale**(`object`: *any*, `scale`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function scale used to increase size of object according to the scaling coordinates.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`scale` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

[selected object]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2191](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2191)

___

### scaleMultiple

▸ **scaleMultiple**(`objects`: *any*, `scale`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function scaleMultiple used to increase size of multiple selected objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`scale` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

[selected objects]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2224](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2224)

___

### scaleSelected

▸ **scaleSelected**(`scale`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function scaleSelected used when multiple objects are selected.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`scale` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2250](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2250)

___

### select

▸ **select**(`object`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `updateTransformRoots?`: *boolean*): *any*

Function select called if we select object on the scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`updateTransformRoots` | *boolean* | true |

**Returns:** *any*

[data of selected object]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:826](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L826)

___

### selectAll

▸ **selectAll**(`useHistory?`: *boolean*, `emitEvent?`: *boolean*, `updateTransformRoots?`: *boolean*): *any*

Function selectAll used to select all objects available in the scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`updateTransformRoots` | *boolean* | true |

**Returns:** *any*

[selected objects]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:912](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L912)

___

### selectMultiple

▸ **selectMultiple**(`objects`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `updateTransformRoots?`: *boolean*): *any*

Function selectMultiple used to select multiple objects on the scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`updateTransformRoots` | *boolean* | true |

**Returns:** *any*

[data of selected objects]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:866](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L866)

___

### setGridHeight

▸ **setGridHeight**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2802](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2802)

___

### setObjectProperty

▸ **setObjectProperty**(`propertyName`: *any*, `value`: *any*, `useHistory?`: *boolean*): *any*

[setObjectProperty used to set propery to selected object]

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`propertyName` | *any* | - |
`value` | *any* | - |
`useHistory` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2409](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2409)

___

### setPosition

▸ **setPosition**(`object`: *any*, `position`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setPosition used to position object on scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`position` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1686](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1686)

___

### setPositionMultiple

▸ **setPositionMultiple**(`objects`: *any*, `position`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setPositionMultiple used to position multiple objects on the scene.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`position` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1740](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1740)

___

### setPositionSelected

▸ **setPositionSelected**(`position`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setPositionSelected used to position select object.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`position` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1775](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1775)

___

### setProperties

▸ **setProperties**(`object`: *any*, `properties`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setProperties used to set multiple properties to selected object.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`properties` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2480](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2480)

___

### setPropertiesMultiple

▸ **setPropertiesMultiple**(`objects`: *any*, `properties`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setPropertiesMultiple used to set multiple properties of multiple selected objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`properties` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2515](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2515)

___

### setPropertiesSelected

▸ **setPropertiesSelected**(`properties`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setPropertiesSelected used when multiple objects are selected.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`properties` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2539](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2539)

___

### setProperty

▸ **setProperty**(`object`: *any*, `propertyName`: *any*, `value`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `disableCopy?`: *boolean*): *any*

Function setProperty used to set specific property to the selected object.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`propertyName` | *any* | - |
`value` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`disableCopy` | *boolean* | false |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2381](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2381)

___

### setPropertyMultiple

▸ **setPropertyMultiple**(`objects`: *any*, `propertyName`: *any*, `value`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setPropertyMultiple used to set propery to multiple selected objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`propertyName` | *any* | - |
`value` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2443](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2443)

___

### setPropertySelected

▸ **setPropertySelected**(`propertyName`: *any*, `value`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setPropertySelected used when multiple objects are selected.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`propertyName` | *any* | - |
`value` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2467](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2467)

___

### setRotation

▸ **setRotation**(`object`: *any*, `rotation`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setRotation used to rotate a single object.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`rotation` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1895](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1895)

___

### setRotationMultiple

▸ **setRotationMultiple**(`objects`: *any*, `rotation`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setRotationMultiple used to set multiple rotations.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`rotation` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1949](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1949)

___

### setRotationSelected

▸ **setRotationSelected**(`rotation`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setRotationSelected used when multiple objects are selected to rotate.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`rotation` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1984](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1984)

___

### setScale

▸ **setScale**(`object`: *any*, `scale`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setScale used to scale object according to scaling coordinates.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`scale` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2264](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2264)

___

### setScaleMultiple

▸ **setScaleMultiple**(`objects`: *any*, `scale`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setScaleMultiple used to scale multiple objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`scale` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2331](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2331)

___

### setScaleSelected

▸ **setScaleSelected**(`scale`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function setScaleSelected used when multiple objects are selected.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`scale` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2366](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2366)

___

### setSelection

▸ **setSelection**(`objects`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `updateTransformRoots?`: *boolean*): *any*

Function setSelection used to set selection various objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`updateTransformRoots` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1045](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1045)

___

### setSource

▸ **setSource**(`sourceId`: *any*): *void*

Function setSource emitting event setSource using sourceId.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`sourceId` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:270](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L270)

___

### spawnGrabbedObject

▸ **spawnGrabbedObject**(`object`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`object` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2778](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2778)

___

### takeScreenshot

▸ **takeScreenshot**(`width`: *any*, `height`: *any*): *Promise*<any\>

Function takeScreenshot used for taking screenshots.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`width` | *any* |
`height` | *any* |

**Returns:** *Promise*<any\>

[generated screenshot according to height and width]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:671](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L671)

___

### toggleGridVisible

▸ **toggleGridVisible**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2807](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2807)

___

### toggleSelection

▸ **toggleSelection**(`object`: *any*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*, `updateTransformRoots?`: *boolean*): *any*

Function toggleSelection used to toggle select and unselect object.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |
`updateTransformRoots` | *boolean* | true |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1028](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1028)

___

### translate

▸ **translate**(`object`: *any*, `translation`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function translate used to move an object to specific postion.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`object` | *any* | - |
`translation` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

[object]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1790](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1790)

___

### translateMultiple

▸ **translateMultiple**(`objects`: *any*, `translation`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

FUnction translateMultiple is used when multiple objects are selected.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`objects` | *any* | - |
`translation` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

[selected objects]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1845](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1845)

___

### translateSelected

▸ **translateSelected**(`translation`: *any*, `space?`: *string*, `useHistory?`: *boolean*, `emitEvent?`: *boolean*): *any*

Function translateSelected handler to transform multiple selected objects.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`translation` | *any* | - |
`space` | *string* | - |
`useHistory` | *boolean* | true |
`emitEvent` | *boolean* | true |

**Returns:** *any*

[multiple selected objects]

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:1881](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L1881)

___

### undo

▸ **undo**(): *void*

Function undo used to undo changes using history of this component.

**`author`** Robert Long

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:803](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L803)

___

### update

▸ **update**(): *void*

Function update used to update components used in editor.

**`author`** Robert Long

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:749](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L749)

___

### updateTransformRoots

▸ **updateTransformRoots**(): *void*

Function to update transform roots.

**`author`** Robert Long

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Editor.tsx:2679](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Editor.tsx#L2679)
