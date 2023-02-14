import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Tabs from './index'
import { Default as story } from './index.stories'

describe('Tabs', () => {
  it('- should render', () => {
    const wrapper = shallow(<Tabs {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
