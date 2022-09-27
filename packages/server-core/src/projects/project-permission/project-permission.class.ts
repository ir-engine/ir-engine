import { BadRequest, Forbidden } from '@feathersjs/errors'
import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { ProjectPermissionInterface } from '@xrengine/common/src/interfaces/ProjectPermissionInterface'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserParams } from '../../user/user/user.class'

export type ProjectPermissionsDataType = ProjectPermissionInterface

export class ProjectPermission<T = ProjectPermissionsDataType> extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async makeRandomProjectOwnerIfNone(projectId) {
    const projectOwners = await this.app.service('project-permission').Model.findAll({
      paginate: false,
      where: {
        projectId: projectId,
        type: 'owner'
      }
    })
    if (projectOwners.length === 0) {
      const newOwner = await this.app.service('project-permission').Model.findOne({
        where: {
          projectId: projectId
        }
      })
      if (newOwner)
        await super.patch(newOwner.id, {
          type: 'owner'
        })
    }
  }

  async find(params?: UserParams): Promise<T[] | Paginated<T>> {
    const loggedInUser = params!.user!
    if (loggedInUser.scopes?.find((scope) => scope.type === 'admin:admin')) return super.find(params)
    if (params?.query?.projectId) {
      const permissionStatus = await super.Model.findOne({
        where: {
          projectId: params.query.projectId,
          userId: loggedInUser?.id
        }
      })
      if (permissionStatus) return super.find(params)
    }
    if (!params) params = {}
    if (!params.query) params.query = {}
    params.query.userId = loggedInUser.id
    return super.find(params)
  }

  async get(id: string, params?: UserParams): Promise<T> {
    const loggedInUser = params!.user!
    const projectPermission = await super.get(id, params)
    if (loggedInUser.scopes?.find((scope) => scope.type === 'admin:admin')) return projectPermission
    if (projectPermission.userId !== loggedInUser.id) throw new Forbidden('You do not own this project-permission')
    return projectPermission
  }

  async create(data: any, params?: UserParams): Promise<T> {
    const selfUser = params!.user!
    try {
      const searchParam = data.inviteCode
        ? {
            inviteCode: data.inviteCode
          }
        : {
            id: data.userId
          }
      const user = await this.app.service('user').Model.findOne({
        where: searchParam
      })
      if (!user) throw new BadRequest('Invalid user ID and/or user invite code')
      const existing = (await super.find({
        query: {
          projectId: data.projectId,
          userId: user.id
        }
      })) as Paginated<T>
      if (existing.total > 0) return existing.data[0]
      const project = await this.app.service('project').Model.findOne({
        where: {
          id: data.projectId
        }
      })
      if (!project) throw new BadRequest('Invalid project ID')
      if (!user) throw new BadRequest('Invalid user ID')
      const existingPermissionsCount = await super.Model.count({
        where: {
          projectId: data.projectId
        }
      })
      return super.create({
        projectId: data.projectId,
        userId: user.id,
        type:
          data.type === 'owner' ||
          existingPermissionsCount === 0 ||
          (selfUser.scopes?.find((scope) => scope.type === 'admin:admin') && selfUser.id === user.id)
            ? 'owner'
            : 'user'
      })
    } catch (err) {
      logger.error(err)
      throw err
    }
  }

  async patch(id: string, data: any, params?: Params): Promise<T> {
    const result = await super.patch(id, {
      type: data.type === 'owner' ? 'owner' : 'user'
    })

    await this.makeRandomProjectOwnerIfNone(result.projectId)
    return result
  }

  async remove(id: string, params?: Params): Promise<T> {
    const result = await super.remove(id, params)
    if (id && result) await this.makeRandomProjectOwnerIfNone(result.projectId)
    return result
  }
}
