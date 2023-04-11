import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Dashboard from './index'
import { Default as story } from './index.stories'

describe('Dashboard', () => {
  it('- should render', () => {
    const wrapper = shallow(<Dashboard {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
