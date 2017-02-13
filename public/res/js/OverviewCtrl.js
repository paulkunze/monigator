/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

angular
  .module('controllers')
  .controller('OverviewCtrl', function ($scope, overviewService, $interval, switchPageService, severityService) {

    $scope.overviewService = overviewService;
    $scope.severityService = severityService;


    // fetch the data every 2 minutes
    overviewService.getPymonHostData();
    var dataInterval = $interval(function () {
      overviewService.getPymonHostData();
    }, 120000); // 2 minutes

    $scope.selectHostChartItem = function (selectedItem) {
      // 0 = info, 1 = warning, 2 = error, 3 = unknown
      switchPageService.goToPymonHosts(selectedItem.row);
    };

    var previousChartItem;

    $scope.selectApplicationChartItem = function (selectedItem) {
      // 0 = info, 1 = warning, 2 = error, 3 = unknown
      if(selectedItem == undefined){    // when unselecting, selectedItem is undefined -> get the item that was selected
        selectedItem = previousChartItem;
      }else {
        previousChartItem = selectedItem;
      }
      switch (selectedItem.row) {
        case 0:
          overviewService.pymonAppsFilter.info = true;
          overviewService.pymonAppsFilter.warning = false;
          overviewService.pymonAppsFilter.error = false;
          overviewService.pymonAppsFilter.unknown = false;
          break;
        case 1:
          overviewService.pymonAppsFilter.info = false;
          overviewService.pymonAppsFilter.warning = true;
          overviewService.pymonAppsFilter.error = false;
          overviewService.pymonAppsFilter.unknown = false;
          break;
        case 2:
          overviewService.pymonAppsFilter.info = false;
          overviewService.pymonAppsFilter.warning = false;
          overviewService.pymonAppsFilter.error = true;
          overviewService.pymonAppsFilter.unknown = false;
          break;
        case 3:
          overviewService.pymonAppsFilter.info = false;
          overviewService.pymonAppsFilter.warning = false;
          overviewService.pymonAppsFilter.error = false;
          overviewService.pymonAppsFilter.unknown = true;
          break;
      }
    };


    // ------------------- quotes ---------------------

    var motivationQuotes = [
      ['The best preparation for good work tomorrow is to do good work today.', 'Elbert Hubbard'],
      ['The beginning is the most important part of the work.', 'Plato'],
      ['Working hard and working smart sometimes can be two different things.', 'Byron Dorgan'],
      ['Nothing will work unless you do.', 'Maya Angelou'],
      ['What you are will show in what you do.', 'Thomas A. Edison'],
      ['When your work speaks for itself, don\'t interrupt.', 'Henry J. Kaiser'],
      ['It always seems impossible until it\'s done.', 'Nelson Mandela'],
      ['What you do today can improve all your tomorrows.', 'Ralph Marston'],
      ['Life is 10% what happens to you and 90% how you react to it.', 'Charles R. Swindoll'],
      ['Either you run the day or the day runs you.', 'Jim Rohn'],
      ['Act as if what you do makes a difference. It does.', 'William James'],
      ['Action is the foundational key to all success.', 'Pablo Picasso'],
      ['Once you replace negative thoughts with positive ones, you\'ll start having positive results.', 'Willie Nelson'],
      ['Every day brings new choices.', 'Martha Beck']];

    // display a new random quote every 16 minutes
    $scope.quote = motivationQuotes[Math.floor((Math.random() * motivationQuotes.length))];
    var quoteInterval = $interval(function () {
      $scope.quote = motivationQuotes[Math.floor((Math.random() * motivationQuotes.length))];
    }, 960000); // 16 minutes

    $scope.$on('$destroy', function () {    // stop the intervals when leaving the overview page
      $interval.cancel(dataInterval);
      $interval.cancel(quoteInterval);
    });

  });