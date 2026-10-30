// Browser-only request identity. Persist a digest and UUID, never the guest's
// name, contact details, dates, or note. PJ is responsible for durable deduplication.
const STORAGE_KEY = 'kpl.guest-request.v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Only clear after an acknowledged result; retain the key on ambiguous failure.
 * @param {Pick<Storage, 'getItem' | 'removeItem'> | null} storage
 * @param {string} acknowledgedKey
 */
export function clearGuestRequestKey(storage, acknowledgedKey) {
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) ?? 'null');
    if (saved?.key === acknowledgedKey) storage?.removeItem(STORAGE_KEY);
  } catch {
    // The successful action also drops the form's in-memory key.
  }
}

/** @param {Pick<Storage, 'getItem' | 'setItem'> | null} storage */
export function createGuestRequestKeyManager(storage = null) {
  let previous;
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) ?? 'null');
    if (saved && UUID.test(saved.key) && /^[0-9a-f]{64}$/.test(saved.fingerprint)) previous = saved;
  } catch {
    // Private browsing can deny storage. The current form still keeps its key.
  }

  /** @param {FormData} form */
  return async function requestKey(form) {
    const value = name => String(form.get(name) ?? '');
    const canonical = JSON.stringify([
      value('check_in'), value('check_out'), value('guest_name').trim(),
      value('guest_email').trim().toLowerCase(), Number(value('guests')),
      Number(value('pets')), value('note').trim(),
    ]);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
    const fingerprint = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');

    if (previous?.fingerprint === fingerprint) return previous.key;

    previous = { fingerprint, key: globalThis.crypto.randomUUID() };
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(previous));
    } catch {
      // Keep in-memory retry protection when browser storage is unavailable.
    }
    return previous.key;
  };
}
