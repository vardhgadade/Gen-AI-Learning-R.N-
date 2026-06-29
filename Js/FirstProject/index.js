// import { GooogleGenAI } from "@google/genai"
import { GoogleGenAI } from "@google/genai"
import 'dotenv/config'

const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY})

async function  main () {
    const response= await ai.models.generateContent({
        model:"gemini-2.5-flash",
        contents:[{
            role:'user',parts:[{text:"what is my name"}]
        },
        {
            role:'model',
            parts:[{text:"As an AI, I don't have access to your personal information, including your name. My memory resets with each interaction, and I don't store details about you.If you'd like me to refer to you by a name during this conversation, please feel free to tell me!"}]
        },
        {
            role:'user',
            parts:[{text:"My Name is Vardhman Gadade"}]

        },
        {
            role:'user',
            parts:[{text:"What is My Name?"}]

        }
    
    
    
    ]
    })
    console.log(response.text)
}

await main()


