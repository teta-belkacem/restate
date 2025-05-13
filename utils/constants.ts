export const propertyTypes = [
  { id: 1, name: "شقة" },
  { id: 2, name: "فيلا" },
  { id: 3, name: "منزل" },
  { id: 4, name: "أرض" },
  { id: 6, name: "مكتب" },
  { id: 7, name: "محل تجاري" },
  { id: 8, name: "مستودع" },
] as const;

export const operationTypes = [
  { id: 0, name: "بيع" },
  { id: 1, name: "إيجار" },
] as const;

export const paymentTypes = [
  { id: 1, name: "نقدا" },
  { id: 2, name: "تقسيط" },
] as const;

export const listingStatus = ["قيد الإنشاء", "قيد المراجعة", "مقبول", "مرفوض" ] as const; 

export const reviewStatus = [ "مقبول", "مرفوض" ] as const; 