const {chromium}=require("playwright");const path=require("path");
(async()=>{const dir=process.argv[2];const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1080,height:1920},recordVideo:{dir,size:{width:1080,height:1920}}});
const p=await ctx.newPage();await p.goto("file://"+path.resolve(process.argv[3]||path.join(dir,"story.html")));await p.waitForTimeout(10500);
const v=p.video();await ctx.close();console.log(await v.path());await b.close();})();
