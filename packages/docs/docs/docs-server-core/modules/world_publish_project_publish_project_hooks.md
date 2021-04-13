---
id: "world_publish_project_publish_project_hooks"
title: "Module: world/publish-project/publish-project.hooks"
sidebar_label: "world/publish-project/publish-project.hooks"
custom_edit_url: null
hide_title: true
---

# Module: world/publish-project/publish-project.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`after` | *object* |
`after.all` | *any*[] |
`after.create` | (`context`: *HookContext*<any, Service<any\>\>) => *HookContext*<any, Service<any\>\>[] |
`after.find` | *any*[] |
`after.get` | *any*[] |
`after.patch` | *any*[] |
`after.remove` | *any*[] |
`after.update` | *any*[] |
`before` | *object* |
`before.all` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
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
