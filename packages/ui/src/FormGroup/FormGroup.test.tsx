import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import FormGroup from './index'
import { Default as story } from './index.stories'

describe('FormGroup', () => {
  it('- should render', () => {
    const wrapper = shallow(<FormGroup {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
