import app from '../../server/app'

describe('CRUD operation on \'Instance\' model', () => {
  const model = app.service('instance').Model
  const locationModel = app.service('location').Model
  let locationId: any, instanceId: any

  beforeEach(async () => {
    const location = await locationModel.create({
      name: 'test location',
      maxUsersPerInstance: 10
    })
    locationId = location.id
  })

  it('Create', () => {
    model.create({
      locationId: locationId
    }).then(res => {
      instanceId = res.id
      done()
    }).catch(done)
  })

  it('Read', () => {
    model.findOne({
      where: {
        id: instanceId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', () => {
    model.update(
      { currentUsers: 20 },
      { where: { id: instanceId } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', () => {
    model.destroy({
      where: { id: instanceId }
    }).then(res => {
      done()
    }).catch(done)
  })

  afterEach(() => {
    locationModel.destroy({
      where: {
        id: locationId
      }
    })
  })
})
