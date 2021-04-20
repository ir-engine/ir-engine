---
id: "social_group_group_hooks"
title: "Module: social/group/group.hooks"
sidebar_label: "social/group/group.hooks"
custom_edit_url: null
hide_title: true
---

# Module: social/group/group.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`after` | *object* |
`after.all` | *any*[] |
`after.create` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
`after.find` | *any*[] |
`after.get` | *any*[] |
`after.patch` | *any*[] |
`after.remove` | *any*[] |
`after.update` | *any*[] |
`before` | *object* |
`before.all` | *Hook*<any, Service<any\>\>[] |
`before.create` | *any*[] |
`before.find` | *any*[] |
`before.get` | *any*[] |
`before.patch` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<any\>[] |
`before.remove` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<any\>[] |
`before.update` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<any\>[] |
`error` | *object* |
`error.all` | *any*[] |
`error.create` | *any*[] |
`error.find` | *any*[] |
`error.get` | *any*[] |
`error.patch` | *any*[] |
`error.remove` | *any*[] |
`error.update` | *any*[] |
