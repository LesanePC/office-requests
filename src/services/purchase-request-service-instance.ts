import { mockPurchaseRequestService } from "./mock-purchase-request-service";
import type { PurchaseRequestService } from "./purchase-request-service";

export const purchaseRequestService: PurchaseRequestService =
  mockPurchaseRequestService;
