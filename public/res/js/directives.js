/*
 Copyright (C) 2016 Paul Kunze
 License: MIT (https://opensource.org/licenses/MIT)
 */

angular.module('directives', [])

  .directive('scrollingFab', function () {
    return {
      link: function (scope, element) {
        var content = angular.element('#content');
        var fabWasVisible = false;
        var handler = function () {
          if (content.scrollTop() > 700) {
            fabWasVisible = true;
            element.addClass('in');
            element.removeClass('out');
          } else if (fabWasVisible) {
            element.addClass('out');
            element.removeClass('in');
          }
        };
        content.on('scroll', scope.$apply.bind(scope, handler));
      }
    };
  });

