import app from '../../src/app'

describe('CRUD operation on \'AccessControl\' model', () => {
  const model = app.service('access-control').Model
  const accessControlScopeModel = app.service('access-control-scope').Model
  const userRoleModel = app.service('user-role').Model
  const resourceTypeModel = app.service('resource-type').Model
  let scope: any, updatedScope: any, userRole: any, resourceType: any

  before(async () => {
    const accessControl = await accessControlScopeModel.create({
      scope: 'test_scope'
    })
    scope = accessControl.scope

    const newAccessControl = await accessControlScopeModel.create({
      scope: 'new_test_scope'
    })
    updatedScope = newAccessControl.scope

    const userRoleInstance = await userRoleModel.create({
      role: 'testrole'
    })
    userRole = userRoleInstance.role

    const type = await resourceTypeModel.create({
      type: 'test'
    })
    resourceType = type.type
  })

  it('Create', done => {
    model.create({
      userRole: userRole,
      resourceType: resourceType,
      listScope: scope,
      createScope: scope,
      readScope: scope,
      updateScope: scope,
      destroyScope: scope
    }).then(res => {
      done()
    }).catch((err) => {
      console.log(err)
      done()
    })
  })

  it('Read', done => {
    model.findOne({
      where: {
        userRole: userRole,
        resourceType: resourceType
      }
    }).then(res => {
      done()
    }).catch((err) => {
      console.log(err)
      done()
    })
  })

  it('Update', done => {
    model.update(
      { listScope: updatedScope },
      { where: { userRole: userRole, resourceType: resourceType } }
    ).then(res => {
      done()
    }).catch((err) => {
      console.log(err)
      done()
    })
  })

  it('Delete', done => {
    model.destroy({
      where: { userRole: userRole, resourceType: resourceType }
    }).then(res => {
      done()
    }).catch((err) => {
      console.log(err)
      done()
    })
  })

  after(async () => {
    await accessControlScopeModel.destroy({
      where: {
        scope: scope
      }
    })

    await accessControlScopeModel.destroy({
      where: {
        scope: updatedScope
      }
    })

    await userRoleModel.destroy({
      where: {
        role: userRole
      }
    })

    await resourceTypeModel.destroy({
      where: {
        type: resourceType
      }
    })
  })
})
