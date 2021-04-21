---
id: "social_location_ban_location_ban_hooks"
title: "Module: social/location-ban/location-ban.hooks"
sidebar_label: "social/location-ban/location-ban.hooks"
custom_edit_url: null
hide_title: true
---

# Module: social/location-ban/location-ban.hooks

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
| `before.all` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `before.create` | (`context`: *any*) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `before.find` | *any*[] |
| `before.get` | *any*[] |
| `before.patch` | *Hook*<any, Service<any\>\>[] |
| `before.remove` | *any*[] |
| `before.update` | *Hook*<any, Service<any\>\>[] |
| `error` | *object* |
| `error.all` | *any*[] |
| `error.create` | *any*[] |
| `error.find` | *any*[] |
| `error.get` | *any*[] |
| `error.patch` | *any*[] |
| `error.remove` | *any*[] |
| `error.update` | *any*[] |
