import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import ListItemIcon from './index'
import { Default as story } from './index.stories'

describe('ListItemIcon', () => {
  it('- should render', () => {
    const wrapper = shallow(<ListItemIcon {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
