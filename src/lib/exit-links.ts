// 錯誤頁的「出口」網址。大廳自己就是門戶，所以全部是站內相對路徑，
// 不需要任何 env（其他服務的同名檔會從 PORTAL_URL 推導，見各服務 next.config.ts）。
export const HOME_URL = "/";
export const PORTAL_URL = "/";
// 全平台唯一的回報入口（B5）：app/feedback/route.ts 依註冊表轉址到回報問卷。
export const FEEDBACK_URL = "/feedback";
