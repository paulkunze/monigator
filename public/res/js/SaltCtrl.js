/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

angular
  .module('controllers')
  .controller('SaltCtrl', function ($http, $state, $location, saltPathService, toastService, demoService) {

    var saltHeaders = {'Authorization': 'Basic <auth-key>'};

    var salt = this;
    
    salt.getSearchTermFromUrl = function () {
      if($state.includes('salt.search')) {
        var urlParts = $location.path().split('/');
        salt.selectedItem = urlParts[urlParts.length - 1];
        salt.startSaltSearch();
      }
    };

    function getDateAsTimestamp(date) {
      if (demoService.demoMode) {
        return 1472774400000;
      } else {
        return Math.floor(date.getTime() / 1000);
      }
    }

    var todayAsDate = new Date();
    var todayAsTimestamp = getDateAsTimestamp(todayAsDate);
    var singleSearch = false;

    salt.searchInput = '';
    salt.minionSearchResult = {};

    // autocomplete
    salt.queryResult = {minions: []};
    salt.selectedItem = null;
    getAllMinions();

    salt.querySearch = function (query) {
      return query ? salt.queryResult.minions.filter(createFilterFor(query)) : salt.queryResult.minions;
    };

    // Filter function for query string
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(station) {
        return (angular.lowercase(station).indexOf(lowercaseQuery) > -1);
      };
    }

    salt.startSaltSearch = function () {
      salt.minionSearchResult = {};
      if (salt.selectedItem != null) {        // if existing minion was selected
        singleSearch = true;
        searchMinion(salt.selectedItem);      // display that minion
      } else if (salt.searchInput != '') {    // if anything else was entered
        singleSearch = false;
        searchMinions();
      }
    };

    function getAllMinions() {    // for the autocomplete list
      $http.get(saltPathService.saltPath + '/minions' + saltPathService.saltEnding, {headers: saltHeaders})
        .then(function successCallback(response) {
          salt.queryResult = response.data;
        }, function errorCallback(response) {
          console.log(response.data);
          toastService.showErrorToast('Fehler beim Abrufen der Daten. Details in der Konsole.');
        });
    }

    function searchMinions() {
      $http.get(saltPathService.saltPath + '/minionquery/' + salt.searchInput + saltPathService.saltEnding,
        {headers: saltHeaders})
        .then(function successCallback(response) {
          for (var i = 0; i < response.data.minions.length; i++) {
            searchMinion(response.data.minions[i]);
          }
        }, function errorCallback(response) {
          console.log(response.data);
          toastService.showErrorToast('Fehler beim Abrufen der Daten. Details in der Konsole.');
        });
    }

    function searchMinion(name) {
      $http.get(saltPathService.saltPath + '/minion/' + name + '/from/' + todayAsTimestamp + saltPathService.saltEnding,
        {headers: saltHeaders})
        .then(function successCallback(response) {
          salt.minionSearchResult[name] = response.data.results;
        }, function errorCallback(response) {
          if(singleSearch) {    // only display one error toast
            console.log(response.data);
            toastService.showErrorToast('Fehler beim Abrufen der Daten. Details in der Konsole.');
          }
        });
    }

  });