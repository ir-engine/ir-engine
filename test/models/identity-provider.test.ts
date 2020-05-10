import app from '../../src/app'

describe('CRUD operation on \'IdentityProvider\' model', () => {
  const model = app.service('identity-provider').Model
  const userModel = app.service('user').Model
  const identityTypeModel = app.service('identity-provider-type').Model
  var userId: any, type: any

  before(async () => {
    const user = await userModel.create({
      email: 'email@example.com',
      password: '12345',
      mobile: '8767367277',
      githubId: 'githubtest',
      isVerified: true
    })
    userId = user.id
    const identityType = await identityTypeModel.create({
      type: 'test'
    })
    type = identityType.type
  })

  it('Create', done => {
    model.create({
      type: type,
      userId: userId
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        type: type
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { type: type },
      { where: { type: type } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { type: type }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(() => {
    userModel.destroy({
      where: {
        userId: userId
      }
    })
    identityTypeModel.destroy({
      where: {
        type: type
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
