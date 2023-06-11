import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Menu from './index'
import { Primary as story } from './index.stories'

describe('Menu', () => {
  it('- should render', () => {
    const wrapper = shallow(<Menu {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
