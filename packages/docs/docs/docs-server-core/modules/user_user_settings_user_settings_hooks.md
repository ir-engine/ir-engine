---
id: "user_user_settings_user_settings_hooks"
title: "Module: user/user-settings/user-settings.hooks"
sidebar_label: "user/user-settings/user-settings.hooks"
custom_edit_url: null
hide_title: true
---

# Module: user/user-settings/user-settings.hooks

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
| `before.create` | *any*[] |
| `before.find` | *any*[] |
| `before.get` | *any*[] |
| `before.patch` | *any*[] |
| `before.remove` | *any*[] |
| `before.update` | *any*[] |
| `error` | *object* |
| `error.all` | *any*[] |
| `error.create` | *any*[] |
| `error.find` | *any*[] |
| `error.get` | *any*[] |
| `error.patch` | *any*[] |
| `error.remove` | *any*[] |
| `error.update` | *any*[] |
