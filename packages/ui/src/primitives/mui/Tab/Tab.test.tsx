import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Tab from './index'
import { Primary as story } from './index.stories'

describe('Tab', () => {
  it('- should render', () => {
    const wrapper = shallow(<Tab {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
