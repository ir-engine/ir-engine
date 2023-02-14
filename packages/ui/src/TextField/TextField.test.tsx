import { shallow } from 'enzyme'
import React from 'react'

import TextField from './index'
import { Default as story } from './index.stories'

describe('TextField', () => {
  it('- should render', () => {
    const wrapper = shallow(<TextField {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
