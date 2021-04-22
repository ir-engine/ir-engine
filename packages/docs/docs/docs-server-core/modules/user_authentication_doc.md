---
id: "user_authentication_doc"
title: "Module: user/authentication.doc"
sidebar_label: "user/authentication.doc"
custom_edit_url: null
hide_title: true
---

# Module: user/authentication.doc

## Properties

### default

• **default**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `definitions` | *object* |
| `definitions.authentication` | *object* |
| `definitions.authentication.properties` | *object* |
| `definitions.authentication.properties.email` | *object* |
| `definitions.authentication.properties.email.type` | *string* |
| `definitions.authentication.properties.password` | *object* |
| `definitions.authentication.properties.password.type` | *string* |
| `definitions.authentication.properties.strategy` | *object* |
| `definitions.authentication.properties.strategy.default` | *string* |
| `definitions.authentication.properties.strategy.type` | *string* |
| `definitions.authentication.type` | *string* |
| `operations` | *object* |
| `operations.find` | *object* |
| `operations.find.security` | { `bearer`: *any*[] = [] }[] |
| `securities` | *string*[] |
