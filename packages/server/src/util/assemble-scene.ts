export default (scene): any => {
    const returned = {
        version: 4,
        root: scene.entities[0].entityId,
        metadata: JSON.parse(scene.metadata),
        entities: {}
    }
    for (const index in scene.entities) {
        const entity = (scene.entities[index] as any);
        console.log('entity:');
        console.log(entity)
        returned.entities[entity.entityId] = {
            name: entity.name,
            parent: entity.parent,
            index: entity.index,
            components: entity.components.map(component => {
                return {
                    name: component.name,
                    props: component.props
                }
            })
        }
    }
    return returned;
}