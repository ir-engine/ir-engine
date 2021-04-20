---
id: "media_static_resource_static_resource_hooks"
title: "Module: media/static-resource/static-resource.hooks"
sidebar_label: "media/static-resource/static-resource.hooks"
custom_edit_url: null
hide_title: true
---

# Module: media/static-resource/static-resource.hooks

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
`before.all` | *any*[] |
`before.create` | ((`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\> \| (`context`: *HookContext*<any, Service<any\>\>) => *HookContext*<any, Service<any\>\>)[] |
`before.find` | *Hook*<any, Service<any\>\>[] |
`before.get` | *any*[] |
`before.patch` | *Hook*<any, Service<any\>\>[] |
`before.remove` | *Hook*<any, Service<any\>\>[] |
`before.update` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
`error` | *object* |
`error.all` | *any*[] |
`error.create` | *any*[] |
`error.find` | *any*[] |
`error.get` | *any*[] |
`error.patch` | *any*[] |
`error.remove` | *any*[] |
`error.update` | *any*[] |
