import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { createEntity } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { ComponentConstructor } from "@xr3ngine/engine/src/ecs/interfaces/ComponentInterfaces";
//import {curryRight} from "lodash";

function round(number: number): number {
    return Math.trunc(number * 1000) / 1000;
}

function objectToString(object: object, tabLevel: number, maxTabLevel: number): string {
    let s = '';
   
    Object.keys(object).sort().forEach(k => {
        s += '\t'.repeat(tabLevel);
        s += (k + ': ');
        const v = object[k];
        if (v === null) {
            s += 'null';
        } else if (typeof v === 'function') {
            s += 'function';
        } else if (typeof v === 'object') {

            if (tabLevel >= maxTabLevel) {
                s += '{ ... }';
            } else {
                s += '{\n';
                s += objectToString(v, tabLevel + 1, maxTabLevel);
                s += '\t'.repeat(tabLevel);
                s += '}';
            }

        } else {
            s += v.toString();
        }
        s += '\n';
    });

    return s;
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
                                for (const componentId in e.components) {
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
                        const entity = createEntity();
                        print(`Entity ${entity.id} was created.`);
                    
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
                        const ids = options;
	                    ids.forEach(id => {
		                      const entity = Engine.entities.find(element => element.id === id);
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

                        if ('a' in args)
                            s += objectToString(component, 1, 2);
                    }
                    print(s);
                    break;
                }

                case 'components': {
                    let s = '';
                    Engine.components.forEach((component: ComponentConstructor<any>) => {
                        s += component.name + "\n";
                        if ('a' in args)
                            s += objectToString(component, 1, 1);
                    });
                    print(s);
                    break;
                }
                case 'component': {
                    if (args._.length < 2) {
                        print('An component id was not speciffied.');
                        return;
                    }
                    
                    const componentId = args._[1];
                    let s = '';

                    Engine.entities.forEach(e => {
                        if (componentId in e.components) {
                            s += `Entity ${e.id }:\n`;
                            s += objectToString(e.components[componentId], 1, 2);
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

export const descriptions = {
   ecs: `control of entities and components
List entities: ecs entities ls
List entities and its components: ecs entities ls -a
List entities and its components, show position and rotation for TransformComponent:
ecs entities ls -p
List entity components: ecs entity (id)
List entity components and its attributes: ecs entity (id) -a
List entity components, show position and rotation for TransformComponent: ecs entity (id) -p
List component attributes: ecs component (id)
List registered components: ecs components
List registered components and its attributes: ecs components -a
Make entity: ecs entities make
Remove entity: ecs entities rm (ids list)`
};
