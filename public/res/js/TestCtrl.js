/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

angular
  .module('controllers')
  .controller('TestCtrl', function ($scope, overviewService) {

    var test = this;
    
    test.code = "<h1>Hello</h1>\n<h2>editable</h2>\n<h3>inline document</h3>\n<hr>";

    test.isContentVisible = false;

    $scope.overviewService = overviewService;
    
  });