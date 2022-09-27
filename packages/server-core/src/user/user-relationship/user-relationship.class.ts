import { Id, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Sequelize, Transaction } from 'sequelize'

import { UserRelationshipInterface } from '@xrengine/common/src/dbmodels/UserRelationship'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { resolveModelData } from '../../util/model-resolver'
import { UserParams } from '../user/user.class'

export type UserRelationshipDataType = UserRelationshipInterface
/**
 * A class for User Relationship service
 */
export class UserRelationship<T = UserRelationshipDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<any> {
    if (!params) params = {}
    const UserRelationshipModel = this.getModel(params)
    const UserRelationshipTypeService = this.app.service('user-relationship-type')
    const userRelationshipTypes = ((await UserRelationshipTypeService.find()) as any).data

    const userId = params.query?.userId
    const result = {}

    for (const userRelationType of userRelationshipTypes) {
      const userRelations = await UserRelationshipModel.findAll({
        where: {
          userId,
          userRelationshipType: userRelationType.type
        },
        attributes: ['relatedUserId'],
        raw: false
      })

      const resolvedData: any[] = []
      for (const userRelation of userRelations) {
        const userData = resolveModelData(await userRelation.getRelatedUser())
        // add second relation type
        const inverseRelationType = resolveModelData(
          await UserRelationshipModel.findOne({
            where: {
              userId: userRelation.relatedUserId,
              relatedUserId: userId
            }
          })
        )

        if (inverseRelationType) {
          Object.assign(userData, { inverseRelationType: inverseRelationType.type })
        }

        Object.assign(userData, { relationType: userRelationType.type })

        resolvedData.push(userData)
      }

      Object.assign(result, { [userRelationType.type]: resolvedData })
    }

    Object.assign(result, { userId })
    return result
  }

  async create(data: any, params?: Params): Promise<T> {
    if (!params) params = {}
    const loggedInUserEntity: string = config.authentication.entity

    const userId = data.userId || params[loggedInUserEntity].userId
    const { relatedUserId, userRelationshipType } = data
    const UserRelationshipModel = this.getModel(params)

    if (userRelationshipType === 'blocking') {
      await this.remove(relatedUserId, params)
    }

    await this.app.get('sequelizeClient').transaction(async (trans: Transaction) => {
      await UserRelationshipModel.create(
        {
          userId: userId,
          relatedUserId: relatedUserId,
          userRelationshipType: userRelationshipType
        },
        {
          transaction: trans
        }
      )

      if (userRelationshipType === 'blocking' || userRelationshipType === 'requested') {
        await UserRelationshipModel.create(
          {
            userId: relatedUserId,
            relatedUserId: userId,
            userRelationshipType: userRelationshipType === 'blocking' ? 'blocked' : 'pending'
          },
          {
            transaction: trans
          }
        )
      }
    })

    const result = await UserRelationshipModel.findOne({
      where: {
        userId: userId,
        relatedUserId: relatedUserId
      }
    })

    return result
  }

  async patch(id: Id, data: any, params?: UserParams): Promise<T> {
    if (!params) params = {}
    const { userRelationshipType } = data
    const UserRelationshipModel = this.getModel(params)

    let whereParams

    try {
      await this.app.service('user').get(id)
      //The ID resolves to a userId, in which case patch the relation joining that user to the requesting one
      whereParams = {
        userId: params.user!.id,
        relatedUserId: id
      }
    } catch (err) {
      //The ID does not resolve to a user, in which case it's the ID of the user-relationship object, so patch it
      whereParams = {
        id: id
      }
    }

    await this.app.get('sequelizeClient').transaction(async (trans: Transaction) => {
      await UserRelationshipModel.update(
        {
          userRelationshipType: userRelationshipType
        },
        {
          where: whereParams
        },
        {
          transaction: trans
        }
      )

      if (userRelationshipType === 'friend' || userRelationshipType === 'blocking') {
        const result = await UserRelationshipModel.findOne({
          where: whereParams
        })

        await UserRelationshipModel.update(
          {
            userRelationshipType: userRelationshipType === 'friend' ? 'friend' : 'blocked'
          },
          {
            where: {
              userId: result.relatedUserId,
              relatedUserId: result.userId
            }
          },
          {
            transaction: trans
          }
        )
      }
    })

    return await UserRelationshipModel.findOne({
      where: whereParams
    })
  }

  async remove(id: Id, params?: Params): Promise<T> {
    if (!params) params = {}
    const loggedInUserEntity: string = config.authentication.entity

    const authUser = params[loggedInUserEntity]
    const userId = authUser.userId
    const UserRelationshipModel = this.getModel(params)

    //If the ID provided is not a user ID, as it's expected to be, it'll throw a 404
    await this.app.service('user').get(id)

    const relationship = await UserRelationshipModel.findOne({
      where: {
        userId: userId,
        relatedUserId: id
      }
    })
    await UserRelationshipModel.destroy({
      where: Sequelize.literal(
        `(userId='${userId as string}' AND relatedUserId='${id as string}') OR 
             (userId='${id as string}' AND relatedUserId='${userId as string}')`
      )
    })

    return relationship
  }
}
