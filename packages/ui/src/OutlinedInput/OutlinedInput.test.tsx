import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import OutlinedInput from './index'
import { Default as story } from './index.stories'

describe('OutlinedInput', () => {
  it('- should render', () => {
    const wrapper = shallow(<OutlinedInput {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
