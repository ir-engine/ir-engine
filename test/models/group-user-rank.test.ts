import app from '../../src/app'

describe('CRUD operation on \'GroupUserRank\' model', () => {
  const model = app.service('group-user-rank').Model

  it('Create', done => {
    model.create({
      rank: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        rank: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { rank: 'test' },
      { where: { rank: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { rank: 'test' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
