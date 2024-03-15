export default {
    data() {
        const apiKey = '868c0c8721msh6a1ce74715ec254p133b1cjsn70daf7be0daf';

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'yahoo-finance127.p.rapidapi.com',
            },
        };
        //Options for API 2
        const options2 = {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
            },
        };

        return {
            stockName: '',
            sector: '',
            symbol: '',
            ebitda: null,
            analystRecommendations: '',
            analystRecommendationKey: null,
            recommendationLow: null,
            recommendationMed: null,
            recommendationMedian: null,
            recommendationHigh: null,
            numberOfOpinions: null,
            stockPrice: null,
            outstandingShares: null,
            peRatio: null,
            enterpriseValue: null,
            valueMultiple: null,
            analystScore: 0,
            watchlist: [],
            watchlistButtonDisabled: false,
            watchlistDuplicate: true,
            searchMade: false,
            loading: false,
            //URLs for API 1
            financeUrl: 'https://yahoo-finance127.p.rapidapi.com/finance-analytics/',
            //URLs for API 2
            johnApiUrl: 'https://axlstockapi.azurewebsites.net/stock/',


            options: options,
            options2: options2,
        };
    },
    methods: {
        updateWatchlistButton() {
            const stockAlreadyExists = this.watchlist.some(item => item.symbol === this.symbol);
            if (stockAlreadyExists) {
                this.watchlistDuplicate = false;
            } else {
                this.watchlistDuplicate = true;
            }
        },

        removeFromWatchlist(symbolToRemove) {
            const updatedWatchlist = this.watchlist.filter(item => item.symbol !== symbolToRemove);
            this.watchlist = updatedWatchlist;
            this.updateWatchlistButton();
        },

        addToWatchlist() {
            let listItem = { symbol: this.symbol, stockPrice: this.stockPrice };

            const stockAlreadyExists = this.watchlist.some(item => item.symbol === this.symbol);

            if (!stockAlreadyExists) {
                this.watchlist.push(listItem)
                //Watchlist check
                this.watchlistDuplicate = false;
            }
            //We know that the button has been pressed at least once, start updating watchlist prices
            this.intervalId = setInterval(() => {
                this.UpdateWatchListPrices();
            }, 15000);
            
        },

        async handleSearch() {
            this.loading = true; //While api calls and other functions are running
            try {
                Promise.all([
                    await this.firstApiCall(),
                    await this.secondApiCall(),
                    this.calculateMultiple(),
                    this.searchMade = true,

                    this.updateWatchlistButton(),

                ]).then(() => {
                    // All API calls completed - loading done
                    this.loading = false;
                });

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        async firstApiCall(){
            const firstApiUrl = this.johnApiUrl + this.stockName;
            const response = await fetch(firstApiUrl, this.options);
            const result = await response.json();

            this.sector = result.yahooProfileData.sector;
            this.symbol = result.symbolFromCheck;
            this.stockPrice = result.googleDefaultData.marketPrice;
            this.outstandingShares = result.yahooKeyStatistics.sharesOutstanding;
            this.peRatio = result.yahooKeyStatistics.trailingPE;
            this.ebitda = result.yahooKeyStatistics.ebitda;            
        },
        
        async secondApiCall() {
            const secondApiUrl = this.financeUrl + this.symbol;
            const secondResponse = await fetch(secondApiUrl, this.options);
            const secondResult = await secondResponse.json();
            this.analystRecommendations = secondResult.recommendationMean.raw;
            this.analystRecommendationKey = secondResult.recommendationKey;
            this.recommendationLow = secondResult.targetLowPrice.raw;
            this.recommendationMed = secondResult.targetMeanPrice.raw;
            this.recommendationHigh = secondResult.targetHighPrice.raw;
            this.recommendationMedian = secondResult.targetMedianPrice.raw;
            this.numberOfOpinions = secondResult.numberOfAnalystOpinions.raw;

        },
        
        calculateMultiple() {
            this.enterpriseValue = this.outstandingShares * this.stockPrice;
            this.valueMultiple = this.enterpriseValue / this.ebitda;
        },

        //Simple price api called every 15 seconds for watchlist
        async UpdateWatchListPrices() {
            for (const element of this.watchlist) {
                try {
                    let stockUrl = "https://axlstockapi.azurewebsites.net/stock/price/" + element.symbol;

                    const priceApiResponse = await fetch(stockUrl, this.options2);
                    const priceApiResult = await priceApiResponse.json();

                    let updatedPrice = priceApiResult.googlePriceData.marketPrice;

                    element.stockPrice = updatedPrice;
                    
                } catch (error) {
                    console.error('Error fetching price data:', error);
                }
            }


        }
    },
};