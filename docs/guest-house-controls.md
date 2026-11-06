# Guest house controls

The default music flow is **Use my music app**. Guests choose Spotify, Apple Music, YouTube Music, Amazon Music or another app and choose a compatible output through Spotify Connect, AirPlay, Cast or Bluetooth. The page cannot see another app's song, pair a phone automatically, or verify compatible hardware before commissioning. Optional Spotify embeds may play previews. Local audio files stay on the guest's device.

Private Wi-Fi details use sensitive server variables `KPL_GUEST_WIFI_SSID` and `KPL_GUEST_WIFI_PASSWORD`. Guest authentication precedes disclosure. Never commit these values or use `NEXT_PUBLIC`. The public `/house` page receives neither. Guests can save a password once disclosed.

## Implemented control boundary

`lib/guest-home.mjs` is a server broker for Home Assistant. Each Server Action independently authenticates the guest. Browser requests contain logical devices and allowed actions, never arbitrary entities, service names, URLs or payloads.

- Speaker: resume, pause, bounded volume.
- TV: power, playback, volume and approved inputs. Inputs intersect the owner's list with the device's reported sources.
- Thermostat: bounded single setpoint in supported active modes, with verified system units and device limits. No HVAC mode, off, schedules or dual targets.
- Supported-feature flags determine buttons. Every request checks an expiring grant bound to the current guidebook session. Missing/invalid configuration fails closed.
- Readback confirms the requested device state. A changed target temperature does not mean the room already reached it. Missing confirmation is shown explicitly.
- Structured runtime logs record request ID, grant ID, logical device and requested/confirmed/unconfirmed/denied result. Secrets and listening history are excluded. These logs are **not a durable PJ audit ledger**.

The legacy music Server Action uses this broker too. Its old preset `start` command is denied. The old adapter has no live imports. The simulated lamp is removed from the live overview.

## Commissioning

No installed Lodge device IDs, reachable hub or receiver compatibility was verified. Production remote controls therefore remain disabled. Do not populate guessed entities.

1. Inventory the actual Lodge speaker, TV/streamer, thermostat and router. Add supported devices to an always-on local Home Assistant host.
2. Prefer local integrations and protected remote access. Home Assistant Cloud supports encrypted remote access without opening router ports. Keep hub credentials on the server; do not embed the administrator dashboard. HA user roles are not an untrusted-guest security boundary.
3. Test each device on-site, including actual sound and temperature units. Confirm physical controls work during cloud failure.
4. Configure the server values below. Rotate **both** guidebook code hash and session token per stay, then bind the grant to the new session. This release supports one shared active stay, not per-person identities or automatic booking grants.
5. Deploy, test guest access and expiry, then enable the approved stay. Environment policy changes require redeployment; immediate revocation needs a live policy store.

| Variable | Purpose |
| --- | --- |
| `KPL_HOME_ENABLED` | Exact `true` enables requests once all checks pass. Omit to disable. |
| `KPL_HOME_HUB_URL` | Trusted reachable HTTPS origin, no credentials/path/query/fragment. |
| `KPL_HOME_HUB_TOKEN` | Sensitive server credential. |
| `KPL_HOME_SPEAKER`, `KPL_HOME_TV` | Optional approved `media_player` entity IDs. |
| `KPL_HOME_CLIMATE` | Optional approved `climate` entity ID. |
| `KPL_HOME_GRANT_ID` | Opaque stay identifier without personal information. |
| `KPL_HOME_SESSION_HASH` | SHA-256 hex of the current guidebook session token. |
| `KPL_HOME_ACCESS_START`, `KPL_HOME_ACCESS_END` | ISO timestamps with timezone; start inclusive, end exclusive; at most 31 days. |
| `KPL_HOME_VOLUME_MAX` | Integer 0–50, default 40, for broker requests. |
| `KPL_HOME_TEMP_UNIT` | `F` or `C`; must match HA before climate controls appear. |
| `KPL_HOME_TEMP_MIN`, `KPL_HOME_TEMP_MAX` | Default 68–74°F / 20–23°C; outer limits 60–80°F / 16–27°C; intersected with device bounds. |
| `KPL_HOME_TV_SOURCES` | Exact input names separated by `|`. Omit to disable. |

## Network and PJ follow-through

Guest phones and media receivers need permitted discovery for Connect/AirPlay/Cast. Isolate owner devices, locks, cameras and hub administration. Client isolation can block casting; design a guest-media network rather than broadly removing isolation.

**Broker limits do not constrain physical remotes, Bluetooth, AirPlay, Cast or Spotify Connect used directly.** Enforce house-wide volume/quiet-hour rules at the receiver/local hub. Grant expiry stops new guidebook commands; it does not stop existing audio or revoke saved Wi-Fi/Bluetooth access. Commission a checkout routine that clears guest pairings/accounts, stops media and restores approved setpoints. That routine is not implemented here.

Next PJ work: per-reservation revocable grants in a live store, per-device/action policy, local quiet hours, distributed rate limits, and durable append-only intent/decision/result records. Require durable intent persistence before dispatch when that is the governance contract. Keep listening history out of those records. Locks, alarms, cameras, purchases and safety settings remain excluded.

## Verification

`npm run test:core` covers stay boundaries, session rotation, insecure origins, invalid limits, capabilities, source allowlists, climate units/modes, exact service payloads, readback, stale/offline state and expiry during requests. `npm run build` checks routes and TypeScript. Fixtures do not prove physical operation.

Before a stay, verify anonymous requests cannot retrieve Wi-Fi or invoke controls, copy/reveal on a phone, actual network discovery, every connected device on-site, expiry with an open page, cloud failure and checkout cleanup.

## Official sources reviewed November 6, 2026

- [Spotify Connect](https://support.spotify.com/us/article/spotify-connect/): output selection from the guest's Spotify app.
- [Spotify API quotas](https://developer.spotify.com/documentation/web-api/concepts/quota-modes): development apps require owner Premium and allow five authorized users; unsuitable for arbitrary rotating guests without further approval.
- [Apple AirPlay](https://support.apple.com/en-us/105068) and [Google Cast](https://support.google.com/chromecast/answer/6109286): compatible receivers and shared network. Cast guest mode is discontinued.
- [Home Assistant remote access](https://www.home-assistant.io/docs/configuration/remote/) and [trust model](https://contributors.home-assistant.io/security/how-it-works/): protected transport and trusted-user assumptions.
- [Media player](https://www.home-assistant.io/integrations/media_player/) and [climate](https://www.home-assistant.io/integrations/climate/): actions and state reporting.
