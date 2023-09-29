"use strict";
const IndicatorMode = {
    REBEL: 0,
    GALACTIC: 1,
	EOE:2,
	BLACKEMPIRE:3,
	DEFAULT:4,
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

class NavigationFFG extends SceneNavigation {
	 static get defaultOptions() {
            const options = super.defaultOptions;
			options.id = "navigation";
			options.template = "modules/swffgUI-cc/templates/parts/ffg-navigation.html";
			options.popOut = false;
			return options;
        }
} 

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
    if (icon?.length <= 0) {
      icon = "/modules/swffgUI-cc/default-ui/pause-icon.png";
    }

    return {
      paused: game.paused,
      icon,
    };
  }
}


class swffgUIModule {
	
    constructor() {
        this.swffgUIModule = new Map();
        this.TIMEOUT_INTERVAL = 50; // ms
        this.MAX_TIMEOUT = 1000; // ms
        // Random id to prevent collision with other modules;
        this.ID = randomID(24);
    }

    log(msg, ...args) {
        if (game && game.settings.get("swffgUI-cc", "verboseLogs")) {
            const color = "background: #6699ff; color: #000; font-size: larger;";
            console.debug(`%c swffgUIModule: ${msg}`, color, ...args);
        }
    }

    async init() {
	
	//game.settings.set("starwarsffg", "ui-pausedImage", "/modules/swffgUI-cc/default-ui/pause-icon.png");
	game.settings.register('swffgUI-cc', 'flickering', {
        name: game.i18n.localize('SWFFG.flickering'),
        hint: game.i18n.localize('SWFFG.flickeringHint'),
        scope: 'client',
        type: Boolean,
        default: false,
        config: true,
        onChange: () => {
            location.reload();
        },
    });
    game.settings.register('swffgUI-cc', 'screenDoor', {
        name: game.i18n.localize('SWFFG.screenDoor'),
        hint: game.i18n.localize('SWFFG.screenDoorHint'),
        scope: 'client',
        type: Boolean,
        default: false,
        config: true,
        onChange: () => {
            location.reload();
        },
    });
    game.settings.register('swffgUI-cc', 'scanline', {
        name: game.i18n.localize('SWFFG.scanline'),
        hint: game.i18n.localize('SWFFG.scanlineHint'),
        scope: 'client',
        type: Boolean,
        default: false,
        config: true,
        onChange: () => {
            location.reload();
        },
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
			onChange: (value) => {
				let state = Number(value);
				var head = document.getElementsByTagName('head')[0];
				var locationOrigin= document.location.origin;
				var hrefToApply = "swffg-default.css";
				let stateEnableCursor = Number(game.settings.get("swffgUI-cc", "enable-cursor"));
				
				switch(state){
					case IndicatorMode.GALACTIC:
							hrefToApply= "darkside/css/swffg.css";
							if (stateEnableCursor)
								document.documentElement.style.setProperty('--application-cursor-pointer', 'url(../ui/buttons/cursor-empire.png), pointer');
							break;
					case IndicatorMode.REBEL:
							if (stateEnableCursor)
								document.documentElement.style.setProperty('--application-cursor-pointer', 'url(../ui/buttons/cursor-rebel.png), pointer');
							hrefToApply= "css/swffg.css";
							break;
					case IndicatorMode.EOE:
					        if (stateEnableCursor)
								document.documentElement.style.setProperty('--application-cursor-pointer', 'url(../ui/buttons/cursor-pyke.png), pointer');
							hrefToApply= "EoE/css/swffg.css";
							break;
					case IndicatorMode.BLACKEMPIRE:
					        if (stateEnableCursor)
								document.documentElement.style.setProperty('--application-cursor-pointer', 'url(../ui/buttons/cursor-pyke.png), pointer');
							hrefToApply= "blackEmpire/css/swffg.css";
							break;				    
					case IndicatorMode.DEFAULT:
							hrefToApply= "swffg-default.css";
							break;
					default:
					  console.log('Something went wrong [$value] does not exists in fonts choices (in theme)');
				}
				
				for(var elem = 0 ; elem < head.children.length; elem++){
					if (typeof head.children[elem].href === 'undefined') continue;
					
					if (head.children[elem].href.endsWith("swffg-default.css")){
						head.children[elem].href= head.children[elem].href.replace("swffg-default.css",hrefToApply);
						break;
					}
					else if	(head.children[elem].href.endsWith("darkside/css/swffg.css")){
						head.children[elem].href= head.children[elem].href.replace("darkside/css/swffg.css",hrefToApply);
						break;
					}
					else if (head.children[elem].href.endsWith("EoE/css/swffg.css")){
						head.children[elem].href= head.children[elem].href.replace("EoE/css/swffg.css",hrefToApply);
						break;
					}
					else if (head.children[elem].href.endsWith("blackEmpire/css/swffg.css")){
						head.children[elem].href= head.children[elem].href.replace("blackEmpire/css/swffg.css",hrefToApply);
						break;
					}
					else if (head.children[elem].href.endsWith("css/swffg.css")){
						head.children[elem].href= head.children[elem].href.replace("css/swffg.css",hrefToApply);
						break;
					}
						
				}
			}
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
			onChange: (value) => {
				let state = Number(value);

				switch (state){
					case IndicatorFonts.EARTHORBITER:
					  document.documentElement.style.setProperty('--major-button-font-family','EarthOrbiter');	
					  break;
					case IndicatorFonts.KUIPERBELT:
					  document.documentElement.style.setProperty('--major-button-font-family','KuiperBelt');	
					  break;
					case IndicatorFonts.MONS:
					  document.documentElement.style.setProperty('--major-button-font-family','Mons');	
					  break;
					case IndicatorFonts.DISTANTGALAXY:
					  document.documentElement.style.setProperty('--major-button-font-family','DistantGalaxy');	
					  break;
					case IndicatorFonts.SIGNIKA:
					  document.documentElement.style.setProperty('--major-button-font-family','Signika');	
					  break;
					case IndicatorFonts.ROBOTO:
					  document.documentElement.style.setProperty('--major-button-font-family','Roboto');	
					  break;
					case IndicatorFonts.ERAS:
					  document.documentElement.style.setProperty('--major-button-font-family','Eras');	
					  break;
					default:
					  console.log('Something went wrong [$value] does not exists in fonts choices');
				}
			}
        });
	
		game.settings.register("swffgUI-cc", "windowBorderSize", {
			name: "SWFFG.windowBorderSize",
			hint: "SWFFG.windowBorderSizeHint",
			scope: "client",
			type: Number,
			default: 12,
			range: {
				min: 8,
				max: 30,
				step: 2
			},
			config: true,
			onChange: (value) => {
			  let windowBorderSize = Number(value);
			  		
			  let borderImageWidthValue= windowBorderSize;
			  let borderImageOutsetValue = windowBorderSize - 8;
			  let borderHeaderMarginValue= windowBorderSize - 8;
			
			  document.documentElement.style.setProperty('--window-content-border-image-width', borderImageWidthValue+'px');
			  document.documentElement.style.setProperty('--window-content-border-image-outset', borderImageOutsetValue+'px');
			  document.documentElement.style.setProperty('--window-header-margin', '0px 0px '+borderHeaderMarginValue+'px 0px');
			}
        });
		
		/*--major-button-font-size*/
	game.settings.register("swffgUI-cc", "fontSize", {
            name: "SWFFG.fontSize",
			hint: "SWFFG.fontSizeHint",
			scope: "client",
			type: Number,
			default: 14,
			range: {
				min: 10,
				max: 22,
				step: 2
			},
			config: true,
			onChange: (value) => {
				document.documentElement.style.setProperty('--major-button-font-size', value+'px');
			}
        }); 
        
        game.settings.register("swffgUI-cc", "enable-cursor", {
        name: "SWFFG.CursorSettings",
        hint: "SWFFG.CursorSettingsHint",
        scope: "Client",
        config: true,
        default: false,
        type: Boolean,
        onChange: (value) => { 
            if (value){
			  let state = Number(game.settings.get("swffgUI-cc", "selectSkin"));
			  switch(state){
					case IndicatorMode.GALACTIC:
							document.documentElement.style.setProperty('--application-cursor-pointer', 'url(../ui/buttons/cursor-empire.png), pointer');
							break;
					case IndicatorMode.REBEL:
							document.documentElement.style.setProperty('--application-cursor-pointer', 'url(../ui/buttons/cursor-rebel.png), pointer');
							break;
					case IndicatorMode.EOE:
							document.documentElement.style.setProperty('--application-cursor-pointer', 'url(../ui/buttons/cursor-pyke.png), pointer');
							break;
					case IndicatorMode.BLACKEMPIRE:
					        document.documentElement.style.setProperty('--application-cursor-pointer', 'url(../ui/buttons/cursor-pyke.png), pointer');
							break;
					case IndicatorMode.DEFAULT:
							document.documentElement.style.setProperty('--application-cursor-pointer', 'pointer');
							break;
					default:
					  console.log('Something went wrong [$state] does not exists in theme choices');
				}
              
            }
            else {
              document.documentElement.style.setProperty('--application-cursor-pointer', 'pointer');
            }
        }
      });
	  
	  game.settings.register("swffgUI-cc", "enable-auberesh-title", {
        name: "SWFFG.AubereshSettings",
        hint: "SWFFG.AubereshSettingsHint",
        scope: "Client",
        config: true,
        default: false,
        type: Boolean,
        onChange: (value) => { 
            if (value){
			  document.documentElement.style.setProperty('--application-auberesh-title', 'contents');
		      document.documentElement.style.setProperty('--application-auberesh-sidebar-title', 'flex');
			}
            else {				
              document.documentElement.style.setProperty('--application-auberesh-title', 'none');
			  document.documentElement.style.setProperty('--application-auberesh-sidebar-title', 'none');
			}
        }
      });
	  
	  game.settings.register("swffgUI-cc", "active-cclink", {
        name: "SWFFG.CCLinkSettings",
        hint: "SWFFG.CCLinkSettingsHint",
        scope: "Client",
        config: true,
        default: true,
        type: Boolean,
        onChange: (value) => { 
            if (value){
			    let myImg = document.createElement("img");
				let myImgA = document.createElement("a");
				myImgA.setAttribute("href", "https://github.com/prolice/swffgUI-cc/blob/swffgUI-cc/ImagesLicences.md");
				myImg.setAttribute("id", "creative-common");
				myImg.setAttribute("src", "modules/swffgUI-cc/CC-BY-license.png");
				myImg.style.cssText = 'position:absolute;width:150px;opacity:0.7;z-index:60;bottom:7px;right: 450px;';
				myImg.title = 'Images used by module swffg-cc are under Creative Common license\x0Afollow the link to get all the images licenses and owners...';
				myImg.name = 'cclink';
				myImgA.appendChild(myImg);

				document.body.appendChild(myImgA);             
            }
			else {
				var cclinkimg = document.getElementsByName('cclink')[0];
				/*cclinkimg.style.display='none';*/
				var cclinkimgParent = cclinkimg.parentNode;
				cclinkimgParent.removeChild(cclinkimg);
			}
        }
      });
		
		game.settings.register("swffgUI-cc", "verboseLogs", {
            name: "Enable more module logging.",
            hint: "Enables more verbose module logging. This is useful for debugging the module. But otherwise should be left off.",
            scope: "world",
            config: false,
            default: false,
            type: Boolean,
        });
		
		this.switchStyleSheet();
		
		Hooks.on("renderActorSheet", (sheet, $element, templateData) => {
			if (game.system.id !== "starwarsffg") return;
			
			let tokenName = null;
			if(sheet.token !== null){
				tokenName = sheet.token.data.name;
			}
			else {
				tokenName = templateData.actor.name;
			}
			
			let profileImg = $element.find('.profile-img');
			profileImg.before('<div class="auberesh-name">' + tokenName + '</div>');
						
			console.log("[SWFFG-UI-CC] is rendering " + tokenName + "actor sheet with Auberesh");
			
		});
		
		//here
    }
	
