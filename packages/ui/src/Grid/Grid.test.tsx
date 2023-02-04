import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Grid from './index'
import { Default as story } from './index.stories'

describe('Grid', () => {
  it('- should render', () => {
    const wrapper = shallow(<Grid {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
