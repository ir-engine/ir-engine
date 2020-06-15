import app from '../../server/app'
import GenerateRandomAnimalName from 'random-animal-name-generator'

describe('CRUD operation on \'User\' model', () => {
  const model = app.service('user').Model
  const userRoleModel = app.service('user-role').Model

  beforeAll(async () => {
    await userRoleModel.create({
      role: 'testrole'
    })
  })

  it('Create', () => {
    model.create({
      name: 'test',
      userRole: 'testrole'
    })
  })

  it('Read', () => {
    model.findOne({
      where: {
        name: 'test',
        userRole: 'testrole'
      }
    })
  })

  it('Update', () => {
    model.update(
      { name: GenerateRandomAnimalName().toUpperCase() },
      {
        where: { name: 'test', userRole: 'testrole' }
      })
  })

  it('Delete', () => {
    model.destroy({
      where: { userRole: 'testrole' }
    })
  })

  afterAll(async () => {
    await userRoleModel.destroy({
      where: {
        role: 'testrole'
      }
    })
  })
})
