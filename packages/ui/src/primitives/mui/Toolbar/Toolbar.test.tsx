import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Toolbar from './index'
import { Primary as story } from './index.stories'

describe('Toolbar', () => {
  it('- should render', () => {
    const wrapper = shallow(<Toolbar {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
