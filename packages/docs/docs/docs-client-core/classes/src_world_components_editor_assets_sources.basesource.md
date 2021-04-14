---
id: "src_world_components_editor_assets_sources.basesource"
title: "Class: BaseSource"
sidebar_label: "BaseSource"
custom_edit_url: null
hide_title: true
---

# Class: BaseSource

[src/world/components/editor/assets/sources](../modules/src_world_components_editor_assets_sources.md).BaseSource

BaseSource Parent class for all source classes.

**`author`** Robert Long

## Hierarchy

* *EventEmitter*

  ↳ **BaseSource**

  ↳↳ [*AssetManifestSource*](src_world_components_editor_assets_assetmanifestsource.assetmanifestsource.md)

  ↳↳ [*ImageMediaSource*](src_world_components_editor_assets_imagemediasource.imagemediasource.md)

  ↳↳ [*ModelMediaSource*](src_world_components_editor_assets_modelmediasource.modelmediasource.md)

  ↳↳ [*VideoMediaSource*](src_world_components_editor_assets_videomediasource.videomediasource.md)

  ↳↳ [*ElementsSource*](src_world_components_editor_assets_sources_elementssource.elementssource.md)

  ↳↳ [*MyAssetsSource*](src_world_components_editor_assets_sources_myassetssource.myassetssource.md)

## Constructors

### constructor

\+ **new BaseSource**(): [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

**Returns:** [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

Overrides: EventEmitter.constructor

Defined in: [packages/client-core/src/world/components/editor/assets/sources/index.tsx:15](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/world/components/editor/assets/sources/index.tsx#L15)

## Properties

### assetPanelComponent

• **assetPanelComponent**: *any*

Defined in: [packages/client-core/src/world/components/editor/assets/sources/index.tsx:12](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/world/components/editor/assets/sources/index.tsx#L12)

___

### iconComponent

• **iconComponent**: *any*

Defined in: [packages/client-core/src/world/components/editor/assets/sources/index.tsx:11](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/world/components/editor/assets/sources/index.tsx#L11)

___

### id

• **id**: *string*

Defined in: [packages/client-core/src/world/components/editor/assets/sources/index.tsx:9](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/world/components/editor/assets/sources/index.tsx#L9)

___

### name

• **name**: *string*

Defined in: [packages/client-core/src/world/components/editor/assets/sources/index.tsx:10](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/world/components/editor/assets/sources/index.tsx#L10)

___

### requiresAuthentication

• **requiresAuthentication**: *boolean*

Defined in: [packages/client-core/src/world/components/editor/assets/sources/index.tsx:13](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/world/components/editor/assets/sources/index.tsx#L13)

___

### searchDebounceTimeout

• **searchDebounceTimeout**: *number*

Defined in: [packages/client-core/src/world/components/editor/assets/sources/index.tsx:15](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/world/components/editor/assets/sources/index.tsx#L15)

___

### uploadSource

• **uploadSource**: *boolean*

Defined in: [packages/client-core/src/world/components/editor/assets/sources/index.tsx:14](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/world/components/editor/assets/sources/index.tsx#L14)

___

### prefixed

▪ `Static` **prefixed**: *string* \| *boolean*

Inherited from: EventEmitter.prefixed

Defined in: node_modules/eventemitter3/index.d.ts:9

## Methods

### addListener

▸ **addListener**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

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

**Returns:** [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

Inherited from: EventEmitter.addListener

Defined in: node_modules/eventemitter3/index.d.ts:45

___

### emit

▸ **emit**<T\>(`event`: T, ...`args`: *any*[]): *boolean*

Calls each of the listeners registered for a given event.

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |
`...args` | *any*[] |

**Returns:** *boolean*

Inherited from: EventEmitter.emit

Defined in: node_modules/eventemitter3/index.d.ts:32

___

### eventNames

▸ **eventNames**(): (*string* \| *symbol*)[]

Return an array listing the events for which the emitter has registered
listeners.

**Returns:** (*string* \| *symbol*)[]

Inherited from: EventEmitter.eventNames

Defined in: node_modules/eventemitter3/index.d.ts:15

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

### off

▸ **off**<T\>(`event`: T, `fn?`: (...`args`: *any*[]) => *void*, `context?`: *any*, `once?`: *boolean*): [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

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

**Returns:** [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

Inherited from: EventEmitter.off

Defined in: node_modules/eventemitter3/index.d.ts:69

___

### on

▸ **on**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

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

**Returns:** [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

Inherited from: EventEmitter.on

Defined in: node_modules/eventemitter3/index.d.ts:40

___

### once

▸ **once**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

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

**Returns:** [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

Inherited from: EventEmitter.once

Defined in: node_modules/eventemitter3/index.d.ts:54

___

### removeAllListeners

▸ **removeAllListeners**(`event?`: *string* \| *symbol*): [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

Remove all listeners, or those of the specified event.

#### Parameters:

Name | Type |
:------ | :------ |
`event?` | *string* \| *symbol* |

**Returns:** [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

Inherited from: EventEmitter.removeAllListeners

Defined in: node_modules/eventemitter3/index.d.ts:79

___

### removeListener

▸ **removeListener**<T\>(`event`: T, `fn?`: (...`args`: *any*[]) => *void*, `context?`: *any*, `once?`: *boolean*): [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

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

**Returns:** [*BaseSource*](src_world_components_editor_assets_sources.basesource.md)

Inherited from: EventEmitter.removeListener

Defined in: node_modules/eventemitter3/index.d.ts:63

___

### search

▸ **search**(`_params`: *any*, `_cursor?`: *any*, `_abortSignal?`: *any*): *Promise*<{ `hasMore`: *boolean* = false; `nextCursor`: *number* = 0; `results`: *any*[] = []; `suggestions`: *any*[] = [] }\>

#### Parameters:

Name | Type |
:------ | :------ |
`_params` | *any* |
`_cursor?` | *any* |
`_abortSignal?` | *any* |

**Returns:** *Promise*<{ `hasMore`: *boolean* = false; `nextCursor`: *number* = 0; `results`: *any*[] = []; `suggestions`: *any*[] = [] }\>

Defined in: [packages/client-core/src/world/components/editor/assets/sources/index.tsx:26](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/world/components/editor/assets/sources/index.tsx#L26)
