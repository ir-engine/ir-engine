---
id: "payments_subscription_subscription_hooks"
title: "Module: payments/subscription/subscription.hooks"
sidebar_label: "payments/subscription/subscription.hooks"
custom_edit_url: null
hide_title: true
---

# Module: payments/subscription/subscription.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `after` | *object* |
| `after.all` | *any*[] |
| `after.create` | *any*[] |
| `after.find` | *any*[] |
| `after.get` | *any*[] |
| `after.patch` | *any*[] |
| `after.remove` | *any*[] |
| `after.update` | *any*[] |
| `before` | *object* |
| `before.all` | *any*[] |
| `before.create` | (`context`: *HookContext*<any, Service<any\>\>) => *any*[] |
| `before.find` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `before.get` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `before.patch` | *Hook*<any, Service<any\>\>[] |
| `before.remove` | *Hook*<any, Service<any\>\>[] |
| `before.update` | *Hook*<any, Service<any\>\>[] |
| `error` | *object* |
| `error.all` | *any*[] |
| `error.create` | *any*[] |
| `error.find` | *any*[] |
| `error.get` | *any*[] |
| `error.patch` | *any*[] |
| `error.remove` | *any*[] |
| `error.update` | *any*[] |
