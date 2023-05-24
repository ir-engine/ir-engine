import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import DashboardMenuItem from './index'
import { Primary as story } from './index.stories'

describe('DashboardMenuItem', () => {
  it('- should render', () => {
    const wrapper = shallow(<DashboardMenuItem {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
