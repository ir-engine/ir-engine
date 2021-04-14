---
id: "user_strategies_facebook.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[user/strategies/facebook](../modules/user_strategies_facebook.md).default

## Hierarchy

* [*default*](user_strategies_custom_oauth.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`app`: *any*): [*default*](user_strategies_facebook.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`app` | *any* |

**Returns:** [*default*](user_strategies_facebook.default.md)

Overrides: [default](user_strategies_custom_oauth.default.md)

Defined in: [packages/server-core/src/user/strategies/facebook.ts:6](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/user/strategies/facebook.ts#L6)

## Properties

### app

• **app**: *any*

Overrides: [default](user_strategies_custom_oauth.default.md).[app](user_strategies_custom_oauth.default.md#app)

Defined in: [packages/server-core/src/user/strategies/facebook.ts:6](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/user/strategies/facebook.ts#L6)

___

### authentication

• `Optional` **authentication**: *AuthenticationBase*

Inherited from: [default](user_strategies_custom_oauth.default.md).[authentication](user_strategies_custom_oauth.default.md#authentication)

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:4

___

### name

• `Optional` **name**: *string*

Inherited from: [default](user_strategies_custom_oauth.default.md).[name](user_strategies_custom_oauth.default.md#name)

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:6

## Accessors

### configuration

• get **configuration**(): *any*

**Returns:** *any*

Defined in: node_modules/@feathersjs/authentication-oauth/lib/strategy.d.ts:8

___

### entityId

• get **entityId**(): *string*

**Returns:** *string*

Defined in: node_modules/@feathersjs/authentication-oauth/lib/strategy.d.ts:9

___

### entityService

• get **entityService**(): *Service*<any\>

**Returns:** *Service*<any\>

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:11

## Methods

### authenticate

▸ **authenticate**(`authentication`: AuthenticationRequest, `originalParams`: Params): *Promise*<{ [x: string]: *any*; `authentication`: { `strategy`: *string*  }  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`authentication` | AuthenticationRequest |
`originalParams` | Params |

**Returns:** *Promise*<{ [x: string]: *any*; `authentication`: { `strategy`: *string*  }  }\>

Inherited from: [default](user_strategies_custom_oauth.default.md)

Defined in: node_modules/@feathersjs/authentication-oauth/lib/strategy.d.ts:23

___

### createEntity

▸ **createEntity**(`profile`: OAuthProfile, `params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`profile` | OAuthProfile |
`params` | Params |

**Returns:** *Promise*<any\>

Inherited from: [default](user_strategies_custom_oauth.default.md)

Defined in: node_modules/@feathersjs/authentication-oauth/lib/strategy.d.ts:20

___

### findEntity

▸ **findEntity**(`profile`: OAuthProfile, `params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`profile` | OAuthProfile |
`params` | Params |

**Returns:** *Promise*<any\>

Inherited from: [default](user_strategies_custom_oauth.default.md)

Defined in: node_modules/@feathersjs/authentication-oauth/lib/strategy.d.ts:19

___

### getCurrentEntity

▸ **getCurrentEntity**(`params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`params` | Params |

**Returns:** *Promise*<any\>

Inherited from: [default](user_strategies_custom_oauth.default.md)

Defined in: node_modules/@feathersjs/authentication-oauth/lib/strategy.d.ts:17

___

### getEntity

▸ **getEntity**(`result`: *any*, `params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`result` | *any* |
`params` | Params |

**Returns:** *Promise*<any\>

Inherited from: [default](user_strategies_custom_oauth.default.md)

Defined in: node_modules/@feathersjs/authentication-oauth/lib/strategy.d.ts:22

___

### getEntityData

▸ **getEntityData**(`profile`: *any*, `entity`: *any*, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`profile` | *any* |
`entity` | *any* |
`params?` | Params |

**Returns:** *Promise*<any\>

Overrides: [default](user_strategies_custom_oauth.default.md)

Defined in: [packages/server-core/src/user/strategies/facebook.ts:11](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/user/strategies/facebook.ts#L11)

___

### getEntityQuery

▸ **getEntityQuery**(`profile`: OAuthProfile, `_params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`profile` | OAuthProfile |
`_params` | Params |

**Returns:** *Promise*<any\>

Inherited from: [default](user_strategies_custom_oauth.default.md)

Defined in: [packages/server-core/src/user/strategies/custom-oauth.ts:6](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/user/strategies/custom-oauth.ts#L6)

___

### getProfile

▸ **getProfile**(`data`: AuthenticationRequest, `_params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | AuthenticationRequest |
`_params` | Params |

**Returns:** *Promise*<any\>

Inherited from: [default](user_strategies_custom_oauth.default.md)

Defined in: node_modules/@feathersjs/authentication-oauth/lib/strategy.d.ts:16

___

### getRedirect

▸ **getRedirect**(`data`: *any*, `params?`: Params): *Promise*<string\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |
`params?` | Params |

**Returns:** *Promise*<string\>

Overrides: [default](user_strategies_custom_oauth.default.md)

Defined in: [packages/server-core/src/user/strategies/facebook.ts:36](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/user/strategies/facebook.ts#L36)

___

### setApplication

▸ **setApplication**(`app`: *Application*<{}\>): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`app` | *Application*<{}\> |

**Returns:** *void*

Inherited from: [default](user_strategies_custom_oauth.default.md)

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:8

___

### setAuthentication

▸ **setAuthentication**(`auth`: *AuthenticationBase*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`auth` | *AuthenticationBase* |

**Returns:** *void*

Inherited from: [default](user_strategies_custom_oauth.default.md)

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:7

___

### setName

▸ **setName**(`name`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`name` | *string* |

**Returns:** *void*

Inherited from: [default](user_strategies_custom_oauth.default.md)

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:9

___

### updateEntity

▸ **updateEntity**(`entity`: *any*, `profile`: *any*, `params?`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`entity` | *any* |
`profile` | *any* |
`params?` | Params |

**Returns:** *Promise*<any\>

Overrides: [default](user_strategies_custom_oauth.default.md)

Defined in: [packages/server-core/src/user/strategies/facebook.ts:22](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/user/strategies/facebook.ts#L22)
