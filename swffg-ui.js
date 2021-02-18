"use strict";

const IndicatorMode = {
    REBEL: 0,
    GALACTIC: 1,
	EOE:2,
	DEFAULT:3,
};

const IndicatorFonts = {
	EARTHORBITER: 0,
	KUIPERBELT: 1,
	MONS: 2,
	DISTANTGALAXY: 3,
	SIGNIKA: 4,
	ROBOTO: 5,
};

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
        
		game.settings.register("swffgUI-cc", "selectSkin", {
            name: game.i18n.localize("SWFFG.selectSkin"),
            hint: game.i18n.localize("SWFFG.selectSkinHint"),
            scope: "client",
            config: true,
            default: 0,
            type: Number,
			choices: {
				0: "SWFFG.options.indicator.choices.0",
				1: "SWFFG.options.indicator.choices.1",
				2: "SWFFG.options.indicator.choices.2",
				3: "SWFFG.options.indicator.choices.3"
			},
			onChange: (value) => {
				let state = Number(value);
				var head = document.getElementsByTagName('head')[0];
				var locationOrigin= document.location.origin;
				var hrefToApply = "modules/swffgUI-cc/swffg-default.css";
				switch(state){
					case IndicatorMode.GALACTIC:
							hrefToApply= "modules/swffgUI-cc/darkside/css/swffg.css";
							break;
					case IndicatorMode.REBEL:
							hrefToApply= "modules/swffgUI-cc/css/swffg.css";
							break;
					case IndicatorMode.EOE:
							hrefToApply= "modules/swffgUI-cc/EoE/css/swffg.css";
							break;
					case IndicatorMode.DEFAULT:
							hrefToApply= "modules/swffgUI-cc/swffg-default.css";
							break;
					default:
					  console.log('Something went wrong [$value] does not exists in fonts choices (in theme)');
				}
				
				for(var elem = 0 ; elem < head.children.length; elem++){
					if (head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/swffg-default.css" ||
						head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/darkside/css/swffg.css" ||
						head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/EoE/css/swffg.css" ||
						head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/css/swffg.css"){
							head.children[elem].href= hrefToApply;
							break;
						}
				}
				
				/*if (state === IndicatorMode.GALACTIC){
						for(var elem = 0 ; elem < head.children.length; elem++){
							if (head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/swffg-default.css" ||
							    head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/css/swffg.css"){
							// head.children[elem].href= locationOrigin +"/"+"modules/swffgUI-cc/darkside/css/swffg.css";
							head.children[elem].href= "modules/swffgUI-cc/darkside/css/swffg.css";
							break;
							}
						}
				}
				else if (state === IndicatorMode.REBEL){
					for(var elem = 0 ; elem < head.children.length; elem++){
							if (head.children[elem].href == locationOrigin +"/"+"modules/swffgUI-cc/swffg-default.css" ||
								head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/darkside/css/swffg.css"){
							// head.children[elem].href= locationOrigin +"/"+"modules/swffgUI-cc/css/swffg.css";
							head.children[elem].href= "modules/swffgUI-cc/css/swffg.css";
							break;
							}
						}					
				}
				else {
					for(var elem = 0 ; elem < head.children.length; elem++){
							if (head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/css/swffg.css" ||
								head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/darkside/css/swffg.css"){
							// head.children[elem].href= locationOrigin +"/"+"modules/swffgUI-cc/css/swffg.css";
							head.children[elem].href= "modules/swffgUI-cc/swffg-default.css";
							break;
							}
						}			
				}*/
				
			}
        });
		
		game.settings.register("swffgUI-cc", "fontSettings", {
            name: game.i18n.localize("SWFFG.fontSettings"),
            hint: game.i18n.localize("SWFFG.fontSettingsHint"),
            scope: "client",
            config: true,
            default: 1,
            type: Number,
			choices: {
				0: "SWFFG.options.indicator.fonts.0",
				1: "SWFFG.options.indicator.fonts.1",
				2: "SWFFG.options.indicator.fonts.2",
				3: "SWFFG.options.indicator.fonts.3",
				4: "SWFFG.options.indicator.fonts.4",
				5: "SWFFG.options.indicator.fonts.5"
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
				min: 12,
				max: 22,
				step: 2
			},
			config: true,
			onChange: (value) => {
				document.documentElement.style.setProperty('--major-button-font-size', value+'px');
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
		
		let myImg = document.createElement("img");
		let myImgA = document.createElement("a");
		myImgA.setAttribute("href", "https://github.com/prolice/swffgUI-cc/blob/swffgUI-cc/ImagesLicences.md");
		myImg.setAttribute("id", "creative-common");
		myImg.setAttribute("src", "modules/swffgUI-cc/CC-BY-license.png");
		myImg.style.cssText = 'position:absolute;width:150px;opacity:0.7;z-index:60;bottom:7px;right: 450px;';
		myImg.title = 'Images used by module swffg-cc are under Creative Common license\x0Afollow the link to get all the images licenses and owners...';
		myImgA.appendChild(myImg);

		document.body.appendChild(myImgA);
	
		/*let para = document.createElement("div");
		let node = document.createTextNode("SWFFG-UI");
		let span = document.createElement("span");
		let version = document.createTextNode("0.0.2");
		para.appendChild(node);
		span.appendChild(version);
		para.appendChild(span);
		
		var infoElmt = document.getElementById('game-details');
		if (infoElmt !== null){
			infoElmt.appendChild(para);
		}*/
		
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
    }
	
	
	switchStyleSheet(){
		var head = document.getElementsByTagName('head')[0];
		var locationOrigin= document.location.origin;
		let state = Number(game.settings.get("swffgUI-cc", "selectSkin"));
		
		var hrefToApply = "modules/swffgUI-cc/swffg-default.css";
		switch(state){
			case IndicatorMode.GALACTIC:
					hrefToApply= "modules/swffgUI-cc/darkside/css/swffg.css";
					break;
			case IndicatorMode.REBEL:
					hrefToApply= "modules/swffgUI-cc/css/swffg.css";
					break;
			case IndicatorMode.EOE:
					hrefToApply= "modules/swffgUI-cc/EoE/css/swffg.css";
					break;
			case IndicatorMode.DEFAULT:
					hrefToApply= "modules/swffgUI-cc/swffg-default.css";
					break;
			default:
			  console.log('Something went wrong [$value] does not exists in fonts choices (in theme)');
		}
		
		for(var elem = 0 ; elem < head.children.length; elem++){
			if (head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/swffg-default.css" ||
				head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/darkside/css/swffg.css" ||
				head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/EoE/css/swffg.css" ||
				head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/css/swffg.css"){
					head.children[elem].href= hrefToApply;
					break;
				}
		}
		
		/*if (state === IndicatorMode.REBEL) {
			console.log("[SWFFG-UI-CC] Default option is activated");
			for(var elem = 0 ; elem < head.children.length; elem++)
			{
				if (head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/swffg-default.css" ||
				    head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/darkside/css/swffg.css"){
					//head.children[elem].href= locationOrigin +"/"+"modules/swffgUI-cc/css/swffg.css";
					head.children[elem].href= "modules/swffgUI-cc/css/swffg.css";
					break;
				}
			}
		}
		else if (state === IndicatorMode.GALACTIC){
			console.log("[SWFFG-UI-CC] *Dark Side* option is activated");
	
			for(var elem = 0 ; elem < head.children.length; elem++)
			{
				if (head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/swffg-default.css" ||
				    head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/css/swffg.css"){
				  // head.children[elem].href= locationOrigin +"/"+"modules/swffgUI-cc/darkside/css/swffg.css";
				  head.children[elem].href= "modules/swffgUI-cc/darkside/css/swffg.css";
				  break;
				}
			}
		}
		else {
			console.log("[SWFFG-UI-CC] default starwars UI option is activated");
	
			for(var elem = 0 ; elem < head.children.length; elem++)
			{
				if (head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/darkside/css/swffg.css" ||
				    head.children[elem].href === locationOrigin +"/"+"modules/swffgUI-cc/css/swffg.css"){
				  // head.children[elem].href= locationOrigin +"/"+"modules/swffgUI-cc/darkside/css/swffg.css";
				  head.children[elem].href= "modules/swffgUI-cc/swffg-default.css";
				  break;
				}
			}
		}*/
		
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
		/*margin: 0px 0px 8px 0px;*/
		/*let destinydiv = document.getElementById('destiny-tracker');
		destiny-tracker.setAttribute("style","z-index: 100; inset: 784px 305px 0px 1291px; width: 200px; height: 105px;");*/
		/*let para = document.createElement("li");
		let node = document.createTextNode("SWFFG-UI-CC");
		let span = document.createElement("span");
		let version = document.createTextNode("0.0.2");
		para.appendChild(node);
		span.appendChild(version);
		para.appendChild(span);
		
		var infoElmt = document.getElementById('game-details');
		if (infoElmt !== null){
			infoElmt.appendChild(para);
		}*/
		
	}

}

Hooks.on("ready", () => {
    swffgUIModule.singleton = new swffgUIModule();
    swffgUIModule.singleton.init();
});
