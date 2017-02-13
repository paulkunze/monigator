/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

angular
  .module('controllers')
  .controller('MainCtrl', function ($rootScope, $scope, $mdDialog, $mdSidenav, $state, searchService, demoService,
                                    settingsService) {

    $scope.showLoadingIndicator = true;             // show loading screen on app start
    angular.element(document).ready(function () {   // remove loading screen when the app is ready
      $scope.showLoadingIndicator = false;
    });

    // ----------- general settings ----------

    $scope.settingsService = settingsService;

    $scope.updateListHeight = function () {
      var elements = document.querySelectorAll('.error-hosts-list');
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.maxHeight = $scope.settingsService.settings.listMaxHeight + "px";
      }
    };

    // -------------- page changes -----------

    $scope.$on('$stateChangeSuccess', function () {       // this event is fired after the page changed
      updateCaption();
    });

    // --------------- searching --------------

    $scope.searchInput = searchService;

    $scope.startSearch = function () {
      if ($scope.searchInput.searchTerm != '') {
        if ($state.includes('search')) {              // if already on the search page
          $rootScope.$broadcast('doSearch');          // tell the search controller to start the search
        } else {                                      // open the search page which starts the search on page load
          $state.go('search');
        }
      }
    };

    $scope.startSearchForTerm = function (term) {
      $scope.searchInput.searchTerm = term;
      if ($state.includes('search')) {              // if already on the search page
        $rootScope.$broadcast('doSearch');          // tell the search controller to start the search
      } else {                                      // open the search page which starts the search on page load
        $state.go('search');
      }
    };


    // ----------------- toolbar --------------------

    $scope.isPymonState = function () {
      return $state.includes('pymon');
    };

    $scope.caption = 'MONIGATOR';
    updateCaption();
    function updateCaption() {
      if ($state.is('overview')) {
        $scope.caption = 'Monitoring Aggregator';
      } else if ($state.is('pymon')) {
        $scope.caption = 'Pymon - Hosts';
      } else if ($state.is('pymon.host')) {
        $scope.caption = 'Pymon - Host';
      } else if ($state.is('pymon.host.origin')) {
        $scope.caption = 'Pymon - Origin';
      } else if ($state.is('pymon.host.origin.suborigin')) {
        $scope.caption = 'Pymon - Suborigin';
      } else if ($state.is('pymon.host.origin.suborigin.parameter')) {
        $scope.caption = 'Pymon - Parameter';
      } else if ($state.is('pymon.status')) {
        if (window.innerWidth < 800) {
          $scope.caption = 'Pymon - Zustand';
        } else {
          $scope.caption = 'Pymon - Interner Zustand';
        }
      } else if ($state.is('psc')) {
        $scope.caption = 'PSC';
      } else if ($state.includes('patchday')) {
        $scope.caption = 'Patchdays';
      } else if ($state.is('salt')) {
        $scope.caption = 'SaltStack';
      } else if ($state.is('search')) {
        $scope.caption = 'Suche';
      } else if ($state.is('imprint')) {
        $scope.caption = 'Impressum';
      } else if ($state.is('license')) {
        $scope.caption = 'Lizenz';
      }
    }

    $(window).resize(function () {
      updateCaption();
    });


    // ------------------ sidenav -------------------

    $scope.toggleLeft = function () {
      $mdSidenav('left-nav').toggle();
    };


    // ------------------ dialogs --------------------

    $scope.showAppsChartDialog = function (ev, id) {
      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.querySelector(id)))
          .clickOutsideToClose(true)
          .title('Nutzung des Diagramms')
          .textContent('Bewege die Maus über eine Fläche, um weitere Informationen anzuzeigen. Klicke auf eine ' +
            'Fläche, um in der Liste nach Gewichtung zu filtern.')
          .ariaLabel('Diagramm-Nutzung')
          .ok('OK')
          .targetEvent(ev)
      );
    };

    $scope.showHostChartDialog = function (ev, id) {
      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.querySelector(id)))
          .clickOutsideToClose(true)
          .title('Nutzung des Diagramms')
          .textContent('Bewege die Maus über eine Fläche, um die genauen Werte anzuzeigen. Klicke auf eine Fläche, ' +
            'um zur Host-Liste mit angewandtem Filter zu wechseln.')
          .ariaLabel('Diagramm-Nutzung')
          .ok('OK')
          .targetEvent(ev)
      );
    };

    $scope.showFeedbackDialog = function ($event) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        templateUrl: 'partials/DialogFeedback.html',
        clickOutsideToClose: true,
        controller: DialogController
      });

      function DialogController($scope, $mdDialog) {
        $scope.closeDialog = function () {
          $mdDialog.hide();
        }
      }
    };

    $scope.showSettingsDialog = function ($event, settings, standardSettings) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        templateUrl: 'partials/DialogSettings.html',
        clickOutsideToClose: true,
        locals: {
          newSettings: $scope.settingsService.settings,
          standardSettings: $scope.settingsService.standardSettings
        },
        controller: DialogController
      }).then(function (newSettings) {
        settingsService.saveSettings(newSettings);
        $scope.updateListHeight();
      });

      function DialogController($scope, $mdDialog) {
        $scope.newSettings = settings;
        $scope.standardSettings = standardSettings;
        $scope.saveSettings = function (settingsToSave) {
          $mdDialog.hide(settingsToSave);
        };
        $scope.restoreSettings = function () {
          $scope.newSettings = angular.copy($scope.standardSettings);
        }
      }
    };

    $scope.showDialog = function (ev, id) {
      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.querySelector(id)))
          .clickOutsideToClose(true)
          .title('Everything OK')
          .textContent('This works')
          .ariaLabel('Test Dialog')
          .ok('OK')
          .targetEvent(ev)
      );
    };


    // -------------------- demo mode -------------------

    $scope.demoService = demoService;

  });