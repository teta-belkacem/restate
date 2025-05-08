export const property_types = [
  "قطعة أرض",
  "منزل",
  "شقة",
  "مكتب",
  "محل تجاري",
  "فيلا",
] as const;

export const operation_types = ["بيع", "إيجار"] as const;

export const payment_types = [
  "نقدا (كاش)",
  "تقسيط",
] as const;

// export const documents_types = [
//   "عقد ملكية",
//   "عقد إيجار",
//   "رخصة بناء",
//   "شهادة إتمام بناء",
//   "شهادة تصرف",
// ] as const;

export const listing_status = ["قيد الإنشاء", "قيد المراجعة", "مقبول", "مرفوض" ] as const; 

export const review_status = [ "مقبول", "مرفوض" ] as const; 