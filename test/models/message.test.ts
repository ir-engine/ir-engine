import app from '../../src/app'
import GenerateRandomAnimalName from 'random-animal-name-generator'
import { Op } from 'sequelize'

describe('CRUD operation on \'Message\' model', () => {
  const model = app.service('message').Model
  const userModel = app.service('user').Model
  const convModel = app.service('conversation').Model

  let sender: any, receiver: any, conversationId: any

  before(async () => {
    let user = await userModel.create({
      name: GenerateRandomAnimalName().toUpperCase()
    })
    sender = user.id

    user = await userModel.create({
      name: GenerateRandomAnimalName().toUpperCase()
    })
    receiver = user.id
    const conversation = await convModel.create({
      firstuserId: sender,
      seconduserId: receiver,
      recipientType: 'user'
    })
    conversationId = conversation.id
  })

  it('Create', (done) => {
    model.create({
      text: 'test message',
      senderId: sender,
      conversationId: conversationId
    }).then(res => {
      convModel.findOne({
        include: [model]
      }).then(res => {
        done()
      }).catch(done)
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        conversationId: conversationId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { conversationId: conversationId }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Shouldnot create without senderId and conversationId', (done) => {
    model.create({
      text: 'test message'
    }).then(res => {
      done(new Error('Message shouldnot created without its senderId and conversationId.'))
    }).catch(_err => {
      done()
    })
  })

  after(async () => {
    await userModel.destroy({
      where: {
        id: {
          [Op.in]: [sender, receiver]
        }
      }

    })

    await convModel.destroy({
      where: {
        id: conversationId
      }
    })
  })
})
