/**
 * swffg-ui.js — Star Wars FFG UI Creative Common Module
 *
 * Foundry v12 / v13 dual-compatibility rewrite.
 *
 * Breaking changes addressed (host system 1.910 → 2.xx / Foundry v12 → v13):
 *  1. `Pause` and `SceneNavigation` globals no longer exist in Foundry v13.
 *     Classes that extend them are now defined conditionally inside `init`.
 *  2. Render hooks now pass a raw HTMLElement (not a jQuery array) for
 *     ApplicationV2-based UI elements (sidebar directories, settings, etc.).
 *     A `resolveEl()` helper normalises both cases.
 *  3. `this.section` / `section` implicit global bug fixed with proper `let`.
 *  4. `html.find()` jQuery call replaced with querySelector.
 *  5. `.directory-header` selector uses a graceful fallback chain for v13.
 *  6. `CONFIG.TinyMCE` optional-chaining guard added.
 */

"use strict";

/* ------------------------------------------------------------------ */
/* I. ENUMERATIONS                                                     */
/* ------------------------------------------------------------------ */

const IndicatorMode = {
    REBEL: 0,
    GALACTIC: 1,
    EOE: 2,
    BLACKEMPIRE: 3,
    DEFAULT: 4,
};

const IndicatorFonts = {
    EARTHORBITER: 0,
    KUIPERBELT: 1,
    MONS: 2,
    DISTANTGALAXY: 3,
    SIGNIKA: 4,
    ROBOTO: 5,
    ERAS: 6,
};

/* ------------------------------------------------------------------ */
/* II. THEME & FONT TABLES                                             */
/* ------------------------------------------------------------------ */

/** Base path for all module assets. */
const MODULE_PATH = "modules/swffgUI-cc";

/**
 * Theme definitions.
 * `css` is relative to the module root — the full href is built at runtime.
 * DEFAULT has no `css` entry: Foundry already loads `swffg-default.css` via
 * module.json `styles`, so no extra <link> is needed for that theme.
 * Cursor paths are root-relative so they resolve correctly regardless of
 * which CSS file consumes the --application-cursor-pointer variable.
 */
const themes = {
    [IndicatorMode.GALACTIC]: {
        css: "darkside/css/swffg.css",
        cursor: "/modules/swffgUI-cc/darkside/ui/buttons/cursor-empire.webp"
    },
    [IndicatorMode.EOE]: {
        css: "EoE/css/swffg.css",
        cursor: "/modules/swffgUI-cc/EoE/ui/buttons/cursor-pyke.webp"
    },
    [IndicatorMode.BLACKEMPIRE]: {
        css: "blackEmpire/css/swffg.css",
        cursor: "/modules/swffgUI-cc/EoE/ui/buttons/cursor-pyke.webp"
    },
    [IndicatorMode.DEFAULT]: {
        // No extra CSS — swffg-default.css is already injected by Foundry via module.json
    },
    [IndicatorMode.REBEL]: {
        css: "rebel/css/swffg.css",
        cursor: "/modules/swffgUI-cc/rebel/ui/buttons/cursor-rebel.webp"
    }
};

const fonts = {
    [IndicatorFonts.EARTHORBITER]: 'EarthOrbiter',
    [IndicatorFonts.KUIPERBELT]: 'KuiperBelt',
    [IndicatorFonts.MONS]: 'Mons',
    [IndicatorFonts.DISTANTGALAXY]: 'DistantGalaxy',
    [IndicatorFonts.SIGNIKA]: 'Signika',
    [IndicatorFonts.ROBOTO]: 'Roboto',
    [IndicatorFonts.ERAS]: 'Eras'
};

/* ------------------------------------------------------------------ */
/* III. DOM COMPATIBILITY HELPER                                       */
/* Foundry v12: render hooks pass jQuery-wrapped arrays.              */
/* Foundry v13: render hooks pass raw HTMLElement.                    */
/* ------------------------------------------------------------------ */

/**
 * Resolve an HTMLElement from whatever the render hook passes.
 * @param {HTMLElement|jQuery|any} html
 * @returns {HTMLElement|null}
 */
