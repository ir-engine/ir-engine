import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import ThemeSwitcher from './index'
import { Primary as story } from './index.stories'

describe('ThemeSwitcher', () => {
  it('- should render', () => {
    const wrapper = shallow(<ThemeSwitcher {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
