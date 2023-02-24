import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import InputLabel from './index'
import { Default as story } from './index.stories'

describe('InputLabel', () => {
  it('- should render', () => {
    const wrapper = shallow(<InputLabel {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
