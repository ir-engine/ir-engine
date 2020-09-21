import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { Entity } from "@xr3ngine/engine/src/ecs/classes/Entity";
import { System } from "@xr3ngine/engine/src/ecs/classes/System";
import { Component } from "@xr3ngine/engine/src/ecs/classes/Component";
import { Query } from "@xr3ngine/engine/src/ecs/classes/Query";
import { ComponentConstructor } from "@xr3ngine/engine/src/ecs/interfaces/ComponentInterfaces";
import Left from "../ui/Drawer/Left";
import { createEntity } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
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
          print("Failed to evaluate code");
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
            if (!args._[0]){
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
            }
//          console.log(args);

            switch (args._[0]){
                case 'entities':
                    const CMDID = 1;
                    const command = args._[CMDID];
                    const options = args._.slice(CMDID + 1);

//                  print(options.join('|'));
                        // ecs: "console.log("Eval says: feed me code!")"
                        // _: Array(4)
                        // 0: "entities"
                        // 1: "ls"
                        // 2: 22
                        // 3: 33
                        // ecs entities rm 11 22 33

                    if (command === 'ls') {
                        // print(`(List entities)`);
                        // print(`{-c | --components} show entity components`);
                        // const {join, map} = Array.prototype;
                        // const mapc = callback => iterable => map.call(iterable, callback);
                        // const opts = options.join().split(/\w*\-{0,2}(\W+)\w*/);
                        /*
                        if('components' in opts || 'c' in opts){//replace to Maybee monad
                             // @ts-ignore above the line
                            const componentsFields = ({components}) => 
                                toString(map.call(components, ({constructor:{name}, id}) =>
                                    `${id} ${name}`) );
                        }
                        const entityFields = ({id}) => id;              
                        const toString = iterable => join.call(iterable, "\n");
                        const list = mapc(entityFields);
                        const {entities} = Engine;
                        print(toString(list(entities)));
                        */

                      console.log('check', options);
                      console.log('check', args._);
                      
                      let s = '';
                      Engine.entities.forEach(e => {
                        s += e.id;
//                        console.log('check', Object.getOwnPropertyNames(e.components));
//                        console.log('check', e.components);
                        s += '\n';  
                        for (let componentId in e.components)
                           s += ('\t' + componentId + ': ' +
                               e.components[componentId].name + '\n');

                        s += '\n';  
                      });
                      print(s);

                    } else if (command === 'make') {
                        print(`(create entity)`);
                        const entity = createEntity();
                        print(`entity #${entity.id} created.`);
                    
                    }else if(command === 'cp'){
                        print(`(copy entity)`);
                        console.log(options);
                        if(!(options && options[0])){
                            print('please specify entity id to copy.');
                        }
                        const protoEntityId = Number(options[0]);
                        const protoEntity = Engine.entities[protoEntityId];
                        if(protoEntity){
                            const entity = protoEntity.clone();
                            print(`entity created with id ${entity.id}.`);
                        }else{
                            print(`entity ${protoEntityId} not exist.`);
                        }

                    }else if(command === 'rm'){
                        print(`(removing entities and components)`);
                        // ecs entities rm 1 2 3
                        const ids = options;

//                      ids.forEach( id => Engine.entities[id].remove() );

	                    ids.forEach(id => {
		                      let foundEntity = Engine.entities.find(element => element.id == id);
                              if (foundEntity != undefined) foundEntity.remove();
	                    });


                    }else if(command === 'cat'){
                        print(`(Query entity components for data)`);
                        // ecs entities cat 1/ComponentName
                        const [entityId, componentName] = options[0].split('/');
                        const entity = Engine.entities[entityId];
                        //get component
                        //@ts-ignore
                        const entry = Object.entries(entity.components).find(([,{name}]) => name === componentName);
                        const [,component] = entry;
                        //@ts-ignore
                        print(component._typeId + Object.getOwnPropertyNames( component ));
                        
                        //const component = getComponent(entity, Component);
                        //get component fields
                        //list compponent data
                        
                    }else if(command === 'echo'){
                        print(`(Query components for data)`);
                    }



                    break;

                case 'components': {
                    // User passed a number, which should align with an entity ID -- show breakdown of data on entity
                    if(!isNaN(args._[1])){
                        let cstring = "";
                        Object.values(Engine.components[args._[1]]).forEach((c: any) => {
                            cstring += '\n';
                            Object.keys(c).forEach((p: any) => {
                                cstring += '\n';
                                // TODO: If is object or array, drill down into values
                                cstring += p.toString() + ": " + c[p].toString();
                            });
                            cstring += '\n';
                        });
                        console.log(cstring);
                        print(cstring);
                    } else {
                        let cstring = "\n";
                    Engine.components.forEach((component: ComponentConstructor<any>) => {
                        cstring +=  component.name + "\n";
                        Object.keys(component).forEach(k => {
                            cstring += k + ": " + component[k].toString() + "\n";
                        });
                        cstring += "\n --------------- \n";
                    });
                    console.log(cstring);
                    print(cstring);
                }
            }
                    break;

                case 'systems': {
                    const result = Engine.systems.map(
                        ({name, enabled}) => 
                            `${name} - ${enabled ? 'enabled' : 'disabled'}`
                    ).join("\n");
                    print(result);
                }
                break;

                case 'stop': {

                    Engine.enabled = false;
                    //Engine.engineTimer.stop()
                    print( `Engine stopped at ? time`);
                    
                }break;
                case 'start': {
                    Engine.enabled = true;
                    //Engine.engineTimer.start()
                    print( `Engine started`);
                }break;
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
};
export const description = {
    // ecs: {
    //     play: '',
    //     pause: '',
    // }
};
