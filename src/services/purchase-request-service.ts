
import type {
  CreatePurchaseRequestDto,
  PurchaseRequest,
  UpdatePurchaseRequestDto,
} from "../types/purchase-request";

export interface PurchaseRequestService {
  getAll(): Promise<PurchaseRequest[]>;

  create(
    data: CreatePurchaseRequestDto,
  ): Promise<PurchaseRequest>;

  update(
    id: string,
    data: UpdatePurchaseRequestDto,
  ): Promise<PurchaseRequest>;

  remove(id: string): Promise<void>;
}
