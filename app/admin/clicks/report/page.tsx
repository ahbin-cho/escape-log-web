import BrandReportView from "./BrandReportView";

// 브랜드 월간 리포트 (/admin/clicks/report?brand=키이스케이프).
// 인쇄(PDF 저장)해서 매장에 보내거나, 메일 초안을 복사해 쓴다.
export default function BrandReportPage({
  searchParams,
}: {
  searchParams: { brand?: string };
}) {
  const brand = (searchParams.brand ?? "").trim();
  if (!brand) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel p-6 text-sm text-cream/70">
        브랜드를 고르세요. 예약 클릭 화면의 브랜드 표에서 &quot;리포트&quot;를
        누르면 됩니다.
      </p>
    );
  }
  return <BrandReportView brand={brand} />;
}
