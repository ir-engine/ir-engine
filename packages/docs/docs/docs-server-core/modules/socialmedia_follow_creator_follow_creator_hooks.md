---
id: "socialmedia_follow_creator_follow_creator_hooks"
title: "Module: socialmedia/follow-creator/follow-creator.hooks"
sidebar_label: "socialmedia/follow-creator/follow-creator.hooks"
custom_edit_url: null
hide_title: true
---

# Module: socialmedia/follow-creator/follow-creator.hooks

## Properties

### default

• **default**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`after` | *object* |
`after.all` | *any*[] |
`after.create` | (`context`: *any*) => *Promise*<HookContext\>[] |
`after.find` | *any*[] |
`after.get` | *any*[] |
`after.patch` | *any*[] |
`after.remove` | (`context`: *any*) => *Promise*<HookContext\>[] |
`after.update` | *any*[] |
`before` | *object* |
`before.all` | *any*[] |
`before.create` | *any*[] |
`before.find` | *any*[] |
`before.get` | *any*[] |
`before.patch` | *any*[] |
`before.remove` | *any*[] |
`before.update` | *any*[] |
`error` | *object* |
`error.all` | *any*[] |
`error.create` | *any*[] |
`error.find` | *any*[] |
`error.get` | *any*[] |
`error.patch` | *any*[] |
`error.remove` | *any*[] |
`error.update` | *any*[] |
