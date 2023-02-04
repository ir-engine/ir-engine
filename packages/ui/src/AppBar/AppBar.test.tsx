import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import AppBar from './index'
import { Default as story } from './index.stories'

describe('AppBar', () => {
  it('- should render', () => {
    const wrapper = shallow(<AppBar {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
