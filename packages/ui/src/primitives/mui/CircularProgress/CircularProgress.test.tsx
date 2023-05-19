import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import CircularProgress from './index'
import { Primary as story } from './index.stories'

describe('CircularProgress', () => {
  it('- should render', () => {
    const wrapper = shallow(<CircularProgress {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
