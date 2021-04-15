---
id: "media_video_video_class.video"
title: "Class: Video"
sidebar_label: "Video"
custom_edit_url: null
hide_title: true
---

# Class: Video

[media/video/video.class](../modules/media_video_video_class.md).Video

A class for Video service

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new Video**(`options?`: ServiceOptions, `app`: Application): [*Video*](media_video_video_class.video.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`options` | ServiceOptions | {} |
`app` | Application | - |

**Returns:** [*Video*](media_video_video_class.video.md)

Defined in: [packages/server-core/src/media/video/video.class.ts:16](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/video/video.class.ts#L16)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/media/video/video.class.ts:15](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/video/video.class.ts#L15)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/media/video/video.class.ts:16](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/video/video.class.ts#L16)

## Methods

### create

▸ **create**(`data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.create

Defined in: [packages/server-core/src/media/video/video.class.ts:33](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/video/video.class.ts#L33)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

Implementation of: ServiceMethods.find

Defined in: [packages/server-core/src/media/video/video.class.ts:23](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/video/video.class.ts#L23)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.get

Defined in: [packages/server-core/src/media/video/video.class.ts:27](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/video/video.class.ts#L27)

___

### patch

▸ **patch**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.patch

Defined in: [packages/server-core/src/media/video/video.class.ts:48](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/video/video.class.ts#L48)

___

### remove

▸ **remove**(`id`: NullableId, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.remove

Defined in: [packages/server-core/src/media/video/video.class.ts:52](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/video/video.class.ts#L52)

___

### update

▸ **update**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.update

Defined in: [packages/server-core/src/media/video/video.class.ts:44](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/video/video.class.ts#L44)
