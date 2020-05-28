import app from '../../src/app'
import bcrypt from 'bcrypt'
import request from 'supertest'

describe('CRUD operation on \'IdentityProvider\' model', () => {
  const model = app.service('identity-provider').Model
  const userModel = app.service('user').Model
  let userId: any
  const password = 'password'
  const token = 'some token'

  before(async () => {
    const user = await userModel.create({})
    userId = user.id
  })

  it('Create', done => {
    model.create({
      type: password,
      userId: userId,
      password: password,
      token: token
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

  it('Encrypted Password', done => {
    model.findOne({
      where: {
        userId: userId
      }
    }).then(res => {
      bcrypt.compare(password, res.password).then(res => {
        done()
      }).catch(done)
    }).catch(done)
  })

  it('Encrypted Token', done => {
    model.findOne({
      where: {
        userId: userId
      }
    }).then(res => {
      bcrypt.compare(token, res.token).then(res => {
        done()
      }).catch(done)
    }).catch(done)
  })

  it('Find User by IdentityProvider', done => {
    model.findOne({
      where: {
        type: password
      }
    }).then(res => {
      userModel.findOne({
        where: {
          id: res.userId
        }
      }).then(res => {
        done()
      }).catch(done)
    }).catch(done)
  })

  it('Not expecting password and token ', done => {
    (request(app) as any).get('/identity-provider')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const result = JSON.parse(response.res.text)
        if (result.total > 0) {
          const identityProvider = result.data[0]
          if (('password' in identityProvider)) {
            done(new Error('Not expecting password.'))
            return
          }
        }
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

  after(() => {
    userModel.destroy({
      where: {
        id: userId
      }
    })
  })
})
