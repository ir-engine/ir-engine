---
id: "social_party_party_hooks"
title: "Module: social/party/party.hooks"
sidebar_label: "social/party/party.hooks"
custom_edit_url: null
hide_title: true
---

# Module: social/party/party.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `after` | *object* |
| `after.all` | *any*[] |
| `after.create` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `after.find` | *any*[] |
| `after.get` | *any*[] |
| `after.patch` | *any*[] |
| `after.remove` | *any*[] |
| `after.update` | *any*[] |
| `before` | *object* |
| `before.all` | *Hook*<any, Service<any\>\>[] |
| `before.create` | (`context`: *any*) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `before.find` | *any*[] |
| `before.get` | *any*[] |
| `before.patch` | *any*[] |
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
