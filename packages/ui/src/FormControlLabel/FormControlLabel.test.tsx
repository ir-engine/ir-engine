import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import FormControlLabel from './index'
import { Default as story } from './index.stories'

describe('FormControlLabel', () => {
  it('- should render', () => {
    const wrapper = shallow(<FormControlLabel {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
