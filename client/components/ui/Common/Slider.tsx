import Slider from '@material-ui/core/Slider'

interface Props {
  value: number
  onChange: any
  arialabelledby: any
}

const CommonSlider = (props: Props) => (
  <Slider
    value={props.value}
    onChange={props.onChange}
    aria-labelledby={props.arialabelledby}
  />
)

export default CommonSlider
