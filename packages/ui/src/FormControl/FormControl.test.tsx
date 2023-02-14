import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import FormControl from './index'
import { Default as story } from './index.stories'

describe('FormControl', () => {
  it('- should render', () => {
    const wrapper = shallow(<FormControl {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
