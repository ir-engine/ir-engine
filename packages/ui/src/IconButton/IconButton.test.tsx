import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import IconButton from './index'
import { Default as story } from './index.stories'

describe('IconButton', () => {
  it('- should render', () => {
    const wrapper = shallow(<IconButton {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