function resolveEl(html) {
    if (!html) return null;
    if (html instanceof HTMLElement) return html;            // v13 ApplicationV2
    if (typeof html.get === 'function') return html.get(0); // jQuery object
    if (html[0] instanceof HTMLElement) return html[0];     // jQuery array
    return null;
}

/**
 * Find the best insertion anchor in a sidebar tab element.
 * Tries progressively broader selectors for v12 and v13 compatibility.
 * @param {HTMLElement} el
 * @returns {HTMLElement|null}
 */
function findDirectoryHeader(el) {
    if (!el) return null;
    return el.querySelector(".directory-header")
        ?? el.querySelector(".header-actions.action-buttons")
        ?? el.querySelector(".action-buttons")
        ?? el.querySelector("header")
        ?? null;
}

/* ------------------------------------------------------------------ */
/* IV. THEME & FONT APPLICATION                                        */
/* ------------------------------------------------------------------ */

const applyFontSetting = (state) => {
    const fontFamily = fonts[state];
    if (fontFamily) {
        document.documentElement.style.setProperty('--major-button-font-family', fontFamily);
    } else {
        console.error(`[swffgUI-cc] Unknown font state: ${state}`);
    }
};

/**
 * Return the dedicated theme <link> element, creating and inserting it if
 * it does not yet exist.  The link is inserted immediately after the last
 * <link> whose href contains the module path so it overrides swffg-default.css
 * and swffg-shared.css without polluting unrelated stylesheets.
 * @returns {HTMLLinkElement}
 */
function _getOrCreateThemeLink() {
    const LINK_ID = "swffgui-theme";
    let link = document.getElementById(LINK_ID);
    if (link) return link;

    link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    link.type = "text/css";

    // Find the last <link> that belongs to this module so we insert right after it.
    // This guarantees our theme CSS wins the cascade over swffg-default.css.
    const moduleLinks = Array.from(document.head.querySelectorAll("link[href]"))
        .filter(el => el.href.includes(MODULE_PATH));
    const insertAfter = moduleLinks.at(-1) ?? document.head.lastElementChild;
    insertAfter.insertAdjacentElement("afterend", link);

    return link;
}

/**
 * Apply a theme by its IndicatorMode value.
 * - DEFAULT: removes the dedicated theme <link> (Foundry's swffg-default.css stays).
 * - Any other theme: creates/updates the dedicated <link> with the new CSS href.
 * Cursor custom property is updated when the enable-cursor setting is on.
 * @param {number} state  One of the IndicatorMode values.
 */
const applyTheme = (state) => {
    const theme = themes[state] ?? themes[IndicatorMode.DEFAULT];

    // --- Cursor ---
    const cursorEnabled = Number(game.settings.get("swffgUI-cc", "enable-cursor"));
    if (cursorEnabled && theme.cursor) {
        document.documentElement.style.setProperty(
            '--application-cursor-pointer',
            `url(${theme.cursor}), pointer`
        );
    } else if (!cursorEnabled) {
        document.documentElement.style.setProperty('--application-cursor-pointer', 'pointer');
    }

    // --- Stylesheet ---
    if (!theme.css) {
        // DEFAULT theme: Foundry already provides swffg-default.css via module.json.
        // Remove the override link if one was previously injected.
        document.getElementById("swffgui-theme")?.remove();
        return;
    }

    const fullHref = `${MODULE_PATH}/${theme.css}`;
    const link = _getOrCreateThemeLink();
    if (!link.href.endsWith(fullHref) && !link.href.includes(theme.css)) {
        link.href = fullHref;
    }
};

/* ------------------------------------------------------------------ */
/* V. MODULE CLASS                                                     */
/* ------------------------------------------------------------------ */

class swffgUIModule {

    constructor() {
        this.swffgUIModule = new Map();
        this.TIMEOUT_INTERVAL = 50;
        this.MAX_TIMEOUT = 1000;
        // Use the namespaced API (global randomID deprecated since v12, removed in v14)
        this.ID = foundry.utils.randomID(24);
    }

    log(msg, ...args) {
        if (game && game.settings.get("swffgUI-cc", "verboseLogs")) {
            const color = "background: #6699ff; color: #000; font-size: larger;";
            console.debug(`%c swffgUIModule: ${msg}`, color, ...args);
        }
    }

