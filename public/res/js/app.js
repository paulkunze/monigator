/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

angular
  .module('dashboardApp', [
    'ngAnimate',
    'ngMaterial',
    'controllers',
    'directives',
    'services',
    'angular-loading-bar',
    'charts',
    'ui.router',
    'ncy-angular-breadcrumb',
    'ngCookies'
  ])
  .config(function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;   // don't show the additional spinner
    cfpLoadingBarProvider.latencyThreshold = 200;   // only show loading bar if it takes more than these milliseconds
  })
  .config(function ($breadcrumbProvider) {
    $breadcrumbProvider.setOptions({
      template: 'bootstrap3'
    });
  })
  .config(function ($compileProvider) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|psc):/);  // add psc:// as a valid protocol
    }
  )
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('overview', {
        url: '/',
        templateUrl: 'partials/overview.html',
        controller: 'OverviewCtrl'
      })
      .state('search', {
        url: '/suche',
        templateUrl: 'partials/search.html',
        controller: 'SearchCtrl as ctrl'
      })
      .state('pymon', {
        url: '/pymon',
        templateUrl: 'partials/pymon_hosts.html',
        controller: 'PymonCtrl as ctrl',
        ncyBreadcrumb: {
          label: '{{breadcrumbs.hosts}}'
        }
      })
      .state('pymon.host', {
        url: '/:hname',
        views: {
          '@': {
            templateUrl: 'partials/pymon_host.html',
            controller: 'PymonCtrl as ctrl'
          }
        },
        ncyBreadcrumb: {
          label: '{{breadcrumbs.host}}'
        }
      })
      .state('pymon.host.origin', {
        url: '/:oname',
        views: {
          '@': {
            templateUrl: 'partials/pymon_origin.html',
            controller: 'PymonCtrl as ctrl'
          }
        },
        ncyBreadcrumb: {
          label: '{{breadcrumbs.origin}}'
        }
      })
      .state('pymon.host.origin.suborigin', {
        url: '/:sname',
        views: {
          '@': {
            templateUrl: 'partials/pymon_suborigin.html',
            controller: 'PymonCtrl as ctrl'
          }
        },
        ncyBreadcrumb: {
          label: '{{breadcrumbs.suborigin}}'
        }
      })
      .state('pymon.host.origin.suborigin.parameter', {
        url: '/:pname',
        views: {
          '@': {
            templateUrl: 'partials/pymon_parameter.html',
            controller: 'PymonCtrl as ctrl'
          }
        },
        ncyBreadcrumb: {
          label: '{{breadcrumbs.parameter}}'
        }
      })
      .state('pymon.status', {
        url: 'status',    // resolves to pymonstatus
        views: {
          '@': {
            templateUrl: 'partials/pymon_status.html',
            controller: 'PymonCtrl as ctrl'
          }
        }
      })
      .state('salt', {
        url: '/salt',
        templateUrl: 'partials/salt.html',
        controller: 'SaltCtrl as ctrl'
      })
      .state('salt.search', {
        url: '/:term',
        templateUrl: 'partials/salt.html',
        controller: 'SaltCtrl as ctrl'
      })
      .state('psc', {
        url: '/psc',
        templateUrl: 'partials/psc.html',
        controller: 'PscCtrl as ctrl'
      })
      .state('patchday', {
        url: '/patchday',
        templateUrl: 'partials/patchday.html',
        controller: 'PatchdayCtrl as ctrl'
      })
      .state('patchday.week', {
        url: '/week',
        views: {
          '@': {
            templateUrl: 'partials/patchday.html',
            controller: 'PatchdayCtrl as ctrl'
          }
        }
      })
      .state('patchday.month', {
        url: '/month',
        views: {
          '@': {
            templateUrl: 'partials/patchday.html',
            controller: 'PatchdayCtrl as ctrl'
          }
        }
      })
      .state('patchday.week.weekday', {
        url: '/:weekday',
        views: {
          '@': {
            templateUrl: 'partials/patchday.html',
            controller: 'PatchdayCtrl as ctrl'
          }
        }
      })
      .state('patchday.month.monthday', {
        url: '/:monthday',
        views: {
          '@': {
            templateUrl: 'partials/patchday.html',
            controller: 'PatchdayCtrl as ctrl'
          }
        }
      })
      .state('imprint', {
        url: '/impressum',
        templateUrl: 'partials/imprint.html'
      })
      .state('license', {
        url: '/lizenz',
        templateUrl: 'partials/license.html'
      })
      .state('tests', {
        url: '/tests',
        templateUrl: 'partials/tests.html',
        controller: 'TestCtrl as ctrl'
      });

    $urlRouterProvider.otherwise("/");
  })
  .config(function ($mdThemingProvider) {
      var customPrimary = {
        '50': '#d8dee1',
        '100': '#c9d2d6',
        '200': '#bbc5ca',
        '300': '#adb9bf',
        '400': '#9eadb4',
        '500': '#90A1A9',   // DB Silber
        '600': '#82959e',
        '700': '#738993',
        '800': '#677c85',
        '900': '#5c6e77',
        'A100': '#e6eaec',
        'A200': '#f5f6f7',
        'A400': '#ffffff',
        'A700': '#516169',
        'contrastDefaultColor': 'light'
      };
      $mdThemingProvider
        .definePalette('customPrimary',
          customPrimary);

      var customAccent = {
        '50': '#000000',
        '100': '#000000',
        '200': '#010410',
        '300': '#040b28',
        '400': '#06113f',
        '500': '#081857',
        '600': '#0c2485',
        '700': '#0e2b9d',
        '800': '#1031b4',
        '900': '#1237cb',
        'A100': '#0c2485',
        'A200': '#0A1E6E',    // DB Blau
        'A400': '#081857',
        'A700': '#153ee3',
        'contrastDefaultColor': 'light'
      };
      $mdThemingProvider
        .definePalette('customAccent',
          customAccent);

      var customWarn = {
        '50': '#f88c8c',
        '100': '#f67474',
        '200': '#f55c5c',
        '300': '#f34444',
        '400': '#f22c2c',
        '500': '#F01414',   // DB Rot
        '600': '#dc0e0e',
        '700': '#c40d0d',
        '800': '#ac0b0b',
        '900': '#950909',
        'A100': '#f9a4a4',
        'A200': '#fbbcbc',
        'A400': '#fcd4d4',
        'A700': '#7d0808'
      };
      $mdThemingProvider
        .definePalette('customWarn',
          customWarn);

      $mdThemingProvider.theme('default')
        .primaryPalette('customPrimary')
        .accentPalette('customAccent')
        .warnPalette('customWarn');

      // set text color of the input field on the toolbar
      $mdThemingProvider.theme('default').foregroundPalette['3'] = '#c9d2d6';   // primary color 100
    }
  );
