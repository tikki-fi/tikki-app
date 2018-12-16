var CACHE_NAME = 'tikki-cache-v1';

var urlsToCache = [
  '/',
  '/lib/ionic/css/ionic.min.css',
  '/lib/ionic/fonts/ionicons.ttf',
  '/lib/ionic/fonts/ionicons.ttf?v=2.0.1',
  '/lib/ionic/fonts/ionicons.woff',
  '/lib/ionic/fonts/ionicons.woff?v=2.0.1',
  '/css/style.css',
  '/lib/ionic/js/ionic.bundle.min.js',
  '/node_modules/ionic-datepicker/dist/ionic-datepicker.bundle.min.js',
  '/lib/angular-chart/dist/angular-chart.min.js',
  '/lib/auth0/angular-auth0.min.js',
  '/node_modules/auth0-js/dist/auth0.js',
  '/node_modules/chart.js/dist/Chart.min.js',
  '/node_modules/moment/min/moment-with-locales.min.js',
  '/index.html',
  '/app/main-module.js',
  '/app/main-ctrl.js',
  '/app/shared/shared-service.js',
  '/pages/activities/activities_list.html',
  '/pages/activities/activity-ctrl.js',
  '/pages/activities/activity-service.js',
  '/pages/activities/add_single_activity.html',
  '/services/auth-service.js',
  '/pages/login/login.html',
  '/pages/register.html',
  '/pages/profile/records.html',
  '/pages/profile/profile.html',
  '/pages/profile/statistics.html',
  '/pages/profile/user-ctrl.js',
  '/services/user-service.js',
  '/img/long_jump1600.png',
  '/assets/pullup.png',
  '/assets/pushup.png',
  '/assets/resul.png',
  '/assets/run.png',
  '/assets/situp.jpg'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {

  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
