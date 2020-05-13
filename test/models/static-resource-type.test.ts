import app from '../../src/app'

describe('CRUD operation on \'Static Resource Type\' model', () => {
  const model = app.service('static-resource-type').Model

  it('Create', (done) => {
    model.create({
      type: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        type: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  // it('Update', done => {
  //   model.update(
  //     {
  //       type: 'updated test'
  //     },
  //     {
  //       where: { type: 'test' }
  //     }
  //   ).then(res => {
  //     done(new Error('Should not update type.'))
  //   }).catch(_err => {
  //     done()
  //   })
  // })

  it('Delete', done => {
    model.destroy({
      where: { type: 'test' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