	switchStyleSheet(){
		var head = document.getElementsByTagName('head')[0];
		var locationOrigin= document.location.origin;
		let state = Number(game.settings.get("swffgUI-cc", "selectSkin"));
		let stateEnableCursor = Number(game.settings.get("swffgUI-cc", "enable-cursor"));
		
		var hrefToApply = "swffg-default.css";
				switch(state){
					case IndicatorMode.GALACTIC:
							hrefToApply= "darkside/css/swffg.css";
							if (stateEnableCursor)
								document.documentElement.style.setProperty('--application-cursor-pointer', 'url(../ui/buttons/cursor-empire.png), pointer');
							break;
					case IndicatorMode.REBEL:
					        if (stateEnableCursor)
								document.documentElement.style.setProperty('--application-cursor-pointer', 'url(../ui/buttons/cursor-rebel.png), pointer');
							hrefToApply= "css/swffg.css";
							break;
					case IndicatorMode.EOE:
							if (stateEnableCursor)
								document.documentElement.style.setProperty('--application-cursor-pointer', 'url(../ui/buttons/cursor-pyke.png), pointer');
							hrefToApply= "EoE/css/swffg.css";
							break;
					case IndicatorMode.BLACKEMPIRE:
							if (stateEnableCursor)
								document.documentElement.style.setProperty('--application-cursor-pointer', 'url(../ui/buttons/cursor-pyke.png), pointer');
							hrefToApply= "blackEmpire/css/swffg.css";
							break;
					case IndicatorMode.DEFAULT:
					        document.documentElement.style.setProperty('--application-cursor-pointer', 'pointer');
							hrefToApply= "swffg-default.css";
							break;
					default:
					  console.log('Something went wrong [$value] does not exists in fonts choices (in theme)');
				}
				
				for(var elem = 0 ; elem < head.children.length; elem++){
					if (typeof head.children[elem].href === 'undefined') continue;
					
					if (head.children[elem].href.endsWith("swffg-default.css")){
						head.children[elem].href= head.children[elem].href.replace("swffg-default.css",hrefToApply);
						break;
					}
					else if	(head.children[elem].href.endsWith("darkside/css/swffg.css")){
						head.children[elem].href= head.children[elem].href.replace("darkside/css/swffg.css",hrefToApply);
						break;
					}
					else if (head.children[elem].href.endsWith("EoE/css/swffg.css")){
						head.children[elem].href= head.children[elem].href.replace("EoE/css/swffg.css",hrefToApply);
						break;
					}
					else if (head.children[elem].href.endsWith("blackEmpire/css/swffg.css")){
						head.children[elem].href= head.children[elem].href.replace("blackEmpire/css/swffg.css",hrefToApply);
						break;
					}
					else if (head.children[elem].href.endsWith("css/swffg.css")){
						head.children[elem].href= head.children[elem].href.replace("css/swffg.css",hrefToApply);
						break;
					}
						
				}
				
		state = Number(game.settings.get("swffgUI-cc", "fontSettings"));
		switch (state){
			case IndicatorFonts.EARTHORBITER:
			  document.documentElement.style.setProperty('--major-button-font-family','EarthOrbiter');	
			  break;
			case IndicatorFonts.KUIPERBELT:
			  document.documentElement.style.setProperty('--major-button-font-family','KuiperBelt');	
			  break;
			case IndicatorFonts.MONS:
			  document.documentElement.style.setProperty('--major-button-font-family','Mons');	
			  break;
			case IndicatorFonts.DISTANTGALAXY:
			  document.documentElement.style.setProperty('--major-button-font-family','DistantGalaxy');	
			  break;
			case IndicatorFonts.SIGNIKA:
			  document.documentElement.style.setProperty('--major-button-font-family','Signika');	
			  break;
			case IndicatorFonts.ROBOTO:
			  document.documentElement.style.setProperty('--major-button-font-family','Roboto');	
			  break;
			case IndicatorFonts.ERAS:
		      document.documentElement.style.setProperty('--major-button-font-family','Eras');	
			  break;
			default:
			  console.log('Something went wrong [$value] does not exists in fonts choices');
		}
		
		let windowBorderSize = game.settings.get("swffgUI-cc", "windowBorderSize");
		
		let borderImageWidthValue= windowBorderSize;
		let borderImageOutsetValue = windowBorderSize - 8;
		let borderHeaderMarginValue= windowBorderSize - 8;
		
		document.documentElement.style.setProperty('--window-content-border-image-width', borderImageWidthValue+'px');
		document.documentElement.style.setProperty('--window-content-border-image-outset', borderImageOutsetValue+'px');
		document.documentElement.style.setProperty('--window-header-margin', '0px 0px '+borderHeaderMarginValue+'px 0px');
		
		let fontSize = game.settings.get("swffgUI-cc", "fontSize");
		document.documentElement.style.setProperty('--major-button-font-size', fontSize+'px');
		
		let activeCClink = game.settings.get("swffgUI-cc", "active-cclink");
		
		if (activeCClink)
		{
			let myImg = document.createElement("img");
			let myImgA = document.createElement("a");
			myImgA.setAttribute("href", "https://github.com/prolice/swffgUI-cc/blob/swffgUI-cc/ImagesLicences.md");
			myImg.setAttribute("id", "creative-common");
			myImg.setAttribute("src", "modules/swffgUI-cc/CC-BY-license.png");
			myImg.style.cssText = 'position:absolute;width:150px;opacity:0.7;z-index:60;bottom:7px;right: 450px;';
			myImg.title = 'Images used by module swffg-cc are under Creative Common license\x0Afollow the link to get all the images licenses and owners...';
			myImg.name = 'cclink';
			myImgA.appendChild(myImg);

			document.body.appendChild(myImgA);
		} 
        
		let isAubereshTitleEnabled = game.settings.get("swffgUI-cc", "enable-auberesh-title");
		if (isAubereshTitleEnabled){
			document.documentElement.style.setProperty('--application-auberesh-title', 'contents');
		    document.documentElement.style.setProperty('--application-auberesh-sidebar-title', 'flex');
		}
        else {				
            document.documentElement.style.setProperty('--application-auberesh-title', 'none');
			document.documentElement.style.setProperty('--application-auberesh-sidebar-title', 'none');
		}
		
	}
}


