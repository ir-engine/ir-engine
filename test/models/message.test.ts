// import app from '../../src/app'
// // import { Op } from 'sequelize'

// describe('CRUD operation on \'Message\' model', () => {
//   const model = app.service('message').Model
//   const userModel = app.service('user').Model
//   const convModel = app.service('conversation').Model

//   let sender: any, receiver: any, conversationId: any

//   before(async () => {
//     let user = await userModel.create({
//       name: 'test user 1'
//     })
//     sender = user.id

//     user = await userModel.create({
//       name: 'test user 2'
//     })
//     receiver = user.id
//     const conversation = await convModel.create({
//       user1: sender,
//       user2: receiver,
//       recipientType: 'user'
//     })
//     conversationId = conversation.id
//   })

//   it('Create', (done) => {
//     model.create({
//       text: 'test message',
//       senderId: sender,
//       conversationId: conversationId
//     }).then(res => {
//       convModel.findOne({
//         include: [model]
//       }).then(res => {
//         console.log(res)
//         done()
//       }).catch(done)
//     }).catch(done)
//   })

//   //   it('Read', done => {
//   //     model.findOne({
//   //       where: {
//   //         conversationId: conversationId
//   //       }
//   //     }).then(res => {
//   //       done()
//   //     }).catch(done)
//   //   })

//   //   //   it('Update', done => {
//   //   //     model.update(
//   //   //       { type: 'model' },
//   //   //       { where: { name: 'test asset' } }
//   //   //     ).then(res => {
//   //   //       done()
//   //   //     }).catch(done)
//   //   //   })

//   //   it('Delete', done => {
//   //     model.destroy({
//   //       where: { conversationId: conversationId }
//   //     }).then(res => {
//   //       done()
//   //     }).catch(done)
//   //   })

//   //   after(async () => {
//   //     await userModel.destroy({
//   //       where: {
//   //         id: {
//   //           [Op.in]: [sender, receiver]
//   //         }
//   //       }

// //     })
// //   })
// })
