---
id: "components_editor_assets_sources.basesource"
title: "Class: BaseSource"
sidebar_label: "BaseSource"
custom_edit_url: null
hide_title: true
---

# Class: BaseSource

[components/editor/assets/sources](../modules/components_editor_assets_sources.md).BaseSource

[BaseSource]

## Hierarchy

* *EventEmitter*

  ↳ **BaseSource**

  ↳↳ [*default*](components_editor_assets_assetmanifestsource.default.md)

  ↳↳ [*default*](components_editor_assets_imagemediasource.default.md)

  ↳↳ [*default*](components_editor_assets_modelmediasource.default.md)

  ↳↳ [*default*](components_editor_assets_videomediasource.default.md)

  ↳↳ [*default*](components_editor_assets_sources_elementssource.default.md)

  ↳↳ [*default*](components_editor_assets_sources_myassetssource.default.md)

## Constructors

### constructor

\+ **new BaseSource**(): [*BaseSource*](components_editor_assets_sources.basesource.md)

**Returns:** [*BaseSource*](components_editor_assets_sources.basesource.md)

Overrides: void

Defined in: [packages/client-core/components/editor/assets/sources/index.tsx:13](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/assets/sources/index.tsx#L13)

## Properties

### assetPanelComponent

• **assetPanelComponent**: *any*

Defined in: [packages/client-core/components/editor/assets/sources/index.tsx:10](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/assets/sources/index.tsx#L10)

___

### iconComponent

• **iconComponent**: *any*

Defined in: [packages/client-core/components/editor/assets/sources/index.tsx:9](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/assets/sources/index.tsx#L9)

___

### id

• **id**: *string*

Defined in: [packages/client-core/components/editor/assets/sources/index.tsx:7](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/assets/sources/index.tsx#L7)

___

### name

• **name**: *string*

Defined in: [packages/client-core/components/editor/assets/sources/index.tsx:8](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/assets/sources/index.tsx#L8)

___

### requiresAuthentication

• **requiresAuthentication**: *boolean*

Defined in: [packages/client-core/components/editor/assets/sources/index.tsx:11](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/assets/sources/index.tsx#L11)

___

### searchDebounceTimeout

• **searchDebounceTimeout**: *number*

Defined in: [packages/client-core/components/editor/assets/sources/index.tsx:13](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/assets/sources/index.tsx#L13)

___

### uploadSource

• **uploadSource**: *boolean*

Defined in: [packages/client-core/components/editor/assets/sources/index.tsx:12](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/assets/sources/index.tsx#L12)

___

### prefixed

▪ `Static` **prefixed**: *string* \| *boolean*

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:9

## Methods

### addListener

▸ **addListener**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*BaseSource*](components_editor_assets_sources.basesource.md)

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

**Returns:** [*BaseSource*](components_editor_assets_sources.basesource.md)

Inherited from: void

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

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:32

___

### eventNames

▸ **eventNames**(): (*string* \| *symbol*)[]

Return an array listing the events for which the emitter has registered
listeners.

**Returns:** (*string* \| *symbol*)[]

Inherited from: void

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

Inherited from: void

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

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:20

___

### off

▸ **off**<T\>(`event`: T, `fn?`: (...`args`: *any*[]) => *void*, `context?`: *any*, `once?`: *boolean*): [*BaseSource*](components_editor_assets_sources.basesource.md)

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

**Returns:** [*BaseSource*](components_editor_assets_sources.basesource.md)

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:69

___

### on

▸ **on**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*BaseSource*](components_editor_assets_sources.basesource.md)

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

**Returns:** [*BaseSource*](components_editor_assets_sources.basesource.md)

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:40

___

### once

▸ **once**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*BaseSource*](components_editor_assets_sources.basesource.md)

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

**Returns:** [*BaseSource*](components_editor_assets_sources.basesource.md)

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:54

___

### removeAllListeners

▸ **removeAllListeners**(`event?`: *string* \| *symbol*): [*BaseSource*](components_editor_assets_sources.basesource.md)

Remove all listeners, or those of the specified event.

#### Parameters:

Name | Type |
:------ | :------ |
`event?` | *string* \| *symbol* |

**Returns:** [*BaseSource*](components_editor_assets_sources.basesource.md)

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:79

___

### removeListener

▸ **removeListener**<T\>(`event`: T, `fn?`: (...`args`: *any*[]) => *void*, `context?`: *any*, `once?`: *boolean*): [*BaseSource*](components_editor_assets_sources.basesource.md)

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

**Returns:** [*BaseSource*](components_editor_assets_sources.basesource.md)

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:63

___

### search

▸ **search**(`_params`: *any*, `_cursor?`: *any*, `_abortSignal?`: *any*): *Promise*<{ `hasMore`: *boolean* = false; `nextCursor`: *number* = 0; `results`: *any*[] ; `suggestions`: *any*[]  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`_params` | *any* |
`_cursor?` | *any* |
`_abortSignal?` | *any* |

**Returns:** *Promise*<{ `hasMore`: *boolean* = false; `nextCursor`: *number* = 0; `results`: *any*[] ; `suggestions`: *any*[]  }\>

Defined in: [packages/client-core/components/editor/assets/sources/index.tsx:24](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/assets/sources/index.tsx#L24)
