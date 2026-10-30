/** HTTP transport test against a contract fixture, NOT the real PJ application. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { PjBookingClient } from '../lib/pj-booking-client.mjs';
import { validateGuestRequest } from '../lib/kpl-booking-core.mjs';

test('real HTTP transport keeps the property key server-side and distinguishes calendar failure', async () => {
  const seen = [];
  const key = 'fixture-only-'.repeat(4);
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const c of request) chunks.push(c);
    const body = Buffer.concat(chunks).toString('utf8');
    seen.push({ url: request.url, method: request.method, auth: request.headers.authorization,
      csrf: request.headers['x-puddlejumper-request'], body: body ? JSON.parse(body) : null });
    response.setHeader('Content-Type', 'application/json');
    if (request.url.endsWith('/begin-checkout')) {
      response.writeHead(503);
      return response.end(JSON.stringify({ success: false, error: 'calendar_unavailable', message: 'Do not reveal this upstream diagnostic' }));
    }
    response.writeHead(request.method === 'POST' ? 201 : 200);
    response.end(JSON.stringify({ success: true, data: { id: 'fixture-record', status: 'requested' } }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const client = new PjBookingClient({baseUrl: `http://127.0.0.1:${server.address().port}/api/stayos/booking`, key, allowLocal: true});
    const input = validateGuestRequest({check_in:'2027-01-02',check_out:'2027-01-04',guest_name:'Fixture Guest',guest_email:'guest@example.test',guests:2,pets:0,consent:'yes',request_key:'A0000000-0000-4000-8000-000000000001'}, new Date('2026-10-27T12:00:00Z'));
    assert.equal((await client.createRequest(input)).status,'requested');
    assert.equal(seen[0].url,'/api/stayos/booking/booking-requests');
    assert.equal(seen[0].auth,`Bearer ${key}`);
    assert.equal(seen[0].csrf,'true');
    assert.deepEqual(seen[0].body,input);
    assert.equal(seen[0].body.request_key,'a0000000-0000-4000-8000-000000000001');
    await assert.rejects(client.beginCheckout('20000000-0000-4000-8000-000000000002'),e=>e.status===503&&e.code==='calendar_unavailable'&&!e.message.includes('diagnostic'));
    assert.equal(seen.length,2);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve=>server.close(resolve));
  }
});
