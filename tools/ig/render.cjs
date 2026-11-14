// 여러 템플릿을 한 번에 이미지로: node tools/ig/render.cjs out.json
// out.json = [{"html":"tools/ig/templates/x.html","out":"…/1.jpg","w":1080,"h":1350}, …]
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const b = await chromium.launch();
  for (const j of jobs) {
    const p = await b.newPage({ viewport: { width: j.w || 1080, height: j.h || 1350 } });
    await p.goto("file://" + path.resolve(j.html));
    await p.waitForTimeout(500);
    fs.mkdirSync(path.dirname(j.out), { recursive: true });
    await p.screenshot({ path: j.out, type: "jpeg", quality: 92 });
    await p.close();
  }
  await b.close();
})();
