import { k8sCoreV1Api } from "./config.js";

export async function createPod(sandboxId) {
    const podManifest = {
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
            labels: {
                app: 'sandbox',
                sandboxId: sandboxId
            }
        },
        spec: {
            containers: [
                {
                    image : "template",
                    imagePullPolicy: "IfNotPresent",
                    name:'sandbox-container',
                    ports:[
                        {
                            containerPort:5173,
                            name:'http'
                        }
                    ],
                    resources:{
                        limits:{
                            cpu:'500m',
                            memory:'512Mi'
                        },
                        requests:{
                            cpu:'250m',
                            memory:'256Mi'
                        }
                    }
                }
            ]
        }
    };

    const respone  = await k8sCoreV1Api.createNamespacedPod({
        namespace:'default',
        body:podManifest
    });

    return respone
}

//This code creates a pod in Kubernetes with the specified sandboxId. The pod is labeled with the sandboxId for easy identification and management. The container within the pod uses the "template" image and exposes port 5173.
