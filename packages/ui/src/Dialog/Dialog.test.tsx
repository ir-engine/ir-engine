import { shallow } from 'enzyme'
import React from 'react'

import Dialog from './index'
import { Default as story } from './index.stories'

describe('Dialog', () => {
  it('- should render', () => {
    const wrapper = shallow(<Dialog {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
