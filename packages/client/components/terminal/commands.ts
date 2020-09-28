import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { Entity } from "@xr3ngine/engine/src/ecs/classes/Entity";
import { System } from "@xr3ngine/engine/src/ecs/classes/System";
import { Component } from "@xr3ngine/engine/src/ecs/classes/Component";
import { Query } from "@xr3ngine/engine/src/ecs/classes/Query";
import { ComponentConstructor } from "@xr3ngine/engine/src/ecs/interfaces/ComponentInterfaces";
import Left from "../ui/Drawer/Left";
import { createEntity } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
//import {curryRight} from "lodash";

function round(number) {
    return Math.trunc(number * 1000) / 1000;
}

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
            if (!args._[0]) {
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

            switch (args._[0]) {
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
                        let s = '';
                        Engine.entities.forEach(e => {
                            s += (e.id + '\n');
                            if ('a' in args || 'p' in args) {
                                for (let componentId in e.components) {
                                    const component = e.components[componentId];
                                    s += ('\t' + componentId + ': ' + component.name);
                                    if (component.name === 'TransformComponent' && ('p' in args))
                                        s += (' (position: x: ' + round(component.position.x) +
                                            ', y: ' + round(component.position.y) +
                                            ', z: ' + round(component.position.z) +
                                            '; rotation: x: ' + round(component.rotation._x) +
                                            ', y: ' + round(component.rotation._y) +
                                            ', z: ' + round(component.rotation._z) +
                                            ', w: ' + round(component.rotation._w) + ')');
                                    s += '\n';
                                }
                            }
                        });
                        print(s);

                    } else if (command === 'make') {
                        print(`(create entity)`);
                        const entity = createEntity();
                        print(`entity #${entity.id} created.`);
                    
                    } else if (command === 'cp') {
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

                    } else if (command === 'rm') {
                        print(`(removing entities and components)`);
                        // ecs entities rm 1 2 3
                        const ids = options;
	                    ids.forEach(id => {
		                      let entity = Engine.entities.find(element => element.id === id);
                              if (entity !== undefined) entity.remove();
	                    });

                    } else if (command === 'cat') {
                        print(`(Query entity components for data)`);
                        // ecs entities cat 1/ComponentName
                        const [entityId, componentName] = options[0].split('/');
                        const entity = Engine.entities[entityId];
                        //get component
                        //@ts-ignore
                        const entry = Object.entries(entity.components).find(([,{name}]) => name === componentName);
                        const [, component] = entry;
                        //@ts-ignore
                        print(component._typeId + Object.getOwnPropertyNames( component ));
                        
                        //const component = getComponent(entity, Component);
                        //get component fields
                        //list compponent data
                        
                    } else if (command === 'echo') {
                        print(`(Query components for data)`);
                    }
                    break;

                    case 'entity': {
                        if (args._.length < 2) {
                            print('An entity id was not speciffied.');
                            return;
                        }
                        
                        const entityId = args._[1];
                        // console.log('check', args);

                        let entity = Engine.entities.find(element => element.id === entityId);
                        if (entity === undefined) {
                            print(`An entity ${entityId} was not found.`);
                            return;
                        }

                        let s = '';

                        for (let componentId in entity.components) {
                            const component = entity.components[componentId];
                            s += (componentId + ': ' + component.name);
                            if (component.name === 'TransformComponent' && ('p' in args))
                                s += (' (position: x: ' + round(component.position.x) +
                                    ', y: ' + round(component.position.y) +
                                    ', z: ' + round(component.position.z) +
                                    '; rotation: x: ' + round(component.rotation._x) +
                                    ', y: ' + round(component.rotation._y) +
                                    ', z: ' + round(component.rotation._z) +
                                    ', w: ' + round(component.rotation._w) + ')');
                            s += '\n';

                            // console.log('check', component);
                            if ('a' in args)
                                Object.keys(component).sort().forEach(k => {
                                    s += ('\t' + k + '\n');
                                    // if (component[k] === null)
                                    // component[k].toString() + '\n');
                                });
                        }
                        print(s);
                        break;
                    }

                    case 'components':
                    // User passed a number, which should align with an entity ID
                    // - show breakdown of data on entity.
                    /*
                    if (!isNaN(args._[1])) {
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
                    */
                    let s = '';
                    Engine.components.forEach((component: ComponentConstructor<any>) => {
                        s += component.name + "\n";
                        if (args.originalArgs.includes('-a')) {
                            Object.keys(component).forEach(k => {
                                s += ('\t' + k + ": " + component[k].toString() + '\n');
                            });
                        }
                    });
                    print(s);
                    break;
                
                case 'component': {
                    if (args._.length < 2) {
                        print('An component id was not speciffied.');
                        return;
                    }
                    
                    const componentId = args._[1];
                    let s = '';

                    Engine.entities.forEach(e => {
                        if (componentId in e.components) {
                            s +=  `Entity ${e.id }:\n`;
                            const component = e.components[componentId];

                            Object.keys(component).sort().forEach(k => {
                                s += ('\t' + k + ': ');
                                const v = component[k];
                                if (v === null) {
                                    s += 'null';
                                } else if (typeof v === 'object') {
                                    s += '{\n';
                                    Object.keys(v).sort().forEach(p => {
                                        s += ('\t\t' + p + ': ');
                                        if (v[p] === null)
                                            s += 'null';
                                        else if (typeof v[p] === 'function')
                                            s += 'function';
                                        else
                                            s += v[p].toString();
                                        s += '\n';
                                    });
                                    s += '\t}';
                                } else {
                                    s += v.toString();
                                }
                                s += '\n';
                            });

                        }
                    });

                    print(s);
                    break;
                }
                case 'systems': {
                    const result = Engine.systems.map(
                        ({name, enabled}) => 
                            `${name} - ${enabled ? 'enabled' : 'disabled'}`
                    ).join("\n");
                    print(result);
                }
                break;

                case 'stop':
                    Engine.enabled = false;
                    //Engine.engineTimer.stop()
                    print(`Engine stopped at ? time`);
                    break;
                case 'start':
                    Engine.enabled = true;
                    //Engine.engineTimer.start()
                    print( `Engine started`);
                    break;
            }
        },
        options: [
          {
            name: 'ecs',
            description: 'query the ecs engine for information on the current scene',
            defaultValue: 'console.log("Eval says: feed me code!")'
          },
          {
            name: 'a',
            description: ''
          },
          {
            name: 'p',
            description: ''
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
