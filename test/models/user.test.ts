import app from '../../server/app'
import GenerateRandomAnimalName from 'random-animal-name-generator'

describe('CRUD operation on \'User\' model', () => {
  const model = app.service('user').Model
  const userRoleModel = app.service('user-role').Model

<<<<<<< HEAD
  beforeAll(async () => {
=======
  beforeEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await userRoleModel.create({
      role: 'testrole'
    })
  })

<<<<<<< HEAD
  it('Create', () => {
    model.create({
      name: 'test',
      userRole: 'testrole'
    })
  })

  it('Read', () => {
=======
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

  it('Read', done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    model.findOne({
      where: {
        name: 'test',
        userRole: 'testrole'
      }
<<<<<<< HEAD
    })
  })

  it('Update', () => {
=======
    }).then(res => {
      done()
    }).catch(err => {
      console.log(err)
    })
  })

  it('Update', done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    model.update(
      { name: GenerateRandomAnimalName().toUpperCase() },
      {
        where: { name: 'test', userRole: 'testrole' }
<<<<<<< HEAD
      })
  })

  it('Delete', () => {
    model.destroy({
      where: { userRole: 'testrole' }
    })
  })

  afterAll(async () => {
=======
      }).then(res => {
      done()
    }).catch(err => {
      console.log(err)
    })
  })

  it('Delete', done => {
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
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await userRoleModel.destroy({
      where: {
        role: 'testrole'
      }
    })
  })
})
