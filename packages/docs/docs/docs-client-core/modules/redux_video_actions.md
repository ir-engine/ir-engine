---
id: "redux_video_actions"
title: "Module: redux/video/actions"
sidebar_label: "redux/video/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/video/actions

## Table of contents

### Interfaces

- [Attribution](../interfaces/redux_video_actions.attribution.md)
- [Image](../interfaces/redux_video_actions.image.md)
- [PublicVideo](../interfaces/redux_video_actions.publicvideo.md)
- [PublicVideoState](../interfaces/redux_video_actions.publicvideostate.md)
- [UploadAction](../interfaces/redux_video_actions.uploadaction.md)
- [VideoMetaData](../interfaces/redux_video_actions.videometadata.md)
- [VideosFetchedAction](../interfaces/redux_video_actions.videosfetchedaction.md)

## Functions

### videosFetchedError

▸ **videosFetchedError**(`err`: *string*): [*VideosFetchedAction*](../interfaces/redux_video_actions.videosfetchedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`err` | *string* |

**Returns:** [*VideosFetchedAction*](../interfaces/redux_video_actions.videosfetchedaction.md)

Defined in: [packages/client-core/redux/video/actions.ts:57](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/video/actions.ts#L57)

___

### videosFetchedSuccess

▸ **videosFetchedSuccess**(`videos`: [*PublicVideo*](../interfaces/redux_video_actions.publicvideo.md)[]): [*VideosFetchedAction*](../interfaces/redux_video_actions.videosfetchedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`videos` | [*PublicVideo*](../interfaces/redux_video_actions.publicvideo.md)[] |

**Returns:** [*VideosFetchedAction*](../interfaces/redux_video_actions.videosfetchedaction.md)

Defined in: [packages/client-core/redux/video/actions.ts:50](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/video/actions.ts#L50)
