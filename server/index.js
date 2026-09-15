import express from 'express';
import Parser from 'rss-parser';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express(); const parser=new Parser();
const PORT=process.env.PORT||3000;
const JOLPICA='https://api.jolpi.ca/ergast/f1';
let cache=new Map();
async function cached(key, fn, ttl=60000){const x=cache.get(key);if(x&&Date.now()-x.t<ttl)return x.v;const v=await fn();cache.set(key,{t:Date.now(),v});return v;}
async function getJson(url){const r=await fetch(url,{headers:{'User-Agent':'F1-Korea-Brief/1.0'}});if(!r.ok)throw new Error(`upstream ${r.status}`);return r.json();}
function raceResults(j){return j.MRData.RaceTable.Races?.[0]||null}
app.use(express.static(path.join(__dirname,'../public')));
app.get('/api/standings',async(req,res)=>{try{const j=await cached('stand',()=>getJson(`${JOLPICA}/current/driverstandings.json`),30000);const list=j.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings||[];res.json({source:'Jolpica F1',updatedAt:new Date().toISOString(),data:list});}catch(e){res.status(502).json({error:'standings unavailable'});}});
app.get('/api/latest-result',async(req,res)=>{try{const j=await cached('result',async()=>{const s=await getJson(`${JOLPICA}/current/last/results.json`);return s;},30000);const race=raceResults(j);res.json({source:'Jolpica F1',updatedAt:new Date().toISOString(),race});}catch(e){res.status(502).json({error:'result unavailable'});}});
app.get('/api/news',async(req,res)=>{try{const feed=await cached('news',()=>parser.parseURL('https://news.google.com/rss/search?q=Formula%201%20when%3A30d&hl=en-US&gl=US&ceid=US:en'),300000);const data=(feed.items||[]).slice(0,100).map(x=>({title:x.title||'',link:x.link||'',date:x.isoDate||x.pubDate||'',description:(x.contentSnippet||x.content||'').replace(/\s+/g,' ').slice(0,300)}));res.json({source:'Google News RSS',updatedAt:new Date().toISOString(),data});}catch(e){res.status(502).json({error:'news unavailable'});}});
app.get('/api/health',(req,res)=>res.json({ok:true,time:new Date().toISOString()}));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'../public/index.html')));
app.listen(PORT,()=>console.log(`F1 Korea Brief: http://localhost:${PORT}`));
