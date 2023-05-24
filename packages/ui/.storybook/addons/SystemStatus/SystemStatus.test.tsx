import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import SystemStatus from './index'
import { Primary as story } from './index.stories'

describe('SystemStatus', () => {
  it('- should render', () => {
    const wrapper = shallow(<SystemStatus {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
