---
id: "definitions.videoeditortranscodeproperties"
title: "Interface: VideoEditorTranscodeProperties"
sidebar_label: "VideoEditorTranscodeProperties"
custom_edit_url: null
hide_title: true
---

# Interface: VideoEditorTranscodeProperties

[definitions](../modules/definitions.md).VideoEditorTranscodeProperties

Transcode options that are required to reencode or change the coding of the video.

## Properties

### audioBitrate

• `Optional` **audioBitrate**: *number*

Sample rate for the audio. iOS only. Defaults to 4410.

Defined in: [packages/native-plugin-xr/src/definitions.ts:128](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L128)

___

### audioChannels

• `Optional` **audioChannels**: *number*

Number of audio channels. iOS only. Defaults to 2.

Defined in: [packages/native-plugin-xr/src/definitions.ts:126](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L126)

___

### deleteInputFile

• `Optional` **deleteInputFile**: *boolean*

Not supported in windows, delete the orginal video

Defined in: [packages/native-plugin-xr/src/definitions.ts:114](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L114)

___

### duration

• `Optional` **duration**: *number*

Not supported in windows, the duration in seconds from the start of the video

Defined in: [packages/native-plugin-xr/src/definitions.ts:110](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L110)

___

### fileUri

• **fileUri**: *string*

A well-known location where the editable video lives.

Defined in: [packages/native-plugin-xr/src/definitions.ts:100](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L100)

___

### fps

• `Optional` **fps**: *number*

Frames per second of the result. Android only. Defaults to 24.

Defined in: [packages/native-plugin-xr/src/definitions.ts:124](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L124)

___

### height

• `Optional` **height**: *number*

Height of the result

Defined in: [packages/native-plugin-xr/src/definitions.ts:120](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L120)

___

### maintainAspectRatio

• `Optional` **maintainAspectRatio**: *boolean*

iOS only. Defaults to true

Defined in: [packages/native-plugin-xr/src/definitions.ts:116](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L116)

___

### optimizeForNetworkUse

• **optimizeForNetworkUse**: VideoEditorOptimizeForNetworkUse

Should the video be processed with quailty or speed in mind

Defined in: [packages/native-plugin-xr/src/definitions.ts:108](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L108)

___

### outputFileName

• **outputFileName**: *string*

A string that indicates what type of field this is, home for example.

Defined in: [packages/native-plugin-xr/src/definitions.ts:102](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L102)

___

### outputFileType

• **outputFileType**: VideoEditorOutputFileType

Instructions on how to encode the video.

Defined in: [packages/native-plugin-xr/src/definitions.ts:106](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L106)

___

### progress

• `Optional` **progress**: (`info`: *any*) => *void*

Not supported in windows, progress on the transcode

#### Type declaration:

▸ (`info`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`info` | *any* |

**Returns:** *void*

Defined in: [packages/native-plugin-xr/src/definitions.ts:130](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L130)

Defined in: [packages/native-plugin-xr/src/definitions.ts:130](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L130)

___

### quality

• **quality**: VideoEditorQuality

The quality of the result.

Defined in: [packages/native-plugin-xr/src/definitions.ts:104](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L104)

___

### saveToLibrary

• `Optional` **saveToLibrary**: *boolean*

Not supported in windows, save into the device library

Defined in: [packages/native-plugin-xr/src/definitions.ts:112](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L112)

___

### videoBitrate

• `Optional` **videoBitrate**: *number*

Bitrate in bits. Defaults to 1 megabit (1000000).

Defined in: [packages/native-plugin-xr/src/definitions.ts:122](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L122)

___

### width

• `Optional` **width**: *number*

Width of the result

Defined in: [packages/native-plugin-xr/src/definitions.ts:118](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/native-plugin-xr/src/definitions.ts#L118)