Hooks.once("init", async function () {
	// TURN ON OR OFF HOOK DEBUGGING
    CONFIG.debug.hooks = false;
	CONFIG.ui.pause = PauseFFG;
	CONFIG.ui.nav = NavigationFFG;
	CONFIG.TinyMCE.content_css.push('modules/swffgUI-cc/css/mce.css');
	
	// game.settings.register('swffgUI-cc', 'autoColorFolder', {
        // name: game.i18n.localize('SWFFG.autocolorfolder'),
        // hint: game.i18n.localize('SWFFG.autocolorfolderHint'),
        // scope: 'client',
        // type: Boolean,
        // default: true,
        // config: true,
        // onChange: () => {
            // location.reload();
        // },
    // });
});

Hooks.on("ready", () => {
    swffgUIModule.singleton = new swffgUIModule();
    swffgUIModule.singleton.init();
});

Hooks.once('ready', function () {
    if (game.settings.get('swffgUI-cc', 'scanline')) {
        const scanline = $('<div>').addClass('scanline');
        $('body').append(scanline);
    }
    if (game.settings.get('swffgUI-cc', 'flickering')) {
        $('body').addClass('flickering');
    }
    if (game.settings.get('swffgUI-cc', 'screenDoor')) {
        $('body').addClass('screen-door');
    }
});

