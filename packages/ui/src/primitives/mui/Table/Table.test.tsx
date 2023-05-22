import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Table from './index'
import { Primary as story } from './index.stories'

describe('Table', () => {
  it('- should render', () => {
    const wrapper = shallow(<Table {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
