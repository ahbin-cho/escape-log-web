const {chromium}=require("playwright");const path=require("path");
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});
await p.goto("file://"+path.resolve(process.argv[2]));await p.waitForTimeout(500);await p.screenshot({path:process.argv[3],type:"jpeg",quality:92});await b.close();})();