    async init() {
        game.settings.register('swffgUI-cc', 'flickering', {
            name: game.i18n.localize('SWFFG.flickering'),
            hint: game.i18n.localize('SWFFG.flickeringHint'),
            scope: 'client',
            type: Boolean,
            default: false,
            config: true,
            onChange: () => { location.reload(); },
        });

        game.settings.register('swffgUI-cc', 'screenDoor', {
            name: game.i18n.localize('SWFFG.screenDoor'),
            hint: game.i18n.localize('SWFFG.screenDoorHint'),
            scope: 'client',
            type: Boolean,
            default: false,
            config: true,
            onChange: () => { location.reload(); },
        });

        game.settings.register('swffgUI-cc', 'scanline', {
            name: game.i18n.localize('SWFFG.scanline'),
            hint: game.i18n.localize('SWFFG.scanlineHint'),
            scope: 'client',
            type: Boolean,
            default: false,
            config: true,
            onChange: () => { location.reload(); },
        });

        game.settings.register("swffgUI-cc", "selectSkin", {
            name: game.i18n.localize("SWFFG.selectSkin"),
            hint: game.i18n.localize("SWFFG.selectSkinHint"),
            scope: "client",
            config: true,
            default: 4,
            type: Number,
            choices: {
                0: "SWFFG.options.indicator.choices.0",
                1: "SWFFG.options.indicator.choices.1",
                2: "SWFFG.options.indicator.choices.2",
                3: "SWFFG.options.indicator.choices.3",
                4: "SWFFG.options.indicator.choices.4"
            },
            onChange: (value) => { applyTheme(Number(value)); }
        });

        game.settings.register("swffgUI-cc", "fontSettings", {
            name: game.i18n.localize("SWFFG.fontSettings"),
            hint: game.i18n.localize("SWFFG.fontSettingsHint"),
            scope: "client",
            config: true,
            default: 6,
            type: Number,
            choices: {
                0: "SWFFG.options.indicator.fonts.0",
                1: "SWFFG.options.indicator.fonts.1",
                2: "SWFFG.options.indicator.fonts.2",
                3: "SWFFG.options.indicator.fonts.3",
                4: "SWFFG.options.indicator.fonts.4",
                5: "SWFFG.options.indicator.fonts.5",
                6: "SWFFG.options.indicator.fonts.6",
            },
            onChange: (value) => { applyFontSetting(Number(value)); }
        });

        game.settings.register("swffgUI-cc", "windowBorderSize", {
            name: "SWFFG.windowBorderSize",
            hint: "SWFFG.windowBorderSizeHint",
            scope: "client",
            type: Number,
            default: 12,
            range: { min: 8, max: 30, step: 2 },
            config: true,
            onChange: (value) => {
                const n = Number(value);
                document.documentElement.style.setProperty('--window-content-border-image-width', n + 'px');
                document.documentElement.style.setProperty('--window-content-border-image-outset', (n - 8) + 'px');
                document.documentElement.style.setProperty('--window-header-margin', `0px 0px ${n - 8}px 0px`);
            }
        });

        game.settings.register("swffgUI-cc", "fontSize", {
            name: "SWFFG.fontSize",
            hint: "SWFFG.fontSizeHint",
            scope: "client",
            type: Number,
            default: 14,
            range: { min: 10, max: 22, step: 2 },
            config: true,
            onChange: (value) => {
                document.documentElement.style.setProperty('--major-button-font-size', value + 'px');
            }
        });

        game.settings.register("swffgUI-cc", "enable-cursor", {
            name: "SWFFG.CursorSettings",
            hint: "SWFFG.CursorSettingsHint",
            scope: "client",
            config: true,
            default: false,
            type: Boolean,
            onChange: (value) => {
                if (value) {
                    const state = Number(game.settings.get("swffgUI-cc", "selectSkin"));
                    const theme = themes[state];
                    const cursor = theme?.cursor ? `url(${theme.cursor}), pointer` : 'pointer';
                    document.documentElement.style.setProperty('--application-cursor-pointer', cursor);
                } else {
                    document.documentElement.style.setProperty('--application-cursor-pointer', 'pointer');
                }
            }
        });

        game.settings.register("swffgUI-cc", "enable-auberesh-title", {
            name: "SWFFG.AubereshSettings",
            hint: "SWFFG.AubereshSettingsHint",
            scope: "client",
            config: true,
            default: false,
            type: Boolean,
            onChange: (value) => {
                if (value) {
                    document.documentElement.style.setProperty('--application-auberesh-title', 'contents');
                    document.documentElement.style.setProperty('--application-auberesh-sidebar-title', 'flex');
                } else {
                    document.documentElement.style.setProperty('--application-auberesh-title', 'none');
                    document.documentElement.style.setProperty('--application-auberesh-sidebar-title', 'none');
                }
            }
        });

        game.settings.register("swffgUI-cc", "active-cclink", {
            name: "SWFFG.CCLinkSettings",
            hint: "SWFFG.CCLinkSettingsHint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: (value) => {
                if (value) {
                    this._insertCCLink();
                } else {
                    const img = document.getElementsByName('cclink')[0];
                    if (img) img.parentNode?.removeChild(img);
                }
            }
        });

