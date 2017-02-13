/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

angular.module('services', [])

  .service('settingsService', function ($cookies) {
    var service = this;

    service.standardSettings = {
      showEnvsChart: true, showEnvsList: true, showHostsChart: true, showHostsList: true,
      showQmgrList: true, showPatchList: true, showQuote: false,
      showPymonInfo: false, showPymonWarning: true, showPymonError: true, listMaxHeight: 340
    };

    service.saveSettings = function (newSettings) {
      service.settings = angular.copy(newSettings);
      $cookies.putObject('settings', service.settings);
    };

    service.settings = $cookies.getObject('settings');
    if (service.settings === undefined) {
      service.saveSettings(service.standardSettings);
    }
    
  })
  .service('severityService', function () {
    this.getSeverityString = function (severity) {
      if (this.isSeverityInfo(severity)) {
        return 'info';
      } else if (this.isSeverityWarning(severity)) {
        return 'warning';
      } else if (this.isSeverityError(severity)) {
        return 'error';
      } else {
        return 'unbekannt'
      }
    };

    this.isSeverityInfo = function (severity) {
      if (severity == undefined) {
        return false;
      }
      var severityString = severity.toString().toLowerCase();
      return severityString == '10' || severityString == 'info';
    };

    this.isSeverityWarning = function (severity) {
      if (severity == undefined) {
        return false;
      }
      var severityString = severity.toString().toLowerCase();
      return severityString == '20' || severityString == 'warn' || severityString == 'warning';
    };

    this.isSeverityError = function (severity) {
      if (severity == undefined) {
        return false;
      }
      var severityString = severity.toString().toLowerCase();
      return severityString == '30' || severityString == 'error' || severityString == 'critical'
        || severityString == 'fatal';
    };

    this.isSeverityNone = function (severity) {
      if (severity == undefined) {
        return true;
      }
      var severityString = severity.toString().toLowerCase();
      return severityString == '0' || severityString == 'none';
    };
  })

  .service('searchService', function () {
    this.searchTerm = '';
  })

  .service('switchPageService', function ($state, $rootScope) {

    this.goToPymonHosts = function (status) {
      $state.go('pymon').then(function () {
        $rootScope.$broadcast('setPymonFilter', status);
      })
    };

    this.goToPymonHost = function (hostname) {
      $state.go('pymon.host', {hname: hostname});
    };

    this.goToPatchday = function (dateString) {
      $state.go('patchday.week.weekday', {weekday: dateString});
    };

    this.goToSalt = function (input) {
      $state.go('salt.search', {term: input});
    }
  })

  .service('pymonPathService', function (demoService) {
    if (demoService.demoMode) {
      this.pymonPath = 'res/demo-data/pymon';
      this.pymonEnding = '.json';
    } else {
      this.pymonPath = 'http://own-server.url:8001/pymon-server.url';   // redirect through own server (for CORS)
      this.pymonEnding = '';
    }
  })

  .service('patchdayPathService', function (demoService) {
    if (demoService.demoMode) {
      this.patchdayPath = 'res/demo-data/patchday/day.json';
    } else {
      this.patchdayPath = 'http://own-server.url:8001/patchday-server.url';
    }
  })

  .service('saltPathService', function (demoService) {
    if (demoService.demoMode) {
      this.saltPath = 'res/demo-data/salt';
      this.saltEnding = '.json';
    } else {
      this.saltPath = 'http://own-server.url:8001/salt-server.url';
      this.saltEnding = '';
    }
  })

  .service('overviewService', function (toastService, severityService, pymonPathService, patchdayPathService,
                                        $http, $q) {
    var service = this;
    service.pymonAppsChartData = [['Host Status', 'Anzahl'], ['Info', 0], ['Warning', 0], ['Error', 0], ['Unknown', 0]];
    service.pymonHostChartData = [['Host Status', 'Anzahl'], ['Info', 0], ['Warning', 0], ['Error', 0], ['Unknown', 0]];
    service.isListEmpty = false;
    service.errorOccured = false;
    service.errorHosts = [];
    service.unavailableQmgrHosts = [];
    service.pymonApps = [];
    service.pymonAppsFilter = {'info': true, 'warning': true, 'error': true, 'unknown': true};
    service.isQmgrListEmpty = false;
    const pymonPath = pymonPathService.pymonPath;
    const pymonEnding = pymonPathService.pymonEnding;

    service.patches = {};
    service.isPatchPlanned = function () {
      return (service.patches != undefined) && (service.patches != 'null') &&
        Object.keys(service.patches).length > 0;
    };

    this.getPymonHostData = function () {
      var infoAppsCount = 0, warningAppsCount = 0, errorAppsCount = 0, unknownAppsCount = 0;
      var infoHostCount = 0, warningHostCount = 0, errorHostCount = 0, unknownHostCount = 0;

      $http.get(pymonPath + '/apps' + pymonEnding, {cache: false})
        .then(function successCallback(response) {
          service.isListEmpty = !Object.keys(response.data).length;
          if (!service.isListEmpty) {
            service.pymonApps = [];
            for (var app in response.data) {
              service.pymonApps.push({name: app, severity: response.data[app].severity});
              if (severityService.isSeverityInfo(response.data[app].severity)) {
                infoAppsCount++;
              } else if (severityService.isSeverityWarning(response.data[app].severity)) {
                warningAppsCount++;
              } else if (severityService.isSeverityError(response.data[app].severity)) {
                errorAppsCount++;
              } else {
                unknownAppsCount++;
              }
            }
            service.pymonAppsChartData[1][1] = infoAppsCount;
            service.pymonAppsChartData[2][1] = warningAppsCount;
            service.pymonAppsChartData[3][1] = errorAppsCount;
            service.pymonAppsChartData[4][1] = unknownAppsCount;
          }
        }, function errorCallback(response) {
          console.log(response);
          service.errorOccured = true;
        });

      $http.get(pymonPath + '/hosts' + pymonEnding, {cache: false})
        .then(function successCallback(response) {
          service.isListEmpty = !Object.keys(response.data).length;
          if (!service.isListEmpty) {
            service.errorHosts = [];
            for (var host in response.data) {
              if (severityService.isSeverityInfo(response.data[host].severity)) {
                infoHostCount++;
              } else if (severityService.isSeverityWarning(response.data[host].severity)) {
                warningHostCount++;
              } else if (severityService.isSeverityError(response.data[host].severity)) {
                errorHostCount++;
                service.errorHosts.push(host);
              } else {
                unknownHostCount++;
              }
            }
            service.pymonHostChartData[1][1] = infoHostCount;
            service.pymonHostChartData[2][1] = warningHostCount;
            service.pymonHostChartData[3][1] = errorHostCount;
            service.pymonHostChartData[4][1] = unknownHostCount;

            if (errorHostCount > 0) {
              var errHosts = service.errorHosts;
              var promises = [];
              var foundHosts = [];
              for (var pos = 0; pos < errHosts.length; pos++) {   // collect all requests and host names
                const errHost = errHosts[pos];
                promises.push($http.get(pymonPath + '/host/' + errHost + pymonEnding, {cache: false}));
                foundHosts.push(errHost);
              }
              $q.all(promises).then(function (arrayOfResults) {   // start the requests and update the list after that
                service.unavailableQmgrHosts = [];
                for (var i = 0; i < arrayOfResults.length; i++) {
                  var result = arrayOfResults[i].data;
                  var eHost = foundHosts[i];
                  for (var qmgr in result) {
                    var qmgrObject = result[qmgr];
                    if (qmgrObject[qmgr] != undefined) {   // if origin == hostname -> could be qmgr error
                      if (severityService.isSeverityError(qmgrObject[qmgr].severity)) {  // if the qmgr is the problem
                        service.unavailableQmgrHosts.push(qmgr + ' @ ' + eHost);
                      }
                    }
                  }
                }
                service.isQmgrListEmpty = service.unavailableQmgrHosts.length == 0;
              })
            } else {
              service.unavailableQmgrHosts = [];  // remove qmgr errors if no error is present at all
            }
          }
          service.errorOccured = false;
        }, function errorCallback(response) {
          console.log(response);
          service.isListEmpty = true;
          service.isQmgrListEmpty = true;
          service.errorOccured = true;
          toastService.showErrorToast('Fehler beim Abrufen der Pymon-Daten. Details in der Konsole.');
        });

      // ------------------- patches --------------------

      $http.get(patchdayPathService.patchdayPath)
        .then(function (response) {   // success
          service.patches = response.data;
        }, function (response) {  // error
          console.log(response);
          toastService.showErrorToast('Fehler beim Abrufen der Patchday-Daten. Details in der Konsole.');
        });
    };
  })

  .service('dateService', function () {
    var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    this.getDateAsString = function (date, fullYear) {
      var day = date.getDate();
      if (day < 10) {
        day = '0' + day;
      }
      var month = months[date.getMonth()];
      var year;
      if (fullYear) {
        year = date.getFullYear();                            // e.g. returns 15.09.2016
      } else {
        year = date.getFullYear().toString().substr(2, 2);    // e.g. returns 15.09.16
      }
      return day + '.' + month + '.' + year;
    };
  })

  .service('pymonFilterService', function (settingsService) {
    var service = this;
    service.hostFilter = '';
    service.originFilter = '';
    service.suboriginFilter = '';
    service.parameterFilter = '';

    service.showInfo = settingsService.settings.showPymonInfo;
    service.showWarning = settingsService.settings.showPymonWarning;
    service.showError = settingsService.settings.showPymonError;
  })

  .service('toastService', function ($mdToast) {
    this.showErrorToast = function (message) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('bottom right')
          .hideDelay(3000)
      );
    }
  })

  .service('demoService', function () {
    this.demoMode = true;
  });
