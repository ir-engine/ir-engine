// import app from '../../server/app'

// describe('CRUD operation on \'Component\' model', () => {
//   const model = app.service('component').Model
//   const componentTypeModel = app.service('component-type').Model
//   const entityModel = app.service('entity').Model
//   const entityTypeModel = app.service('entity-type').Model

//   let entityType: any
//   let componentType: any
//   let entityId: any

//   beforeEach(async () => {
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
//   it('Create', () => {
//     model.create(input).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Read', () => {
//     model.findOne({
//       where: {
//         entityId: entityId
//       }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Update', () => {
//     model.update(
//       { data: JSON.stringify({ data: 'test2' }) },
//       { where: { entityId: entityId } }
//     ).then(res => {
//       done()
//     }).catch(done)
//   })

//   it('Delete', () => {
//     model.destroy({
//       where: { entityId: entityId }
//     }).then(res => {
//       done()
//     }).catch(done)
//   })

//   afterEach(async () => {
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
