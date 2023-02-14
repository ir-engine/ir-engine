import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import ToggleButtonGroup from './index'
import { Default as story } from './index.stories'

describe('ToggleButtonGroup', () => {
  it('- should render', () => {
    const wrapper = shallow(<ToggleButtonGroup {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
