import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import SvgIcon from './index'
import { Default as story } from './index.stories'

describe('SgIcon', () => {
  it('- should render', () => {
    const wrapper = shallow(<SvgIcon {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
