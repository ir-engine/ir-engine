---
id: "social_invite_invite_hooks"
title: "Module: social/invite/invite.hooks"
sidebar_label: "social/invite/invite.hooks"
custom_edit_url: null
hide_title: true
---

# Module: social/invite/invite.hooks

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
| `after.get` | *any*[] |
| `after.patch` | *any*[] |
| `after.remove` | *any*[] |
| `after.update` | *any*[] |
| `before` | *object* |
| `before.all` | *Hook*<any, Service<any\>\>[] |
| `before.create` | (`context`: *HookContext*<any, Service<any\>\>) => *any*[] |
| `before.find` | (`context`: *HookContext*<any, Service<any\>\>) => *any*[] |
| `before.get` | *IffHook*[] |
| `before.patch` | *Hook*<any, Service<any\>\>[] |
| `before.remove` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `before.update` | *Hook*<any, Service<any\>\>[] |
| `error` | *object* |
| `error.all` | *any*[] |
| `error.create` | *any*[] |
| `error.find` | *any*[] |
| `error.get` | *any*[] |
| `error.patch` | *any*[] |
| `error.remove` | *any*[] |
| `error.update` | *any*[] |
