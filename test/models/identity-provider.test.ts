import app from '../../src/app'
import { Op } from 'sequelize'
import bcrypt from 'bcrypt'
import request from 'supertest'

describe('CRUD operation on \'IdentityProvider\' model', () => {
  const model = app.service('identity-provider').Model
  const userModel = app.service('user').Model
  const identityProviderTypeModel = app.service('identity-provider-type').Model
  let userId: any, type: any, newType: any
  const password = 'password'
  const token = 'some token'

  before(async () => {
    const user = await userModel.create({})
    userId = user.id
    let identityProviderType = await identityProviderTypeModel.create({
      type: 'test'
    })
    type = identityProviderType.type

    identityProviderType = await identityProviderTypeModel.create({
      type: 'new test'
    })
    newType = identityProviderType.type
  })

  it('Create', done => {
    model.create({
      type: type,
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

  it('Update', done => {
    model.update(
      { type: newType },
      { where: { userId: userId } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Find User by IdentityProvider', done => {
    model.findOne({
      where: {
        type: newType
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
          if (('token' in identityProvider)) {
            done(new Error('Not expecting token.'))
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
    identityProviderTypeModel.destroy({
      where: {
        type: {
          [Op.in]: [type, newType]
        }
      }
    })
  })

  it('Should not create IdentityProvider without IdentityProviderType', done => {
    model.create({
      type: 'test11'
    }).then(res => {
      done(new Error('IdentityProvider created without IdentityProviderType.'))
    }).catch(_err => {
      done()
    })
  })
})
