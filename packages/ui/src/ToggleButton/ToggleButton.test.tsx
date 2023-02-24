import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import ToggleButton from './index'
import { Default as story } from './index.stories'

describe('ToggleButton', () => {
  it('- should render', () => {
    const wrapper = shallow(<ToggleButton {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