        game.settings.register("swffgUI-cc", "verboseLogs", {
            name: "Enable more module logging.",
            hint: "Enables more verbose module logging. Useful for debugging.",
            scope: "world",
            config: false,
            default: false,
            type: Boolean,
        });

        this.switchStyleSheet();

        Hooks.on("renderActorSheet", (sheet, $element, templateData) => {
            if (game.system.id !== "starwarsffg") return;

            let tokenName = sheet.token?.name ?? templateData.actor.name;
            const isAubereshTitleEnabled = game.settings.get("swffgUI-cc", "enable-auberesh-title");

            // $element may be jQuery (appv1 sheets) — use find() safely
            const profileImg = typeof $element?.find === 'function'
                ? $element.find('.profile-img')
                : $element?.querySelector?.('.profile-img');

            if (isAubereshTitleEnabled && profileImg) {
                const aubereshDiv = document.createElement('div');
                aubereshDiv.className = 'auberesh-name';
                aubereshDiv.textContent = tokenName;
                const target = typeof profileImg.get === 'function' ? profileImg.get(0) : profileImg;
                target?.parentNode?.insertBefore(aubereshDiv, target);
            }

            this.log("is rendering actor sheet with Auberesh: " + tokenName);
        });
    }

    /**
     * Insert the Creative Commons attribution badge into the document body.
     * @private
     */
    _insertCCLink() {
        if (document.getElementsByName('cclink').length > 0) return;
        const img = document.createElement("img");
        const anchor = document.createElement("a");
        anchor.setAttribute("href", "https://github.com/prolice/swffgUI-cc/blob/swffgUI-cc/ImagesLicences.md");
        img.setAttribute("id", "creative-common");
        img.setAttribute("src", "modules/swffgUI-cc/CC-BY-license.webp");
        img.style.cssText = 'position:absolute;width:150px;opacity:0.7;z-index:60;bottom:7px;right:450px;';
        img.title = 'Images used by module swffg-cc are under Creative Common license\nFollow the link to see all image licenses and owners.';
        img.name = 'cclink';
        anchor.appendChild(img);
        document.body.appendChild(anchor);
    }

    switchStyleSheet() {
        applyTheme(Number(game.settings.get("swffgUI-cc", "selectSkin")));
        applyFontSetting(Number(game.settings.get("swffgUI-cc", "fontSettings")));

        const windowBorderSize = game.settings.get("swffgUI-cc", "windowBorderSize");
        document.documentElement.style.setProperty('--window-content-border-image-width', windowBorderSize + 'px');
        document.documentElement.style.setProperty('--window-content-border-image-outset', (windowBorderSize - 8) + 'px');
        document.documentElement.style.setProperty('--window-header-margin', `0px 0px ${windowBorderSize - 8}px 0px`);

        const fontSize = game.settings.get("swffgUI-cc", "fontSize");
        document.documentElement.style.setProperty('--major-button-font-size', fontSize + 'px');

        if (game.settings.get("swffgUI-cc", "active-cclink")) {
            this._insertCCLink();
        }

        const isAubereshTitleEnabled = game.settings.get("swffgUI-cc", "enable-auberesh-title");
        if (isAubereshTitleEnabled) {
            document.documentElement.style.setProperty('--application-auberesh-title', 'contents');
            document.documentElement.style.setProperty('--application-auberesh-sidebar-title', 'flex');
        } else {
            document.documentElement.style.setProperty('--application-auberesh-title', 'none');
            document.documentElement.style.setProperty('--application-auberesh-sidebar-title', 'none');
        }
    }
}

