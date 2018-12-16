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
  '/lib/ionic-datepicker/dist/ionic-datepicker.bundle.min.js',
  '/lib/angular-chart/dist/angular-chart.min.js',
  '/lib/auth0/angular-auth0.min.js',
  '/lib/auth0/auth0.min.js',
  '/lib/chart/dist/Chart.min.js',
  '/lib/moment/min/moment-with-locales.min.js',
  '/index.html',
  '/app/main-module.js',
  '/app/main-ctrl.js',
  '/app/shared/shared-service.js',
  '/app/components/activities/activities.html',
  '/app/components/activities/activity-ctrl.js',
  '/app/components/activities/activity-service.js',
  '/app/components/activities/activity.html',
  '/app/components/auth/auth-service.js',
  '/app/components/login/login.html',
  '/app/components/registration/register.html',
  '/app/components/user/profile-records.html',
  '/app/components/user/profile-beta.html',
  '/app/components/user/profile-statistics.html',
  '/app/components/user/profile.html',
  '/app/components/user/user-ctrl.js',
  '/app/components/user/user-service.js',
  '/img/long_jump1600.png',
  '/img/pullup.png',
  '/img/pushup.png',
  '/img/resul.png',
  '/img/run.png',
  '/img/situp.jpg'
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