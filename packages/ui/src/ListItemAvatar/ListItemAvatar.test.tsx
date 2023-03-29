import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import ListItemAvatar from './index'
import { Default as story } from './index.stories'

describe('ListItemAvatar', () => {
  it('- should render', () => {
    const wrapper = shallow(<ListItemAvatar {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
