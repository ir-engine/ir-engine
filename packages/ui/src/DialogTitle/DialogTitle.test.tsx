import { shallow } from 'enzyme'
import React from 'react'

import DialogTitle from './index'
import { Default as story } from './index.stories'

describe('DialogTitle', () => {
  it('- should render', () => {
    const wrapper = shallow(<DialogTitle {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
