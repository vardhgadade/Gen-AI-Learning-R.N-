import { Type,GoogleGenAI } from '@google/genai'
import axios from 'axios'
import 'dotenv/config'
import readlineSync from 'readline-sync'

 

//Crypto currency tool
const GEIMINI_URI=process.env.GEMINI_API_KEY
const CURRENCY_BASE_URL=process.env.CRYPTOCURRENCY_API_KEY
const WHEATEHR_BASE_URL=process.env.WEATHER_API_BASE_URL
const WHEATHER_KEY=process.env.APP_KEY


const AI=new GoogleGenAI({key:GEIMINI_URI})
async function cryptoCurrency({coin}) {
     const response = await axios.get(`${CURRENCY_BASE_URL}&ids=${coin}`)
     return response.data
}

// http://api.weatherapi.com/v1/current.json?key=aceb36f799fc4591a2a185459252506&q=London&aqi=no
async function WeatherInformation({city}) { 
    const response=await axios.get(`${WHEATEHR_BASE_URL}?key=${WHEATHER_KEY}&q=${city}&aqi=no`)
    return response.data
    
}

// const result = await cryptoCurrency("bitcoin")
// const res=await WeatherInformation("London")
// console.log(result)
// console.log(res)


const cryptoInfo={
    name:"cryptoCurrency",
    description:"We can give you current price or other information relate to cryptocurrency like bitcoin and ethereum etc",
    parameters:{
        type:Type.OBJECT,
        properties:{
            coin:{
                type:Type.STRING,
                description:"It will be the name of the cryptocurreny like bitcoin,etherum,etc"
            }
        },
        required:["coin"]
    }
}

const WeatherInfo={
    name:"WeatherInformation",
    description:"You can get the current weather information of any city luke London,Goa,etc",
    parameters:{
        type:Type.OBJECT,
        properties:{
            city:{
                type:Type.STRING,
                description:"Name of the city for which i have to fetch the weather information like London,Goa.If user id not mentioning the city by default use city as mumbai"
            },

        },
        required:["city"]
    }
}

const tools=[{
    functionDeclarations:[cryptoInfo, WeatherInfo]
}]

let History=[]

const toolFunction={
    "cryptoCurrency":cryptoCurrency,
    "WeatherInformation":WeatherInformation
}

async function runAgent() {
    while(true){
        const result=await AI.models.generateContent({
             model:"gemini-2.5-flash",
             contents:History,
             config:{tools}
        })

        if(result.functionCalls && result.functionCalls.length>0){
            const functionCallParts=[]
            const functionResponseParts=[]

            for (const functionCall of result.functionCalls) {
                const { name, args } = functionCall
                const response = await toolFunction[name](args)
                functionCallParts.push({ functionCall: functionCall })
                functionResponseParts.push({
                    functionResponse: {
                        name: name,
                        response: { result: response }
                    }
                })
            }

            History.push({ role:"model", parts:functionCallParts })
            History.push({ role:"user", parts:functionResponseParts })
        }else{
            History.push({
                role:"model",
                parts:[{text:result.text}]
            })
            console.log(result.text)
            break
        }
    }
}


while(true){
    const question=readlineSync.question("Ask Me Anything")
    if(question=="exit"){
        break
    }

    History.push({
        role:"user",
        parts:[{text:question}]
    })

    await runAgent()
}