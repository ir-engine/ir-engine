import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Avatar from './index'
import { Default as story } from './index.stories'

describe('Avatar', () => {
  it('- should render', () => {
    const wrapper = shallow(<Avatar {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
