// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { UserID } from '@etherealengine/common/src/schemas/user/user.schema'
import { dataValidator, queryValidator } from '@etherealengine/common/src/schemas/validators'
import { TypedString } from '@etherealengine/common/src/types/TypeboxUtils'
import { Static, Type, getValidator, querySyntax } from '@feathersjs/typebox'

export const projectHistoryPath = 'project-history'
export const projectHistoryMethods = ['create', 'find', 'remove'] as const

export enum ActionTypes {
  CREATE_PROJECT = 'CREATE_PROJECT',
  RENAME_PROJECT = 'RENAME_PROJECT',
  COLLABORATER_ADDED = 'COLLABORATER_ADDED',
  COLLABORATER_REMOVED = 'COLLABORATER_REMOVED',

  CREATE_SCENE = 'CREATE_SCENE',
  RENAME_SCENE = 'RENAME_SCENE',
  REMOVE_SCENE = 'REMOVE_SCENE',
  CREATE_ASSET = 'CREATE_ASSET',
  RENAME_ASSET = 'RENAME_ASSET',
  REMOVE_ASSET = 'REMOVE_ASSET'
}

export const UserActionTypes = [ActionTypes.COLLABORATER_ADDED, ActionTypes.COLLABORATER_REMOVED]
export const ResourceActionTypes = [
  ActionTypes.CREATE_SCENE,
  ActionTypes.RENAME_SCENE,
  ActionTypes.REMOVE_SCENE,
  ActionTypes.CREATE_ASSET,
  ActionTypes.RENAME_ASSET,
  ActionTypes.REMOVE_ASSET
]

// Schema for creating new entries
export const projectHistorySchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    projectId: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),

    userName: Type.String(),
    userAvatar: Type.String({ format: 'uri' }),

    action: Type.Enum(ActionTypes),
    actionIdentifier: Type.String(), // can be resourceId or userId or projectId
    actionResource: Type.String(), // can be assetURL or user name or project name

    createdAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ProjectHistory', additionalProperties: false }
)
export interface ProjectHistoryType extends Static<typeof projectHistorySchema> {}

// Schema for creating new entries
export const projectHistoryDataSchema = Type.Partial(projectHistorySchema, {
  $id: 'ProjectHistoryData'
})
export interface ProjectHistoryData extends Static<typeof projectHistoryDataSchema> {}

// Schema for allowed query properties
export const projectHistoryQueryProperties = Type.Pick(projectHistorySchema, ['id', 'projectId', 'createdAt'])

export const projectHistoryQuerySchema = Type.Intersect([querySyntax(projectHistoryQueryProperties, {})], {
  additionalProperties: false
})
export interface ProjectHistoryQuery extends Static<typeof projectHistoryQuerySchema> {}

export const projectHistoryValidator = /* @__PURE__ */ getValidator(projectHistorySchema, dataValidator)
export const projectHistoryDataValidator = /* @__PURE__ */ getValidator(projectHistoryDataSchema, dataValidator)
export const projectHistoryQueryValidator = /* @__PURE__ */ getValidator(projectHistoryQuerySchema, queryValidator)
