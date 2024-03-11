<!-- StockSearch.vue -->

<template>
  <div class="main-container">
    <div class="search">
      <label>
        Enter a US Stock Name:
        <input v-model="stockName" @keyup.enter="handleSearch"/>
      </label>
      <button @click="handleSearch">Search</button>

      <button v-if="searchMade && watchlistDuplicate" @click="addToWatchlist"> Add to watchlist</button>
    </div>
    <div v-if="loading" class="loading">Loading
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
    <div v-else>
      <div class="data-container" v-if="searchMade">

        <section class="watchlist">
          <h3>Watchlist</h3>
          <div v-if="watchlist.length > 0">
            <li v-for="(item, index) in watchlist" :key="index" class="watchlist-list">
              {{ item.symbol }} - ${{ item.stockPrice.toFixed(2) }} <button
                @click="removeFromWatchlist(item.symbol)">❌</button>
            </li>
          </div>
        </section>
        <section class="general-information">
          <h3>General information</h3>
          <p>Price: <strong>${{ stockPrice.toFixed(2) }}</strong></p>
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
            v-if="stockPrice > recommendationLow && stockPrice < recommendationHigh && recommendationLow !== recommendationHigh">
            <div class="bar-chart">
              <div class="bar"
                :style="{ width: `${((stockPrice - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
              </div>
              <div class="label" :style="{ left: '0%' }">{{ recommendationLow.toFixed(2) }} <br /> Low</div>
              <div class="label-current"
                :style="{ left: `${((stockPrice - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
                {{ stockPrice.toFixed(2) }} <br /> Current
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
            v-if="stockPrice < recommendationLow && stockPrice < recommendationHigh && recommendationLow !== recommendationHigh">
            <div class="bar-chart">
              <div class="bar"
                :style="{ width: `${((stockPrice - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%`, left: `${stockPrice < recommendationLow ? 0 : ((stockPrice - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
              </div>
              <div class="label"
                :style="{ left: `${((recommendationLow - stockPrice) / (recommendationHigh - stockPrice)) * 100}%` }">
                {{ recommendationLow.toFixed(2) }} <br /> Low</div>
              <div class="label-current" :style="{ left: '0%' }">{{ stockPrice.toFixed(2) }} <br /> Current</div>
              <div class="label"
                :style="{ left: `${((recommendationMed - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
                {{ recommendationMed.toFixed(2) }} <br /> Average</div>
              <div class="label-median"
                :style="{ left: `${((recommendationMedian - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
                {{ recommendationMedian.toFixed(2) }} <br /> Median</div>
              <div class="label" :style="{ left: '100%' }">{{ recommendationHigh.toFixed(2) }} <br /> High</div>
            </div>
          </div>

          <div v-if="stockPrice > recommendationHigh && recommendationLow !== recommendationHigh">
            <div class="bar-chart">

              <div class="bar"
                :style="{ width: `${((stockPrice - recommendationLow) / (stockPrice - recommendationLow)) * 100}%` }">
              </div>

              <div class="label" :style="{ left: '0%' }">{{ recommendationLow.toFixed(2) }} <br /> Low</div>

              <div class="label"
                :style="{ left: `${((recommendationHigh - recommendationLow) / (stockPrice - recommendationLow)) * 100}%` }">
                {{ recommendationHigh.toFixed(2) }} <br /> High</div>

              <div class="label"
                :style="{ left: `${((recommendationMed - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
                {{ recommendationMed.toFixed(2) }} <br /> Average</div>

              <div class="label-median"
                :style="{ left: `${((recommendationMedian - recommendationLow) / (recommendationHigh - recommendationLow)) * 100}%` }">
                {{ recommendationMedian.toFixed(2) }} <br /> Median</div>

              <div class="label-current" :style="{ left: '100%' }">{{ stockPrice.toFixed(2) }} <br /> Current</div>
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
  </div>
</template>

<script src="../assets/css/StockSearch.js"></script>


<style scoped>
@import '../assets/css/StockSearch.css';
</style>