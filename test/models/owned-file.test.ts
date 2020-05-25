import app from '../../src/app'

describe('CRUD operation on \'OwnedFile\' model', () => {
  const model = app.service('owned-file').Model
  const userModel = app.service('user').Model
  const key = Math.random().toString()
  let userId: any

  before(async () => {
    const user = await userModel.create({
      userRole: 'user'
    })
    userId = user.id
  })

  it('Create', (done) => {
    model.create({
      key: key,
      url: 'http://wikipedia.org',
      content_type: 'application/json',
      content_length: '1024',
      state: 'active',
      ownerUserId: userId
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        ownerUserId: userId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { status: 'inactive' },
      { where: { ownerUserId: userId } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { ownerUserId: userId }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(async () => {
    await userModel.destroy({
      where: {
        id: userId
      }
    })
  })
})
