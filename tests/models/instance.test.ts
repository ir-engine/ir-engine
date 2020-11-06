import app from '../../packages/server/src/app'

describe('CRUD operation on \'Instance\' model', () => {
  const model = app.service('instance').Model
  const locationModel = app.service('location').Model
  let locationId: any

  beforeAll(async () => {
    const location = await locationModel.create({
      name: 'test location',
      slugifiedName: 'test-location',
      maxUsersPerInstance: 10
    })
    locationId = location.id
  })

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
    locationModel.destroy({
      where: {
        id: locationId
      }
    })
  })
})
