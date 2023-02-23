import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Card from './index'
import { Default as story } from './index.stories'

describe('Card', () => {
  it('- should render', () => {
    const wrapper = shallow(<Card {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
