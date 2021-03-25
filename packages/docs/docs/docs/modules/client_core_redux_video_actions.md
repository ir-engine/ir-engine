---
id: "client_core_redux_video_actions"
title: "Module: client-core/redux/video/actions"
sidebar_label: "client-core/redux/video/actions"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/video/actions

## Table of contents

### Interfaces

- [Attribution](../interfaces/client_core_redux_video_actions.attribution.md)
- [Image](../interfaces/client_core_redux_video_actions.image.md)
- [PublicVideo](../interfaces/client_core_redux_video_actions.publicvideo.md)
- [PublicVideoState](../interfaces/client_core_redux_video_actions.publicvideostate.md)
- [UploadAction](../interfaces/client_core_redux_video_actions.uploadaction.md)
- [VideoMetaData](../interfaces/client_core_redux_video_actions.videometadata.md)
- [VideosFetchedAction](../interfaces/client_core_redux_video_actions.videosfetchedaction.md)

## Functions

### videosFetchedError

▸ **videosFetchedError**(`err`: *string*): [*VideosFetchedAction*](../interfaces/client_core_redux_video_actions.videosfetchedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`err` | *string* |

**Returns:** [*VideosFetchedAction*](../interfaces/client_core_redux_video_actions.videosfetchedaction.md)

Defined in: [packages/client-core/redux/video/actions.ts:57](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/video/actions.ts#L57)

___

### videosFetchedSuccess

▸ **videosFetchedSuccess**(`videos`: [*PublicVideo*](../interfaces/client_core_redux_video_actions.publicvideo.md)[]): [*VideosFetchedAction*](../interfaces/client_core_redux_video_actions.videosfetchedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`videos` | [*PublicVideo*](../interfaces/client_core_redux_video_actions.publicvideo.md)[] |

**Returns:** [*VideosFetchedAction*](../interfaces/client_core_redux_video_actions.videosfetchedaction.md)

Defined in: [packages/client-core/redux/video/actions.ts:50](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/video/actions.ts#L50)
