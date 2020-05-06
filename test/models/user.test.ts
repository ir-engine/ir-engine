import app from '../../src/app'

describe('CRUD operation on \'User\' model', () => {
  const model = app.service('user').Model
  const instanceModel = app.service('instance').Model
  const locationModel = app.service('location').Model
  const userRoleModel = app.service('user-role').Model
  var instanceId: any, locationId: any, role: any

  before(async () => {
    const location = await locationModel.create({
      name: 'test',
      maxUsersPerInstance: 10
    })
    locationId = location.id
    const instance = await instanceModel.create({
      address: 'test address',
      maxUsers: 10,
      locationId: locationId
    })
    instanceId = instance.id

    const userRole = await userRoleModel.create({
      role: 'test'
    })
    role = userRole.role
  })

  it('Create', function (done) {
    model.create({
      email: 'vinay.k@queppelin.com',
      password: '12345',
      mobile: '8767367277',
      githubId: 'githubtest',
      isVerified: true,
      instanceId: instanceId,
      userRole: role
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        email: 'vinay.k@queppelin.com'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { password: '123456' },
      { where: { email: 'vinay.k@queppelin.com' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { email: 'vinay.k@queppelin.com' }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(() => {
    locationModel.destroy({
      where: {
        id: locationId
      }
    })

    instanceModel.destroy({
      where: {
        id: instanceId
      }
    })
    userRoleModel.destroy({
      where: {
        role: role
      }
    })
  })
})
