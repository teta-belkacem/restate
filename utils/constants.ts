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

export const specifications = {
  "gas" : "الغاز",
  "electricity" : "الكهرباء",
  "water" : "الماء",
}

export const listingStatus = [
  { id: 0, name: "قيد الإنشاء"}, 
  { id: 1, name: "قيد المراجعة"}, 
  { id: 2, name: "مقبول"}, 
  { id: 3, name: "مرفوض"}, 
] as const; 

export const reviewStatus = [
  { id: 0, name: "مرفوض"}, 
  { id: 1, name: "مقبول"}, 
] as const; 