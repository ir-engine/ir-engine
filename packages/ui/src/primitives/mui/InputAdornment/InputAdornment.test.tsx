import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import InputAdorment from './index'
import { Default as story } from './index.stories'

describe('InputAdorment', () => {
  it('- should render', () => {
    const wrapper = shallow(<InputAdorment {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
