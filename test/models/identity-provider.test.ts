import app from '../../server/app'
import bcrypt from 'bcrypt'
import request from 'supertest'

describe('CRUD operation on \'IdentityProvider\' model', () => {
  const model = app.service('identity-provider').Model
  const userModel = app.service('user').Model
  let userId: any
  const password = 'password'
  const token = 'some token'

<<<<<<< HEAD
  beforeAll(async () => {
=======
  beforeEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    const user = await userModel.create({})
    userId = user.id
  })

<<<<<<< HEAD
  it('Create', async () => {
=======
  it('Create', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.create({
      type: password,
      userId: userId,
      password: password,
      token: token
    })
  })

<<<<<<< HEAD
  it('Read', async () => {
=======
  it('Read', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.findOne({
      where: {
        userId: userId
      }
    })
  })

<<<<<<< HEAD
  it('Encrypted Password', async () => {
=======
  it('Encrypted Password', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    const userFromModel = await model.findOne({
      where: {
        userId: userId
      }
    })
    expect(bcrypt.compare(password, userFromModel.password)).toBeTruthy()
  })

<<<<<<< HEAD
  it('Encrypted Token', async () => {
=======
  it('Encrypted Token', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    const user = await model.findOne({
      where: {
        userId: userId
      }
    })
    expect(bcrypt.compare(token, user.token)).toBeTruthy()
  })

<<<<<<< HEAD
  it('Find User by IdentityProvider', async () => {
=======
  it('Find User by IdentityProvider', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
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

<<<<<<< HEAD
  it('Not expecting password and token ', async () => {
=======
  it('Not expecting password and token ', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
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

<<<<<<< HEAD
  it('Delete', async () => {
=======
  it('Delete', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.destroy({
      where: { userId: userId }
    })
  })

<<<<<<< HEAD
  afterAll(async () => {
=======
  afterEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await userModel.destroy({
      where: {
        id: userId
      }
    })
  })
})
