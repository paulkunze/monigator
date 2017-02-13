/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

angular
  .module('controllers')
  .controller('SearchCtrl', function ($scope, $http, $state, $filter, searchService, severityService, dateService,
                                      toastService, switchPageService, pymonPathService, saltPathService, 
                                      patchdayPathService) {

    $scope.searchInput = searchService;
    $scope.severityService = severityService;
    $scope.switchPageService = switchPageService;
    $scope.pscChangePath = 'psc://change/';

    var search = this;

    $scope.$on('doSearch', function (event, args) {
      search.startSearch();
    });

    search.startSearch = function () {
      if ($scope.searchInput.searchTerm != null && $scope.searchInput.searchTerm != '') {
        search.getPymonData();
      }
    };

    const pymonPath = pymonPathService.pymonPath;
    const pymonEnding = pymonPathService.pymonEnding;


    // ------------------------------ Pymon -----------------------------

    search.pymonHostSearchResults = [];
    search.pymonAppSearchResults = [];

    search.getPymonData = function () {
      search.pymonHostSearchResults = [];
      search.pymonAppSearchResults = [];

      var apps = {};
      $http.get(pymonPath + '/apps' + pymonEnding, {cache: false})
        .then(function successCallback(response) {
          apps = response.data;
          var wantedApp = $scope.searchInput.searchTerm;
          for (var app in apps) {
            if (app.toLowerCase().indexOf(wantedApp.toLowerCase()) > -1) {
              for (var env in apps[app]) {
                for (host in apps[app][env]) {
                  apps[app][env][host].name = host;   // add the key (the hostname) as a value
                }
                apps[app][env].name = env;  // add the key (the environment) as a value
              }
              search.pymonAppSearchResults.push({name: app, severity: apps[app].severity, envs: apps[app]});
            }
          }
        }, function errorCallback(response) {
          console.log(response);
          toastService.showErrorToast('Fehler beim Abrufen der Pymon-Daten. Details in der Konsole.');
        });

      var hosts = {};
      $http.get(pymonPath + '/hosts' + pymonEnding, {cache: false})
        .then(function successCallback(response) {
          hosts = response.data;
          var wantedHost = $scope.searchInput.searchTerm;
          for (var host in hosts) {
            if (host.toLowerCase().indexOf(wantedHost.toLowerCase()) > -1) {
              search.pymonHostSearchResults.push({name: host, severity: hosts[host].severity});
            }
          }
          // start the patchday and salt requests after all host names are known
          search.getPatchdayForHosts();
        }, function errorCallback(response) {
          console.log(response);
          toastService.showErrorToast('Fehler beim Abrufen der Pymon-Daten. Details in der Konsole.');
        });
    };

    search.getEnvCount = function (app) {
      return Object.keys(app.envs).length - 1;  // -1 for the severity
    };

    $scope.envComparator = function (val1, val2) {
      var weights = {'Test': 0, 'Entwicklung': 1, 'Wartung': 2, 'Produktion': 3};
      if (weights[val1] < weights[val2]) {
        return -1;
      } else if (weigths[val1] > weights[val2]) {
        return 1;
      } else {  // equal
        return 0;
      }
    };

    // --------------------------- Patchday ----------------------------

    var second = 1000, minute = 60 * second, hour = 60 * minute, day = 24 * hour, week = 7 * day;
    const today = new Date();
    const from = dateService.getDateAsString(new Date(today.getTime() - 12 * week), true);
    const till = dateService.getDateAsString(new Date(today.getTime() + 12 * week), true);

    search.getPatchdayForHosts = function () {
      for (var i = 0; i < search.pymonHostSearchResults.length; i++) {    // start one request for every host
        const hostname = search.pymonHostSearchResults[i].name;
        const request = patchdayPathService.patchdayPath + '&serv=' + hostname + '&from=' + from
          + '&till=' + till;
        const pos = i;
        search.getMinionForHost(hostname, pos);   // start salt minion request

        $http.get(request)
          .then(function (response) {   // success
            // if some values are not contained, use default text
            search.pymonHostSearchResults[pos].patchday = 'kein Patch geplant';
            search.pymonHostSearchResults[pos].prevPatchday = 'kein Patch bekannt';
            search.pymonHostSearchResults[pos].change = 'unbekannt';
            search.pymonHostSearchResults[pos].slevel = 'unbekannt';
            if (response.data != 'null') {
              var days = Object.keys(response.data);
              var nextDay = days[Object.keys(response.data).length - 1];
              search.pymonHostSearchResults[pos].patchday = nextDay;
              var prevDay = days[Object.keys(response.data).length - 2];
              search.pymonHostSearchResults[pos].prevPatchday = prevDay;

              var changeNumber, supportLevel;
              for (var time in response.data[nextDay]) {  // only for getting the key, always just one entry
                changeNumber = response.data[nextDay][time][hostname].RfC;
                supportLevel = response.data[nextDay][time][hostname].SUPPORTLEVEL;
              }
              search.pymonHostSearchResults[pos].change = changeNumber;
              search.pymonHostSearchResults[pos].slevel = supportLevel;
            }
          }, function (response) {      // error
            search.pymonHostSearchResults[pos].prevPatchday = '(Fehler)';
            search.pymonHostSearchResults[pos].patchday = '(Fehler)';
            search.pymonHostSearchResults[pos].change = '(Fehler)';
            search.pymonHostSearchResults[pos].slevel = '(Fehler)';
            console.log(response);
            toastService.showErrorToast('Fehler beim Abrufen der Daten vom Patchday-Kalender. Details in der Konsole.');
          })
      }
    };

    // ----------------------------- Salt ------------------------------


    var saltHeaders = {'Authorization': 'Basic <auth-key>'};
    search.existingMinions = [];

    function getAllMinions() {
      $http.get(saltPathService.saltPath + '/minions' + saltPathService.saltEnding, {headers: saltHeaders})
        .then(function successCallback(response) {
          search.existingMinions = response.data.minions;
        }, function errorCallback(response) {
          console.log(response.data);
          toastService.showErrorToast('Fehler beim Abrufen der Salt-Daten. Details in der Konsole.');
        });
    }

    getAllMinions();  // fetch all minions on page load

    search.getMinionForHost = function (hostname, pos) {
      for (var i = 0; i < search.existingMinions.length; i++) {
        if (search.existingMinions[i].indexOf(hostname) > -1) {
          search.pymonHostSearchResults[pos].minion = search.existingMinions[i];
          search.getLastFuncForHost(search.existingMinions[i], pos);
          return;
        }
      }
      if (search.existingMinions.length === 0) {      // if no minion could be fetched
        search.pymonHostSearchResults[pos].minion = '(Fehler)';
        search.pymonHostSearchResults[pos].saltFunc = '(Fehler)';
      }
      search.pymonHostSearchResults[pos].minion = 'keiner';
      search.pymonHostSearchResults[pos].saltFunc = 'keine';
    };

    search.getLastFuncForHost = function (minionname, pos) {
      search.pymonHostSearchResults[pos].saltFunc = 'unbekannt';
      $http.get(saltPathService.saltPath + '/minion/' + minionname + '/from/' + '1472774400000'
        + saltPathService.saltEnding, {headers: saltHeaders})
        .then(function successCallback(response) {
          var jobs = response.data.results;
          var func = 'unbekannt';
          for (var job in jobs) {
            func = jobs[job].fun + ' (' + $filter('date')(jobs[job]._stamp, 'dd.MM., hh:mm:ss')
              + ')'; // only hold the last result - in the form 'func (date)'
          }
          search.pymonHostSearchResults[pos].saltFunc = func;
        }, function errorCallback(response) {
          console.log(response.data);
          search.pymonHostSearchResults[pos].saltFunc = '(Fehler)';
        });
    };


  })
  .filter('orderEnvironments', function () {      // custom sorting filter for environments
    var envComparator = function (val1, val2) {   // custom comparator for showing the important environments first
      var weights = {'Test': 0, 'Entwicklung': 1, 'Wartung': 2, 'Abnahme': 3, 'Produktion': 4};
      var weight1 = weights[val1.name], weight2 = weights[val2.name];
      if (weight1 === undefined || weight2 === undefined) {
        return 0;
      }
      if (weight1 < weight2) {
        return -1;
      } else if (weight1 > weight2) {
        return 1;
      } else {  // equal
        return 0;
      }
    };

    return function (items, field, reverse) {
      var filtered = [];
      angular.forEach(items, function (item) {    // create an array from the objects for sorting
        if (item.name != undefined) {
          filtered.push(item);
        }
      });
      filtered.sort(envComparator);               // apply the comparator
      if (reverse) filtered.reverse();
      return filtered;
    };
  });
