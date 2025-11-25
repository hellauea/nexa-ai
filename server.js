const express=require("express");
const cors=require("cors");
const fetch=require("node-fetch");
const app=express();


app.use(cors({origin:"*"}));
app.use(express.json());


const API_KEY=process.env.API_KEY||"";
const NEXA_PROMPT=`You are Nexa — intelligent AI assistant, friendly, smart, helpful.`;


app.post("/ask",async(req,res)=>{
try{
const userText=req.body.history.at(-1)?.content||"";


res.setHeader("Content-Type","text/plain; charset=utf-8");
res.setHeader("Transfer-Encoding","chunked");


const payload={contents:[{role:"user",parts:[{text:`${NEXA_PROMPT}\nUser: ${userText}`}]}]};


const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});


const reader=response.body.getReader();
const decoder=new TextDecoder();


while(true){const {value,done}=await reader.read();if(done) break;res.write(decoder.decode(value));}
res.end();
}catch(err){res.end("Streaming error");}
});


const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log(`Nexa Streaming Active on ${PORT}`));
