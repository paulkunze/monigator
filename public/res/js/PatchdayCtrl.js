/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

angular
  .module('controllers')
  .controller('PatchdayCtrl', function ($location, $http, $state, $mdDialog, $scope, $mdMedia, toastService,
                                        demoService, patchdayPathService) {

    $scope.$mdMedia = $mdMedia;
    var patchday = this;

    // ------------------------------ data loading from the JSON interface -----------------------------------

    patchday.data = {json: ''};
    patchday.view = 'current';    // current, week or month
    patchday.errorOccured = false;

    patchday.loadDataForView = function () {
      var dateString;
      if ($state.includes('patchday.week.weekday')) {
        try {
          dateString = patchday.getDateStringFromUrl(true);
          patchday.getDateFromString(dateString);           // just for checking if it is a correct date
          patchday.loadDataForWeekViewForDate(dateString);
        } catch (err) {
          console.log(err);
          patchday.loadDataForWeekView();
        }
      } else if ($state.includes('patchday.week')) {
        patchday.loadDataForWeekView();
      } else if ($state.includes('patchday.month.monthday')) {
        try {
          dateString = patchday.getDateStringFromUrl(true);
          patchday.getDateFromString(dateString);           // just for checking if it is a correct date
          patchday.loadDataForMonthViewForDate(dateString);
        } catch (err) {
          patchday.loadDataForMonthView();
        }
      } else if ($state.includes('patchday.month')) {
        patchday.loadDataForMonthView();
      } else {
        patchday.loadDataForCurrentView();
      }
    };

    patchday.getDateStringFromUrl = function (fullYear) {
      var parts = $location.path().split('/');
      var dateString = parts[parts.length - 1];
      if (!fullYear && dateString.match(regExDateLongYear)) {   // remove the first two year digits if present
        var part1 = dateString.substr(0, 6);
        var part2 = dateString.substr(8, 9);
        dateString = part1 + part2;
      }
      return dateString;
    };

    patchday.loadDataForCurrentView = function () {
      loadDataForView(patchdayPathService.patchdayPath + patchday.getParametersForCurrentView(), 'current');
    };

    patchday.loadDataForWeekViewForDate = function (dateString) {
      loadDataForView(patchdayPathService.patchdayPath + patchday.getParametersForWeekViewForDate(dateString), 'week');
    };

    patchday.loadDataForWeekView = function () {
      loadDataForView(patchdayPathService.patchdayPath + patchday.getParametersForWeekView(), 'week');
    };

    patchday.loadDataForPreviousWeek = function () {
      loadDataForView(patchdayPathService.patchdayPath + patchday.getParametersForPreviousWeek(), 'week');
    };

    patchday.loadDataForNextWeek = function () {
      loadDataForView(patchdayPathService.patchdayPath + patchday.getParametersForNextWeek(), 'week');
    };

    patchday.loadDataForMonthViewForDate = function (dateString) {
      loadDataForView(patchdayPathService.patchdayPath
        + patchday.getParametersForMonthViewForDate(dateString), 'month');
    };

    patchday.loadDataForMonthView = function () {
      loadDataForView(patchdayPathService.patchdayPath + patchday.getParametersForMonthView(), 'month');
    };

    patchday.loadDataForPreviousMonth = function () {
      loadDataForView(patchdayPathService.patchdayPath + patchday.getParametersForPreviousMonth(), 'month');
    };

    patchday.loadDataForNextMonth = function () {
      loadDataForView(patchdayPathService.patchdayPath + patchday.getParametersForNextMonth(), 'month');
    };

    var loadDataForView = function (url, view) {
      if (demoService.demoMode) {
        today = new Date(1465423200000); // 09.06.16
        switch (view) {
          case 'current':
            url = 'res/demo-data/patchday/current.json';
            break;
          case 'week':
            url = 'res/demo-data/patchday/week.json';
            break;
          case 'month':
            url = 'res/demo-data/patchday/month.json';
            break;
        }
      }
      $http.get(url)
        .then(function (response) {   // success
          if (response.data != 'null') {
            patchday.errorOccured = false;
            patchday.data.json = response.data;
            patchday.view = view;
            patchday.setCaption();
          } else {
            patchday.errorOccured = true;
          }
        }, function (response) {  // error
          console.log(response);
          toastService.showErrorToast('Fehler beim Abrufen der Daten. Details in der Konsole.');
          patchday.errorOccured = true;
        })

    };

    // ---------------------------------------- variables ----------------------------------------------

    var second = 1000, minute = 60 * second, hour = 60 * minute, day = 24 * hour, week = 7 * day;
    var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    var monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September',
      'Oktober', 'November', 'Dezember'];
    var dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Heute'];
    var regExDateShortYear = /^\d{2}.\d{2}.\d{2}$/;
    var regExDateLongYear = /^\d{2}.\d{2}.\d{4}$/;
    var today = new Date();
    var displayedFirstWeekDay, displayedFirstMonthDay;  // in milliseconds


    // ------------------------------------- date calculations ------------------------------------------

    patchday.caption = 'Aktuelle Patches';
    patchday.setCaption = function () {
      if (patchday.view === 'current') {
        patchday.caption = 'Aktuelle Patches';
      } else if (patchday.view === 'week') {
        var firstDay = new Date(displayedFirstWeekDay).getDate();
        var lastDay = new Date(displayedFirstWeekDay + 6 * day).getDate();
        if (firstDay < lastDay) { // same month
          patchday.caption = 'Patches der Woche vom ' + firstDay + '. bis ' + lastDay + '. '
            + monthNames[new Date(displayedFirstWeekDay).getMonth()];
        } else {  // the week starts in another month than when it ends
          patchday.caption = 'Patches der Woche vom ' + firstDay + '. '
            + monthNames[new Date(displayedFirstWeekDay).getMonth()] + ' bis ' + lastDay + '. '
            + monthNames[new Date(displayedFirstWeekDay + 6 * day).getMonth()];
        }
      } else if (patchday.view === 'month') {
        patchday.caption = 'Patches im Monat ' + monthNames[new Date(displayedFirstMonthDay).getMonth()];
      }
    };

    patchday.getDateFromString = function (dateString) {
      if (!dateString.match(regExDateShortYear) && !dateString.match(regExDateLongYear)) {
        throw 'not a date';           // the format must be xx.xx.xx or xx.xx.xxxx
      }

      var dateParts = dateString.split(".");
      if (dateParts[2].length < 3) {                                          // if year only contains 2 digits
        var thisYearPrefix = new Date().getFullYear().toString().substr(0, 2);// get the first two digits from this year
        dateParts[2] = thisYearPrefix + dateParts[2];                         // put the digits in front
      }
      return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    };

    patchday.getDayNameFromString = function (dateString) {
      var dateArray = dateString.split('.');
      dateArray[2] = '20' + dateArray[2];   // 16 becomes 2016
      var date = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
      if (patchday.isToday(getDateAsString(date))) {
        return dayNames[7];
      } else {
        return dayNames[date.getDay()];
      }
    };

    patchday.getParametersForCurrentView = function () {
      var before2days = new Date(today.getTime() - 2 * day);
      var in2days = new Date(today.getTime() + 2 * day);
      return '&from=' + getDateAsString(before2days, true)
        + '&till=' + getDateAsString(in2days, true);
    };

    patchday.getParametersForWeekViewForDate = function (dateString) {
      var date = patchday.getDateFromString(dateString);
      var dateDay = date.getDay();
      if (dateDay == 0) {
        dateDay = 7;     // adjust when day is sunday
      }
      var mondayThisWeek = date.getTime() - (dateDay - 1) * day;
      var sundayThisWeek = date.getTime() + (7 - dateDay) * day;
      displayedFirstWeekDay = mondayThisWeek;
      return '&from=' + getDateAsString(new Date(mondayThisWeek), true)
        + '&till=' + getDateAsString(new Date(sundayThisWeek), true);
    };

    patchday.getParametersForWeekView = function () {
      var mondayThisWeek = today.getTime() - (today.getDay() - 1) * day;
      var sundayThisWeek = today.getTime() + (7 - today.getDay()) * day;
      displayedFirstWeekDay = mondayThisWeek;
      return '&from=' + getDateAsString(new Date(mondayThisWeek), true)
        + '&till=' + getDateAsString(new Date(sundayThisWeek), true);
    };

    patchday.getParametersForPreviousWeek = function () {
      var mondayBefore = displayedFirstWeekDay - week;
      var sundayBefore = mondayBefore + 6 * day;
      displayedFirstWeekDay = mondayBefore;
      return '&from=' + getDateAsString(new Date(mondayBefore), true)
        + '&till=' + getDateAsString(new Date(sundayBefore), true);
    };

    patchday.getParametersForNextWeek = function () {
      var mondayAfter = displayedFirstWeekDay + week;
      var sundayAfter = mondayAfter + 6 * day;
      displayedFirstWeekDay = mondayAfter;
      return '&from=' + getDateAsString(new Date(mondayAfter), true)
        + '&till=' + getDateAsString(new Date(sundayAfter), true);
    };

    patchday.getParametersForMonthViewForDate = function (dateString) {
      var date = patchday.getDateFromString(dateString);
      var firstMonthDay = new Date().setFullYear(date.getFullYear(), date.getMonth(), 1);
      var lastMonthDay = new Date().setFullYear(date.getFullYear(), date.getMonth() + 1, 0);
      displayedFirstMonthDay = firstMonthDay;
      return '&from=' + getDateAsString(new Date(firstMonthDay), true)
        + '&till=' + getDateAsString(new Date(lastMonthDay), true);
    };

    patchday.getParametersForMonthView = function () {
      var firstMonthDay = new Date().setFullYear(today.getFullYear(), today.getMonth(), 1);
      var lastMonthDay = new Date().setFullYear(today.getFullYear(), today.getMonth() + 1, 0);
      displayedFirstMonthDay = firstMonthDay;
      return '&from=' + getDateAsString(new Date(firstMonthDay), true)
        + '&till=' + getDateAsString(new Date(lastMonthDay), true);
    };

    patchday.getParametersForPreviousMonth = function () {
      var monthDayAsDate = new Date(displayedFirstMonthDay);
      var firstMonthDayBefore = new Date().setFullYear(monthDayAsDate.getFullYear(), monthDayAsDate.getMonth() - 1, 1);
      var lastMonthDayBefore = new Date().setFullYear(monthDayAsDate.getFullYear(), monthDayAsDate.getMonth(), 0);
      displayedFirstMonthDay = firstMonthDayBefore;
      return '&from=' + getDateAsString(new Date(firstMonthDayBefore), true)
        + '&till=' + getDateAsString(new Date(lastMonthDayBefore), true);
    };

    patchday.getParametersForNextMonth = function () {
      var monthDayAsDate = new Date(displayedFirstMonthDay);
      var firstMonthDayAfter = new Date().setFullYear(monthDayAsDate.getFullYear(), monthDayAsDate.getMonth() + 1, 1);
      var lastMonthDayAfter = new Date().setFullYear(monthDayAsDate.getFullYear(), monthDayAsDate.getMonth() + 2, 0);
      displayedFirstMonthDay = firstMonthDayAfter;
      return '&from=' + getDateAsString(new Date(firstMonthDayAfter), true)
        + '&till=' + getDateAsString(new Date(lastMonthDayAfter), true);
    };

    var getDateAsString = function (date, fullYear) {
      var day = date.getDate();
      if (day < 10) {
        day = '0' + day;
      }
      var month = months[date.getMonth()];
      var year;
      if (fullYear) {
        year = date.getFullYear();                            // returns 15.09.2016
      } else {
        year = date.getFullYear().toString().substr(2, 2);    // returns 15.09.16
      }
      return day + '.' + month + '.' + year;
    };


    var getTodayAsString = function () {
      return getDateAsString(today, false);
    };

    patchday.isToday = function (dateString) {
      return dateString === getTodayAsString();
    };

    patchday.isInUrl = function (dateString) {
      return dateString === patchday.getDateStringFromUrl(false);
    };


    // ----------------------------------- helpers for filtering ----------------------------------------

    patchday.searchTerm = '';

    patchday.hasMatchesForHour = function (servers) {
      for (var server in servers) {
        if (server.indexOf(patchday.searchTerm) > -1) {
          return true;
        }
      }
      return false;
    };

    patchday.hasMatchesForCard = function (hours) {
      for (var hour in hours) {
        if (patchday.hasMatchesForHour(hours[hour]))
          return true;
      }
      return false;
    };


    // ------------------------------------ dialog for details -----------------------------------------

    patchday.showCommentsDialog = function ($event, server, content) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        templateUrl: 'partials/DialogComments.html',
        clickOutsideToClose: true,
        locals: {
          server: $scope.server,
          content: $scope.content
        },
        controller: DialogController
      });

      function DialogController($scope, $mdDialog) {
        $scope.server = server;
        $scope.content = content;
        $scope.closeDialog = function () {
          $mdDialog.hide();
        }
      }
    };

  });