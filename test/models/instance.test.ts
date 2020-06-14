import app from '../../server/app'

describe('CRUD operation on \'Instance\' model', () => {
  const model = app.service('instance').Model
  const locationModel = app.service('location').Model
<<<<<<< HEAD
  let locationId: any

  beforeAll(async () => {
=======
  let locationId: any, instanceId: any

  beforeEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    const location = await locationModel.create({
      name: 'test location',
      maxUsersPerInstance: 10
    })
    locationId = location.id
  })

<<<<<<< HEAD
  it('Create', () => {
    model.create({
      locationId
    })
  })

  it('Read', () => {
    model.findOne({
      where: {
        locationId
      }
    })
  })

  it('Update', () => {
    model.update(
      { currentUsers: 20 },
      { where: { locationId } }
    )
  })

  it('Delete', () => {
    model.destroy({
      where: { locationId }
    })
  })

  afterAll(() => {
=======
  it('Create', done => {
    model.create({
      locationId: locationId
    }).then(res => {
      instanceId = res.id
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        id: instanceId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { currentUsers: 20 },
      { where: { id: instanceId } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { id: instanceId }
    }).then(res => {
      done()
    }).catch(done)
  })

  afterEach(() => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    locationModel.destroy({
      where: {
        id: locationId
      }
    })
  })
})
