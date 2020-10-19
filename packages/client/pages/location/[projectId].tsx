import Layout from '../../components/ui/Layout';
import { useRouter } from 'next/router';
import Error404 from '../404';
import React, { useEffect } from 'react';
import { client } from '../../redux/feathers';
// import { initializeEngine } from "@xr3ngine/engine/src/initialize";
import { createEntity } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";

const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/;

async function init (projectId: string): Promise<any> { // auth: any,
  createEntity();

  let service, serviceId;
  console.log("list for project service");
  const r = await client.service('project').find();
  console.log(r);

  const projectResult = await client.service('project').get(projectId);
  const projectUrl = projectResult.project_url;
  const regexResult = projectUrl.match(projectRegex);
  if (regexResult) {
    service = regexResult[1];
    serviceId = regexResult[2];
  }
  const result = await client.service(service).get(serviceId);
  Object.keys(result.entities).forEach((key) => {
    const entity = result.entities[key];
    const newEntity = createEntity();
    entity.components.forEach((component) => {
      console.log(component.name);
      console.log(component);
      // EditorNodeLoader(scene, newEntity, component)

    });
    console.log(newEntity);
  });
}

const EditorRoomPage: React.FC = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const props = {
    projectId: projectId
  };

  useEffect(() => {
    const { projectId } = props;
    init(projectId as any).catch((e) => { console.log(e); });
  }, []);

  if (!projectId) {
    <Layout pageTitle="Home">
      <div/>
    </Layout>;
      }
  return (
    <Layout pageTitle="Home">
      <div/>
    </Layout>
  );
};

export default EditorRoomPage;
