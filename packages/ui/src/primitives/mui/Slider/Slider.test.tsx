import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Slider from './index'
import { Default as story } from './index.stories'

describe('Slider', () => {
  it('- should render', () => {
    const wrapper = shallow(<Slider {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
