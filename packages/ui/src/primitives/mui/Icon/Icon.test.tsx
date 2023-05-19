import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Icon from './index'
import { Primary as story } from './index.stories'

describe('Icon', () => {
  it('- should render', () => {
    const wrapper = shallow(<Icon {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
