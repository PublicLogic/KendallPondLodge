export function mercantileOwnerPreviewEnabled(env?: Record<string, string | undefined>): boolean;
export function ownerOrderPage<Order extends { status: string }>(orders: Order[], status?: string, requestedPage?: string | number): {
  orders: Order[]; page: number; pages: number; total: number; status: string;
};
export function ownerOrdersHref(status: string, page?: number): string;
export function readOwnerOrders(options: {
  env?: Record<string, string | undefined>;
  client: () => { base: string; key: string };
  fetcher?: typeof fetch;
}): Promise<Array<{
  id: string; product_id: string; quantity: number; total_cents: number;
  status: string; created_at: string;
}>>;
