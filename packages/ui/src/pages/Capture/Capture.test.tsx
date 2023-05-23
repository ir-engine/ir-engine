import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Capture from './index'
import { Primary as story } from './index.stories'

describe('Capture', () => {
  it('- should render', () => {
    const wrapper = shallow(<Capture {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