Hooks.on("renderSidebarTab", async (object, html) => {
  if (object instanceof Settings) {
    const details = html.find("#game-details");
    const swffgUIDetails = document.createElement("li");
    swffgUIDetails.classList.add("donation-link");
    //let swffgUiVersion = game.i18n.localize('SWFFG.Version');
	let swffgUiVersion = game.modules.get("swffgUI-cc").data.version
	let swffgUiDonate = game.i18n.localize('SWFFG.donate');
	let swffgUiThemeMaintenance = game.i18n.localize('SWFFG.thememaintenance');
    let swffgUiReportThemeIssue = game.i18n.localize('SWFFG.reportthemeissue');
	swffgUIDetails.innerHTML = "Star Wars UI (CC)<a style='animation: textShadow 1.6s infinite;' title='"+swffgUiDonate+"' href='https://ko-fi.com/prolice1403'><img src='https://storage.ko-fi.com/cdn/cup-border.png' height='12px'></a><span style='font-size:var(--major-button-font-size);'>"+swffgUiVersion+"</span>";
    details.append(swffgUIDetails);
	
	this.section = document.createElement("section");
	this.section.classList.add("swffgui-maintenance");
	// Add menu before directory header
	const dirHeader = html[0].querySelector("#settings-game").nextSibling;
	dirHeader.parentNode.insertBefore(this.section, dirHeader);

	//if (this.data !== undefined) 
		section.insertAdjacentHTML(
		  "afterbegin",
		  `
		  <h2>`+swffgUiThemeMaintenance+`</h2>
		  <button class="swffgui-maintenance" onclick="window.open('https://github.com/prolice/swffgUI-cc/issues','_blank')"><i class="fas fa-paint-roller"></i>`+swffgUiReportThemeIssue+`</button>`
		);
	
  }
});

