import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import InputBase from './index'
import { Default as story } from './index.stories'

describe('InputBase', () => {
  it('- should render', () => {
    const wrapper = shallow(<InputBase {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
