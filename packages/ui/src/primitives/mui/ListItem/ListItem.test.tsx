import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import ListItem from './index'
import { Primary as story } from './index.stories'

describe('ListItem', () => {
  it('- should render', () => {
    const wrapper = shallow(<ListItem {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
