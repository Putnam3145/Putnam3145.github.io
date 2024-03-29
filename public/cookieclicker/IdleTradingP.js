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
        const dollars = Game.cookies/Game.cookiesPs;
        const expectedMax = (100+(Game.Objects['Bank'].level-1)*3)
		for(var iG = 0; iG < M.goodsById.length; iG++){
			let good = M.goodsById[iG];
            let conf = IdleTrading.config.goods[iG];
            const baseline = 10*(iG+1)+level;
            const buyPrice = Math.max(1,Math.min(dollars / M.getGoodMaxStock(good), baseline, expectedMax));
            conf.buyThresh = 1
            conf.sellThresh = baseline+expectedMax;
            switch(good.mode)
            {
                case 3: // fast rise, buy more aggressively
                    conf.buyThresh = buyPrice
                    break;
                case 1: // rising; buy now
                    if(good.dur > 10) conf.buyThresh = buyPrice;
                    break;
                case 4:
                    conf.sellThresh = 1
                    break;
                case 2: // falling; sell now
                    if(good.dur > 20) conf.sellThresh = 1
                    break;
                case 5: // chaotic, get weird with it
                    conf.buyThresh = buyPrice/1.2;
                    conf.sellThresh = baseline*1.2;
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