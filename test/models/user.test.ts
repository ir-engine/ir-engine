import app from '../../src/app'
import GenerateRandomAnimalName from 'random-animal-name-generator'

describe('CRUD operation on \'User\' model', () => {
  const model = app.service('user').Model
  const userRoleModel = app.service('user-role').Model
  let roleId: any

  before(async () => {
    const userRole = await userRoleModel.create({})
    roleId = userRole.id
  })

  it('Create', (done) => {
    model.create({
      userRole: roleId,
      name: GenerateRandomAnimalName().toUpperCase()
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        userRole: roleId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { name: GenerateRandomAnimalName().toUpperCase() },
      { where: { userRole: roleId } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { userRole: roleId }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(async () => {
    await userRoleModel.destroy({
      where: {
        id: roleId
      }
    })
  })
})
