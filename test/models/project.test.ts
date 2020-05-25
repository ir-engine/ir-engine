import app from '../../src/app'

describe('CRUD operation on \'Project\' model', () => {
  const model = app.service('project').Model
  const collectionTypeModel = app.service('collection-type').Model
  const collectionModel = app.service('collection').Model

  const userRoleModel = app.service('user-role').Model
  const userModel = app.service('user').Model

  let userRole: any, userId: any, collectionId: any, collectionType: any

  before(async () => {
    userRole = await userRoleModel.create({ role: 'usertestrole' }).role
    userId = await userModel.create({ userRole: userRole }).id
    collectionType = await collectionTypeModel.create({ type: 'test-project' }).type
    collectionId = await collectionModel.create({ name: 'test-collection', collectionType }).id
  })

  it('Create', (done) => {
    model.create({
      name: 'test project',
      creatorUserId: userId,
      collectionId
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        name: 'test project'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { type: 'model' },
      { where: { name: 'test project' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { name: 'test project' }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(async () => {
    userModel.destroy({
      where: {
        id: userId
      }
    })

    userRoleModel.destroy({
      where: {
        role: userRole
      }
    })

    collectionModel.destroy({
      where: {
        id: collectionId
      }
    })

    collectionTypeModel.destroy({
      where: {
        type: collectionType
      }
    })
  })
})
