---
id: "editor_functions_thumbnails"
title: "Module: editor/functions/thumbnails"
sidebar_label: "editor/functions/thumbnails"
custom_edit_url: null
hide_title: true
---

# Module: editor/functions/thumbnails

## Functions

### generateImageFileThumbnail

▸ **generateImageFileThumbnail**(`file?`: *any*, `width?`: *any*, `height?`: *any*, `crop?`: *any*, `background?`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`file?` | *any* |
`width?` | *any* |
`height?` | *any* |
`crop?` | *any* |
`background?` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/engine/src/editor/functions/thumbnails.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/functions/thumbnails.ts#L21)

___

### generateMediaThumbnail

▸ **generateMediaThumbnail**(`el?`: *any*, `width?`: *number*, `height?`: *number*, `background?`: *string*): *Promise*<any\>

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`el?` | *any* | - |
`width` | *number* | 256 |
`height` | *number* | 256 |
`background` | *string* | "#000" |

**Returns:** *Promise*<any\>

Defined in: [packages/engine/src/editor/functions/thumbnails.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/functions/thumbnails.ts#L59)

___

### generateVideoFileThumbnail

▸ **generateVideoFileThumbnail**(`file?`: *any*, `width?`: *any*, `height?`: *any*, `background?`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`file?` | *any* |
`width?` | *any* |
`height?` | *any* |
`background?` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/engine/src/editor/functions/thumbnails.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/functions/thumbnails.ts#L38)

___

### getCanvasBlob

▸ **getCanvasBlob**(`canvas`: *any*, `fileType?`: *string*, `quality?`: *number*): *Promise*<any\>

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`canvas` | *any* | - |
`fileType` | *string* | "image/jpeg" |
`quality` | *number* | 0.9 |

**Returns:** *Promise*<any\>

Defined in: [packages/engine/src/editor/functions/thumbnails.ts:86](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/functions/thumbnails.ts#L86)
