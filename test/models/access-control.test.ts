import app from '../../src/app'
import { Op } from 'sequelize'

describe('CRUD operation on \'AccessControl\' model', () => {
  const model = app.service('access-control').Model
  const accessControlScopeModel = app.service('access-control-scope').Model
  const userRoleModel = app.service('user-role').Model
  const resourceTypeModel = app.service('resource-type').Model
  let scope: any, updatedScope: any, role: any, resourceType: any

  before(async () => {
    const accessControl = await accessControlScopeModel.create({
      scope: 'test_scope'
    })
    scope = accessControl.scope

    const newAccessControl = await accessControlScopeModel.create({
      scope: 'new_test_scope'
    })
    updatedScope = newAccessControl.scope

    const userRole = await userRoleModel.create({})
    role = userRole.id

    const type = await resourceTypeModel.create({
      type: 'test'
    })
    resourceType = type.type
  })

  it('Create', done => {
    model.create({
      userRole: role,
      resourceType: resourceType,
      list: scope,
      create: scope,
      read: scope,
      update: scope,
      delete: scope
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        userRole: role,
        resourceType: resourceType
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { list: updatedScope },
      { where: { userRole: role, resourceType: resourceType } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { userRole: role, resourceType: resourceType }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(async () => {
    accessControlScopeModel.destroy({
      where: {
        scope: {
          [Op.in]: [scope, updatedScope]
        }
      }
    })

    await userRoleModel.destroy({
      where: {
        id: role
      }
    })

    await resourceTypeModel.destroy({
      where: {
        type: 'test'
      }
    })
  })
})
