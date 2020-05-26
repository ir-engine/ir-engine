import app from '../../src/app'
import GenerateRandomAnimalName from 'random-animal-name-generator'
import { Op } from 'sequelize'

describe('CRUD operation on \'MessageStatus\' model', () => {
  const model = app.service('message-status').Model
  const messageModel = app.service('message').Model
  const userModel = app.service('user').Model
  const convModel = app.service('conversation').Model

  let sender: any, receiver: any, conversationId: any, messageId: any

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

    const message = await messageModel.create({
      text: 'test message',
      senderId: sender,
      conversationId: conversationId
    })
    messageId = message.id
  })

  it('Create', (done) => {
    model.create({
      messageId: messageId,
      recipientId: receiver
    }).then(res => {
      convModel.findOne({
        include: [{
          model: messageModel,
          include: [model]
        }]
      }).then(res => {
        done()
      }).catch(done)
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        messageId: messageId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { messageId: messageId }
    }).then(res => {
      done()
    }).catch(done)
  })

  //   it('Shouldnot create without messageId and recipientId', (done) => {
  //     model.create({}).then(res => {
  //       done(new Error('Message status shouldnot created without messageId and recipientId.'))
  //     }).catch(_err => {
  //       done()
  //     })
  //   })

  after(async () => {
    await userModel.destroy({
      where: {
        id: {
          [Op.in]: [sender, receiver]
        }
      }

    })

    await messageModel.destroy({
      where: {
        conversationId: conversationId
      }
    })

    await convModel.destroy({
      where: {
        id: conversationId
      }
    })
  })
})
