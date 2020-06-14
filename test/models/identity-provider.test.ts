import app from '../../server/app'
import bcrypt from 'bcrypt'
import request from 'supertest'

describe('CRUD operation on \'IdentityProvider\' model', () => {
  const model = app.service('identity-provider').Model
  const userModel = app.service('user').Model
  let userId: any
  const password = 'password'
  const token = 'some token'

  beforeEach(async () => {
    const user = await userModel.create({})
    userId = user.id
  })

  it('Create', async done => {
    await model.create({
      type: password,
      userId: userId,
      password: password,
      token: token
    })
  })

  it('Read', async done => {
    await model.findOne({
      where: {
        userId: userId
      }
    })
  })

  it('Encrypted Password', async done => {
    const userFromModel = await model.findOne({
      where: {
        userId: userId
      }
    })
    expect(bcrypt.compare(password, userFromModel.password)).toBeTruthy()
  })

  it('Encrypted Token', async done => {
    const user = await model.findOne({
      where: {
        userId: userId
      }
    })
    expect(bcrypt.compare(token, user.token)).toBeTruthy()
  })

  it('Find User by IdentityProvider', async done => {
    const identityProvider = await model.findOne({
      where: {
        type: password
      }
    })

    const userFromId = await userModel.findOne({
      where: {
        id: identityProvider.userId
      }
    })

    expect(userFromId).toBe(expect.anything())
  })

  it('Not expecting password and token ', async done => {
    (request(app) as any).get('/identity-provider')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        const result = JSON.parse(response.res.text)
        if (result.total > 0) {
          const identityProvider = result.data[0]
          expect('password' in identityProvider).toBeFalsy()
        }
      })
  })

  it('Delete', async done => {
    await model.destroy({
      where: { userId: userId }
    })
  })

  afterEach(async () => {
    await userModel.destroy({
      where: {
        id: userId
      }
    })
  })
})
