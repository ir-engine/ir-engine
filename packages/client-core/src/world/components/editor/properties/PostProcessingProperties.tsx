import React, { PureComponent } from "react";
import BooleanInput from "../inputs/BooleanInput";
import ColorInput from "../inputs/ColorInput";
import CompoundNumericInput from "../inputs/CompoundNumericInput";
import InputGroup from "../inputs/InputGroup";
import SelectInput from "../inputs/SelectInput";
import { PostProcessingPropertyTypes } from "./PostProcessingNodeEditor";

const BlendFunctionSelect=[
    {
      label: "Skip",
      value: 0
    },
    {
      label: "Add",
      value: 1
    },
    {
      label: "ALPHA",
      value: 2
    },
    {
      label: "AVERAGE",
      value: 3
    },
    {
      label: "COLOR_BURN",
      value: 4
    },
    {
      label: "COLOR_DODGE",
      value: 5
    },
    {
      label: "DARKEN",
      value: 6
    },
    {
      label: "DIFFERENCE",
      value: 7
    },
    {
      label: "EXCLUSION",
      value: 8
    },
    {
      label: "LIGHTEN",
      value: 9
    },
    {
      label: "MULTIPLY",
      value: 10
    },
    {
      label: "DIVIDE",
      value: 11
    },
    {
      label: "NEGATION",
      value: 12
    },
    {
      label: "NORMAL",
      value: 13
    },
    {
      label: "OVERLAY",
      value: 14
    },
    {
      label: "REFLECT",
      value: 15
    },
    {
      label: "SCREEN",
      value: 16
    },
    {
      label: "SOFT_LIGHT",
      value: 17
    },
    {
      label: "SUBTRACT",
      value: 18
    },
  ];

const KernelSizeSelect= [

      {
        label: "VERY_SMALL",
        value: 0
      },
      {
        label: "SMALL",
        value: 1
      },

      {
        label: "MEDIUM",
        value: 2
      },
      {
        label: "LARGE",
        value: 3
      },
      {
        label: "VERY_LARGE",
        value: 4
      },
      {
        label: "HUGE",
        value: 5
      },
];
interface props {
    values?:object,
    onChangeFunction?:object
 }
 
/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */
export default class PostProcessingProperties extends PureComponent<props>{

    render(){
        { /* @ts-ignore */}
        const {values,op,onChangeFunction,getProp}=this.props;
        const onPropertyValueChanged=(event)=>{
          let address='';
          op.forEach((element,id) => {
            if(id<op.length-1)
              address+=element+".";
            else
              address+=element;
          });
          { /* @ts-ignore */}
          onChangeFunction(address,event);
        };

        const getPropertyValue=()=>{
          const val=getProp(op);
          return val;
        };

        { /* @ts-ignore */}
        if(values.keys==="") return <></>;


        let renderVal=<></>;
        { /* @ts-ignore */}
        switch(values.propertyType){
            case PostProcessingPropertyTypes.Number:
                renderVal=<>
                { /* @ts-ignore */}
                <CompoundNumericInput
                    min={0}
                    max={100}
                    step={0.001}
                    value={getPropertyValue()}
                    onChange={onPropertyValueChanged}
                    />
                </>;
                break;

            case PostProcessingPropertyTypes.Boolean:
                renderVal= <><BooleanInput
                    onChange={onPropertyValueChanged}
                    value={getPropertyValue()}
                  /> </>;
                break;
            case PostProcessingPropertyTypes.BlendFunction:
                renderVal= <>
                    { /* @ts-ignore */}
                    <SelectInput options={BlendFunctionSelect}
                    onChange={onPropertyValueChanged}
                    value={getPropertyValue()}
                    />
                    </>;
                break;

            case PostProcessingPropertyTypes.Color:
                { /* @ts-ignore */}
                renderVal= <ColorInput
                  value={getPropertyValue()}
                  onChange={onPropertyValueChanged}
                  isValueAsInteger={true}
                  />;
                break;

            case PostProcessingPropertyTypes.KernelSize:
                renderVal= <>
                    { /* @ts-ignore */}
                    <SelectInput options={KernelSizeSelect}
                    onChange={onPropertyValueChanged}
                    value={getPropertyValue()}
                    />

                    </>;
                break;
            default:
                renderVal= <>Can't Determine type of property</>;
            
        }

        return <div style={{

                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}> 
                { /* @ts-ignore */}
                <InputGroup name={values.name}>
                {renderVal}
                </InputGroup>
            </div>;
    }
}
