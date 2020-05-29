import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import {
  NullableId,
  Params
} from '@feathersjs/feathers'
import { Transaction, Sequelize } from 'sequelize'
import config from '../../config'

const loggedInUserEntity: string = config.authentication.entity

interface Data {
  userId: string
  relatedUserId: string
  userRelationshipType: string
}

export class RelationRelation extends Service {
  app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  // async find (params: Params): Promise<any> {
  //   const UserRelationshipModel = this.getModel(params)
  //   const UserRelationshipTypeService = this.app.service('user-relationship-type')
  //   const userRelationshipTypes = ((await UserRelationshipTypeService.find()) as any).data

  //   const userId = params.query?.userId
  //   const search = params.query?.search
  //   const result = {}

  //   delete params.query?.search

  //   for (const userRelationType of userRelationshipTypes) {
  //     const userRelations = await UserRelationshipModel.findAll({
  //       where: {
  //         userId,
  //         type: userRelationType.type
  //       },
  //       attributes: ['relatedUserId'],
  //       raw: false
  //     })

  //     const resolvedData = []
  //     for (const userRelation of userRelations) {
  //       const userData = resolveModelData(await userRelation.getRelatedUser())
  //       // add second relation type
  //       const inverseRelationType = resolveModelData(await UserRelationshipModel.findOne({
  //         where: {
  //           userId: userRelation.relatedUserId,
  //           relatedUserId: userId
  //         }
  //       }))

  //       if (inverseRelationType) {
  //         Object.assign(userData, { inverseRelationType: inverseRelationType.type })
  //       }

  //       Object.assign(userData, { relationType: userRelationType.type })

  //       resolvedData.push(userData)
  //     }

  //     Object.assign(result, { [userRelationType.type]: resolvedData })
  //   }

  //   Object.assign(result, { userId })
  //   return result
  // }

  async addRelationShip (data: Data, params: Params): Promise<any> {
    const UserRelationshipModel = this.getModel(params)
    let result
    await this.app.get('sequelizeClient').transaction(async (trans: Transaction) => {
      console.log('------add 1--------', data)
      result = await UserRelationshipModel.create(data, { transaction: trans })
      console.log('------add 2--------')

      await UserRelationshipModel.create({
        userId: data.relatedUserId,
        relatedUserId: data.userId,
        userRelationshipType: data.userRelationshipType === 'blocking' ? 'blocked' : 'requested'
      }, {
        transaction: trans
      })
    })
    console.log('------add 3--------', result)

    return result
  }

  async create (data: any, params: Params): Promise<any> {
    const authUser = params[loggedInUserEntity]
    const userId = authUser.userId
    const { relatedUserId, userRelationshipType, relatedUserTag, email, mobile, action } = data

    if (action === 'relatedUserTag') {
      const UserModel = this.app.get('sequelizeClient').models.user
      const user = await UserModel.findOne({
        where: {
          partyId: params?.query?.partyId,
          userId: params.user.userId
        }
      })

      if (!user) {
        throw new Error('There is no user with tag ' + (relatedUserTag as string))
      }

      return await this.addRelationShip({ userId, relatedUserId: user.id, userRelationshipType }, params)
    } else if (action === 'invite') {
      let identityProvider
      if (email) {
        identityProvider = await this.app.service('magiclink').create({
          email,
          type: 'email'
        })
      } else if (mobile) {
        identityProvider = await this.app.service('magiclink').create({
          mobile,
          type: 'sms'
        })
      }
      if (identityProvider) {
        return await this.addRelationShip({ userId, relatedUserId: identityProvider.userId, userRelationshipType: 'friend' }, params)
      }

      throw new Error("Can't invite a friend because of invalid parameters.")
    } else {
      return await this.addRelationShip({ userId, relatedUserId, userRelationshipType }, params)
    }
  }

  async patch (id: NullableId, data: any, params: Params): Promise<any> {
    const authUser = params[loggedInUserEntity]
    const userId = authUser.userId
    const { userRelationshipType } = data
    const UserRelationshipModel = this.getModel(params)

    return UserRelationshipModel.update({
      userRelationshipType
    }, {
      where: {
        userId: userId,
        relatedUserId: id
      }
    })
  }

  async remove (id: NullableId, params: Params): Promise<any> {
    const authUser = params[loggedInUserEntity]
    const userId = authUser.userId
    const UserRelationshipModel = this.getModel(params)

    return UserRelationshipModel.destroy({
      where: Sequelize.literal(
          `(userId='${userId as string}' AND relatedUserId='${id as string}') OR 
             (userId='${id as string}' AND relatedUserId='${userId as string}')`)
    })
  }
}
