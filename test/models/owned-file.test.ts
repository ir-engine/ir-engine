import app from '../../src/app'

describe('CRUD operation on \'OwnedFile\' model', () => {
  const model = app.service('owned-file').Model
  const userModel = app.service('user').Model
  const key = Math.random().toString()
  let userId: any

  before(async () => {
    const user = await userModel.create({})
    userId = user.id
  })

  it('Create', (done) => {
    model.create({
      key: key,
      content_type: 'application/json',
      content_length: '1024',
      state: 'active',
      account_id: userId
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        account_id: userId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { status: 'inactive' },
      { where: { account_id: userId } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { account_id: userId }
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
