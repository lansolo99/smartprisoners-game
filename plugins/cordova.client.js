export default (ctx, inject) => {
  const { app } = ctx

  const cordovaApp = {
    // Application Constructor
    initialize() {
      document.addEventListener(
        'deviceready',
        this.onDeviceReady.bind(this),
        false
      )
    },

    // deviceready Event Handler

    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady() {
      // Wake lock
      window.powermanagement.acquire()

      function onBackKeyDown() {
        // Handle the back button
        console.log('onBackKeyDown')
      }
      document.addEventListener('backbutton', onBackKeyDown, false)

      // Orientation
      window.screen.orientation.lock('landscape')
      window.addEventListener('orientationchange', function() {
        console.log(screen.orientation.type) // e.g. portrait
      })

      window.addEventListener('native.keyboardshow', function(e) {
        setTimeout(function() {
          document.activeElement.scrollIntoViewIfNeeded()
        }, 100)
      })

      window.cordova.plugins.backgroundMode.setEnabled(true)
      // window.cordova.plugins.backgroundMode.enable()
      // window.cordova.plugins.backgroundMode.on('activate', function() {
      //   window.cordova.plugins.backgroundMode.disableWebViewOptimizations()
      // })
      /**
       * initialize all different stuff here:
       * e.g.
       *  - sentry
       *  - firebase
       *  - adjust
       *  - push notifications
       *  - fabric
       *  - custom url schema
       *  - facebook
       *  - universal links
       *  - google analytics
       *  - ...
       *
       *  context to "app" is avaialble, but beware only the app scope of a plugin (which means if any other plugin
       *  extends the app scope, it could be that it is not available yet)
       */

      try {
        this.initFullScreenOptions()
      } catch (err) {
        // console.error('status bar failed', err)
      }

      try {
        // this.initFullScreenOptions()
      } catch (err) {
        // console.error('status bar failed', err)
      }

      try {
        this.initWKWebView()
      } catch (err) {
        // console.error('init WKWebView failed', err)
      }

      try {
        // this.initStore()
      } catch (err) {}

      try {
        this.initCustomUrlScheme()
      } catch (err) {}
    },

    initCustomUrlScheme() {
      window.handleOpenURL = url => {
        alert('DeepLink: ' + url)
      }
    },

    initFullScreenOptions() {
      function successFunction() {}
      function errorFunction(error) {
        console.log(error)
      }

      window.StatusBar.hide()
      window.AndroidFullScreen.isSupported(successFunction, errorFunction)
      window.AndroidFullScreen.isImmersiveModeSupported(
        successFunction,
        errorFunction
      )
      window.AndroidFullScreen.leanMode(successFunction, errorFunction)
      window.AndroidFullScreen.immersiveMode(successFunction, errorFunction)
    },

    initStore() {
      console.log('initStore from cordovaclient')

      if (!window.store) {
        console.log('Store not available')
      }

      window.store.register({
        id: 'smartprisoners_fullgame',
        // type: window.store.NON_CONSUMABLE
        type: window.store.CONSUMABLE
      })

      window.store.error(function(error) {
        console.log('ERROR ' + error.code + ': ' + error.message)
      })
    },

    initWKWebView() {
      /* window.WkWebView.allowsBackForwardNavigationGestures(false)
        EventBus.$on('OpenInsidePages', count => {
          if (count > 0) {
            window.WkWebView.allowsBackForwardNavigationGestures(true)
          } else {
            window.WkWebView.allowsBackForwardNavigationGestures(false)
          }
        }) */
    }
  }

  cordovaApp.initialize()

  // patch redirect url for cordova - removes "formatUrl" call because it add "//" to the path
  app.context.redirect = (status, path, query) => {
    if (!status) {
      return
    }

    app.context._redirected = true
    // if only 1 or 2 arguments: redirect('/') or redirect('/', { foo: 'bar' })
    let pathType = typeof path
    if (
      typeof status !== 'number' &&
      (pathType === 'undefined' || pathType === 'object')
    ) {
      query = path || {}
      path = status
      pathType = typeof path
      status = 302
    }
    if (pathType === 'object') {
      path = app.router.resolve(path).href
    }
    // "/absolute/route", "./relative/route" or "../relative/route"
    if (/(^[.]{1,2}\/)|(^\/(?!\/))/.test(path)) {
      app.context.next({
        path,
        query,
        status
      })
    } else {
      // https://developer.mozilla.org/en-US/docs/Web/API/Location/replace

      // path = formatUrl(path, query) removed

      window.location.replace(path)
    }
  }
}