/* ------------------------------------------------------------------ */
/* VI. FOUNDRY HOOKS — INIT                                            */
/* ------------------------------------------------------------------ */

Hooks.once("init", async function () {
    // NOTE: CONFIG.debug.hooks must not be set by a module — removed.

    // --- Pause UI override ---
    // Foundry v12: `Pause` is a global AppV1 class (has `_render` on prototype).
    // Foundry v13: `Pause` is a compat alias for `GamePause` (AppV2). AppV2 does NOT
    //              use `defaultOptions`/`template` — the override would be silently ignored.
    //              Guard: only extend when AppV1 pattern is detected.
    const pauseIsAppV1 = typeof Pause !== 'undefined'
        && typeof Pause.prototype._render === 'function';
    if (pauseIsAppV1) {
        class PauseFFG extends Pause {
            static get defaultOptions() {
                const options = super.defaultOptions;
                options.id = "pause";
                options.template = "modules/swffgUI-cc/templates/parts/ffg-paused.html";
                options.popOut = false;
                return options;
            }
            getData() {
                let icon = game.settings.get("starwarsffg", "ui-pausedImage");
                if (!icon || icon.length <= 0) {
                    icon = "/modules/swffgUI-cc/default-ui/pause-icon.webp";
                }
                return { paused: game.paused, icon };
            }
        }
        CONFIG.ui.pause = PauseFFG;
    }
    // For Foundry v13 — renderGamePause hook (section IX) handles the pause icon.

    // --- Scene Navigation override ---
    // Foundry v12: `SceneNavigation` is a global AppV1 class (has `_render`).
    // Foundry v13: `SceneNavigation` is AppV2 — `CONFIG.ui.nav` EXISTS but class is AppV2.
    //              The `defaultOptions`/`template` approach has no effect on AppV2.
    //              Guard: only extend when AppV1 pattern is detected.
    const navIsAppV1 = typeof SceneNavigation !== 'undefined'
        && typeof SceneNavigation.prototype._render === 'function'
        && CONFIG.ui && 'nav' in CONFIG.ui;
    if (navIsAppV1) {
        class NavigationFFG extends SceneNavigation {
            static get defaultOptions() {
                const options = super.defaultOptions;
                options.id = "navigation";
                options.template = "modules/swffgUI-cc/templates/parts/ffg-navigation.html";
                options.popOut = false;
                return options;
            }
        }
        CONFIG.ui.nav = NavigationFFG;
    }
    // For Foundry v13 — renderSceneNavigation hook (section VIII) handles Auberesh spans.

    // TinyMCE custom CSS
    if (CONFIG.TinyMCE?.content_css) {
        CONFIG.TinyMCE.content_css.push('modules/swffgUI-cc/css/mce.css');
    }
});

/* ------------------------------------------------------------------ */
/* VII. FOUNDRY HOOKS — READY                                          */
/* ------------------------------------------------------------------ */

// Use Hooks.once — `ready` fires only once per session
Hooks.once("ready", () => {
    swffgUIModule.singleton = new swffgUIModule();
    swffgUIModule.singleton.init();
});

Hooks.once('ready', function () {
    if (game.settings.get('swffgUI-cc', 'scanline')) {
        const scanline = document.createElement('div');
        scanline.classList.add('scanline');
        document.body.appendChild(scanline);
    }
    if (game.settings.get('swffgUI-cc', 'flickering')) {
        document.body.classList.add('flickering');
    }
    if (game.settings.get('swffgUI-cc', 'screenDoor')) {
        document.body.classList.add('screen-door');
    }
});

/* ------------------------------------------------------------------ */
/* VIII. FOUNDRY HOOKS — SCENE NAVIGATION                             */
/* For Foundry v13 (ApplicationV2 navigation), inject Auberesh spans  */
/* via a render hook instead of a class override.                      */
/* ------------------------------------------------------------------ */

