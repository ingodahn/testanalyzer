module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/testanalyzer/" : "/",
  "transpileDependencies": [
    "vuetify"
  ]
}