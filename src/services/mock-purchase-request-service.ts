import type {
  CreatePurchaseRequestDto,
  PurchaseRequest,
  UpdatePurchaseRequestDto,
} from "../types/purchase-request";
import type { PurchaseRequestService } from "./purchase-request-service";

const requests: PurchaseRequest[] = [
  {
    id: "1",
    name: "Монитор",
    quantity: 2,
    unit: "шт.",
    department: "it",
    productUrl: "https://example.com/monitor",
    comment: "Для новых сотрудников",
    createdBy: "Евгений",
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-27T10:00:00.000Z",
  },
  {
    id: "2",
    name: "АКБ HP 840",
    quantity: 5,
    unit: "шт.",
    department: "it",
    productUrl: "https://example.com/poweracb",
    comment: "Для замены",
    createdBy: "Евгений",
    createdAt: "2026-10-27T10:00:00.000Z",
    updatedAt: "2026-10-29T10:00:00.000Z",
  },
];
const STORAGE_KEY = "office-purchase-requests";
function saveRequests() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

let isInitialized = false;

function loadRequests(): PurchaseRequest[] {
  if (isInitialized) {
    return [...requests];
  }

  const savedRequests = localStorage.getItem(STORAGE_KEY);

  if (savedRequests) {
    try {
      const parsedRequests: unknown = JSON.parse(savedRequests);

      if (Array.isArray(parsedRequests)) {
        requests.splice(0, requests.length, ...parsedRequests);
      }
    } catch (error) {
      console.error("Не удалось загрузить заявки:", error);
      saveRequests();
    }
  } else {
    saveRequests();
  }

  isInitialized = true;

  return [...requests];
}

const mockPurchaseRequestService: PurchaseRequestService = {
  async getAll() {
    return loadRequests();
  },
  async create(data: CreatePurchaseRequestDto) {
    loadRequests();
    const newRequest: PurchaseRequest = {
      ...data,
      id: crypto.randomUUID(),
      createdBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    requests.push(newRequest);
    saveRequests();
    return newRequest;
  },

  async update(id: string, data: UpdatePurchaseRequestDto) {
    loadRequests();
    const request = requests.find((item) => item.id === id);

    if (!request) {
      throw new Error("Заявка не найдена");
    }

    Object.assign(request, data, {
      updatedAt: new Date().toISOString(),
    });

    saveRequests();

    return request;
  },

  async remove(id: string) {
    loadRequests();
    const index = requests.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("Заявка не найдена");
    }

    requests.splice(index, 1);
    saveRequests();
  },
};

export { mockPurchaseRequestService };
