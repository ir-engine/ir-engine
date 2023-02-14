import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Typography from './index'
import { Default as story } from './index.stories'

describe('Typography', () => {
  it('- should render', () => {
    const wrapper = shallow(<Typography {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
