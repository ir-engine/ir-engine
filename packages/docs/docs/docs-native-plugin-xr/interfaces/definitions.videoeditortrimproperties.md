---
id: "definitions.videoeditortrimproperties"
title: "Interface: VideoEditorTrimProperties"
sidebar_label: "VideoEditorTrimProperties"
custom_edit_url: null
hide_title: true
---

# Interface: VideoEditorTrimProperties

[definitions](../modules/definitions.md).VideoEditorTrimProperties

Trim options that are required to locate, reduce start/ end and save the video.

## Properties

### fileUri

• **fileUri**: *string*

A well-known location where the editable video lives.

Defined in: [packages/native-plugin-xr/src/definitions.ts:138](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L138)

___

### outputFileName

• **outputFileName**: *string*

A string that indicates what type of field this is, home for example.

Defined in: [packages/native-plugin-xr/src/definitions.ts:144](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L144)

___

### progress

• `Optional` **progress**: (`info`: *any*) => *void*

Progress on transcode.

#### Type declaration:

▸ (`info`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`info` | *any* |

**Returns:** *void*

Defined in: [packages/native-plugin-xr/src/definitions.ts:146](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L146)

Defined in: [packages/native-plugin-xr/src/definitions.ts:146](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L146)

___

### trimEnd

• **trimEnd**: *number*

A number of seconds to trim the front of the video.

Defined in: [packages/native-plugin-xr/src/definitions.ts:142](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L142)

___

### trimStart

• **trimStart**: *number*

A number of seconds to trim the front of the video.

Defined in: [packages/native-plugin-xr/src/definitions.ts:140](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L140)
