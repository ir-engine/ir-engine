import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Container from './index'
import { Default as story } from './index.stories'

describe('Container', () => {
  it('- should render', () => {
    const wrapper = shallow(<Container {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
