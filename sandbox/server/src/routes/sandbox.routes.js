import {Router} from "express"
import { v7 as uuid } from "uuid";
import { createPod } from "../kubernetes/pod.js";
import { createService } from "../kubernetes/service.js";
import { createSandboxkey } from "../config/redis.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import Project from "../models/project.model.js";

const router = Router();

router.post('/project', authMiddleware, async (req, res) => {
    const {title} = req.body
    
    const newProject = new Project({
        user:req.user,
        title
    })

    await newProject.save()
    return res.status(201).json({
        message:"Project created successfully",
        project: newProject
    })
})

router.post('/start', authMiddleware, async (req, res) => {

    const projectId = req.body.projectId;

    const project  = await Project.findOne({_id: projectId, user: req.user})

    if(!project){
        return res.status(404).json({message: "project not found"})
    }
    const sandboxId = uuid(); //this generates new unique id for each sandbox
    await Promise.all([
        createPod(sandboxId,projectId),
        createService(sandboxId),
        createSandboxkey(sandboxId)
    ])

    return res.status(200).json({ 
      message: 'Sandbox environment created successfully', 
      sandboxId,
      previewUrl: `http://${sandboxId}.preview.localhost`
    });
})

router.get('/projects',authMiddleware, async(req,res)=>{
    try{
        const projects = await Project.find({user:req.user})
        return res.status(200).json({
            message:"Projects fetched successfully",
            projects
        })
    }   
    catch(err){
        console.log("error", err)
        return res.status(500).json({message:"Internal server error"})
    }
})


export default router;