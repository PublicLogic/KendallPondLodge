import test from 'node:test';
import assert from 'node:assert/strict';
import { getOwnerSessionToken, verifyOwnerSessionToken, verifyOwnerCode, hashOwnerCode, OwnerConfigError, OWNER_SESSION_TTL_SECONDS } from '../lib/owner-auth.mjs';
test('owner-code UX issues unique signed cookies, not the configured secret', () => { const old = { ...process.env }; try {
    process.env.NODE_ENV = 'production';
    process.env.KPL_OWNER_SESSION_TOKEN = 'a'.repeat(64);
    process.env.KPL_OWNER_CODE_HASH = hashOwnerCode('sample-passphrase');
    assert.equal(verifyOwnerCode('sample-passphrase'), true);
    assert.equal(verifyOwnerCode('wrong'), false);
    const a = getOwnerSessionToken(), b = getOwnerSessionToken();
    assert.notEqual(a, b);
    assert.notEqual(a, process.env.KPL_OWNER_SESSION_TOKEN);
        assert.notEqual(JSON.parse(Buffer.from(a.split(".")[0], "base64url").toString()).code, process.env.KPL_OWNER_CODE_HASH);
    assert.equal(verifyOwnerSessionToken(a), true);
    assert.equal(verifyOwnerSessionToken(process.env.KPL_OWNER_SESSION_TOKEN), false);
    assert.equal(verifyOwnerSessionToken(a + 'x'), false);
    assert.equal(OWNER_SESSION_TTL_SECONDS, 43200);
}
finally {
    for (const k of ['NODE_ENV', 'KPL_OWNER_SESSION_TOKEN', 'KPL_OWNER_CODE_HASH'])
        if (old[k] === undefined)
            delete process.env[k];
        else
            process.env[k] = old[k];
} });
test('expiry and key/code rotation revoke a session', () => { const old = { ...process.env }; try {
    process.env.NODE_ENV = 'production';
    process.env.KPL_OWNER_SESSION_TOKEN = 'b'.repeat(64);
    process.env.KPL_OWNER_CODE_HASH = hashOwnerCode('sample-passphrase');
    const now = Date.now(), t = getOwnerSessionToken(now);
    assert.equal(verifyOwnerSessionToken(t, now + 43200001), false);
    assert.equal(verifyOwnerSessionToken(t, now - 61000), false);
    process.env.KPL_OWNER_CODE_HASH = hashOwnerCode('new-passphrase');
    assert.equal(verifyOwnerSessionToken(t), false);
    process.env.KPL_OWNER_CODE_HASH = hashOwnerCode('sample-passphrase');
    process.env.KPL_OWNER_SESSION_TOKEN = 'c'.repeat(64);
    assert.equal(verifyOwnerSessionToken(t), false);
}
finally {
    for (const k of ['NODE_ENV', 'KPL_OWNER_SESSION_TOKEN', 'KPL_OWNER_CODE_HASH'])
        if (old[k] === undefined)
            delete process.env[k];
        else
            process.env[k] = old[k];
} });
test('owner auth fails closed without secrets in all environments', () => { const old = { ...process.env }; try {
    delete process.env.KPL_OWNER_SESSION_TOKEN;
    delete process.env.KPL_OWNER_CODE_HASH;
    assert.throws(() => getOwnerSessionToken(), OwnerConfigError);
    assert.throws(() => verifyOwnerCode('anything'), OwnerConfigError);
    assert.equal(verifyOwnerSessionToken(undefined), false);
}
finally {
    for (const k of ['KPL_OWNER_SESSION_TOKEN', 'KPL_OWNER_CODE_HASH'])
        if (old[k] === undefined)
            delete process.env[k];
        else
            process.env[k] = old[k];
} });
