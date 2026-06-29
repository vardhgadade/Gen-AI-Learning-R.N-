import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
import 'dotenv/config'

const ai=new GoogleGenAI({key:process.env.GEMINI_API_KEY})


async function main() {

      let  response=await ai.models.generateContent({
            model:"gemini-2.5-flash",
            config:{
                systemInstruction:`MY Name is Vardhman Gadade i am working as software engineer at cctech from last november till current day ${new Date()}.I have one year of expereience in CCTech `
            },
            contents:"Explain my bio in 50 words... and also about current wather in pune(wakad) and about my organization "
         }

         )

         console.log(response.text)
    
    
}

await main()