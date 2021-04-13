---
id: "renderer_postprocessing_core_selection.selection"
title: "Class: Selection"
sidebar_label: "Selection"
custom_edit_url: null
hide_title: true
---

# Class: Selection

[renderer/postprocessing/core/Selection](../modules/renderer_postprocessing_core_selection.md).Selection

An object selection.

Object selections use render layers to facilitate quick and efficient
visibility changes.

## Hierarchy

* *Set*

  ↳ **Selection**

## Constructors

### constructor

\+ **new Selection**(`iterable?`: *any*, `layer?`: *number*): [*Selection*](renderer_postprocessing_core_selection.selection.md)

Constructs a new selection.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`iterable?` | *any* | - |
`layer` | *number* | 10 |

**Returns:** [*Selection*](renderer_postprocessing_core_selection.selection.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/core/Selection.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Selection.ts#L9)

## Properties

### [Symbol.species]

• `Readonly` **[Symbol.species]**: SetConstructor

Defined in: node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:320

___

### [Symbol.toStringTag]

• `Readonly` **[Symbol.toStringTag]**: *string*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:143

___

### currentLayer

• **currentLayer**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/core/Selection.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Selection.ts#L9)

___

### size

• `Readonly` **size**: *number*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.es2015.collection.d.ts:64

## Accessors

### layer

• get **layer**(): *number*

A dedicated render layer for selected objects.

This layer is set to 10 by default. If this collides with your own custom
layers, please change it to a free layer before rendering!

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/core/Selection.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Selection.ts#L43)

• set **layer**(`value`: *number*): *void*

Sets the render layer of selected objects.

The current selection will be updated accordingly.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/Selection.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Selection.ts#L55)

## Methods

### [Symbol.iterator]

▸ **[Symbol.iterator]**(): *IterableIterator*<any\>

Iterates over values in the set.

**Returns:** *IterableIterator*<any\>

Inherited from: void

Defined in: node_modules/typescript/lib/lib.es2015.iterable.d.ts:171

___

### add

▸ **add**(`object`: *any*): [*Selection*](renderer_postprocessing_core_selection.selection.md)

Adds an object to this selection.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`object` | *any* | The object that should be selected.   |

**Returns:** [*Selection*](renderer_postprocessing_core_selection.selection.md)

This selection.

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/core/Selection.ts:118](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Selection.ts#L118)

___

### clear

▸ **clear**(): *void*

Clears this selection.

**Returns:** *void*

This selection.

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/core/Selection.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Selection.ts#L72)

___

### delete

▸ **delete**(`object`: *any*): *boolean*

Removes an object from this selection.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`object` | *any* | The object that should be deselected.   |

**Returns:** *boolean*

Returns true if an object has successfully been removed from this selection; otherwise false.

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/core/Selection.ts:132](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Selection.ts#L132)

___

### entries

▸ **entries**(): *IterableIterator*<[*any*, *any*]\>

Returns an iterable of [v,v] pairs for every value `v` in the set.

**Returns:** *IterableIterator*<[*any*, *any*]\>

Inherited from: void

Defined in: node_modules/typescript/lib/lib.es2015.iterable.d.ts:175

___

### forEach

▸ **forEach**(`callbackfn`: (`value`: *any*, `value2`: *any*, `set`: *Set*<any\>) => *void*, `thisArg?`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`callbackfn` | (`value`: *any*, `value2`: *any*, `set`: *Set*<any\>) => *void* |
`thisArg?` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.es2015.collection.d.ts:62

___

### has

▸ **has**(`value`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *boolean*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.es2015.collection.d.ts:63

___

### indexOf

▸ **indexOf**(`object`: *any*): *0* \| *-1*

An alias for [has](renderer_postprocessing_core_selection.selection.md#has).

**`deprecated`** Added for backward compatibility. Use has instead.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`object` | *any* | An object.   |

**Returns:** *0* \| *-1*

Returns 0 if the given object is currently selected, or -1 otherwise.

Defined in: [packages/engine/src/renderer/postprocessing/core/Selection.ts:107](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Selection.ts#L107)

___

### keys

▸ **keys**(): *IterableIterator*<any\>

Despite its name, returns an iterable of the values in the set.

**Returns:** *IterableIterator*<any\>

Inherited from: void

Defined in: node_modules/typescript/lib/lib.es2015.iterable.d.ts:179

___

### set

▸ **set**(`objects`: *any*): [*Selection*](renderer_postprocessing_core_selection.selection.md)

Clears this selection and adds the given objects.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`objects` | *any* | The objects that should be selected. This array will be copied.   |

**Returns:** [*Selection*](renderer_postprocessing_core_selection.selection.md)

This selection.

Defined in: [packages/engine/src/renderer/postprocessing/core/Selection.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Selection.ts#L89)

___

### setVisible

▸ **setVisible**(`visible`: *any*): [*Selection*](renderer_postprocessing_core_selection.selection.md)

Sets the visibility of all selected objects.

This method enables or disables render layer 0 of all selected objects.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`visible` | *any* | Whether the selected objects should be visible.   |

**Returns:** [*Selection*](renderer_postprocessing_core_selection.selection.md)

This selection.

Defined in: [packages/engine/src/renderer/postprocessing/core/Selection.ts:149](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Selection.ts#L149)

___

### values

▸ **values**(): *IterableIterator*<any\>

Returns an iterable of values in the set.

**Returns:** *IterableIterator*<any\>

Inherited from: void

Defined in: node_modules/typescript/lib/lib.es2015.iterable.d.ts:184
