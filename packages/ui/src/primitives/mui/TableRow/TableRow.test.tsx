import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import TableRow from './index'
import { Primary as story } from './index.stories'

describe('TableRow', () => {
  it('- should render', () => {
    const wrapper = shallow(<TableRow {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
