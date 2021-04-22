---
id: "media_upload_media_upload_media_hooks"
title: "Module: media/upload-media/upload-media.hooks"
sidebar_label: "media/upload-media/upload-media.hooks"
custom_edit_url: null
hide_title: true
---

# Module: media/upload-media/upload-media.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `after` | *object* |
| `after.all` | *any*[] |
| `after.create` | *Hook*<any, Service<any\>\>[] |
| `after.find` | *any*[] |
| `after.get` | *any*[] |
| `after.patch` | *any*[] |
| `after.remove` | *any*[] |
| `after.update` | *any*[] |
| `before` | *object* |
| `before.all` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `before.create` | (`context`: *HookContext*<any, Service<any\>\>) => *any*[] |
| `before.find` | *Hook*<any, Service<any\>\>[] |
| `before.get` | *any*[] |
| `before.patch` | *Hook*<any, Service<any\>\>[] |
| `before.remove` | *Hook*<any, Service<any\>\>[] |
| `before.update` | *Hook*<any, Service<any\>\>[] |
| `error` | *object* |
| `error.all` | (`context`: *HookContext*<any, Service<any\>\>) => *Promise*<HookContext<any, Service<any\>\>\>[] |
| `error.create` | *any*[] |
| `error.find` | *any*[] |
| `error.get` | *any*[] |
| `error.patch` | *any*[] |
| `error.remove` | *any*[] |
| `error.update` | *any*[] |
