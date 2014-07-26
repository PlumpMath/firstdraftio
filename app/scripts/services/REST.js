'use strict';

angular.module('fdApp')
  .factory('REST', function ($http, $rootScope) {
    // Service logic
    // ...

    var methods = {
      createAlias: function(cb) {
        $http({
          method: 'POST', 
          data: {
            db: "alias"
          },
        url: '/rest/op/random-hash'}).
        success(function(result, status, headers, config) {
          if (result.status == "success") {
            cb(result.data);
          }
          else {
            cb("fail");
          }
        }).
        error(function(result, status, headers, config) {
          cb("fail");
        });
      },
      draftExists: function(alias, cb) {
        $http({
          method: 'POST', 
          data: {
            db: "alias",
            key: alias
          },
        url: '/rest/view/hash'}).
        success(function(result, status, headers, config) {
          console.log(result);
          if (result.status == "success") {
            if (_.isEmpty(result.data)) {
              cb(false);
            }
            else {
              cb(result.data)
            }
          }
          else {
            cb(false);
          }
        }).
        error(function(result, status, headers, config) {
          cb("fail");
        });
      },
      createDraft: function(alias, data, cb) {
        $http({
          method: 'POST', 
          data: {
            alias: alias,
            save: data.save,
            current: data.current,
            nRow: data.nRow,
            nCol: data.nCol,
          },
        url: '/rest/op/create-draft'}).
        success(function(result, status, headers, config) {
          if (result.status == "success") {
            if (_.isEmpty(result.data)) {
              cb(false);
            }
            else {
              cb(result.data)
            }
          }
          else {
            cb(false);
          }
        }).
        error(function(result, status, headers, config) {
          cb(false);
        });
      },
      saveDraft: function(alias, data, cb) {
        if (data.finish == "true") {
          $rootScope.iconType = "glyphicon-refresh spin";
        }
        $http({
          method: 'POST', 
          data: {
            alias: alias,
            save: data.save,
            current: data.current,
            nRow: data.nRow,
            nCol: data.nCol,
            finish: data.finish
          },
        url: '/rest/op/save-draft'}).
        success(function(result, status, headers, config) {
          if (data.finish == "true") {
          }
          console.log(result);
          if (result.status == "success") {
            if (_.isEmpty(result.data)) {
              cb(false);
            }
            else {
              cb(result.data)
            }
          }
          else {
            cb(false);
          }
        }).
        error(function(result, status, headers, config) {
          cb(false);
        });
      },
      loadLastPage: function(data, cb) {
        $http({
          method: 'POST', 
          data: {
            alias: data.alias, 
            current: data.current
          },
          url: '/rest/op/last-page'
        }).
        success(function(result, status, headers, config) {
          if (result.status == "success") {
            if (_.isEmpty(result.data)) {
              cb(false);
            }
            else {
              cb(result.data)
            }
          }
          else {
            cb(false);
          }
        }).
        error(function(result, status, headers, config) {
          cb(false);
        });
      },
      loadDraft: function(alias, cb) {
        $http({
          method: 'POST', 
          data: {
            alias: alias, 
          },
          url: '/rest/op/load-draft'
        }).
        success(function(result, status, headers, config) {
          if (result.status == "success") {
            if (_.isEmpty(result.data)) {
              cb(false);
            }
            else {
              cb(result.data)
            }
          }
          else {
            cb(false);
          }
        }).
        error(function(result, status, headers, config) {
          cb(false);
        });
      },
      sendEmail: function(data, cb) {
        $http({
          method: 'POST', 
          data: {
            alias: data.alias, 
            email: data.email
          },
          url: '/rest/op/email-notification'
        }).
        success(function(result, status, headers, config) {
          if (result.status == "success") {
            if (result.data == {}) {
              cb(false);
            }
            else {
              cb(result.data)
            }
          }
          else {
            cb(false);
          }
        }).
        error(function(result, status, headers, config) {
          cb(false);
        });
      },
    };

    // Public API here
    return {
      draftExists: function(alias, cb) {
        methods.draftExists(alias, cb);
      },
      createAlias: function (cb) {
        methods.createAlias(cb);
      },
      createDraft: function (alias, data, cb) {
        methods.createDraft(alias, data, cb);
      },
      loadDraft: function (alias, cb) {
        methods.loadDraft(alias, cb);
      },
      saveDraft: function (alias, data, cb) {
        methods.saveDraft(alias, data, cb);
      },
      loadLastPage: function (data, cb) {
        methods.loadLastPage(data, cb);
      },
      sendEmail: function (data, cb) {
        methods.sendEmail(data, cb);
      },
    };
  });
