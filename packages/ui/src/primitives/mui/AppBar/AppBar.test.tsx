import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import AppBar from './index'
import { Primary as story } from './index.stories'

describe('AppBar', () => {
  it('- should render', () => {
    const wrapper = shallow(<AppBar {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
