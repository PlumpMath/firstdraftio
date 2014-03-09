'use strict';

angular.module('fdApp')
  .controller('MainCtrl', function ($scope) {
    var rows = new Array(new Array());
    for (var i = 0; i < 10; i++) {
      for (var y = 0; y < 60; y++ {
        rows[i][y] = '';
      }
    }
    var updateText = function() {
      $scope.text = '';
      for (var i = 0; i < 10; i++) {
        for (var y = 0; y < 60; y++ {
          $scope.text += rows[i][y];
        }
      }
    }
    var nRow = 0;
    var nCol = 0;
    var charHistory = [];
    $scope.characters = 0;
    var keys = '`1234567890-=qwertyuiop[]asdfghjkl;zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM?'.split('');
    keys.push("'");
    Mousetrap.bind('>', function(e) {
      $scope.characters++;
      e.preventDefault();
      $scope.$apply(function() {
        $scope.text = $scope.text + "&gt;";
      });
    });
    Mousetrap.bind('<', function(e) {
      $scope.characters++;
      e.preventDefault();
      $scope.$apply(function() {
        $scope.text = $scope.text + "&lt;";
      });
    });
    Mousetrap.bind('backspace', function(e) {
      var deleteLine = false;
      e.preventDefault();
      $scope.$apply(function() {
        if ($scope.text[$scope.text.length-1] == ';') {
          var reverse = $scope.text.split("").reverse().join("");
          var ampPos = reverse.search('&');
          $scope.text = $scope.text.substring(0, $scope.text.length-ampPos-1);
        }
        else if ($scope.text[$scope.text.length-1] == '>') {
          console.log($scope.text.slice($scope.text.length-4, $scope.text.length));
          if ($scope.text.slice($scope.text.length-4, $scope.text.length) == "<BR>") {
            deleteLine = true;
            $scope.characters = charHistory.pop();
          }
          var reverse = $scope.text.split("").reverse().join("");
          var ampPos = reverse.search('<');
          $scope.text = $scope.text.substring(0, $scope.text.length-ampPos-1);
        }
        else {
          $scope.text = $scope.text.substring(0, $scope.text.length-1) ;
        }
        if ($scope.text.length > 0) {
          $scope.characters--;
        }
        else {
          $scope.characters = 0;
        }
      });
    });
    Mousetrap.bind(['space', 'shift+space'], function(e) {
      if ($scope.text[$scope.text.length-1] != " ") $scope.characters++;
      e.preventDefault();
      $scope.$apply(function() {
       if ($scope.text[$scope.text.length-1] != " ") $scope.text = $scope.text + " ";
       else $scope.text = $scope.text + "&nbsp;";
      });
    });
    Mousetrap.bind('return', function(e) {
      charHistory.push($scope.characters + 1);
      console.log('hit return');
      if ($scope.characters < 60) {
        $scope.characters = 60;
      }
      else {
        $scope.characters += 60 - $scope.characters%60;
      }
      if (e.preventDefault != undefined) {
        e.preventDefault();
      }
      $scope.$apply(function() {
        $scope.text = $scope.text + "<BR>";
      });
    });
    var setKey = function(key) {
      Mousetrap.bind(key, function() { 
        $scope.characters++;
        console.log(key);
        $scope.$apply(function() {
          if (key == ";") {
            $scope.text += "&#59;"
          }
          else {
            $scope.text = $scope.text + key;
          }
        });
        console.log($scope.characters%60);
        if ($scope.characters%60 == 0) {
          if ($scope.text[$scope.text.length-1] == " ") {
            $scope.characters++;
            Mousetrap.trigger('return');
          }
          else {
            var reverse = $scope.text.split("").reverse().join("");
            var ampPos = reverse.search(' '); 
            charHistory.push($scope.characters + 1);
            $scope.characters += $scope.text.slice($scope.text.length-ampPos-1).length;
            $scope.text = $scope.text.substring(0, $scope.text.length-ampPos-1) + '<BR>' + $scope.text.slice($scope.text.length-ampPos-1);
          }
        }
      });
    }
    for (var i = 0; i < keys.length; i++) {
      setKey(keys[i]);
    }
    console.log(keys);
    var regex = /\s+/gi;
    $scope.text = ""; 
    $scope.cursor = '<div class="cursor"> </div>';
    $scope.$watch('text', function(oldVal, newVal) {
      $scope.words = $scope.text.trim().replace(regex, ' ').split(' ').length;
      if ($scope.characters > 126) {
        var firstBreak = $scope.text.indexOf("\n");
        var sub = $scope.text.substring(0, firstBreak + 1);
        console.log(sub);
        $scope.text = $scope.text.slice(firstBreak + 1);
      }
    });

  });
