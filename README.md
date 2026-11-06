# Jellyfin Audiobook Speed

A Jellyfin plugin that adds a playback-speed control to the web audio player.

- Speed menu opened from the speed label in the now-playing bar (and from a button on the full-screen player page).
- Coarse steps of **0.25x** with `-` / `+` buttons and presets, from 0.5x to 3.0x.
- **Fine-tune slider** in 0.05x steps.
- Pitch is preserved; the chosen speed is remembered and re-applied on every track change.
- Keyboard shortcuts (desktop): `[` slower, `]` faster, `\` reset to 1.0x.

Built for **Jellyfin 12** (`net10.0`, `targetAbi` 12.0.0.0).

## How it works

The plugin injects a small script into the web client's `index.html` and serves it from
`/AudiobookSpeed/script.js`. Any client that renders the server's web UI picks it up, including
the official **Jellyfin for Android** and iOS apps (WebView wrappers).

**Limitation:** native clients that do not load the web UI (Swiftfin, Finamp, Android TV, ...)
are not affected; speed control there must come from the app itself.

## Install

1. Build (below) or download the release zip.
2. Stop Jellyfin and copy the `AudiobookSpeed_<version>` folder (DLL + `meta.json`) into the server's
   `plugins` directory (Windows: `%ProgramData%\Jellyfin\Server\plugins\`).
3. Start Jellyfin, then hard-refresh the web client / fully restart the mobile app.

## Build

Requires the .NET 10 SDK.

```
dotnet publish Jellyfin.Plugin.AudiobookSpeed -c Release -o out
```

Copy `out/Jellyfin.Plugin.AudiobookSpeed.dll` into a folder with this `meta.json`:

```json
{
  "guid": "b7d1c5a2-4e0f-4a6b-9c33-5f1e2d8a7c90",
  "name": "Audiobook Speed",
  "description": "Adds a playback speed control (0.25x steps plus fine-tune slider) to the web audio player.",
  "overview": "Audiobook playback speed control",
  "owner": "burrissj",
  "category": "General",
  "version": "1.0.4.0",
  "targetAbi": "12.0.0.0",
  "timestamp": "2026-10-09T00:00:00Z",
  "status": "Active",
  "autoUpdate": false,
  "assemblies": ["Jellyfin.Plugin.AudiobookSpeed.dll"]
}
```

## Configuration

`Step` (0.25), `FineStep` (0.05), `MinSpeed` (0.5) and `MaxSpeed` (3.0) live in the plugin's
configuration XML in the server's `plugins/configurations` folder.

## License

GPL-2.0, see [LICENSE](LICENSE).
