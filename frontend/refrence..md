POST https://localhost/api/sandbox/start   => This api will create a sandbox with these credential : {"message":"Sandbox environment created successfully","sandboxId":"019e9bf8-0aa1-763b-9850-6e15d40ec1a9","previewUrl":"http://019e9bf8-0aa1-763b-9850-6e15d40ec1a9.preview.localhost" //create i-frame using this previwe url
}



This api will list the files in the sandbox   =>    method GET http://019e9bf8-0aa1-763b-9850-6e15d40ec1a9.agent.localhost/list-files 
    :   {"message":"Files listed successfully","files":[".dockerignore",".gitignore","Dockerfile","README.md","eslint.config.js","index.html","package-lock.json","package.json","public/vite.svg","src/App.css","src/App.jsx","src/assets/react.svg","src/index.css","src/main.jsx","vite.config.js"]}



GET : http://019e9bf8-0aa1-763b-9850-6e15d40ec1a9.agent.localhost/read-files?files=src/App.css
 This Api will read the files in the sandbox 
 {"message":"File contents","files":[{"/src/App.css":"#root {\n  max-width: 1280px;\n  margin: 0 auto;\n  padding: 2rem;\n  text-align: center;\n}\n\n.logo {\n  height: 6em;\n  padding: 1.5em;\n  will-change: filter;\n  transition: filter 300ms;\n}\n.logo:hover {\n  filter: drop-shadow(0 0 2em #646cffaa);\n}\n.logo.react:hover {\n  filter: drop-shadow(0 0 2em #61dafbaa);\n}\n\n@keyframes logo-spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n@media (prefers-reduced-motion: no-preference) {\n  a:nth-of-type(2) .logo {\n    animation: logo-spin infinite 20s linear;\n  }\n}\n\n.card {\n  padding: 2em;\n}\n\n.read-the-docs {\n  color: #888;\n}\n"}]}



PATCH : http://019e9bf8-0aa1-763b-9850-6e15d40ec1a9.agent.localhost/update-files
This api will update the files in the sandbox 
 : {
    "updates" : [
        {
            "file" : "src/App.css",
            "content" : ""
        }
    ]
}




POST http://localhost/api/ai/invoke
This api will invoke the agent with the following data :
req.body = {
    "message":"make the snake game with dark blue theme",
    "projectId" : "019e9bf8-0aa1-763b-9850-6e15d40ec1a9"
}

response will be in SSE

data: Listing files in project sandbox...

data: Files listed successfully.Files: .dockerignore, .gitignore, Dockerfile, README.md, eslint.config.js, index.html, package-lock.json, package.json, public/vite.svg, src/App.css, src/App.jsx, src/assets/react.svg, src/index.css, src/main.jsx, vite.config.js

data: Reading files: src/App.jsx, src/App.css, src/index.css, src/main.jsx, index.html

data: Files read successfully.

data: Updating files: src/App.jsx, src/App.css, src/index.css

data: Files updated successfully.




Then we have an Socket.io url 
http://019e9bc0-998d-76ed-8681-15f5a41ab6bd.agent.localhost
use Xterm.js for the terminal on the frontend


with event name "terminal-input"  for terminal input 
                "terminal-output" for terminal output 