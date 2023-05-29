import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Drawer from './index'
import { Default as story } from './index.stories'

describe('Drawer', () => {
  it('- should render', () => {
    const wrapper = shallow(<Drawer {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
