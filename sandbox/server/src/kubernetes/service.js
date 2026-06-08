import { k8sCoreV1Api } from "./config.js";

export async function createService(sandboxId) {
    const serviceManifest = {
        metadata: {
            name: `sandbox-service-${sandboxId}`,
            labels: {
                sandboxId: sandboxId
            }
        },
        spec: {
            selector: {
                sandboxId: sandboxId
            },
            ports: [
                {
                    name: 'http',
                    port: 80,
                    targetPort: 5173,
                    protocol: 'TCP'
                },
                {
                    name: 'agent-http',
                    port: 3000,
                    targetPort: 3000,
                    protocol: 'TCP'
                }                    
            ],
            type: 'ClusterIP'
        }
    }

    const respone  = await k8sCoreV1Api.createNamespacedService({
        namespace:'default',
        body:serviceManifest
    });
    return respone
}    

export async function deleteService(sandboxId){
    const response = await k8sCoreV1Api.deleteNamespacedService({
        namespace: 'default',
        name: `sandbox-service-${sandboxId}`,
    });
    return response;
}