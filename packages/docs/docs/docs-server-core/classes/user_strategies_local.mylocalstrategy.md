---
id: "user_strategies_local.mylocalstrategy"
title: "Class: MyLocalStrategy"
sidebar_label: "MyLocalStrategy"
custom_edit_url: null
hide_title: true
---

# Class: MyLocalStrategy

[user/strategies/local](../modules/user_strategies_local.md).MyLocalStrategy

## Hierarchy

* *LocalStrategy*

  ↳ **MyLocalStrategy**

## Constructors

### constructor

\+ **new MyLocalStrategy**(): [*MyLocalStrategy*](user_strategies_local.mylocalstrategy.md)

**Returns:** [*MyLocalStrategy*](user_strategies_local.mylocalstrategy.md)

Inherited from: LocalStrategy.constructor

## Properties

### app

• `Optional` **app**: *Application*<{}\>

Inherited from: LocalStrategy.app

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:5

___

### authentication

• `Optional` **authentication**: *AuthenticationBase*

Inherited from: LocalStrategy.authentication

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:4

___

### name

• `Optional` **name**: *string*

Inherited from: LocalStrategy.name

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:6

## Accessors

### configuration

• get **configuration**(): *any*

**Returns:** *any*

Defined in: node_modules/@feathersjs/authentication-local/lib/strategy.d.ts:5

___

### entityService

• get **entityService**(): *Service*<any\>

**Returns:** *Service*<any\>

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:11

## Methods

### authenticate

▸ **authenticate**(`data`: AuthenticationRequest, `params`: Params): *Promise*<{ [x: number]: *any*; `authentication`: { `strategy`: *string*  }  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | AuthenticationRequest |
`params` | Params |

**Returns:** *Promise*<{ [x: number]: *any*; `authentication`: { `strategy`: *string*  }  }\>

Inherited from: LocalStrategy.authenticate

Defined in: node_modules/@feathersjs/authentication-local/lib/strategy.d.ts:13

___

### comparePassword

▸ **comparePassword**(`entity`: *any*, `password`: *string*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`entity` | *any* |
`password` | *string* |

**Returns:** *Promise*<any\>

Inherited from: LocalStrategy.comparePassword

Defined in: node_modules/@feathersjs/authentication-local/lib/strategy.d.ts:11

___

### findEntity

▸ **findEntity**(`username`: *string*, `params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`username` | *string* |
`params` | Params |

**Returns:** *Promise*<any\>

Overrides: LocalStrategy.findEntity

Defined in: [packages/server-core/src/user/strategies/local.ts:7](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/user/strategies/local.ts#L7)

___

### getEntity

▸ **getEntity**(`result`: *any*, `params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`result` | *any* |
`params` | Params |

**Returns:** *Promise*<any\>

Inherited from: LocalStrategy.getEntity

Defined in: node_modules/@feathersjs/authentication-local/lib/strategy.d.ts:10

___

### getEntityQuery

▸ **getEntityQuery**(`query`: Query, `_params`: Params): *Promise*<{ `$limit`: *number*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`query` | Query |
`_params` | Params |

**Returns:** *Promise*<{ `$limit`: *number*  }\>

Inherited from: LocalStrategy.getEntityQuery

Defined in: node_modules/@feathersjs/authentication-local/lib/strategy.d.ts:6

___

### hashPassword

▸ **hashPassword**(`password`: *string*, `_params`: Params): *Promise*<string\>

#### Parameters:

Name | Type |
:------ | :------ |
`password` | *string* |
`_params` | Params |

**Returns:** *Promise*<string\>

Inherited from: LocalStrategy.hashPassword

Defined in: node_modules/@feathersjs/authentication-local/lib/strategy.d.ts:12

___

### setApplication

▸ **setApplication**(`app`: *Application*<{}\>): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`app` | *Application*<{}\> |

**Returns:** *void*

Inherited from: LocalStrategy.setApplication

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:8

___

### setAuthentication

▸ **setAuthentication**(`auth`: *AuthenticationBase*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`auth` | *AuthenticationBase* |

**Returns:** *void*

Inherited from: LocalStrategy.setAuthentication

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:7

___

### setName

▸ **setName**(`name`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`name` | *string* |

**Returns:** *void*

Inherited from: LocalStrategy.setName

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:9

___

### verifyConfiguration

▸ **verifyConfiguration**(): *void*

**Returns:** *void*

Inherited from: LocalStrategy.verifyConfiguration

Defined in: node_modules/@feathersjs/authentication-local/lib/strategy.d.ts:4
