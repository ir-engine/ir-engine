import * as React from 'react'
import { useAutocomplete, AutocompleteGetTagProps } from '@mui/base/AutocompleteUnstyled'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'

const Root = styled('div')(
  ({ theme }) => `
  color: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,.85)'};
  font-size: 14px;
`
)

const Label = styled('label')`
  padding: 0 0 10px;
  line-height: 1.5;
  display: block;
  color: #ffffff;
`

const InputWrapper = styled('div')(
  ({ theme }) => `
  width: 100%;
  border: 1px solid #23282c;
  background-color: #343b41;
  border-radius: 4px;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;

  & input {
    background-color: #343b41;;
    color: #ffffff;
    height: 30px;
    box-sizing: border-box;
    padding: 4px 6px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`
)

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
  label: string
}

function Tag(props: TagProps) {
  const { label, onDelete, ...other } = props
  return (
    <div {...other}>
      <span>{label}</span>
      <CloseIcon onClick={onDelete} />
    </div>
  )
}

const StyledTag = styled(Tag)<TagProps>(
  ({ theme }) => `
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: #343b41;
  border: 1px solid #23282c;
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;
  color: #f1f1f1;
  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
    color: #ffffff;
  }
`
)

const Listbox = styled('ul')(
  ({ theme }) => `
  width: 40%;
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: #343b41;
  color: #ffffff;
  overflow: auto;
  max-height: 30vh;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;

  & li {
    padding: 5px 12px;
    display: flex;
    cursor: pointer;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: #15171B;
    font-weight: 600;

    & svg {
      color: #fff;
    }
  }

  & li[data-focus='true'] {
    background-color: #15171B !important;
    cursor: pointer;
    
    & svg {
      color: currentColor;
    }
  }
`
)

export default function AutoComplete({ data, label, handleChangeScopeType, scopes }) {
  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    value,
    focused,
    setAnchorEl
  } = useAutocomplete({
    id: 'customized-hook-demo',
    defaultValue: scopes || [],
    multiple: true,
    options: data,
    getOptionLabel: (option) => option.type,
    onChange: (event: React.ChangeEvent<{}>, value: any) => {
      handleChangeScopeType(value)
    }
  })
  return (
    <Root>
      <div {...getRootProps()}>
        <Label {...getInputLabelProps()}>{label}</Label>
        <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
          {value.map((option: DataType, index: number) => (
            <StyledTag label={option.type} {...getTagProps({ index })} />
          ))}
          <input {...getInputProps()} />
        </InputWrapper>
      </div>
      {groupedOptions.length > 0 ? (
        <Listbox {...getListboxProps()}>
          {(groupedOptions as typeof data).map((option, index) => (
            <li {...getOptionProps({ option, index })}>
              <span>{option.type}</span>
              <CheckIcon fontSize="small" />
            </li>
          ))}
        </Listbox>
      ) : null}
    </Root>
  )
}

interface DataType {
  type: string
}
