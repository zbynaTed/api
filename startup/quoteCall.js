let axios = require("axios").default;
const _ = require("lodash");
const logger = require("./logging");
const {
  apiUrl,
  yahooApiUrl,
  yahooApiKey,
  yahooQuoteStringLimit,
} = require("../data/config.json");

async function getSymbols() {
  const symbols = await axios.get(`${apiUrl}/stocks/symbols`);
  return symbols;
}

async function insertQuote(idStock, data) {
  await axios.patch(`${apiUrl}/stocks/${idStock}`, data);
}

async function generateSymbolString(stocks) {
  const separator = "%2C";
  let symbolString = "";
  for (let s of stocks) {
    symbolString += s.symbol + separator;
  }
  symbolString = symbolString.slice(0, -separator.length);
  return { symbolString };
}

async function getQuotes() {
  const { data: stocks } = await getSymbols();

  let currentTop = 0;
  let currentSliceNumber = 0;

  while (currentTop < stocks.length) {
    let startIndex = 0 + yahooQuoteStringLimit * currentSliceNumber;
    let endIndex =
      yahooQuoteStringLimit * currentSliceNumber - 1 + yahooQuoteStringLimit;
    const currentSlice = _.slice(stocks, startIndex, endIndex);

    const { symbolString } = await generateSymbolString(currentSlice);
    const { data: result } = await axios.request({
      method: "GET",
      url: `${yahooApiUrl}${symbolString}`,
      params: { modules: "defaultKeyStatistics,assetProfile" },
      headers: {
        "x-api-key": yahooApiKey,
      },
    });

    let quoteData = result.quoteResponse.result;
    for (let q of quoteData) {
      let index = stocks.findIndex((s) => s.symbol === q.symbol);
      stocks[index].fiftyTwoWeekLow = q.fiftyTwoWeekLow;
      stocks[index].fiftyTwoWeekHigh = q.fiftyTwoWeekHigh;
      stocks[index].epsForward = q.epsForward;
      stocks[index].sharesOutstanding = q.sharesOutstanding;
      stocks[index].fiftyDayAverage = q.fiftyDayAverage;
      stocks[index].twoHundredDayAverage = q.twoHundredDayAverage;
      stocks[index].marketCap = q.marketCap;
      stocks[index].forwardPE = q.forwardPE;
      stocks[index].priceToBook = q.priceToBook;
      stocks[index].averageAnalystRating = q.averageAnalystRating;
      stocks[index].regularMarketPrice = q.regularMarketPrice;
      await insertQuote(stocks[index].id, stocks[index]);
    }
    logger.info("New stock quotes downloaded.");

    currentTop += yahooQuoteStringLimit;
    currentSliceNumber++;
  }
}

module.exports = function iterateCall() {
  return setInterval(getQuotes, 21600000);
};
