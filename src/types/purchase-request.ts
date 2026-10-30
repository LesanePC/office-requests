
export type Department = "office" | "it";

export interface PurchaseRequest {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  department: Department;
  productUrl: string | null;
  comment: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreatePurchaseRequestDto = Pick<
  PurchaseRequest,
  "name" | "quantity" | "unit" | "department" | "productUrl" | "comment"
>;

export type UpdatePurchaseRequestDto =
  Partial<CreatePurchaseRequestDto>;
