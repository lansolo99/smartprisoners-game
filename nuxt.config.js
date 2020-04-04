import { sentryKey } from './api'
/* eslint-disable prettier/prettier */
export default {
  mode: 'spa',
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: 'SmartPrisonners',
    meta: [
      {
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, user-scalable=no'
      },
      {
        httpEquiv: 'Content-Security-Policy',
        content:
          "default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src *; img-src 'self' data: content:;"
      }
    ],
    script: [
      {
        src: 'cordova.js'
      }
      // {
      //   src: 'https://markknol.github.io/console-log-viewer/console-log-viewer.js'
      // }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: false,
  vue: {
    config: {
      productionTip: false
    }
  },
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/vue-multi-ref',
    '~/plugins/cordova.client',
    '~/plugins/vue-2-touch-event',
    '~/plugins/firebase',
    '~/plugins/localStorage'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/sentry',
    '@nuxtjs/axios',
    '@nuxtjs/eslint-module',
    '@nuxtjs/style-resources',
    '@bazzite/nuxt-netlify'
    // 'nuxt-memwatch'
  ],

  sentry: {
    dsn: sentryKey,
    config: {}, // Additional config
  },

  // memwatch: {
  //   graph: true,
  //   leakGrowthCount: 5,
  //   verbose: true
  // },

  netlify: {},

  styleResources: {
    scss: [
      './assets/styles/scss/style.scss',
      './assets/styles/scss/_variables.scss',
      './assets/styles/scss/_mixins.scss',
      './assets/styles/scss/_webfonts.scss',
      './assets/styles/scss/_globals.scss'
    ]
  },

  serverMiddleware: [
    {
      path: '/nuxtfiles',
      handler: '~/servermiddleware/assets.js'
    }
  ],
  router: {
    mode: 'hash'
  },

  /*
   ** Build configuration
   */
  buildModules: ['@nuxtjs/dotenv', '@nuxtjs/global-components'],
  build: {
    publicPath: '/nuxtfiles/',
    babel: {
      babelrc: false,
      cacheDirectory: undefined,
      presets: ['@nuxt/babel-preset-app'],
      plugins: [
        ['transform-remove-console']
      ]
    },
    // analyze: {
    //   analyze: true
    //   // analyzerMode: 'statics
    // },
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      })
      // if (isDev) { config.mode = 'development' }
      // if (ctx.isDev) {
      //   config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      // }
    }
  }
}
