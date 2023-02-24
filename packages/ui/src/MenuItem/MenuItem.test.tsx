import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import MenuItem from './index'
import { Default as story } from './index.stories'

describe('MenuItem', () => {
  it('- should render', () => {
    const wrapper = shallow(<MenuItem {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
