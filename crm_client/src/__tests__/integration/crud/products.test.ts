// src/__tests__/integration/crud/products.test.ts
import MockAdapter from "axios-mock-adapter";
import axiosInstance from "@/src/shared/services/axiosInstance";
import { fetchProducts, removeProduct } from "@/src/features/products/slices/productsSlice";
import { makeStore } from "@/src/__tests__/utils/testStore";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010/api/v1";

const sampleProduct = {
  _id: "p1",
  name: "Widget",
  description: "A widget",
  price: 9.99,
  stock: 10,
  category: "electronics" as const,
  images: [] as string[],
};

describe("Products CRUD thunks (axios integration)", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
    localStorage.clear();
  });

  it("fetchProducts.fulfilled loads items from paginated list envelope", async () => {
    mock.onGet(`${API_BASE}/products`).reply(200, {
      status: 200,
      message: "OK",
      page: 1,
      limit: 100,
      total: 1,
      totalPages: 1,
      data: [sampleProduct],
    });

    const store = makeStore();
    await store.dispatch(fetchProducts(undefined));

    const { products } = store.getState();
    expect(products.items).toHaveLength(1);
    expect(products.items[0].name).toBe("Widget");
    expect(products.isLoading).toBe(false);
    expect(products.error).toBeNull();
  });

  it("fetchProducts.rejected sets error message on 500", async () => {
    mock.onGet(`${API_BASE}/products`).reply(500, {
      status: 500,
      message: "Server error",
      data: null,
    });

    const store = makeStore();
    await store.dispatch(fetchProducts(undefined));

    expect(store.getState().products.error).toBe("Server error");
    expect(store.getState().products.items).toHaveLength(0);
  });

  it("removeProduct.fulfilled removes item from state", async () => {
    mock.onGet(`${API_BASE}/products`).reply(200, {
      status: 200,
      message: "OK",
      page: 1,
      limit: 100,
      total: 1,
      totalPages: 1,
      data: [sampleProduct],
    });
    mock.onDelete(`${API_BASE}/products/p1`).reply(200, {
      status: 200,
      message: "Deleted",
      data: null,
    });

    const store = makeStore();
    await store.dispatch(fetchProducts(undefined));
    await store.dispatch(removeProduct("p1"));

    expect(store.getState().products.items).toHaveLength(0);
  });
});
