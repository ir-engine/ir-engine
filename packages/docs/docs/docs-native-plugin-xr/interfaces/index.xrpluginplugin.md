---
id: "index.xrpluginplugin"
title: "Interface: XRPluginPlugin"
sidebar_label: "XRPluginPlugin"
custom_edit_url: null
hide_title: true
---

# Interface: XRPluginPlugin

[index](../modules/index.md).XRPluginPlugin

## Methods

### createThumbnail

▸ **createThumbnail**(`options`: [*VideoEditorThumbnailProperties*](definitions.videoeditorthumbnailproperties.md)): *Promise*<{ `path`: *string* ; `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*VideoEditorThumbnailProperties*](definitions.videoeditorthumbnailproperties.md) |

**Returns:** *Promise*<{ `path`: *string* ; `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:232](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L232)

___

### deleteVideo

▸ **deleteVideo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:224](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L224)

___

### getRecordingStatus

▸ **getRecordingStatus**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:206](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L206)

___

### getVideoInfo

▸ **getVideoInfo**(`options`: [*VideoEditorVideoInfoDetails*](definitions.videoeditorvideoinfodetails.md)): *Promise*<{ `info`: [*VideoEditorVideoInfoOptions*](definitions.videoeditorvideoinfooptions.md)  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*VideoEditorVideoInfoDetails*](definitions.videoeditorvideoinfodetails.md) |

**Returns:** *Promise*<{ `info`: [*VideoEditorVideoInfoOptions*](definitions.videoeditorvideoinfooptions.md)  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:234](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L234)

___

### handleTap

▸ **handleTap**(): *void*

**Returns:** *void*

Defined in: [packages/native-plugin-xr/src/definitions.ts:193](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L193)

___

### hideVideo

▸ **hideVideo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:216](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L216)

___

### initialize

▸ **initialize**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:188](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L188)

___

### pauseVideo

▸ **pauseVideo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:220](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L220)

___

### playVideo

▸ **playVideo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:218](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L218)

___

### saveRecordingToVideo

▸ **saveRecordingToVideo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:210](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L210)

___

### saveVideoTo

▸ **saveVideoTo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:226](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L226)

___

### scrubTo

▸ **scrubTo**(`positionInTrack`: *number*): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`positionInTrack` | *number* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:222](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L222)

___

### shareMedia

▸ **shareMedia**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:212](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L212)

___

### showVideo

▸ **showVideo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:214](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L214)

___

### start

▸ **start**(`options`: [*CameraOptions*](definitions.cameraoptions.md)): *Promise*<{}\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*CameraOptions*](definitions.cameraoptions.md) |

**Returns:** *Promise*<{}\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:190](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L190)

___

### startRecording

▸ **startRecording**(`isAudio`: *any*, `width`: *number*, `height`: *number*, `bitRate`: *number*, `dpi`: *number*, `filePath`: *string*): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`isAudio` | *any* |
`width` | *number* |
`height` | *number* |
`bitRate` | *number* |
`dpi` | *number* |
`filePath` | *string* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:195](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L195)

___

### stop

▸ **stop**(): *Promise*<{}\>

**Returns:** *Promise*<{}\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:191](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L191)

___

### stopRecording

▸ **stopRecording**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:204](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L204)

___

### takePhoto

▸ **takePhoto**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:208](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L208)

___

### transcodeVideo

▸ **transcodeVideo**(`options`: [*VideoEditorTranscodeProperties*](definitions.videoeditortranscodeproperties.md)): *Promise*<{ `path`: *string* ; `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*VideoEditorTranscodeProperties*](definitions.videoeditortranscodeproperties.md) |

**Returns:** *Promise*<{ `path`: *string* ; `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:228](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L228)

___

### trim

▸ **trim**(`options`: [*VideoEditorTrimProperties*](definitions.videoeditortrimproperties.md)): *Promise*<{ `path`: *string* ; `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*VideoEditorTrimProperties*](definitions.videoeditortrimproperties.md) |

**Returns:** *Promise*<{ `path`: *string* ; `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/definitions.ts:230](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/definitions.ts#L230)
