---
id: "worker_videotexture.videotextureproxy"
title: "Class: VideoTextureProxy"
sidebar_label: "VideoTextureProxy"
custom_edit_url: null
hide_title: true
---

# Class: VideoTextureProxy

[worker/VideoTexture](../modules/worker_videotexture.md).VideoTextureProxy

## Hierarchy

* *CanvasTexture*

  ↳ **VideoTextureProxy**

## Constructors

### constructor

\+ **new VideoTextureProxy**(`videoProxy`: [*VideoDocumentElementProxy*](worker_messagequeue.videodocumentelementproxy.md), `mapping?`: *any*, `wrapS?`: *any*, `wrapT?`: *any*, `magFilter?`: *any*, `minFilter?`: *any*, `type?`: *any*, `anisotropy?`: *number*): [*VideoTextureProxy*](worker_videotexture.videotextureproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`videoProxy` | [*VideoDocumentElementProxy*](worker_messagequeue.videodocumentelementproxy.md) |
`mapping?` | *any* |
`wrapS?` | *any* |
`wrapT?` | *any* |
`magFilter?` | *any* |
`minFilter?` | *any* |
`type?` | *any* |
`anisotropy?` | *number* |

**Returns:** [*VideoTextureProxy*](worker_videotexture.videotextureproxy.md)

Overrides: void

Defined in: [packages/engine/src/worker/VideoTexture.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/VideoTexture.ts#L15)

## Properties

### isVideoTexture

• **isVideoTexture**: *boolean*= true

Defined in: [packages/engine/src/worker/VideoTexture.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/VideoTexture.ts#L14)

___

### videoProxy

• **videoProxy**: [*VideoDocumentElementProxy*](worker_messagequeue.videodocumentelementproxy.md)

Defined in: [packages/engine/src/worker/VideoTexture.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/VideoTexture.ts#L15)

## Methods

### clone

▸ **clone**(): [*VideoTextureProxy*](worker_videotexture.videotextureproxy.md)

**Returns:** [*VideoTextureProxy*](worker_videotexture.videotextureproxy.md)

Defined in: [packages/engine/src/worker/VideoTexture.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/VideoTexture.ts#L55)

___

### update

▸ **update**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/worker/VideoTexture.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/VideoTexture.ts#L59)
