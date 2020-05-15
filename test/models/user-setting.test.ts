import app from '../../src/app'

describe('CRUD operation on \'UserSetting\' model', () => {
  const model = app.service('user-settings').Model
  const userModel = app.service('user').Model
  let userId: any

  before(async () => {
    const user = await userModel.create({})
    userId = user.id
  })

  it('Create', done => {
    model.create({
      microphone: '.5',
      audio: '.5',
      userId: userId
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        userId: userId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      {
        microphone: '.8'
      },
      {
        where: {
          userId: userId
        }
      }).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { userId: userId }
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
