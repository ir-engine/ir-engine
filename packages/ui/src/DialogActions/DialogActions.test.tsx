import { shallow } from 'enzyme'
import React from 'react'

import DialogActions from './index'
import { Default as story } from './index.stories'

describe('DialogActions', () => {
  it('- should render', () => {
    const wrapper = shallow(<DialogActions {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
