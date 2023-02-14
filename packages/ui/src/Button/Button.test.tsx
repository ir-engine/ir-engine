import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Button from './index'
import { Default as story } from './index.stories'

describe('Button', () => {
  it('- should render', () => {
    const wrapper = shallow(<Button {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
