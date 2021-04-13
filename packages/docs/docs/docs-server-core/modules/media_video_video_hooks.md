---
id: "media_video_video_hooks"
title: "Module: media/video/video.hooks"
sidebar_label: "media/video/video.hooks"
custom_edit_url: null
hide_title: true
---

# Module: media/video/video.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`after` | *object* |
`after.all` | *any*[] |
`after.create` | *any*[] |
`after.find` | *any*[] |
`after.get` | *any*[] |
`after.patch` | *any*[] |
`after.remove` | *any*[] |
`after.update` | *any*[] |
`before` | *object* |
`before.all` | ((`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\> \| *IffHook*)[] |
`before.create` | (`context`: *HookContext*<any, Service<any\>\>) => *any*[] |
`before.find` | *Hook*<any, Service<any\>\>[] |
`before.get` | *Hook*<any, Service<any\>\>[] |
`before.patch` | *Hook*<any, Service<any\>\>[] |
`before.remove` | *Hook*<any, Service<any\>\>[] |
`before.update` | *Hook*<any, Service<any\>\>[] |
`error` | *object* |
`error.all` | *any*[] |
`error.create` | *any*[] |
`error.find` | *any*[] |
`error.get` | *any*[] |
`error.patch` | *any*[] |
`error.remove` | *any*[] |
`error.update` | *any*[] |