Hooks.on("renderSceneNavigation", (_app, html, _data) => {
    const el = resolveEl(html);
    if (!el) return;
    // v13 uses #scene-navigation with .scene-navigation-menu > li.scene > .scene-name
    // v12 uses #navigation with #scene-list > li.scene > .scene-name
    // The selector below covers both.
    el.querySelectorAll(".scene .scene-name, .scene-navigation-menu li .scene-name").forEach(anchor => {
        if (anchor.querySelector('.Auberesh')) return; // already injected
        const nameText = anchor.firstChild;
        if (!nameText) return;
        const span = document.createElement('span');
        span.className = 'Auberesh';
        span.textContent = ' ' + (nameText.textContent ?? '').trim();
        anchor.appendChild(document.createElement('br'));
        anchor.appendChild(span);
    });
});

/* ------------------------------------------------------------------ */
/* IX. FOUNDRY HOOKS — PAUSE (v13)                                    */
/* Foundry v13: renderGamePause passes (app, element, context, opts). */
/* This allows the module to apply a custom pause icon path.          */
/* ------------------------------------------------------------------ */

Hooks.on("renderGamePause", (_app, element, _context, _options) => {
    if (game.system.id !== "starwarsffg") return;
    const el = resolveEl(element) ?? element;
    if (!el) return;
    const img = el.querySelector?.('img') ?? el.querySelector?.('figure img');
    if (!img) return;
    // Use module default if system has none configured
    try {
        const icon = game.settings.get("starwarsffg", "ui-pausedImage");
        if (!icon || icon.length <= 0) {
            img.src = "/modules/swffgUI-cc/default-ui/pause-icon.webp";
        }
    } catch (_e) {
        // setting may not be registered if system is not active
    }
});

/* ------------------------------------------------------------------ */
/* X. FOUNDRY HOOKS — SETTINGS SIDEBAR                                */
/* ------------------------------------------------------------------ */

/**
 * Inject module version info and maintenance section into the Settings sidebar tab.
 * Shared between `renderSidebarTab` (v12 AppV1) and `renderSettings` (v13 AppV2).
 * @param {HTMLElement|null} el
 */
function _injectSettingsSidebarContent(el) {
    if (!el) return;
    // Guard: only inject once per render
    if (el.querySelector('.donation-link')) return;

    const details = el.querySelector("#game-details");
    if (details) {
        const swffgUiVersion = game.modules.get("swffgUI-cc")?.version ?? "";
        const swffgUiDonate = game.i18n.localize('SWFFG.donate');
        const li = document.createElement("li");
        li.classList.add("donation-link");
        li.innerHTML = `Star Wars UI (CC)<a style="animation: textShadow 1.6s infinite;" title="${swffgUiDonate}" href="https://ko-fi.com/prolice1403"><img src="https://storage.ko-fi.com/cdn/cup-border.png" height="12px"></a><span style="font-size:var(--major-button-font-size);">${swffgUiVersion}</span>`;
        details.append(li);
    }

    const swffgUiThemeMaintenance = game.i18n.localize('SWFFG.thememaintenance');
    const swffgUiReportThemeIssue = game.i18n.localize('SWFFG.reportthemeissue');
    const anchorEl = el.querySelector("#settings-game")
        ?? el.querySelector(".settings-game")
        ?? el.querySelector(".sidebar-tab-body")
        ?? el.querySelector("section");

    if (anchorEl && !anchorEl.parentNode?.querySelector('.swffgui-maintenance')) {
        const section = document.createElement("section");
        section.classList.add("swffgui-maintenance");
        section.innerHTML = `<h2>${swffgUiThemeMaintenance}</h2><button class="swffgui-maintenance" onclick="window.open('https://github.com/prolice/swffgUI-cc/issues','_blank')"><i class="fas fa-paint-roller"></i>${swffgUiReportThemeIssue}</button>`;
        anchorEl.parentNode?.insertBefore(section, anchorEl.nextSibling ?? anchorEl);
    }
}

// v12 AppV1: `renderSidebarTab` fires for all AppV1 sidebar tabs
Hooks.on("renderSidebarTab", (object, html, _data) => {
    const isSettingsTab = (typeof Settings !== 'undefined' && object instanceof Settings)
        || object?.options?.id === "settings"
        || object?.constructor?.name === "Settings";
    if (!isSettingsTab) return;
    _injectSettingsSidebarContent(resolveEl(html));
});