Hooks.on("renderActorDirectory", (app, html, data) => {
	this.section = document.createElement("section");
	this.section.classList.add("swffgui");
	// Add menu before directory header
	const dirHeader = html[0].querySelector(".directory-header");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);
	section.insertAdjacentHTML(
		  "afterbegin",
		  `<h3 class="auberesh">Actors Directory</h3>`
		);
});

Hooks.on("renderSceneDirectory", (app, html, data) => {
	this.section = document.createElement("section");
	this.section.classList.add("swffgui");
	// Add menu before directory header
	const dirHeader = html[0].querySelector(".directory-header");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);
	section.insertAdjacentHTML(
		  "afterbegin",
		  `<h3 class="auberesh">Scenes Directory</h3>`
		);
});


Hooks.on("renderJournalDirectory", (app, html, data) => {
	this.section = document.createElement("section");
	this.section.classList.add("swffgui");
	// Add menu before directory header
	const dirHeader = html[0].querySelector(".directory-header");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);
	section.insertAdjacentHTML(
		  "afterbegin",
		  `<h3 class="auberesh">Journal Directory</h3>`
		);
});

Hooks.on("renderItemDirectory", (app, html, data) => {
	this.section = document.createElement("section");
	this.section.classList.add("swffgui");
	// Add menu before directory header
	const dirHeader = html[0].querySelector(".directory-header");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);

	section.insertAdjacentHTML(
		  "afterbegin",
		  `<h3 class="auberesh">Items Directory</h3>`
		);
});

