import app from '../../packages/server/src/app'

describe("CRUD operation on 'Static Resource Type' model", () => {
  const model = (app.service('static-resource-type') as any).Model

  it('Create', () => {
    model.create({
      type: 'test'
    })
  })

  it('Read', () => {
    model.findOne({
      where: {
        type: 'test'
      }
    })
  })

  it('Delete', () => {
    model.destroy({
      where: { type: 'test' }
    })
  })
})
