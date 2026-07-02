import { GoogleGenAI,Type} from '@google/genai'
import 'dotenv/config'
import { exec } from 'child_process'
import util from 'util'
import os from 'os'
import fs from 'fs'
import readlineSync from 'readline-sync'

const platform=os.platform()
const execute=util.promisify(exec)

const GEMINI_API=process.env.GEMINI_API_KEY
const ARITIFICIAL_INTILLIGANCE=new GoogleGenAI({GEMINI_API})

//tool

async function executeCommand({command}){

         try{
            const { stdout,stderr }= await execute(command)

            if(stderr){
                return `Error:${stderr}`
            }

            return `Success:${stdout}`
         }catch(e){
                return `Error:${e}`
         }

}

async function writeFile({path,content}){
        try{
            fs.writeFileSync(path,content)
            return `Success: wrote file ${path}`
        }catch(e){
            return `Error:${e}`
        }
}

const commandexecuter={
    name:"executeCommand",
    description:"It takes any shell/terminal command and executes it. Use this to create, delete, or move folders and files (mkdir, touch, rm, etc). Do NOT use this to write file content.",
    parameters:{
        type:Type.OBJECT,
        properties:{
            command:{
                type:Type.STRING,
                description:"It is the terminal/sheel command.Ex:mkdir calculator,touch calculato/index.js,etc"
            }
        },
        required:["command"]
    }
}

const filewriter={
    name:"writeFile",
    description:"Writes the given content to a file, overwriting anything already there. Always use this to write HTML/CSS/JS code into a file instead of shell commands.",
    parameters:{
        type:Type.OBJECT,
        properties:{
            path:{
                type:Type.STRING,
                description:"Path of the file to write to, relative to the current working directory. Ex: calculator/index.html"
            },
            content:{
                type:Type.STRING,
                description:"The full content to write into the file."
            }
        },
        required:["path","content"]
    }
}




async function buildWebsite() {
    while(true){
       const result=await ARITIFICIAL_INTILLIGANCE.models.generateContent({
        model:"gemini-2.5-flash",
        contents:History,
        config:{
            systemInstruction:`You are a website builder which creates the frontend of a website using two tools: executeCommand and writeFile.
            give the command accoring to the Operating system we are using.
            My current operating system is: ${platform}

            Your Job :
            1.Analyze the user query,
            2.Take the necessary actions using the tools to satisfy the query.

            Step by step Guide
            1.Use executeCommand to create the folder for the website, ex:mkdir calculator
            2.Use executeCommand to create empty HTML/CSS/JS files, ex:touch calculator/index.html
            3.Use writeFile (NOT executeCommand) to write the actual HTML/CSS/JS code into each file - pass the file path and the full code as the content argument.
            4.Fix the error if they are persent at any step by writing,updating or deleting
            `,
            tools:[{
                functionDeclarations:[commandexecuter,filewriter]
            }]
        }
       })

       if(result.functionCalls&&result.functionCalls.length>0){
            const functionCall=result.functionCalls[0]

            const{name,args}=functionCall

             const toolresponse=name==="writeFile" ? await writeFile(args) : await executeCommand(args)

             const functionResponsePart={
                functionResponse:{
                    name:functionCall.name,
                    response:{
                        result:toolresponse
                    }
                }
             }

             //send function response back to model
             History.push({
                role:"model",
                parts:[
                    {
                        functionCall:functionCall
                    }
                ]
             })
             History.push({
                role:"user",
                parts:[functionResponsePart]
             })
       }else{
            console.log(result.text)
            History.push({
                role:"model",
                parts:[{text:result.text}]
            })
            break
       }
    }
}

let History=[]
while(true){
      const question=readlineSync.question("Ask Me Anything ===>")

      if(question==="exit"){
        break
      }
      History.push({
        role:'user',
        parts:[{text:question}]
      }
      )

      await buildWebsite()
}