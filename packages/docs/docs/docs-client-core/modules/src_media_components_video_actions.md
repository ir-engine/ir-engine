---
id: "src_media_components_video_actions"
title: "Module: src/media/components/video/actions"
sidebar_label: "src/media/components/video/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/media/components/video/actions

## Table of contents

### Interfaces

- [Image](../interfaces/src_media_components_video_actions.image.md)
- [PublicVideo](../interfaces/src_media_components_video_actions.publicvideo.md)
- [PublicVideoState](../interfaces/src_media_components_video_actions.publicvideostate.md)
- [UploadAction](../interfaces/src_media_components_video_actions.uploadaction.md)
- [VideoMetaData](../interfaces/src_media_components_video_actions.videometadata.md)
- [VideosFetchedAction](../interfaces/src_media_components_video_actions.videosfetchedaction.md)

## Functions

### videosFetchedError

▸ **videosFetchedError**(`err`: *string*): [*VideosFetchedAction*](../interfaces/src_media_components_video_actions.videosfetchedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `err` | *string* |

**Returns:** [*VideosFetchedAction*](../interfaces/src_media_components_video_actions.videosfetchedaction.md)

Defined in: [packages/client-core/src/media/components/video/actions.ts:49](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/media/components/video/actions.ts#L49)

___

### videosFetchedSuccess

▸ **videosFetchedSuccess**(`videos`: [*PublicVideo*](../interfaces/src_media_components_video_actions.publicvideo.md)[]): [*VideosFetchedAction*](../interfaces/src_media_components_video_actions.videosfetchedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `videos` | [*PublicVideo*](../interfaces/src_media_components_video_actions.publicvideo.md)[] |

**Returns:** [*VideosFetchedAction*](../interfaces/src_media_components_video_actions.videosfetchedaction.md)

Defined in: [packages/client-core/src/media/components/video/actions.ts:42](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/media/components/video/actions.ts#L42)
