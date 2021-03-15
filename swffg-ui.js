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

	/*addChatMessageContextOptions(html, options){
		options.push(
		  {
			name: game.i18n.localize("CHATOPT.ApplyDamage"),
			icon: '<i class="fas fa-user-minus"></i>',
			condition: canApply,
			callback: li => {

			  if (li.find(".dice-roll").length)
			  {
				let amount = li.find('.dice-total').text();
				game.user.targets.forEach(t => t.actor.applyBasicDamage(amount))
			  }
			  else 
			  {
				let cardData = game.messages.get(li.attr("data-message-id")).data.flags.opposeData
				let defenderSpeaker = game.messages.get(li.attr("data-message-id")).data.flags.opposeData.speakerDefend;

				if (!WFRP_Utility.getSpeaker(defenderSpeaker).owner)
				  return ui.notifications.error(game.i18n.localize("ERROR.DamagePermission"))

				let updateMsg = ActorWfrp4e.applyDamage(defenderSpeaker, cardData,  game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
				OpposedWFRP.updateOpposedMessage(updateMsg, li.attr("data-message-id"));
			  }
			}
		  })
	};*/
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
        
        game.settings.register("swffgUI-cc", "enable-cursor", {
        name: "SWFFG.CursorSettings",
        hint: "SWFFG.CursorSettingsHint",
        scope: "Client",
        config: true,
        default: true,
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
		
			
		/*Hooks.on("getChatLogEntryContext", this.addChatMessageContextOptions);
				
		Hooks.on('renderChatMessage', (_0, html) => {
			
			if (_0.data.content === "1D100")
				return;
			
		});*/
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
				
	}

}

Hooks.on("ready", () => {
    swffgUIModule.singleton = new swffgUIModule();
    swffgUIModule.singleton.init();
});

//registerHooks();
