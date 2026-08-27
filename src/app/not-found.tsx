// 打錯網址時的 404（B4）。在此之前會掉到 Next 預設畫面（英文、沒有本站樣式與出口）。
import type { Metadata } from "next";
import { ErrorPage } from "@/components/ErrorPage";

export const metadata: Metadata = { title: "找不到頁面 — T-Pass 門戶" };

export default function NotFound() {
  return (
    <ErrorPage
      code="404 NOT FOUND"
      title="找不到這個頁面"
      message="大廳沒有這個頁面，你要找的東西可能在某個服務裡。"
    />
  );
}
