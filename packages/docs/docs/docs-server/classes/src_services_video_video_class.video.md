---
id: "src_services_video_video_class.video"
title: "Class: Video"
sidebar_label: "Video"
custom_edit_url: null
hide_title: true
---

# Class: Video

[src/services/video/video.class](../modules/src_services_video_video_class.md).Video

A class for Video service

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new Video**(`options?`: ServiceOptions, `app`: [*Application*](../modules/src_declarations.md#application)): [*Video*](src_services_video_video_class.video.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | ServiceOptions |
`app` | [*Application*](../modules/src_declarations.md#application) |

**Returns:** [*Video*](src_services_video_video_class.video.md)

Defined in: [packages/server/src/services/video/video.class.ts:16](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/video/video.class.ts#L16)

## Properties

### app

• **app**: [*Application*](../modules/src_declarations.md#application)

Defined in: [packages/server/src/services/video/video.class.ts:15](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/video/video.class.ts#L15)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server/src/services/video/video.class.ts:16](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/video/video.class.ts#L16)

## Methods

### create

▸ **create**(`data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server/src/services/video/video.class.ts:33](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/video/video.class.ts#L33)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

Implementation of: void

Defined in: [packages/server/src/services/video/video.class.ts:23](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/video/video.class.ts#L23)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server/src/services/video/video.class.ts:27](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/video/video.class.ts#L27)

___

### patch

▸ **patch**(`id`: Id, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server/src/services/video/video.class.ts:48](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/video/video.class.ts#L48)

___

### remove

▸ **remove**(`id`: Id, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server/src/services/video/video.class.ts:52](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/video/video.class.ts#L52)

___

### update

▸ **update**(`id`: Id, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server/src/services/video/video.class.ts:44](https://github.com/xr3ngine/xr3ngine/blob/7650c2bea/packages/server/src/services/video/video.class.ts#L44)
