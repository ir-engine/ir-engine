import app from '../../src/app'

describe('CRUD operation on \'Instance\' model', () => {
  const model = app.service('instance').Model
  const locationModel = app.service('location').Model
  var locationId: any

  before(async () => {
    const location = await locationModel.create({
      name: 'test',
      maxUsersPerInstance: 10
    })
    locationId = location.id
  })

  it('Create', done => {
    model.create({
      address: 'test address',
      maxUsers: 10,
      locationId: locationId
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        locationId: locationId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { maxUsers: 20 },
      { where: { locationId: locationId } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { locationId: locationId }
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
  })
})
