# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**swffgUI-cc** is a [Foundry VTT](https://foundryvtt.com/) module that provides Star Wars FFG-themed UI skins for the [Star Wars FFG system](https://github.com/StarWarsFoundryVTT/StarWarsFFG). It is a purely static front-end module — no Node.js, no build pipeline, no tests.

## Development Commands

There is no build step. Changes to `.js`, `.css`, and `.html` files take effect immediately when reloaded in Foundry VTT.

**Image conversion** (PNG/JPG → WebP, requires FFmpeg):
```
convert-all.cmd
```

**Distribution**: Bump `version` in `module.json`, create a GitHub Release, attach the ZIP. The `download` URL in `module.json` must point to the release asset.

## Architecture

### Entry Point

`swffg-ui.js` is the only JavaScript file. It defines a singleton class `swffgUIModule` that:
- Registers all game settings via `Hooks.once('init')`
- Applies the active theme and font on `Hooks.on('ready')`
- Hooks into Foundry render events (`renderSceneNavigation`, `renderPause`, sidebar renders) to inject custom Handlebars templates

### Theme System

Five themes, each defined as an entry in the `themes` object (inside `swffgUI-cc.js`):
- **default** — `swffg-default.css` + `ui/`
- **rebel** — `rebel/css/swffg.css` + `rebel/ui/`
- **darkside** — `darkside/css/swffg.css` + `darkside/ui/`
- **EoE** — `EoE/css/swffg.css` + `EoE/ui/`
- **blackEmpire** — `blackEmpire/css/swffg.css` + `blackEmpire/ui/`

Theme switching works by swapping the `href` on the `<link id="swffgui-theme">` element injected into the document `<head>`. No page reload required.

### CSS Variables

Runtime customisation (font, border size, font size, CRT effects) is applied by setting CSS custom properties on `document.documentElement`:
- `--major-button-font-family`
- `--window-content-border-image-width`
- `--window-header-font-size`

CRT effects (flicker, scanline, screen door) are CSS animations toggled by adding/removing classes on `<body>`.

### Templates

`templates/parts/` contains Handlebars `.html` files that replace Foundry's native sidebar and navigation elements. They are loaded with `loadTemplates()` on init and rendered via `renderTemplate()` inside hook callbacks.

### Localisation

`lang/en.json` and `lang/fr.json` — 42 keys under the `SWFFG.*` namespace, registered in `module.json` as `languages`.

### Settings Keys

All settings live under the `swffgUI-cc` namespace:
`selectSkin`, `fontSettings`, `windowBorderSize`, `fontSize`, `flickering`, `scanline`, `screenDoor`, `enable-cursor`, `enable-auberesh-title`, `verboseLogs`

## Module Manifest

`module.json` is the authoritative metadata file (id, version, compatibility ranges, file includes). Keep `version`, `compatibility.verified`, and `download` in sync when releasing.