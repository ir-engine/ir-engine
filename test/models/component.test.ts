import app from '../../src/app'

describe('CRUD operation on \'Component\' model', () => {
  const model = app.service('component').Model
  const componentTypeModel = app.service('component-type').Model
  let componentType: any

  before(async () => {
    setTimeout(() => {
      console.log('Waited for thirty seconds before test started.')
    }, 30000)

    const component = await componentTypeModel.create({
      type: 'test'
    })
    componentType = component.type
  })

  const input = {
    id: Math.random(),
    data: JSON.stringify({ data: 'test' }),
    type: componentType
  }
  it('Create', done => {
    model.create(input).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        id: input.id
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { data: JSON.stringify({ data: 'test2' }) },
      { where: { id: input.id } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { id: input.id }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(async () => {
    await componentTypeModel.destroy({
      where: {
        type: componentType
      }
    })
  })
})
