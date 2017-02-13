/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

angular.module('charts', ['googlechart'])
  .controller('ChartCtrl', function ($scope, overviewService) {

    var generalOptions = {
      //colors: ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6']
      fontName: 'Roboto',
      width: '100%',
      height: 300,
      legend: {position: 'none'},
      vAxis: {textPosition: 'none'},
      hAxis: {textPosition: 'none'},
      chartArea: {height: "100%", width: "100%"},
      displayExactValues: true
    };

    var generalFormatters = {
      number: [{
        columnNum: 1,
        pattern: "$ #,##0.00"
      }]
    };


    //----------------------- charts for the dashboard -----------------------------
    

    // chart for pymon application data
    var pymonApplicationChart = {};
    pymonApplicationChart.type = "PieChart";
    pymonApplicationChart.data = overviewService.pymonAppsChartData;
    pymonApplicationChart.options = $.extend({}, generalOptions);  // copy object
    $.extend(pymonApplicationChart.options, {
      chartArea: {height: "92%", width: "92%"},  // avoid cutting the circles on hovering
      // material colors: light green 300, amber 300, deep orange 300, grey 300
      colors: ['#AED581', '#FFD54F', '#FF8A65', '#E0E0E0'],
      fontSize: 14,
      pieSliceText: 'value',
      pieSliceTextStyle: {
        fontSize: 18,
        color: 'black'
      },
      pieSliceBorderColor: 'transparent'
    });
    // add the chart to the scope
    $scope.applicationChart = pymonApplicationChart;


    // chart for pymon host data
    var pymonHostChart = {};
    pymonHostChart.type = "PieChart";
    pymonHostChart.data = overviewService.pymonHostChartData;
    pymonHostChart.options = $.extend({}, generalOptions);  // copy object
    $.extend(pymonHostChart.options, {
      chartArea: {height: "92%", width: "92%"},  // avoid cutting the circles on hovering
      // material colors: light green 300, amber 300, deep orange 300, grey 300
      colors: ['#AED581', '#FFD54F', '#FF8A65', '#E0E0E0'],
      fontSize: 14,
      pieSliceText: 'value',
      pieSliceTextStyle: {
        fontSize: 18,
        color: 'black'
      },
      pieSliceBorderColor: 'transparent'
    });
    // add the chart to the scope
    $scope.hostChart = pymonHostChart;


    //----------------------------- dummy charts ---------------------------------

    var dummyData = [
      ['Component', 'cost'],
      ['Software', 50000],
      ['Hardware', 80000],
      ['Services', 20000]
    ];
    
    var pieChart = {};
    pieChart.type = "PieChart";
    pieChart.data = dummyData.slice();  // copy array
    pieChart.options = $.extend({}, generalOptions);  // copy object
    $.extend(pieChart.options, {
      chartArea: {height: "92%", width: "92%"}  // avoid cutting the circles on hovering
    });
    pieChart.formatters = $.extend({}, generalFormatters);
    $scope.pieChart = pieChart;


    var lineChart = {};
    lineChart.type = "LineChart";
    lineChart.data = dummyData.slice();
    lineChart.options = $.extend({}, generalOptions);
    lineChart.formatters = $.extend({}, generalFormatters);
    $scope.lineChart = lineChart;


    var barChart = {};
    barChart.type = "BarChart";
    barChart.data = dummyData.slice();
    barChart.options = $.extend({}, generalOptions);
    barChart.formatters = $.extend({}, generalFormatters);
    $scope.barChart = barChart;


    var areaChart = {};
    areaChart.type = "AreaChart";
    areaChart.data = dummyData.slice();
    areaChart.options = $.extend({}, generalOptions);
    $.extend(areaChart.options, {
      chartArea: {height: "100%", width: "95%"}  // avoid cutting the circles on hovering
    });
    areaChart.formatters = $.extend({}, generalFormatters);
    $scope.areaChart = areaChart;


    var columnChart = {};
    columnChart.type = "ColumnChart";
    columnChart.data = dummyData.slice();
    columnChart.options = $.extend({}, generalOptions);
    columnChart.formatters = $.extend({}, generalFormatters);
    $scope.columnChart = columnChart;


    var scatterChart = {};
    scatterChart.type = "ScatterChart";
    scatterChart.data = dummyData.slice();
    scatterChart.options = $.extend({}, generalOptions);
    scatterChart.formatters = $.extend({}, generalFormatters);
    $scope.scatterChart = scatterChart;


    var steppedAreaChart = {};
    steppedAreaChart.type = "SteppedAreaChart";
    steppedAreaChart.data = dummyData.slice();
    steppedAreaChart.options = $.extend({}, generalOptions);
    steppedAreaChart.formatters = $.extend({}, generalFormatters);
    $scope.steppedAreaChart = steppedAreaChart;


    var donutChart = {};
    donutChart.type = "PieChart";
    donutChart.data = dummyData.slice();
    donutChart.options = $.extend({}, generalOptions);
    $.extend(donutChart.options, {
      chartArea: {height: "92%", width: "92%"},  // avoid cutting the circles on hovering
      pieHole: 0.4
    });
    donutChart.formatters = $.extend({}, generalFormatters);
    $scope.donutChart = donutChart;

  });
