---
id: "renderer_postprocessing_images_rawimagedata.rawimagedata"
title: "Class: RawImageData"
sidebar_label: "RawImageData"
custom_edit_url: null
hide_title: true
---

# Class: RawImageData

[renderer/postprocessing/images/RawImageData](../modules/renderer_postprocessing_images_rawimagedata.md).RawImageData

A container for raw image data.

## Constructors

### constructor

\+ **new RawImageData**(`width?`: *number*, `height?`: *number*, `data?`: *any*): [*RawImageData*](renderer_postprocessing_images_rawimagedata.rawimagedata.md)

Constructs a new image data container.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`width` | *number* | 0 |
`height` | *number* | 0 |
`data` | *any* | null |

**Returns:** [*RawImageData*](renderer_postprocessing_images_rawimagedata.rawimagedata.md)

Defined in: [packages/engine/src/renderer/postprocessing/images/RawImageData.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/images/RawImageData.ts#L33)

## Properties

### data

• **data**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/images/RawImageData.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/images/RawImageData.ts#L33)

___

### height

• **height**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/images/RawImageData.ts:32](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/images/RawImageData.ts#L32)

___

### width

• **width**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/images/RawImageData.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/images/RawImageData.ts#L31)

## Methods

### toCanvas

▸ **toCanvas**(): OffscreenCanvas

Creates a canvas from this image data.

**Returns:** OffscreenCanvas

The canvas or null if it couldn't be created.

Defined in: [packages/engine/src/renderer/postprocessing/images/RawImageData.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/images/RawImageData.ts#L74)

___

### from

▸ `Static`**from**(`data`: *any*): [*RawImageData*](renderer_postprocessing_images_rawimagedata.rawimagedata.md)

Creates a new image data container.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`data` | *any* | Raw image data.   |

**Returns:** [*RawImageData*](renderer_postprocessing_images_rawimagedata.rawimagedata.md)

The image data.

Defined in: [packages/engine/src/renderer/postprocessing/images/RawImageData.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/images/RawImageData.ts#L89)
