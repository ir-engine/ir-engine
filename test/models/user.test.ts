import app from '../../server/app'
import GenerateRandomAnimalName from 'random-animal-name-generator'

describe('CRUD operation on \'User\' model', () => {
  const model = app.service('user').Model
  const userRoleModel = app.service('user-role').Model

  beforeEach(async () => {
    await userRoleModel.create({
      role: 'testrole'
    })
  })

  it('Create', (done) => {
    model.create({
      name: 'test',
      userRole: 'testrole'
    }).then(res => {
      done()
    }).catch(err => {
      console.log(err)
    })
  })

  it('Read', () => {
    model.findOne({
      where: {
        name: 'test',
        userRole: 'testrole'
      }
    }).then(res => {
      done()
    }).catch(err => {
      console.log(err)
    })
  })

  it('Update', () => {
    model.update(
      { name: GenerateRandomAnimalName().toUpperCase() },
      {
        where: { name: 'test', userRole: 'testrole' }
      }).then(res => {
      done()
    }).catch(err => {
      console.log(err)
    })
  })

  it('Delete', () => {
    model.destroy({
      where: { userRole: 'testrole' }
    }).then(res => {
      done()
    }).catch(err => {
      console.log('ERROR')
      console.log(err)
    })
  })

  afterEach(async () => {
    await userRoleModel.destroy({
      where: {
        role: 'testrole'
      }
    })
  })
})
