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
        const level = Game.Objects['Bank'].level;
		for(var iG = 0; iG < M.goodsById.length; iG++){
			let good = M.goodsById[iG];
            let conf = IdleTrading.config.goods[iG];
            const baseline = 10*(iG+1)+level;
            switch(good.mode)
            {
                case 1: // rising; buy now
                case 3:
                    conf.sellThresh = -1
                    conf.buyThresh = 0.999*baseline;
                    break;
                case 2: // falling; sell now
                case 4:
                    conf.buyThresh = -1
                    conf.sellThresh = 1.001*baseline;
                    break;
                default: // chaotic/stable, just try to buy high/sell low
                    conf.buyThresh = baseline/1.2;
                    conf.sellThresh = baseline*1.2;
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