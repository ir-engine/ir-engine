---
id: "index.xrpluginweb"
title: "Class: XRPluginWeb"
sidebar_label: "XRPluginWeb"
custom_edit_url: null
hide_title: true
---

# Class: XRPluginWeb

[index](../modules/index.md).XRPluginWeb

## Hierarchy

* *WebPlugin*

  ↳ **XRPluginWeb**

## Implements

* [*XRPluginPlugin*](../interfaces/definitions.xrpluginplugin.md)

## Constructors

### constructor

\+ **new XRPluginWeb**(): [*XRPluginWeb*](web.xrpluginweb.md)

**Returns:** [*XRPluginWeb*](web.xrpluginweb.md)

Overrides: void

Defined in: [packages/native-plugin-xr/src/web.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L4)

## Properties

### config

• **config**: WebPluginConfig

Inherited from: void

Defined in: node_modules/@capacitor/core/dist/esm/web/index.d.ts:36

___

### listeners

• **listeners**: *object*

#### Type declaration:

Inherited from: void

Defined in: node_modules/@capacitor/core/dist/esm/web/index.d.ts:38

___

### loaded

• **loaded**: *boolean*

Inherited from: void

Defined in: node_modules/@capacitor/core/dist/esm/web/index.d.ts:37

___

### windowListeners

• **windowListeners**: *object*

#### Type declaration:

Inherited from: void

Defined in: node_modules/@capacitor/core/dist/esm/web/index.d.ts:41

## Methods

### addListener

▸ **addListener**(`eventName`: *string*, `listenerFunc`: ListenerCallback): PluginListenerHandle

#### Parameters:

Name | Type |
:------ | :------ |
`eventName` | *string* |
`listenerFunc` | ListenerCallback |

**Returns:** PluginListenerHandle

Inherited from: void

Defined in: node_modules/@capacitor/core/dist/esm/web/index.d.ts:47

___

### createThumbnail

▸ **createThumbnail**(`options`: [*VideoEditorThumbnailProperties*](../interfaces/definitions.videoeditorthumbnailproperties.md)): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*VideoEditorThumbnailProperties*](../interfaces/definitions.videoeditorthumbnailproperties.md) |

**Returns:** *Promise*<any\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:86](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L86)

___

### deleteVideo

▸ **deleteVideo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:211](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L211)

___

### execFFMPEG

▸ **execFFMPEG**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/web.ts:104](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L104)

___

### execFFPROBE

▸ **execFFPROBE**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Defined in: [packages/native-plugin-xr/src/web.ts:111](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L111)

___

### getRecordingStatus

▸ **getRecordingStatus**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:146](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L146)

___

### getVideoInfo

▸ **getVideoInfo**(): *Promise*<any\>

**Returns:** *Promise*<any\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L98)

___

### getXRDataForFrame

▸ **getXRDataForFrame**(`options`: {}): *Promise*<{ `data`: [*XRFrameData*](../interfaces/definitions.xrframedata.md)  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `data`: [*XRFrameData*](../interfaces/definitions.xrframedata.md)  }\>

Defined in: [packages/native-plugin-xr/src/web.ts:118](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L118)

___

### handleTap

▸ **handleTap**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:60](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L60)

___

### hasListeners

▸ **hasListeners**(`eventName`: *string*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`eventName` | *string* |

**Returns:** *boolean*

Inherited from: void

Defined in: node_modules/@capacitor/core/dist/esm/web/index.d.ts:51

___

### hideVideo

▸ **hideVideo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:183](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L183)

___

### initialize

▸ **initialize**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L12)

___

### load

▸ **load**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@capacitor/core/dist/esm/web/index.d.ts:54

___

### notifyListeners

▸ **notifyListeners**(`eventName`: *string*, `data`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`eventName` | *string* |
`data` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@capacitor/core/dist/esm/web/index.d.ts:50

___

### pauseVideo

▸ **pauseVideo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:197](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L197)

___

### playVideo

▸ **playVideo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:190](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L190)

___

### registerWindowListener

▸ **registerWindowListener**(`windowEventName`: *string*, `pluginEventName`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`windowEventName` | *string* |
`pluginEventName` | *string* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@capacitor/core/dist/esm/web/index.d.ts:52

___

### removeAllListeners

▸ **removeAllListeners**(): *void*

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@capacitor/core/dist/esm/web/index.d.ts:49

___

### requestPermissions

▸ **requestPermissions**(): *Promise*<PermissionsRequestResult\>

**Returns:** *Promise*<PermissionsRequestResult\>

Inherited from: void

Defined in: node_modules/@capacitor/core/dist/esm/web/index.d.ts:53

___

### saveRecordingToVideo

▸ **saveRecordingToVideo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:161](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L161)

___

### saveVideoTo

▸ **saveVideoTo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:219](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L219)

___

### scrubTo

▸ **scrubTo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:204](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L204)

___

### shareMedia

▸ **shareMedia**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:168](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L168)

___

### showVideo

▸ **showVideo**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:176](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L176)

___

### start

▸ **start**(`options`: [*CameraOptions*](../interfaces/definitions.cameraoptions.md)): *Promise*<{}\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*CameraOptions*](../interfaces/definitions.cameraoptions.md) |

**Returns:** *Promise*<{}\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L19)

___

### startRecording

▸ **startRecording**(`isAudio?`: *any*, `width?`: *number*, `height?`: *number*, `bitRate?`: *number*, `dpi?`: *number*, `filePath?`: *string*): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`isAudio?` | *any* |
`width?` | *number* |
`height?` | *number* |
`bitRate?` | *number* |
`dpi?` | *number* |
`filePath?` | *string* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:125](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L125)

___

### stop

▸ **stop**(): *Promise*<any\>

**Returns:** *Promise*<any\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:64](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L64)

___

### stopRecording

▸ **stopRecording**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:139](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L139)

___

### takePhoto

▸ **takePhoto**(`options`: {}): *Promise*<{ `status`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |

**Returns:** *Promise*<{ `status`: *string*  }\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:153](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L153)

___

### transcodeVideo

▸ **transcodeVideo**(`options`: [*VideoEditorTranscodeProperties*](../interfaces/definitions.videoeditortranscodeproperties.md)): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*VideoEditorTranscodeProperties*](../interfaces/definitions.videoeditortranscodeproperties.md) |

**Returns:** *Promise*<any\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:80](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L80)

___

### trim

▸ **trim**(`options`: [*VideoEditorTrimProperties*](../interfaces/definitions.videoeditortrimproperties.md)): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*VideoEditorTrimProperties*](../interfaces/definitions.videoeditortrimproperties.md) |

**Returns:** *Promise*<any\>

Implementation of: [XRPluginPlugin](../interfaces/definitions.xrpluginplugin.md)

Defined in: [packages/native-plugin-xr/src/web.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/native-plugin-xr/src/web.ts#L92)
