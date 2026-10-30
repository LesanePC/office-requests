import type {
  CreatePurchaseRequestDto,
  PurchaseRequest,
  UpdatePurchaseRequestDto,
} from "../types/purchase-request";
import type {
  PurchaseRequestService
} from "./purchase-request-service";

const requests: PurchaseRequest[] = [{
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
  }
];

const mockPurchaseRequestService: PurchaseRequestService = {
  async getAll() {

    return [...requests];
  },
  async create(data: CreatePurchaseRequestDto) {

    const newRequest: PurchaseRequest = {
      ...data,
      id: crypto.randomUUID(),
      createdBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    requests.push(newRequest);
    return newRequest;
  },

  async update(id: string, data: UpdatePurchaseRequestDto) {
    const request = requests.find((item) => item.id === id);

    if (!request) {
      throw new Error("Заявка не найдена");
    }

    Object.assign(request, data, {
      updatedAt: new Date().toISOString(),
    });

    return request;
  },

  async remove(id: string) {
    const index = requests.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("Заявка не найдена");
    }

    requests.splice(index, 1);
  },

};

export {
  mockPurchaseRequestService
};