// v13 AppV2: `renderSettings` fires for the AppV2 Settings class (not renderSidebarTab)
Hooks.on("renderSettings", (_app, html, _data) => {
    _injectSettingsSidebarContent(resolveEl(html));
    injectAubereshHeader(html, "Settings");
});

/* ------------------------------------------------------------------ */
/* XI. FOUNDRY HOOKS — SIDEBAR DIRECTORY TABS (Auberesh headers)      */
/* All these hooks inject an Auberesh-styled h3 title into each tab.  */
/* Compat: v12 passes jQuery html[0]; v13 passes raw HTMLElement.      */
/* ------------------------------------------------------------------ */

/**
 * Inject an Auberesh header section into a sidebar directory element.
 * Guard: skips injection if a section.swffgui was already added (prevents
 * duplicate headers on re-render / popout open).
 * @param {HTMLElement|jQuery} html
 * @param {string} labelText
 */
function injectAubereshHeader(html, labelText) {
    const el = resolveEl(html);
    if (!el) return;
    // Duplicate guard — already injected on a previous render of this element
    if (el.querySelector('section.swffgui')) return;
    const anchor = findDirectoryHeader(el);
    if (!anchor) return;

    const section = document.createElement("section");
    section.classList.add("swffgui");
    section.innerHTML = `<h3 class="auberesh">${labelText}</h3>`;
    anchor.parentNode?.insertBefore(section, anchor);
}

Hooks.on("renderActorDirectory", (_app, html, _data) => {
    injectAubereshHeader(html, "Actors Directory");
});

Hooks.on("renderSceneDirectory", (_app, html, _data) => {
    injectAubereshHeader(html, "Scenes Directory");
});

Hooks.on("renderJournalDirectory", (_app, html, _data) => {
    injectAubereshHeader(html, "Journal Directory");
});

Hooks.on("renderItemDirectory", (_app, html, _data) => {
    injectAubereshHeader(html, "Items Directory");
});

Hooks.on("renderRollTableDirectory", (_app, html, _data) => {
    injectAubereshHeader(html, "RollTable Directory");
});

Hooks.on("renderCompendiumDirectory", (_app, html, _data) => {
    injectAubereshHeader(html, "Compendium Directory");
});

Hooks.on("renderPlaylistDirectory", (_app, html, _data) => {
    injectAubereshHeader(html, "Playlists Directory");
});

Hooks.on("renderChatLog", (_app, html, _data) => {
    const el = resolveEl(html);
    if (!el) return;
    if (el.querySelector('section.swffgui')) return; // duplicate guard
    const chatLog = el.querySelector("#chat-log") ?? el.closest("#chat");
    const anchor = chatLog ?? el;
    const section = document.createElement("section");
    section.classList.add("swffgui");
    section.innerHTML = `<h3 class="auberesh">Chat Log</h3>`;
    anchor.parentNode?.insertBefore(section, anchor);
});

// NOTE: renderSettings is consolidated in section X above — do NOT duplicate here.

Hooks.on("renderCombatTracker", (_app, html, _data) => {
    const el = resolveEl(html);
    if (!el) return;
    if (el.querySelector('section.swffgui')) return; // duplicate guard
    const anchor = el.querySelector("#combat-tracker") ?? el.firstElementChild;
    if (!anchor) return;
    const section = document.createElement("section");
    section.classList.add("swffgui");
    section.innerHTML = `<h3 class="auberesh">Combat Tracker</h3>`;
    anchor.parentNode?.insertBefore(section, anchor);
});

Hooks.on("renderSettingsConfig", (_app, html, _data) => {
    const el = resolveEl(html);
    if (!el) return;
    if (el.querySelector('.swffgui-settings')) return; // duplicate guard
    const anchor = el.querySelector("section") ?? el.firstElementChild;
    if (!anchor) return;
    const div = document.createElement("div");
    div.classList.add("swffgui-settings");
    div.innerHTML = `<h3 class="auberesh">Configure Game Settings</h3>`;
    anchor.parentNode?.insertBefore(div, anchor);
});
