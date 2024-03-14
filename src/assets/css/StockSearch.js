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
            searchUrl: 'https://yahoo-finance127.p.rapidapi.com/search/',
            financeUrl: 'https://yahoo-finance127.p.rapidapi.com/finance-analytics/',
            priceUrl: 'https://yahoo-finance127.p.rapidapi.com/price/',
            keyStatsUrl: 'https://yahoo-finance127.p.rapidapi.com/key-statistics/',
            //URL for API 2
            stockUrl: 'https://axlstockapi.azurewebsites.net/stock/price/',

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
            this.loading = true;
            try {
                Promise.all([
                    await this.firstApiCall(),
                    await this.secondApiCall(),
                    await this.thirdApiCall(),
                    await this.fourthApiCall(),
                    this.calculateMultiple(),
                    this.searchMade = true,

                    this.updateWatchlistButton(),

                ]).then(() => {
                    // All API calls completed
                    this.loading = false;
                });

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        async firstApiCall() {
            const firstApiUrl = this.searchUrl + this.stockName;
            const response = await fetch(firstApiUrl, this.options);
            const result = await response.json();
            this.sector = result.quotes[0].sector;
            this.symbol = result.quotes[0].symbol;

        },
        async secondApiCall() {
            const secondApiUrl = this.financeUrl + this.symbol;
            const secondResponse = await fetch(secondApiUrl, this.options);
            const secondResult = await secondResponse.json();
            this.ebitda = secondResult.ebitda.raw;
            this.analystRecommendations = secondResult.recommendationMean.raw;
            this.analystRecommendationKey = secondResult.recommendationKey;
            this.recommendationLow = secondResult.targetLowPrice.raw;
            this.recommendationMed = secondResult.targetMeanPrice.raw;
            this.recommendationHigh = secondResult.targetHighPrice.raw;
            this.recommendationMedian = secondResult.targetMedianPrice.raw;
            this.numberOfOpinions = secondResult.numberOfAnalystOpinions.raw;

        },
        async thirdApiCall() {
            const thirdApiUrl = this.priceUrl + this.symbol;
            const thirdResponse = await fetch(thirdApiUrl, this.options);
            const thirdResult = await thirdResponse.json();
            this.stockPrice = thirdResult.regularMarketPrice.raw;
            this.outstandingShares = thirdResult.sharesOutstanding.raw;

        },
        async fourthApiCall() {
            const fourthApiUrl = this.keyStatsUrl + this.symbol;
            const fourthResponse = await fetch(fourthApiUrl, this.options);
            const fourthResult = await fourthResponse.json();
            try {
                this.peRatio = fourthResult.trailingPE.raw;
            } catch {
                this.peRatio = 0;
            }
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
                    
                    console.log(updatedPrice);

                } catch (error) {
                    console.error('Error fetching price data:', error);
                }
            }


        }
    },
};