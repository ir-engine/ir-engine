---
id: "social_group_user_group_user_hooks"
title: "Module: social/group-user/group-user.hooks"
sidebar_label: "social/group-user/group-user.hooks"
custom_edit_url: null
hide_title: true
---

# Module: social/group-user/group-user.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `after` | *object* |
| `after.all` | *any*[] |
| `after.create` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `after.find` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `after.get` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `after.patch` | *any*[] |
| `after.remove` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `after.update` | *any*[] |
| `before` | *object* |
| `before.all` | *Hook*<any, Service<any\>\>[] |
| `before.create` | *Hook*<any, Service<any\>\>[] |
| `before.find` | *IffHook*[] |
| `before.get` | *any*[] |
| `before.patch` | *any*[] |
| `before.remove` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<any\>[] |
| `before.update` | *any*[] |
| `error` | *object* |
| `error.all` | *any*[] |
| `error.create` | *any*[] |
| `error.find` | *any*[] |
| `error.get` | *any*[] |
| `error.patch` | *any*[] |
| `error.remove` | *any*[] |
| `error.update` | *any*[] |
