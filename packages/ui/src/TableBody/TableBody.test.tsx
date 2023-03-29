import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import TableBody from './index'
import { Default as story } from './index.stories'

describe('TableBody', () => {
  it('- should render', () => {
    const wrapper = shallow(<TableBody {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
