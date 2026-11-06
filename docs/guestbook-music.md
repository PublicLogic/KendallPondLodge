# Guestbook music

Guests open **Guidebook → Play some music** and use **Play Lodge mix**, **Pause**, **Resume**, or **Set volume**. The panel reads the selected speaker's state from Home Assistant and sends commands to the speaker through the hub. It keeps the Bluetooth instructions available as a fallback.

## Connect the Lodge speaker

1. Add the Lodge speaker to Home Assistant. Test that its integration supports starting a preset with `media_player.play_media`, pause, resume, and absolute volume. Select a mix or station that works on that device and record its content ID and type. Test with a single, ungrouped Lodge speaker.
2. Configure the branch preview's server environment:

   | Variable | Value |
   | --- | --- |
   | `KPL_MUSIC_HUB_URL` | Trusted Home Assistant HTTPS origin that the preview server can reach |
   | `KPL_MUSIC_HUB_TOKEN` | Home Assistant token kept in the server's secret settings |
   | `KPL_MUSIC_SPEAKER` | Approved entity ID, such as `media_player.lodge_living_room` |
   | `KPL_MUSIC_PRESET_ID` | The mix or station ID supported by the speaker integration |
   | `KPL_MUSIC_PRESET_TYPE` | The media type expected by that integration |

3. Verify the preview has the existing Guidebook access settings and uses a code shared with authorized guests. The music page uses that shared Guidebook session. Update the Guidebook session secret when revoking old access.
4. Redeploy the preview. Open `/guidebook/audio` with the guest code and check the speaker status. Start the mix, listen for sound at the Lodge, then test pause, resume, and volume from a phone.

Commands target only the configured speaker. Guests can start the configured mix, resume the current queue, pause, and request a volume between 0% and 50%. The cap applies to guest volume requests. The hub's reported playback state confirms the player is playing or paused. Listening at the Lodge verifies the selected content and physical output.

The automated HTTP fixture exercises speaker status, preset playback, pause, resume, volume, credential failure, and a command that succeeds without changing player state. Run `node --test tests/home-assistant-music.test.mjs`.

[Home Assistant REST API](https://developers.home-assistant.io/docs/api/rest/) · [Media player integration](https://www.home-assistant.io/integrations/media_player/)
