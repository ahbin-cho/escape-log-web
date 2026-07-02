/** @type {import('next').NextConfig} */

// GitHub Pages 정적 배포 설정.
// - output: "export" → out/ 에 순수 정적 파일 생성 (서버 불필요)
// - basePath/assetPrefix → 프로젝트 페이지(https://<id>.github.io/<repo>/)용.
//   워크플로에서 PAGES_BASE_PATH=/<repo> 로 주입. 로컬 dev에선 비어 있어 그대로 동작.
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
