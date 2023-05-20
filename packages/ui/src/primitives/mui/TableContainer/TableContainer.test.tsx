import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import TableContainer from './index'
import { Primary as story } from './index.stories'

describe('TableContainer', () => {
  it('- should render', () => {
    const wrapper = shallow(<TableContainer {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
