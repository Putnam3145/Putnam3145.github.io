if(IdleTradingP === undefined) var IdleTradingP = {};
if(typeof IdleTrading == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/IdleTrading.js');
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
IdleTradingP.name = 'Automated Idle Trading';
IdleTradingP.version = '1.0';
IdleTradingP.GameVersion = '2.048';

IdleTradingP.launch = function(){
	IdleTradingP.init = function(){
		IdleTradingP.isLoaded = 1;
		
        CCSE.MinigameReplacer(IdleTradingP.ReplaceNativeMarket, "Bank");

		if (Game.prefs.popups) Game.Popup(IdleTradingP.name + ' loaded!');
		else Game.Notify(IdleTradingP.name + ' loaded!', '', '', 1, 1);
	}

    IdleTradingP.ReplaceNativeMarket = function() {
		if(!Game.customMinigame['Bank'].tick) Game.customMinigame['Bank'].tick = [];
		Game.customMinigame['Bank'].tick.unshift(IdleTradingP.Logic);
	}
	
	IdleTradingP.Logic = function(){
		var M = Game.Objects['Bank'].minigame;
        const level = Game.Objects['Bank'].level-1;
		for(var iG = 0; iG < M.goodsById.length; iG++){
			let good = M.goodsById[iG];
            let conf = IdleTrading.config.goods[iG];
            const baseline = 10*(iG+1)+level;
            conf.buyThresh = 1
            conf.sellThresh = baseline+250
            switch(good.mode)
            {
                case 1: // rising; buy now
                    conf.buyThresh = baseline;
                    break;
                case 3: // fast rise, always buy
                    if(good.dur > 2) conf.buyThresh = baseline+250
                    break;
                case 2: // falling; sell now
                case 4:
                    conf.sellThresh = baseline
                    break;
            }
		}
	}
	
	
	Game.registerMod(IdleTradingP.name, IdleTradingP); // IdleTradingP.init();
}

if(!IdleTradingP.isLoaded){
	if(IdleTrading && IdleTrading.isLoaded){
        IdleTradingP.launch();
	} else {
		if(!IdleTrading) var IdleTrading = {};
		if(!IdleTrading.postLoadHooks) IdleTrading.postLoadHooks = [];
		IdleTrading.postLoadHooks.push(IdleTradingP.launch);
    }
}