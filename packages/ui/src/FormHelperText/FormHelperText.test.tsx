import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import FormHelperText from './index'
import { Default as story } from './index.stories'

describe('FormHelperText', () => {
  it('- should render', () => {
    const wrapper = shallow(<FormHelperText {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
