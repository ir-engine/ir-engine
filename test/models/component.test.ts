// import app from '../../server/app'

// describe('CRUD operation on \'Component\' model', () => {
//   const model = app.service('component').Model
//   const componentTypeModel = app.service('component-type').Model
//   const entityModel = app.service('entity').Model
//   const entityTypeModel = app.service('entity-type').Model

//   let entityType: any
//   let componentType: any
//   let entityId: any

<<<<<<< HEAD
//   beforeAll(async () => {
=======
//   beforeEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
//     const entityTypeModelInstance = await entityTypeModel.create({
//       type: 'newType'
//     })

//     entityType = entityTypeModelInstance.type

//     const entityModelInstance = await entityModel.create({
//       name: 'testentitytype',
//       entityType: entityType
//     })

//     const componentTypeModelInstance = await componentTypeModel.create({
//       type: 'testcomponenttype'
//     })

//     entityId = entityModelInstance.id
//     componentType = componentTypeModelInstance.type
//   })

//   const input = {
//     data: JSON.stringify({ data: 'test' }),
//     componentType: componentType,
//     entityId: entityId
//   }
<<<<<<< HEAD
//   it('Create', () => {
=======
//   it('Create', done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
//     model.create(input).then(res => {
//       done()
//     }).catch(done)
//   })

<<<<<<< HEAD
//   it('Read', () => {
=======
//   it('Read', done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
//     model.findOne({
//       where: {
//         entityId: entityId
//       }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

<<<<<<< HEAD
//   it('Update', () => {
=======
//   it('Update', done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
//     model.update(
//       { data: JSON.stringify({ data: 'test2' }) },
//       { where: { entityId: entityId } }
//     ).then(res => {
//       done()
//     }).catch(done)
//   })

<<<<<<< HEAD
//   it('Delete', () => {
=======
//   it('Delete', done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
//     model.destroy({
//       where: { entityId: entityId }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

<<<<<<< HEAD
//   afterAll(async () => {
=======
//   afterEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
//     await entityModel.destroy({
//       where: {
//         id: entityId
//       }
//     })
//     await entityTypeModel.destroy({
//       where: {
//         type: entityType
//       }
//     })
//     await componentTypeModel.destroy({
//       where: {
//         type: componentType
//       }
//     })
//   })
// })
