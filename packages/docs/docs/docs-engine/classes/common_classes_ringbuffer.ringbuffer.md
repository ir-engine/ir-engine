---
id: "common_classes_ringbuffer.ringbuffer"
title: "Class: RingBuffer<T>"
sidebar_label: "RingBuffer"
custom_edit_url: null
hide_title: true
---

# Class: RingBuffer<T\>

[common/classes/RingBuffer](../modules/common_classes_ringbuffer.md).RingBuffer

Ring buffer holds data in circular form.\
Data will be inserted in linear fashion and when the buffer reaches its maximum size then
newly entered data will be overwrite first element(s).

```
// Below will create ring buffer with 4 elements and sets size of the buffer to 4.
const buffer = RingBuffer.fromArray([1, 2, 3, 4]);

// Adding new elements will overweight element(s) in FIFO manner.
buffer.add(5, 6); // now buffer contains [5, 6, 3, 4]
```

## Type parameters

Name | Description |
:------ | :------ |
`T` | Type of the data.    |

## Constructors

### constructor

\+ **new RingBuffer**<T\>(`size`: *number*): [*RingBuffer*](common_classes_ringbuffer.ringbuffer.md)<T\>

Constructs ring buffer of given size

#### Type parameters:

Name |
:------ |
`T` |

#### Parameters:

Name | Type |
:------ | :------ |
`size` | *number* |

**Returns:** [*RingBuffer*](common_classes_ringbuffer.ringbuffer.md)<T\>

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L55)

## Properties

### buffer

• `Private` **buffer**: T[]

Buffer to hold element(s).

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L29)

___

### pos

• `Private` **pos**: *number*= 0

Current position on the ring buffer.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L33)

___

### size

• `Private` **size**: *number*

Maximum number of elements this buffer can contain.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L31)

## Methods

### add

▸ **add**(...`items`: T[]): *void*

Add element(s) into the ring buffer.\
If overflow happens then element(s) will be overwritten by FIFO manner.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`...items` | T[] | list of element(s) to be inserted.    |

**Returns:** *void*

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:85](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L85)

___

### clear

▸ **clear**(): *void*

Clear the ring buffer.

**Returns:** *void*

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L196)

___

### clone

▸ **clone**(): [*RingBuffer*](common_classes_ringbuffer.ringbuffer.md)<T\>

Create new ring buffer and copy elements from this ring buffer.

**Returns:** [*RingBuffer*](common_classes_ringbuffer.ringbuffer.md)<T\>

Newly created ring buffer.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L51)

___

### copy

▸ **copy**(): [*RingBuffer*](common_classes_ringbuffer.ringbuffer.md)<T\>

Create new ring buffer and copy elements from this ring buffer.

**Returns:** [*RingBuffer*](common_classes_ringbuffer.ringbuffer.md)<T\>

Newly created ring buffer.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L40)

___

### empty

▸ **empty**(): *boolean*

**Returns:** *boolean*

Whether the buffer is empty or not.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:227](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L227)

___

### fromArray

▸ **fromArray**(`data`: T[], `resize?`: *boolean*): *void*

Fill up the ring buffer with array elements.\
If array contains more element than size of ring buffer then excess elements will not be included in array.
To include every elements set **```resize```** to **```true```**.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`data` | T[] | - | Array containing elements.   |
`resize` | *boolean* | false | Whether resize current ring buffer.    |

**Returns:** *void*

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:182](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L182)

___

### full

▸ **full**(): *boolean*

**Returns:** *boolean*

Whether the buffer is full or not.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:222](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L222)

___

### get

▸ **get**(`index`: *number*): T

Get element at given index from ring buffer.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`index` | *number* | Index of the element which will be retrieved.   |

**Returns:** T

Element in the given index or undefined if not found.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:97](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L97)

___

### getBufferLength

▸ **getBufferLength**(): *number*

**Returns:** *number*

count of elements in the ring buffer.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L76)

___

### getFirst

▸ **getFirst**(): T

Get first element from the ring buffer.

**Returns:** T

First element of ring buffer.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:117](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L117)

___

### getLast

▸ **getLast**(): T

Get last element from the ring buffer.

**Returns:** T

Last element of ring buffer.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:125](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L125)

___

### getPos

▸ **getPos**(): *number*

**Returns:** *number*

current position on the ring buffer.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L71)

___

### getSize

▸ **getSize**(): *number*

**Returns:** *number*

size of the ring buffer.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:66](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L66)

___

### pop

▸ **pop**(): T

Remove and return element from current position.

**Returns:** T

Removed element from current position.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:154](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L154)

___

### popLast

▸ **popLast**(): T

Remove and return last element from ring buffer.

**Returns:** T

last element from ring buffer.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:162](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L162)

___

### remove

▸ **remove**(`index`: *number*, `count?`: *number*): T[]

Remove element(s) from the ring buffer.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`index` | *number* | - | Index From which element(s) will be removed.   |
`count` | *number* | 1 | Number of element(s) to be removed.   |

**Returns:** T[]

Array of removed element(s).

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L135)

___

### resize

▸ **resize**(`newSize`: *number*): *void*

Resize ring buffer with given size.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`newSize` | *number* | new size of the buffer.    |

**Returns:** *void*

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:205](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L205)

___

### toArray

▸ **toArray**(): T[]

Generates array from ring buffer.

**Returns:** T[]

generated array containing ring buffer elements.

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:171](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L171)

___

### fromArray

▸ `Static`**fromArray**<T\>(`data`: T[], `size?`: *number*): [*RingBuffer*](common_classes_ringbuffer.ringbuffer.md)<T\>

Create ring buffer from array.

#### Type parameters:

Name |
:------ |
`T` |

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`data` | T[] | - | Array of element(s).   |
`size` | *number* | 0 | Size of ring array.    |

**Returns:** [*RingBuffer*](common_classes_ringbuffer.ringbuffer.md)<T\>

Defined in: [packages/engine/src/common/classes/RingBuffer.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/RingBuffer.ts#L22)
