import { k8sCoreV1Api } from "./config.js";

export async function createPod(sandboxId, projectId) {
    const podManifest = {
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
            labels: {
                sandboxId: sandboxId
            }
        },
        spec: {
            volumes:[
                {
                    name:'workspace-volume',
                    emptyDir:{},
                }
            ],
            initContainers:[
                {
                    name:'init-container',
                    image : "template",
                    imagePullPolicy: "IfNotPresent",
                    command: ['sh', '-c', 'cp -r /workspace/. /seed/'],
                    volumeMounts:[
                        {
                            name:'workspace-volume',
                            mountPath:'/seed'
                        }
                    ]
                }
            ],
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
                    },
                    volumeMounts:[
                        {
                            name:'workspace-volume',
                            mountPath:'/workspace'
                        }
                    ]
                },
                {
                    image : "agent",
                    ifImagePullPolicy: "IfNotPresent",
                    name:'agent-container',
                    ports:[
                        {
                            containerPort:3000,
                            name:'agent-http'
                        },
                    ],
                    resources:{
                        limits:{
                            cpu:'500m',
                            memory:'1Gi'
                        },
                        requests:{
                            cpu:'250m',
                            memory:'500Mi'
                        }
                    },
                    volumeMounts:[
                        {
                            name:'workspace-volume',
                            mountPath:'/workspace'
                        }
                    ]    
                },
                {
                    image : "sync-agent",
                    imagePullPolicy:"IfNotPresent",
                    name:'sync-agent-container',
                    ports:[
                        {
                            containerPort:4000,
                            name:'http'
                        }
                    ],
                    env:[
                        {
                            name:'PROJECT_ID',
                            value:projectId
                        },
                        {
                            name:'AWS_REGION',
                            valueFrom:{
                                secretKeyRef:{
                                    name:'aws-secret',
                                    key:'AWS_REGION'
                                }
                            }
                        },
                        {
                            name:'AWS_ACCESS_KEY_ID',
                            valueFrom:{
                                secretKeyRef:{
                                    name:'aws-secret',
                                    key:'AWS_ACCESS_KEY_ID'
                                }
                            }
                        },
                        {
                            name:'AWS_SECRET_ACCESS_KEY',
                            valueFrom:{
                                secretKeyRef:{
                                    name:'aws-secret',
                                    key:'AWS_SECRET_ACCESS_KEY'
                                }
                            }
                        }
                    ],
                    volumeMounts:[
                        {
                            name:'workspace-volume',
                            mountPath:'/workspace'
                        }
                    ]
                }
            ]
        }
    };

    const response  = await k8sCoreV1Api.createNamespacedPod({
        namespace:'default',
        body:podManifest
    });

    return response
}

//This code creates a pod in Kubernetes with the specified sandboxId. The pod is labeled with the sandboxId for easy identification and management. The container within the pod uses the "template" image and exposes port 5173.


export async function deletePod (sandboxId) {
    const response = await k8sCoreV1Api.deleteNamespacedPod({
        namespace: 'default',
        name: `sandbox-pod-${sandboxId}`,
    });
    return response;
}