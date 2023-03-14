import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import RadioGroup from './index'
import { Default as story } from './index.stories'

describe('RadioGroup', () => {
  it('- should render', () => {
    const wrapper = shallow(<RadioGroup {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
