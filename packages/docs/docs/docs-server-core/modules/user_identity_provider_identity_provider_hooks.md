---
id: "user_identity_provider_identity_provider_hooks"
title: "Module: user/identity-provider/identity-provider.hooks"
sidebar_label: "user/identity-provider/identity-provider.hooks"
custom_edit_url: null
hide_title: true
---

# Module: user/identity-provider/identity-provider.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `after` | *object* |
| `after.all` | (`context`: *HookContext*<any, Service<any\>\>) => *HookContext*<any, Service<any\>\>[] |
| `after.create` | (`context`: *any*) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `after.find` | *any*[] |
| `after.get` | *any*[] |
| `after.patch` | *IffHook*[] |
| `after.remove` | *any*[] |
| `after.update` | *any*[] |
| `before` | *object* |
| `before.all` | *any*[] |
| `before.create` | *IffHook*[] |
| `before.find` | *any*[] |
| `before.get` | *any*[] |
| `before.patch` | *any*[] |
| `before.remove` | *any*[] |
| `before.update` | ((`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\> \| *IffHook*)[] |
| `error` | *object* |
| `error.all` | *any*[] |
| `error.create` | *any*[] |
| `error.find` | *any*[] |
| `error.get` | *any*[] |
| `error.patch` | *any*[] |
| `error.remove` | *any*[] |
| `error.update` | *any*[] |
