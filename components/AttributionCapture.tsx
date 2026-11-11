"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/track";

// 처음 들어왔을 때 유입 출처를 판별해 기억한다(화면에는 아무것도 그리지 않음).
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
