
import { useCallback, useEffect, useState } from "react";
import { purchaseRequestService } from "../services/purchase-request-service-instance";
import type {
  CreatePurchaseRequestDto,
  PurchaseRequest,
  UpdatePurchaseRequestDto,
} from "../types/purchase-request";

export function usePurchaseRequests() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>("");

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const data = await purchaseRequestService.getAll();
      setRequests(data);
    } catch (error) {
      console.error("Ошибка загрузки заявок:", error);
      setLoadError("Не удалось загрузить заявки. Попробуй ещё раз.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function createRequest(data: CreatePurchaseRequestDto) {
    const newRequest = await purchaseRequestService.create(data);

    setRequests((currentRequests) => [...currentRequests, newRequest]);
  }

  async function updateRequest(
    id: string,
    data: UpdatePurchaseRequestDto,
  ) {
    const updatedRequest = await purchaseRequestService.update(id, data);

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === id ? updatedRequest : request,
      ),
    );
  }

  async function deleteRequest(id: string) {
    await purchaseRequestService.remove(id);

    setRequests((currentRequests) =>
      currentRequests.filter((request) => request.id !== id),
    );
  }

  return {
    requests,
    isLoading,
    loadError,
    loadRequests,
    createRequest,
    updateRequest,
    deleteRequest,
  };
}
