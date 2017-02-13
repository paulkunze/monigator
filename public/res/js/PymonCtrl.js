/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

angular
  .module('controllers')
  .controller('PymonCtrl', function ($scope, $mdMedia, $http, $location, $mdToast, severityService,
                                     toastService, pymonFilterService, pymonPathService) {

    $scope.$mdMedia = $mdMedia;
    $scope.severityService = severityService;
    $scope.filterService = pymonFilterService;

    $scope.scrollTo = function (id) {
      $('#content').animate({
        scrollTop: $('#' + id).offset().top - $('#toolbar').height()
      }, 500);
    };

    $scope.breadcrumbs = {
      hosts: 'Hosts',
      host: '',
      origin: '',
      suborigin: '',
      parameter: ''
    };

    $scope.$on('setPymonFilter', function (event, args) {
      $scope.filterService.hostFilter = '';
      switch (args){
        case 0:   // info
          $scope.filterService.showInfo = true;
          $scope.filterService.showWarning = false;
          $scope.filterService.showError = false;
          break;
        case 1:   // warning
          $scope.filterService.showInfo = false;
          $scope.filterService.showWarning = true;
          $scope.filterService.showError = false;
          break;
        case 2:   // error
          $scope.filterService.showInfo = false;
          $scope.filterService.showWarning = false;
          $scope.filterService.showError = true;
          break;
        case 3:   // unknown
          $scope.filterService.showInfo = false;
          $scope.filterService.showWarning = false;
          $scope.filterService.showError = false;
          break;
      }
    });


    // --------------------------- variables -------------------------------
    
    $scope.isEnvVisible = false;
    $scope.isProcessingVisible = false;
    
    const pymonPath = pymonPathService.pymonPath;
    const pymonEnding = pymonPathService.pymonEnding;

    var pymon = this;
    pymon.data = {status: {}, hosts: {}, host: {}, origin: {}, suborigin: {}, parameter: {}};

    pymon.isListEmpty = false;
    pymon.requestFinished = false;

    pymon.descriptions = {
      "messages_received": "Empfangene Nachrichten",
      "msgs_per_sec": "Nachrichten pro Sekunde",
      "name": "Name der Pipe",
      "num_outputs": "Anzahl Outputs",
      "process_lasttime": "Dauer zuletzt",
      "process_totaltime": "Dauer gesamt",
      "queuedepth": "Füllstand",
      "starttime": "Startzeit",
      "state": "Zustand",
      "time_per_msg": "Zeit pro Nachricht"
    };


    // ------------------------ helper methods --------------------------

    pymon.filterMatches = function (severity) {
      if (severityService.isSeverityInfo(severity) && !$scope.filterService.showInfo ||
        severityService.isSeverityWarning(severity) && !$scope.filterService.showWarning ||
        severityService.isSeverityError(severity) && !$scope.filterService.showError) {
        return false;
      } else {
        return true;
      }
    };

    pymon.getCurrentSuffix = function (limit) {
      var parts = $location.path().split('/', limit);
      var suffix = '';
      var length = parts.length;
      for (var i = 2; i < length; i++) {
        suffix += parts[i];
        if (i < length - 1) {
          suffix += '/';
        }
      }
      return suffix;
    };

    pymon.getHostName = function () {
      return pymon.getCurrentSuffix(3);
    };

    pymon.getOriginPath = function () {
      return pymon.getCurrentSuffix(4);
    };

    pymon.getSuboriginPath = function () {
      return pymon.getCurrentSuffix(5);
    };

    pymon.getParameterPath = function () {
      return pymon.getCurrentSuffix(6);
    };

    pymon.getOriginName = function () {
      return pymon.getOriginPath().split('/').slice(-1)[0];
    };

    pymon.getSuboriginName = function () {
      return pymon.getSuboriginPath().split('/').slice(-1)[0];
    };

    pymon.getParameterName = function () {
      return pymon.getParameterPath().split('/').slice(-1)[0];
    };

    pymon.getStatus = function () {
      pymon.getData('status', '/status');
    };

    pymon.getHosts = function () {
      pymon.getData('hosts', '/hosts');
      pymonFilterService.originFilter = '';
      pymonFilterService.suboriginFilter = '';
      pymonFilterService.parameterFilter = '';
    };

    pymon.getHost = function () {
      pymon.getData('host', '/host/' + pymon.getHostName());
    };

    pymon.getOrigin = function () {
      pymon.getData('origin', '/host/' + pymon.getOriginPath());
    };

    pymon.getSuborigin = function () {
      pymon.getData('suborigin', '/host/' + pymon.getSuboriginPath());
    };

    pymon.getParameter = function () {
      pymon.getData('parameter', '/host/' + pymon.getParameterPath());
    };
    
    
    // ----------------- helper methods for parameters ---------------

    $scope.getThresholdRulesString = function (original) {
      if(original == undefined || original.length == 0){
        return 'keine';
      } else{
        var result = '';
        for(var i = 0; i < original.length; i++){
          result += original[i];
          if(i < original.length - 1){
            result += ', ';
          }
        }
        return result;
      }
    };
    
    $scope.getBooleanParameterString = function (original) {
      if(original == true){
        return 'ja';
      } else if(original == false){
        return 'nein';
      }
      return original;
    };

    // ----------------------- main methods --------------------------

    pymon.updateBreadcrumbs = function () {
      $scope.breadcrumbs.host = pymon.getHostName();
      $scope.breadcrumbs.origin = pymon.getOriginName();
      $scope.breadcrumbs.suborigin = pymon.getSuboriginName();
      $scope.breadcrumbs.parameter = pymon.getParameterName();
    };

    pymon.getData = function (pos, url) {
      pymon.isListEmpty = false;  // don't show a warning/ hint before the request finished
      pymon.requestFinished = false;
      $http.get(pymonPath + url + pymonEnding, {cache: false})
        .then(function successCallback(response) {
          pymon.data = {status: {}, hosts: {}, host: {}, origin: {}, suborigin: {}, parameter: {}};
          pymon.data[pos] = response.data;
          pymon.isListEmpty = !Object.keys(response.data).length;
          pymon.requestFinished = true;
        }, function errorCallback(response) {
          console.log(response);
          toastService.showErrorToast('Fehler beim Abrufen der Pymon-Daten. Details in der Konsole.');
          pymon.requestFinished = true;
          pymon.isListEmpty = true;
        });
      pymon.updateBreadcrumbs();
    };

  });