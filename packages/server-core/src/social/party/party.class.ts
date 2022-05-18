import { NotFound } from '@feathersjs/errors/lib'
import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'
import { Sequelize } from 'sequelize'

import { Party as PartyDataType } from '@xrengine/common/src/interfaces/Party'

// import { Params, Id, NullableId } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import { UserDataType } from '../../user/user/user.class'

// import { Forbidden } from '@feathersjs/errors'

/**
 * A class for Party service
 *
 * @author Vyacheslav Solovjov
 */
export class Party<T = PartyDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<T[] | Paginated<T>> {
    const { action, $skip, $limit, search, ...query } = params?.query ?? {}
    const skip = $skip ? $skip : 0
    const limit = $limit ? $limit : 10

    if (action === 'admin') {
      const sort = params?.query?.$sort
      delete query.$sort
      const order: any[] = []
      if (sort != null) {
        Object.keys(sort).forEach((name, val) => {
          const item: any[] = []

          if (name === 'instance') {
            //item.push(this.app.service('instance').Model)
            item.push(Sequelize.literal('`instance.ipAddress`'))
          } else if (name === 'location') {
            //item.push(this.app.service('location').Model)
            item.push(Sequelize.literal('`location.name`'))
          } else {
            item.push(name)
          }
          item.push(sort[name] === 0 ? 'DESC' : 'ASC')

          order.push(item)
        })
      }
      let ip = {}
      let name = {}
      if (!isNaN(search)) {
        ip = search ? { ipAddress: { [Op.like]: `%${search}%` } } : {}
      } else {
        name = search ? { name: { [Op.like]: `%${search}%` } } : {}
      }

      const party = await (this.app.service('party') as any).Model.findAndCountAll({
        offset: skip,
        limit: limit,
        order: order,
        include: [
          {
            model: (this.app.service('location') as any).Model,
            required: true,
            where: { ...name }
          },
          {
            model: (this.app.service('instance') as any).Model,
            required: true,
            where: { ...ip }
          },
          {
            model: (this.app.service('party-user') as any).Model,
            required: false
          }
        ],
        where: query,
        raw: true,
        nest: true
      })

      return {
        skip: skip,
        limit: limit,
        total: party.count,
        data: party.rows
      }
    } else {
      return super.find(params)
    }
  }

  /**
   * A function which used to get specific party
   *
   * @param id of specific party
   * @param params contains user info
   * @returns {@Object} of single party
   * @author Vyacheslav Solovjov
   */
  async get(id: string, params?: Params): Promise<T> {
    if (id == null || id == '') {
      const loggedInUser = params!.user as UserDataType
      const partyUserResult = await this.app.service('party-user').find({
        query: {
          userId: loggedInUser.id
        }
      })

      if ((partyUserResult as any).total === 0) {
        throw new NotFound('User party not found')
      }

      const partyId = (partyUserResult as any).data[0].partyId

      const party: any = await super.get(partyId)

      const partyUsers = await (this.app.service('party-user') as any).Model.findAll({
        where: {
          partyId: party.id
        },
        include: [
          {
            model: (this.app.service('user') as any).Model
          }
        ]
      })
      // await Promise.all(partyUsers.map(async (partyUser) => {
      //   const avatarResult = await this.app.service('static-resource').find({
      //     query: {
      //       staticResourceType: 'user-thumbnail',
      //       userId: partyUser.userId
      //     }
      //   }) as any;
      //
      //   if (avatarResult.total > 0) {
      //     partyUser.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url;
      //   }
      //
      //   return await Promise.resolve();
      // }));

      party.partyUsers = partyUsers

      return party
    } else {
      return await super.get(id)
    }
  }
}
