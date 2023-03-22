import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Switch from './index'
import { Default as story } from './index.stories'

describe('Switch', () => {
  it('- should render', () => {
    const wrapper = shallow(<Switch {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
