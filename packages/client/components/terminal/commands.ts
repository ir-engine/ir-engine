import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { Entity } from "@xr3ngine/engine/src/ecs/classes/Entity";
import { System } from "@xr3ngine/engine/src/ecs/classes/System";
import { Component } from "@xr3ngine/engine/src/ecs/classes/Component";
import { Query } from "@xr3ngine/engine/src/ecs/classes/Query";
import { ComponentConstructor } from "@xr3ngine/engine/src/ecs/interfaces/ComponentInterfaces";

export const commands = {
    // Hello world to test the terminal
    helloworld: () => alert('Hello From Terminal!'),
    // Evaluates any javascript that comes after "eval"
    eval: {
        method: (args, print, runCommand) => {
            try{
            (console as any).logEval  = function(value)
            {
                console.log(value);
                return value;
            };
            print(eval(args._[0].toString().replace("console.log(", "console.logEval(")));
            } catch (error) {
          print("Failed to evaluate code")
            }
        },
        options: [
          {
            name: 'eval',
            description: 'execute arbitrary js',
            defaultValue: 'console.log("Eval says: feed me code!")',
          },
        ],
      },
      // Query the ECS engine for current stats
      ecs: {
        method: (args, print, runCommand) => {
            console.log(args._[0])
            // TODO: Add filter flag
            let val = ""
            switch(args._[0]){
                case 'entities':
                    // User passed a number, which should align with an entity ID -- show breakdown of data on entity
                    if(!isNaN(args._[1])){
                        let cstring = ""
                        Object.values(Engine.entities[args._[1]].components).forEach((c: any) => {
                            cstring += '\n'
                            Object.keys(c).forEach((p: any) => {
                                cstring += '\n'
                                // TODO: If is object or array, drill down into values
                                cstring += p.toString() + ": " + c[p].toString()
                            })
                            cstring += '\n'
                        })
                        console.log(cstring)
                        print(cstring)
                    } else {
                    Engine.entities.forEach((entity: Entity) => {
                        let componentTypes = ""
                        entity.componentTypes.forEach(componentType => {
                            componentTypes +=  " | " + componentType.name || componentType.displayName
                        })
                        val += "\n" + entity.id + ' || ' + componentTypes + "\n"
                    })
                    console.log(val)
                    print(val)
                }
                    break;
                case 'components': {
                    // User passed a number, which should align with an entity ID -- show breakdown of data on entity
                    if(!isNaN(args._[1])){
                        let cstring = ""
                        Object.values(Engine.components[args._[1]]).forEach((c: any) => {
                            cstring += '\n'
                            Object.keys(c).forEach((p: any) => {
                                cstring += '\n'
                                // TODO: If is object or array, drill down into values
                                cstring += p.toString() + ": " + c[p].toString()
                            })
                            cstring += '\n'
                        })
                        console.log(cstring)
                        print(cstring)
                    } else {
                        let cstring = "\n"
                    Engine.components.forEach((component: ComponentConstructor<any>) => {
                        cstring +=  component.name + "\n"
                        Object.keys(component).forEach(k => {
                            cstring += k + ": " + component[k].toString() + "\n"
                        })
                        cstring += "\n --------------- \n"
                    })
                    console.log(cstring)
                    print(cstring)
                }
                break;
            }
                case 'systems': {
                    console.log("TODO: List systems")
                    print("TODO: List systems")
                }
                case 'queries': {
                    console.log("TODO: List engine queries")
                    print("TODO: List engine queries")
                }
            }
            
        },
        options: [
          {
            name: 'ecs',
            description: 'query the ecs engine for information on the current scene',
            defaultValue: 'console.log("Eval says: feed me code!")',
          },
        ],
      }
}
export const description = {

}
