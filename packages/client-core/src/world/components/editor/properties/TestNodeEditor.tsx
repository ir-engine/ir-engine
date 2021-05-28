/** 
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */

import { BowlingBall } from "@styled-icons/fa-solid";
import React from "react";
import { Vector3 } from "three";
import InputGroup from "../inputs/InputGroup";
import Vector3Input from "../inputs/Vector3Input";

type Propdds={
    editor?:object,
    node?:object,
}




export const TestNodeEditor =(props:Propdds)=>{
    const onChangeProperty=(id)=>{
        (props.editor as any).setPropertySelected(
            "cubePosition",
            id
          );
    }

    const getValue=()=>{
        console.log("Returned Value is:"+(props.node as any).cubePosition.x);
        return (props.node as any).cubePosition;
    }
    return (
    /* @ts-ignore */
    <InputGroup name="Position" label="Position">
            <Vector3Input onChange={(id)=>{onChangeProperty(id)}} value={getValue()} />;
    </InputGroup>
    )

};


TestNodeEditor.iconComponent=BowlingBall;
TestNodeEditor.description="For Adding Reflection Probe in your scene";
export default TestNodeEditor;