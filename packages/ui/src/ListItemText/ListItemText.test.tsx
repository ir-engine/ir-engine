import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import ListItemText from './index'
import { Default as story } from './index.stories'

describe('ListItemText', () => {
  it('- should render', () => {
    const wrapper = shallow(<ListItemText {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
