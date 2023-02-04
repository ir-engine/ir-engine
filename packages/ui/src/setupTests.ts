import js from '@testing-library/jest-dom'
import jsee from '@testing-library/jest-dom/extend-expect'
import enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

enzyme.configure({ adapter: new Adapter() })
