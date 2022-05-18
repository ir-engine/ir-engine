import app from '../../packages/server/src/app'
import bcrypt from 'bcrypt'
import request from 'supertest'

describe('CRUD operation on \'IdentityProvider\' model', () => {
  const model = (app.service('identity-provider') as any).Model
  const userModel = (app.service('user') as any).Model
  let userId: any
  const password = 'password'
  const token = 'some token'

  beforeAll(async (done) => {
    await model.destroy({
      where: { token: token }
    })
    const user = await userModel.create({})
    userId = user.id
    done()
  })

  it('Create', async () => {
    await model.create({
      type: password,
      userId: userId,
      password: password,
      token: token
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        userId: userId
      }
    })
  })

  it('Encrypted Password', async () => {
    const userFromModel = await model.findOne({
      where: {
        userId: userId
      }
    })
    expect(bcrypt.compare(password, userFromModel.password)).toBeTruthy()
  })

  it('Encrypted Token', async () => {
    const user = await model.findOne({
      where: {
        userId: userId
      }
    })
    expect(bcrypt.compare(token, user.token)).toBeTruthy()
  })

  it('Find User by IdentityProvider', async () => {
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

    expect(userFromId).toEqual(expect.anything())
  })

  it('Not expecting password and token ', async () => {
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

  it('Delete', async () => {
    await model.destroy({
      where: { userId: userId }
    })
  })

  afterAll(async () => {
    await userModel.destroy({
      where: {
        id: userId
      }
    })
  })
})
