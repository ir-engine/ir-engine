---
id: "networking_constants_videoconstants"
title: "Module: networking/constants/VideoConstants"
sidebar_label: "networking/constants/VideoConstants"
custom_edit_url: null
hide_title: true
---

# Module: networking/constants/VideoConstants

## Variables

### CAM\_VIDEO\_SIMULCAST\_ENCODINGS

• `Const` **CAM\_VIDEO\_SIMULCAST\_ENCODINGS**: { `maxBitrate`: *number* = 36000; `scaleResolutionDownBy`: *number* = 4 }[]

Encodings for outgoing video.\
Just two resolutions, for now, as chrome 75 seems to ignore more
than two encodings.

Defined in: [packages/engine/src/networking/constants/VideoConstants.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/constants/VideoConstants.ts#L23)

___

### VIDEO\_CONSTRAINTS

• `Const` **VIDEO\_CONSTRAINTS**: *object*

VIDEO_CONSTRAINTS is video quality levels.

#### Type declaration:

Name | Type |
:------ | :------ |
`hd` | *object* |
`hd.height` | *object* |
`hd.height.ideal` | *number* |
`hd.width` | *object* |
`hd.width.ideal` | *number* |
`qvga` | *object* |
`qvga.height` | *object* |
`qvga.height.ideal` | *number* |
`qvga.width` | *object* |
`qvga.width.ideal` | *number* |
`vga` | *object* |
`vga.height` | *object* |
`vga.height.ideal` | *number* |
`vga.width` | *object* |
`vga.width.ideal` | *number* |

Defined in: [packages/engine/src/networking/constants/VideoConstants.ts:2](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/constants/VideoConstants.ts#L2)

___

### localMediaConstraints

• `Const` **localMediaConstraints**: *object*

localMediaConstraints is passed to the getUserMedia object to request a lower video quality than the maximum.

#### Type declaration:

Name | Type |
:------ | :------ |
`audio` | *boolean* |
`video` | *object* |
`video.frameRate` | *object* |
`video.frameRate.max` | *number* |
`video.height` | *object* |
`video.height.ideal` | *number* |
`video.width` | *object* |
`video.width.ideal` | *number* |

Defined in: [packages/engine/src/networking/constants/VideoConstants.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/constants/VideoConstants.ts#L9)
