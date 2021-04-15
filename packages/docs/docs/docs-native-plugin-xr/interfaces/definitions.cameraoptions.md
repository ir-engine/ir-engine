---
id: "definitions.cameraoptions"
title: "Interface: CameraOptions"
sidebar_label: "CameraOptions"
custom_edit_url: null
hide_title: true
---

# Interface: CameraOptions

[definitions](../modules/definitions.md).CameraOptions

## Properties

### className

• `Optional` **className**: *string*

Class name to add to the video preview element (applicable to the web platform only)

Defined in: [packages/native-plugin-xr/src/definitions.ts:33](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L33)

___

### disableAudio

• `Optional` **disableAudio**: *boolean*

Defaults to false - Web only - Disables audio stream to prevent permission requests and output switching

Defined in: [packages/native-plugin-xr/src/definitions.ts:57](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L57)

___

### disableExifHeaderStripping

• `Optional` **disableExifHeaderStripping**: *boolean*

Defaults to false - Android Only - Disable automatic rotation of the image, and let the browser deal with it (keep reading on how to achieve it)

Defined in: [packages/native-plugin-xr/src/definitions.ts:53](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L53)

___

### enableHighResolution

• `Optional` **enableHighResolution**: *boolean*

Defaults to false - iOS only - Activate high resolution image capture so that output images are from the highest resolution possible on the device

Defined in: [packages/native-plugin-xr/src/definitions.ts:55](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L55)

___

### height

• `Optional` **height**: *number*

The preview height in pixels, default window.screen.height (applicable to the android and ios platforms only)

Defined in: [packages/native-plugin-xr/src/definitions.ts:37](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L37)

___

### paddingBottom

• `Optional` **paddingBottom**: *number*

The preview bottom padding in pixes. Useful to keep the appropriate preview sizes when orientation changes (applicable to the android and ios platforms only)

Defined in: [packages/native-plugin-xr/src/definitions.ts:45](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L45)

___

### parent

• `Optional` **parent**: *string*

Parent element to attach the video preview element to (applicable to the web platform only)

Defined in: [packages/native-plugin-xr/src/definitions.ts:31](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L31)

___

### position

• `Optional` **position**: *string*

Choose the camera to use 'front' or 'rear', default 'front'

Defined in: [packages/native-plugin-xr/src/definitions.ts:49](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L49)

___

### rotateWhenOrientationChanged

• `Optional` **rotateWhenOrientationChanged**: *boolean*

Rotate preview when orientation changes (applicable to the ios platforms only; default value is true)

Defined in: [packages/native-plugin-xr/src/definitions.ts:47](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L47)

___

### storeToFile

• `Optional` **storeToFile**: *boolean*

Defaults to false - Capture images to a file and return back the file path instead of returning base64 encoded data

Defined in: [packages/native-plugin-xr/src/definitions.ts:51](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L51)

___

### toBack

• `Optional` **toBack**: *boolean*

Brings your html in front of your preview, default false (applicable to the android only)

Defined in: [packages/native-plugin-xr/src/definitions.ts:43](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L43)

___

### width

• `Optional` **width**: *number*

The preview width in pixels, default window.screen.width (applicable to the android and ios platforms only)

Defined in: [packages/native-plugin-xr/src/definitions.ts:35](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L35)

___

### x

• `Optional` **x**: *number*

The x origin, default 0 (applicable to the android and ios platforms only)

Defined in: [packages/native-plugin-xr/src/definitions.ts:39](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L39)

___

### y

• `Optional` **y**: *number*

The y origin, default 0 (applicable to the android and ios platforms only)

Defined in: [packages/native-plugin-xr/src/definitions.ts:41](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/native-plugin-xr/src/definitions.ts#L41)
