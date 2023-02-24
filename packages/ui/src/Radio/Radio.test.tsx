import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Radio from './index'
import { Default as story } from './index.stories'

describe('Radio', () => {
  it('- should render', () => {
    const wrapper = shallow(<Radio {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
