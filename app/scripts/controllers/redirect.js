'use strict';

angular.module('fdApp')
  .controller('RedirectCtrl', function ($scope, REST, $location) {
    REST.createAlias(function(alias) {
      console.log(alias)
      $location.path(alias);
    });
});
