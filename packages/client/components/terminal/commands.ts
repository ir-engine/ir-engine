import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { Entity } from "@xr3ngine/engine/src/ecs/classes/Entity";
import { System } from "@xr3ngine/engine/src/ecs/classes/System";
import { Component } from "@xr3ngine/engine/src/ecs/classes/Component";
import { Query } from "@xr3ngine/engine/src/ecs/classes/Query";
import { ComponentConstructor } from "@xr3ngine/engine/src/ecs/interfaces/ComponentInterfaces";
import Left from "../ui/Drawer/Left";
//import {curryRight} from "lodash";

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
                    print(`
                        ls 
                        List of entities.
                        
                        rm {id1} {id2}
                        Remove entities and/or components.

                        cat {id}
                        Query components for data.

                        echo '{"json": 5}' > entityId
                        Update data.
                    `);

                    const CMDID = 1;
                    const command = args._[CMDID];
                    const options = args._.slice(CMDID+1);
                    debugger;
                    print('!!'+ command + typeof( options));
                    
                    if(command === 'ls'){
                        print(`(List entities)`);
                        print(`{-c | --components} show entity components`);
                        const {join, map} = Array.prototype;
                        const mapc = callback => iterable => map.call(iterable, callback);
                        const opts = options.join().split(/\w*\-{0,2}(\W+)\w*/);
                        if('components' in opts || 'c' in opts){//replace to Maybee monad
                             // @ts-ignore above the line
                            var componentsFields = ({components}) => 
                                toString(map.call(components, ({constructor:{name}, id}) => `${id} ${name}`) );
                        }
                        const entityFields = ({id}) => id;              
                        const toString = iterable => Array.prototype.join.call(iterable, "\n");
                        const list = mapc(entityFields);
                        const {entities} = Engine;
                        print(toString(list(entities)));
                        break;

                    }else if(command === 'cp'){
                        print(`(copy entities and components)`);
                        break;
                    
                    }else if(command === 'rm'){
                        print(`(removing entities and components)`);
                        break;
                    
                    }else if(command === 'cat'){
                        print(`(Query entity components for data)`);
                        break;
                        
                    }else if(command === 'echo'){
                        print(`(Query components for data)`);
                        break;
                    }
                    //break;



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
            }
                    break;

                case 'systems': {
                    const result = Engine.systems.map(
                        ({name, enabled}) => 
                            `${name} - ${enabled ? 'enabled' : 'disabled'}`
                    ).join("\n")
                    print(result)
                }
                break;

                case 'stop': {

                    Engine.enabled = false
                    //Engine.engineTimer.stop()
                    print( `Engine stopped at ? time`)
                    
                }break
                case 'start': {
                    Engine.enabled = true
                    //Engine.engineTimer.start()
                    print( `Engine started`)
                }break
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
    // ecs: {
    //     play: '',
    //     pause: '',
    // }
}