Hooks.on("renderRollTableDirectory", (app, html, data) => {
	this.section = document.createElement("section");
	this.section.classList.add("swffgui");
	// Add menu before directory header
	const dirHeader = html[0].querySelector(".directory-header");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);

	//if (this.data !== undefined) 
		section.insertAdjacentHTML(
		  "afterbegin",
		  `<h3 class="auberesh">RollTable Directory</h3>`
		);
});

Hooks.on("renderCompendiumDirectory", (app, html, data) => {
	this.section = document.createElement("section");
	this.section.classList.add("swffgui");
	// Add menu before directory header
	const dirHeader = html[0].querySelector(".directory-header");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);

	//if (this.data !== undefined) 
		section.insertAdjacentHTML(
		  "afterbegin",
		  `<h3 class="auberesh">Compendium Directory</h3>`
		);
});

Hooks.on("renderPlaylistDirectory", (app, html, data) => {
	this.section = document.createElement("section");
	this.section.classList.add("swffgui");
	// Add menu before directory header
	const dirHeader = html[0].querySelector(".directory-header");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);

	//if (this.data !== undefined) 
		section.insertAdjacentHTML(
		  "afterbegin",
		  `<h3 class="auberesh">Playlists Directory</h3>`
		);
});

Hooks.on("renderChatLog", (app, html, data) => {
	this.section = document.createElement("section");
	this.section.classList.add("swffgui");
	// Add menu before directory header
	const dirHeader = html[0].querySelector("#chat-log");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);

	//if (this.data !== undefined) 
		section.insertAdjacentHTML(
		  "afterbegin",
		  `<h3 class="auberesh">Chat Log</h3>`
		);
});

Hooks.on("renderSettings", (app, html, data) => {
	this.section = document.createElement("section");
	this.section.classList.add("swffgui");
	// Add menu before directory header
	const dirHeader = html[0].querySelector("h2");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);

	//if (this.data !== undefined) 
		section.insertAdjacentHTML(
		  "afterbegin",
		  `<h3 class="auberesh">Settings</h3>`
		);
});

Hooks.on("renderCombatTracker", (app, html, data) => {
	this.section = document.createElement("section");
	this.section.classList.add("swffgui");
	// Add menu before directory header
	const dirHeader = html[0].querySelector("#combat-tracker");
	//const dirHeader = html[0].querySelector("#combat-tracker");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);

	//if (this.data !== undefined) 
		section.insertAdjacentHTML(
		  "afterbegin",
		  `<h3 class="auberesh">Combat Tracker</h3>`
		);
});

Hooks.on("renderSettingsConfig", (app, html, data) => {
	this.section = document.createElement("div");
	this.section.classList.add("swffgui-settings");
	//this.section.style.flex='0';
	//this.section.style.textAlign = 'center';
	//this.section.style.margin='0 50px 0 50px';
	//this.section.style.background='url(../ui/game-settings-background.png)';
	//this.section.style.add("flex:0;text-align:center;margin: 0px 50px 0px 50px;background: url(../ui/denim.png) repeat;");
	// Add menu before directory header
	const dirHeader = html[0].querySelector("section");
	//const dirHeader = html[0].querySelector("aside.sidebar");
	dirHeader.parentNode.insertBefore(this.section, dirHeader);

	//if (this.data !== undefined) 
		section.insertAdjacentHTML(
		  "afterbegin",
		  `
		  <h3 class="auberesh">Configure Game Settings</h3>
		  `
		);
});

