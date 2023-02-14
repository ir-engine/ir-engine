import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Accordian from './index'
import { Default as story } from './index.stories'

describe('Accordian', () => {
  it('- should render', () => {
    const wrapper = shallow(<Accordian {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
