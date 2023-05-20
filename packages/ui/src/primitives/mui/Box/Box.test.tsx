import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Box from './index'
import { Primary as story } from './index.stories'

describe('Box', () => {
  it('- should render', () => {
    const wrapper = shallow(<Box {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
