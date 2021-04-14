---
id: "user_strategies_jwt.myjwtstrategy"
title: "Class: MyJwtStrategy"
sidebar_label: "MyJwtStrategy"
custom_edit_url: null
hide_title: true
---

# Class: MyJwtStrategy

[user/strategies/jwt](../modules/user_strategies_jwt.md).MyJwtStrategy

## Hierarchy

* *JWTStrategy*

  ↳ **MyJwtStrategy**

## Constructors

### constructor

\+ **new MyJwtStrategy**(): [*MyJwtStrategy*](user_strategies_jwt.myjwtstrategy.md)

**Returns:** [*MyJwtStrategy*](user_strategies_jwt.myjwtstrategy.md)

Inherited from: JWTStrategy.constructor

## Properties

### app

• `Optional` **app**: *Application*<{}\>

Inherited from: JWTStrategy.app

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:5

___

### authentication

• `Optional` **authentication**: *AuthenticationBase*

Inherited from: JWTStrategy.authentication

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:4

___

### expirationTimers

• **expirationTimers**: *WeakMap*<object, any\>

Inherited from: JWTStrategy.expirationTimers

Defined in: node_modules/@feathersjs/authentication/lib/jwt.d.ts:7

___

### name

• `Optional` **name**: *string*

Inherited from: JWTStrategy.name

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:6

## Accessors

### configuration

• get **configuration**(): *any*

**Returns:** *any*

Defined in: node_modules/@feathersjs/authentication/lib/jwt.d.ts:8

___

### entityService

• get **entityService**(): *Service*<any\>

**Returns:** *Service*<any\>

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:11

## Methods

### authenticate

▸ **authenticate**(`authentication`: AuthenticationRequest, `params`: Params): *Promise*<{ `accessToken`: *any* ; `authentication`: { `accessToken`: *any* ; `payload`: *any* ; `strategy`: *string*  }  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`authentication` | AuthenticationRequest |
`params` | Params |

**Returns:** *Promise*<{ `accessToken`: *any* ; `authentication`: { `accessToken`: *any* ; `payload`: *any* ; `strategy`: *string*  }  }\>

Inherited from: JWTStrategy.authenticate

Defined in: node_modules/@feathersjs/authentication/lib/jwt.d.ts:19

___

### getEntity

▸ **getEntity**(`id`: *string*, `params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |
`params` | Params |

**Returns:** *Promise*<any\>

Overrides: JWTStrategy.getEntity

Defined in: [packages/server-core/src/user/strategies/jwt.ts:6](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/user/strategies/jwt.ts#L6)

___

### getEntityId

▸ **getEntityId**(`authResult`: AuthenticationResult, `_params`: Params): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`authResult` | AuthenticationResult |
`_params` | Params |

**Returns:** *Promise*<any\>

Inherited from: JWTStrategy.getEntityId

Defined in: node_modules/@feathersjs/authentication/lib/jwt.d.ts:18

___

### getEntityQuery

▸ **getEntityQuery**(`_params`: Params): *Promise*<{}\>

#### Parameters:

Name | Type |
:------ | :------ |
`_params` | Params |

**Returns:** *Promise*<{}\>

Inherited from: JWTStrategy.getEntityQuery

Defined in: node_modules/@feathersjs/authentication/lib/jwt.d.ts:11

___

### handleConnection

▸ **handleConnection**(`event`: ConnectionEvent, `connection`: *any*, `authResult?`: AuthenticationResult): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`event` | ConnectionEvent |
`connection` | *any* |
`authResult?` | AuthenticationResult |

**Returns:** *Promise*<void\>

Inherited from: JWTStrategy.handleConnection

Defined in: node_modules/@feathersjs/authentication/lib/jwt.d.ts:9

___

### parse

▸ **parse**(`req`: *IncomingMessage*): *Promise*<{ `accessToken`: *string* ; `strategy`: *string*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`req` | *IncomingMessage* |

**Returns:** *Promise*<{ `accessToken`: *string* ; `strategy`: *string*  }\>

Inherited from: JWTStrategy.parse

Defined in: node_modules/@feathersjs/authentication/lib/jwt.d.ts:27

___

### setApplication

▸ **setApplication**(`app`: *Application*<{}\>): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`app` | *Application*<{}\> |

**Returns:** *void*

Inherited from: JWTStrategy.setApplication

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:8

___

### setAuthentication

▸ **setAuthentication**(`auth`: *AuthenticationBase*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`auth` | *AuthenticationBase* |

**Returns:** *void*

Inherited from: JWTStrategy.setAuthentication

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:7

___

### setName

▸ **setName**(`name`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`name` | *string* |

**Returns:** *void*

Inherited from: JWTStrategy.setName

Defined in: node_modules/@feathersjs/authentication/lib/strategy.d.ts:9

___

### verifyConfiguration

▸ **verifyConfiguration**(): *void*

**Returns:** *void*

Inherited from: JWTStrategy.verifyConfiguration

Defined in: node_modules/@feathersjs/authentication/lib/jwt.d.ts:10
