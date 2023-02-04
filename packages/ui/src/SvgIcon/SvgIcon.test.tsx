import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import SVgIcon from './index'
import { Default as story } from './index.stories'

describe('SVgIcon', () => {
  it('- should render', () => {
    const wrapper = shallow(<SVgIcon {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
