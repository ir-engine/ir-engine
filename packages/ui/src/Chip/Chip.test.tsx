import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Chip from './index'
import { Default as story } from './index.stories'

describe('Chip', () => {
  it('- should render', () => {
    const wrapper = shallow(<Chip {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
