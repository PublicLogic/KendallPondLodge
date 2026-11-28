export function mercantileOwnerPreviewEnabled(env = process.env) {
  return env.VERCEL_ENV === 'preview' && env.KPL_STAY_COMMERCE_ENABLED === 'true';
}

export function ownerOrderPage(orders, status = 'all', requestedPage = 1) {
  const selectedStatus = ['paid', 'needs_review', 'fulfilled', 'reserved', 'checkout', 'expired'].includes(status) ? status : 'all';
  const filtered = selectedStatus === 'all' ? orders : orders.filter(order => order.status === selectedStatus);
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const parsed = Number(requestedPage);
  const page = Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, pages) : 1;
  return { orders: filtered.slice((page - 1) * 12, page * 12), page, pages, total: filtered.length, status: selectedStatus };
}

export function ownerOrdersHref(status, page = 1) {
  return '/owner/store?' + new URLSearchParams({ status, page: String(page) });
}

export async function readOwnerOrders({ env = process.env, client, fetcher = fetch }) {
  if (!mercantileOwnerPreviewEnabled(env)) throw new Error('Mercantile owner preview is paused.');
  const { base, key } = client();
  const origin = base.replace(/\/api\/stayos\/booking$/, '');
  const response = await fetcher(origin + '/api/stayos/store/orders', {
    method: 'GET', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
    headers: { Authorization: 'Bearer ' + key, 'X-PJ-Mercantile-Role': 'owner' }
  });
  const payload = await response.json();
  if (!response.ok || payload?.success !== true || !Array.isArray(payload.data)) {
    throw new Error('Mercantile orders are unavailable.');
  }
  return payload.data;
}
