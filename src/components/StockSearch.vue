<!-- StockSearch.vue -->

<template>
  <div class="main-container">
    <div class="search">
      <label>
        Enter a US Stock Name:
        <input v-model="stockName" />
      </label>
      <button @click="handleSearch">Search</button>
      <button @click="addToWatchlist"> Add to watchlist
      </button>
    </div>


    <div class="data-container" v-if="searchMade">

      <section class="watchlist">
        <h3>Watchlist</h3>
      </section>
      <section class="general-information">
        <h3>General information</h3>
        <p>Price: <strong>${{ marketPrice.toFixed(2) }}</strong></p>
        <p>EBITDA 2023: <strong>${{ ebitda.toLocaleString() }}</strong></p>
        <p>Sector: <strong>{{ sector }}</strong></p>
        <p>Symbol: <strong>{{ symbol }}</strong></p>
      </section>
      <section class="stock-details">
        <h3>Details</h3>
        <p>{{ symbol }} is valued at <strong>{{ valueMultiple.toFixed(2) }}</strong> times EBITDA</p>
        <p>PE ratio: <strong>{{ peRatio.toFixed(2) }} 0 can mean minus</strong></p>
      </section>

        <section class="analysts-opinion" v-if="numberOfOpinions > 0">
          <h3>Analysts opinion</h3>
          <p>Low rec: <strong>${{ recommendationLow.toFixed(2) }}</strong></p>
          <p>Average rec: <strong>${{ recommendationMed.toFixed(2) }}</strong></p>
          <p>Median rec: <strong>${{ recommendationMedian.toFixed(2) }}</strong></p>
          <p>High rec: <strong>${{ recommendationHigh.toFixed(2) }}</strong></p>

          <p>Recommendation: <strong>{{ analystRecommendations }}</strong></p>
          <p>Rec key: <strong>{{ analystRecommendationKey }}</strong></p>
          <p>Number of analytics: <strong>{{ numberOfOpinions }}</strong></p>

          <div
            v-if="marketPrice > recommendationLow && marketPrice < recommendationHigh && recommendationLow !== recommendationHigh">
            <div class="bar-chart">
              <div class="bar"
                :style="{ width: `${((marketPrice - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
              </div>
              <div class="label" :style="{ left: '0%' }">{{ recommendationLow.toFixed(2) }} <br /> Low</div>
              <div class="label-current"
                :style="{ left: `${((marketPrice - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
                {{ marketPrice.toFixed(2) }} <br /> Current
              </div>
              <div class="label"
                :style="{ left: `${((recommendationMed - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
                {{ recommendationMed.toFixed(2) }} <br /> Average
              </div>
              <div class="label-median"
                :style="{ left: `${((recommendationMedian - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
                {{ recommendationMedian.toFixed(2) }} <br /> Median
              </div>
              <div class="label" :style="{ left: '100%' }">{{ recommendationHigh.toFixed(2) }} <br /> High</div>
            </div>
          </div>

          <div
            v-if="marketPrice < recommendationLow && marketPrice < recommendationHigh && recommendationLow !== recommendationHigh">
            <div class="bar-chart">
              <div class="bar"
                :style="{ width: `${((marketPrice - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%`, left: `${marketPrice < recommendationLow ? 0 : ((marketPrice - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
              </div>
              <div class="label"
                :style="{ left: `${((recommendationLow - marketPrice) / (recommendationHigh - marketPrice)) * 100}%` }">
                {{ recommendationLow.toFixed(2) }} <br /> Low</div>
              <div class="label-current" :style="{ left: '0%' }">{{ marketPrice.toFixed(2) }} <br /> Current</div>
              <div class="label"
                :style="{ left: `${((recommendationMed - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
                {{ recommendationMed.toFixed(2) }} <br /> Average</div>
              <div class="label-median"
                :style="{ left: `${((recommendationMedian - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
                {{ recommendationMedian.toFixed(2) }} <br /> Median</div>
              <div class="label" :style="{ left: '100%' }">{{ recommendationHigh.toFixed(2) }} <br /> High</div>
            </div>
          </div>

          <div v-if="marketPrice > recommendationHigh && recommendationLow !== recommendationHigh">
            <div class="bar-chart">

              <div class="bar"
                :style="{ width: `${((marketPrice - recommendationLow) / (marketPrice - recommendationLow)) * 100}%` }">
              </div>

              <div class="label" :style="{ left: '0%' }">{{ recommendationLow.toFixed(2) }} <br /> Low</div>

              <div class="label"
                :style="{ left: `${((recommendationHigh - recommendationLow) / (marketPrice - recommendationLow)) * 100}%` }">
                {{ recommendationHigh.toFixed(2) }} <br /> High</div>

              <div class="label"
                :style="{ left: `${((recommendationMed - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
                {{ recommendationMed.toFixed(2) }} <br /> Average</div>

              <div class="label-median"
                :style="{ left: `${((recommendationMedian - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
                {{ recommendationMedian.toFixed(2) }} <br /> Median</div>

              <div class="label-current" :style="{ left: '100%' }">{{ marketPrice.toFixed(2) }} <br /> Current</div>
            </div>
          </div>
        </section>
      <section class="analysts-opinion" v-if="!numberOfOpinions || numberOfOpinions === 0">
        <h3>Analysts opinion</h3>
        <p>Low rec: <strong>0</strong></p>
        <p>Average rec: <strong>0</strong></p>
        <p>Median rec: <strong>0</strong></p>
        <p>High rec: <strong>0</strong></p>

        <p>Recommendation: <strong>0</strong></p>
        <p>Rec key: <strong>0</strong></p>
        <p>Number of analytics: <strong>0</strong></p>

      </section>

    </div>
  </div>
</template>

<script>
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

    return {
      stockName: '',
      // First call
      sector: '',
      symbol: '',
      // Second call
      ebitda: null,
      analystRecommendations: '',
      analystRecommendationKey: null,
      recommendationLow: null,
      recommendationMed: null,
      recommendationMedian: null,
      recommendationHigh: null,
      numberOfOpinions: null,
      // Third call
      marketPrice: null,
      outstandingShares: null,
      // Fourth call
      peRatio: null,
      // Calculations
      enterpriseValue: null,
      valueMultiple: null,
      analystScore: 0,
      // Watchlist
      watchlist: [],
      watchlistButtonDisabled: false,

      searchMade: false,

      searchUrl: 'https://yahoo-finance127.p.rapidapi.com/search/',
      financeUrl: 'https://yahoo-finance127.p.rapidapi.com/finance-analytics/',
      priceUrl: 'https://yahoo-finance127.p.rapidapi.com/price/',
      keyStatsUrl: 'https://yahoo-finance127.p.rapidapi.com/key-statistics/',

      options: options,
    };
  },
  computed: {
    // Your computed properties
  },
  methods: {
    async handleSearch() {
      try {
        await this.firstApiCall();
        await this.secondApiCall();
        await this.thirdApiCall();
        await this.fourthApiCall();
        this.calculateMultiple();
        this.searchMade = true;

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
      this.marketPrice = thirdResult.regularMarketPrice.raw;
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
      console.log(fourthResult);
    },
    calculateMultiple() {
      this.enterpriseValue = this.outstandingShares * this.marketPrice;
      this.valueMultiple = this.enterpriseValue / this.ebitda;
    }

  },
};
</script>

<style scoped>
@import '../assets/css/StockSearch.css';
</style>