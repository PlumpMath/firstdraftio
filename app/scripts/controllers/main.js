'use strict';

angular.module('fdApp')
.controller('MainCtrl', function ($scope, $routeParams, REST, $timeout, $location, $rootScope) {
  var tour = new Tour({
    reflex: true,
    storage: false,
    steps: [
      {
        element: "#cursor-el",
        placement: "left",
        title: "Start Writing",
        content: "Go ahead and start typing. Then hit return",
      },
      {
        element: "#text-el",
        title: "Edit-free Drafting",
        content: "You can only edit and view the last ten lines of writing. Don't worry about editing. Worry about finishing.",
        placement: "left"
      },
      {
        element: "#save-button-el",
        title: "File Commands",
        content: "Save your draft to a secure server, view your recent writing, and when you are finished, export your draft to Google Docs.",
        placement: "bottom"
      },
      {
        element: "bod",
        orphan: true,
        title: "Write Rough & Write Fast",
        content: "Hemingway put it best: first drafts are shit. Don't waste your creative energy editing unfinished crap. So don't edit, don't judge, and don't stop writing!",
        placement: "bottom"
      }
  ]});
  $scope.next = function() {
  }
  var loadTour = function() {
      tour.init();
      tour.start();
      $scope.next = function() {
        console.log('next!');
        tour.next();
      }
  }
  $scope.loadLastPage = function() {
    $scope.lastPage = "<p>Last page loading...</p>";
    $scope.saveToServer(function() {
      $rootScope.iconType = "glyphicon-refresh spin";
      REST.loadLastPage({
        alias: alias,
        current: $scope.text
      },
      function(result) {
        $rootScope.iconType = "glyphicon-floppy-disk";
        if (result == false) {
          $scope.lastPage = "Maybe you should write something first?"
        }
        else {
          console.log(result);
          $scope.lastPage = result.replace(/\u00a0/g, " ");
        }
      });
    });
  }
  $rootScope.iconType = "glyphicon-floppy-disk";
  var saveIcon = function() {
    $rootScope.iconType = "glyphicon-refresh spin";
    $timeout(function() {
      $rootScope.iconType = "glyphicon-floppy-disk";
    },1000);
  }
  $scope.emailSent = false;
  $scope.emailSend = function() {
    if (validateEmail($scope.email)) {
      REST.sendEmail({
        alias: alias,
        email: $scope.email,
      }, 
      function(result) {
        $scope.emailSent = true;
      });
    }
    else {
    }
  }
  var draftLoaded = false; 
  var alias = $routeParams.alias;
  $scope.alias = alias;
  console.log('Alias: ' + alias);
  REST.draftExists(alias, function(result) {
    console.log(result);
    if (result == "deleted") {
      window.location = "http://dev.firstdraft.io/files/" + alias + "/draft.txt";
    }
    else {
      if (!result) {
        loadTour();
      }
      else {
        REST.loadDraft(alias, function(data) {
          // load it up!
          console.log(data);
          draftLoaded = true;
          var draft = data.data[0];
          chars = draft.current;
          nRow = draft.nRow;
          nCol = draft.nCol;
          updateText();
        });
      }
    }
  });
  $scope.writing = true;
  var save = [];
  $scope.words = 1;
  $scope.fullText = '';
  $scope.text = '';
  var chars = [];
  for (var i = 0; i < 10; i++) {
    chars[i] = [];
    for (var y = 0; y < 60; y++) {
      chars[i][y] = '';
    }
  }
  var updateText = function() {
    $scope.text = '';
    $scope.words = 1;
    for (var i = 0; i < 10; i++) {
      for (var y = 0; y < 60; y++) {
        $scope.text += chars[i][y];
        if (chars[i][y] == '&nbsp;') $scope.words++;
      }
    }
  }
  updateText();
  var nRow = 0;
  var nCol = 0;
  var setKey = function(key) {
    chars[nRow][nCol] = key;
    nCol++;
    if (nCol == 58) {
      if (key == "&nbsp;") {
        newLine(false);
      }
      else {
        moveLastWord();
      }
    }
    updateText();
  }
  var moveLastWord = function() {
    var move = _.once(moveChars); 
    var temp = chars[nRow].slice(0);
    var revRow = temp.reverse();
    for (var i = 0; i < 59; i++) {
      if (revRow[i] == '&nbsp;') {
        move(60-i);
      }
    }
  }
  var moveChars = function(col) {

    var newRow = nRow + 1;
    var count = 0;
    for (var i = col; i < 58; i++) {


      var char = chars[nRow][i];

      chars[newRow][count] = char;
      chars[nRow][i] = '';
      count++; 
    }
    chars[nRow][col] = "<BR/>";
    nRow++;
    nCol = count;
    updateText();
    checkForSave();
  }
  var removeKey = function() {
    var remove = _.once(removeFromEnd);
    if (nCol != 0) {
      nCol--;
      chars[nRow][nCol] = '';
      updateText();
    }
    else if (nRow != 0) {
      nRow--;
      for (var i = 58; i >= 0; i--) {
        if (chars[nRow][i] != '') {
          remove(i);
        }
      }
    }
  }
  var removeFromEnd = function(col) {
    nCol = col + 1;
    removeKey();
    removeKey();
  }
  var newLine = function(sapply) {
    console.log(tour.getCurrentStep());
    if (tour.getCurrentStep() == 0) {
      tour.next();
    }
    if (sapply == false) {
      setKey("<BR/>");
      nRow++;
      nCol = 0;
      checkForSave();
    }
    else {
      $scope.$apply(function() {
        setKey("<BR/><p/>");
        nRow++;
        nCol = 0;
        checkForSave();
      });
    }
  }
  var autoSave = 0;
  var checkForSave = function() {
    console.log('Checking for save:' +  autoSave) ;
    if (nRow == 9) {
      autoSave++;
      save.push(_.first(chars));
      chars.splice(0,1);
      for (var i = 9; i < 10; i++) {
        chars[i] = [];
        for (var y = 0; y < 60; y++) {
          chars[i][y] = '';
        }
      }
      nRow--;
      if (autoSave >= 5) {
        autoSave = 0;
        $scope.saveToServer();
      }
    }
  }

  var keys = '`1234567890-=qwertyuiop[]asdfghjkl;zxcvbnm,./~!@#$%^*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM?'.split('');
  Mousetrap.bind(['command+l','ctrl+l'], function(e) {
    $scope.loadLastPage();
    $('#lastPage').modal("show");
    e.preventDefault();
  });
  Mousetrap.bind(['command+left','ctrl+left','command+right','ctrl+right'], function(e) {
    e.preventDefault();
  });
  Mousetrap.bind(["'"], function(e) {
    e.preventDefault();
    $scope.$apply(function() {
      setKey("'");
    });
  });
  Mousetrap.bind(['shift+option+-'], function(e) {
    e.preventDefault();
    $scope.$apply(function() {
      setKey("&mdash;");
    });
  });
  Mousetrap.bind(['ctrl+s','command+s'], function(e) {
    e.preventDefault();
    $scope.saveToServer();
  });
  Mousetrap.bind('>', function(e) {
    e.preventDefault();
    $scope.$apply(function() {
      setKey("&gt;");
    });
  });
  Mousetrap.bind('shift+7', function(e) {
    e.preventDefault();
    $scope.$apply(function() {
      setKey("&amp;");
    });
  });
  Mousetrap.bind('<', function(e) {
    e.preventDefault();
    $scope.$apply(function() {
      setKey("&lt;");
    });
  });
  Mousetrap.bind('backspace', function(e) {
    e.preventDefault();
    $scope.$apply(function() {
      removeKey();
    });
  });
  Mousetrap.bind(['space', 'shift+space'], function(e) {
    e.preventDefault();
    $scope.$apply(function() {
      setKey("&nbsp;");
    });
  });
  Mousetrap.bind('return', function(e) {
    newLine(true);
    if (e.preventDefault != undefined) {
      e.preventDefault();
    }
  });
  var setBind = function(key) {
    Mousetrap.bind(key, function() { 
      $scope.$apply(function() {
        if (key == ";") {
          setKey("&#59;");
        }
        else {
          setKey(key);
        }
      });
    });
  }
  for (var i = 0; i < keys.length; i++) {
    setBind(keys[i]);
  }
  var regex = /\s+/gi;
  $scope.cursor = '<div class="cursor"> </div>';
  $scope.finish = function() {
    Mousetrap.reset();
    $scope.fullText = '';
    $scope.words = 1;
    for (var i = 0; i < save.length; i++) {
      for (var y = 0; y < 60; y++) {
        $scope.fullText += save[i][y];
        if (save[i][y] == '&nbsp;') $scope.words++;
      }
    }
    for (var i = 0; i < chars.length; i++) {
      for (var y = 0; y < 60; y++) {
        $scope.fullText += chars[i][y];
        if (chars[i][y] == '&nbsp;') $scope.words++;
      }
    }
    var data = {
      save: $scope.fullText,
      current: [],
      nRow: 0,
      nCol: 0,
      finish: "true"
    }
    REST.saveDraft(alias, data, function(result) {
      console.log(result);
      window.location = result;
      //window.location = "http://dev.firstdraft.io/files/" + alias + "/draft.txt";
    });
  }
  $scope.saveToServer = function(cb) {
    if (cb == undefined) cb = function(){};
    $rootScope.iconType = "glyphicon-refresh spin";
    var archive = "";
    var saveCopy = [];
    for (var i = 0; i < save.length; i++) {
      saveCopy[i] = save[i].slice();
    }
    save = [];
    for (var i = 0; i < saveCopy.length; i++) {
      for (var y = 0; y < 60; y++) {
        archive += saveCopy[i][y];
      }
    }
    var data = {
      save: archive,
      current: chars,
      nRow: nRow,
      nCol: nCol
    }
    console.log(data);
    if (!draftLoaded) {
      REST.createDraft(alias, data, function(newId) {
        cb(true);
        console.log('new draft called');
        console.log(newId)
        if (newId) {
          saveIcon();
          console.log('new draft created');
          draftLoaded = true;
          $('#firstSave').modal("show");
        }
      });
    }
    else {
      REST.saveDraft(alias, data, function(result) {
        cb(true);
        saveIcon();
        console.log(result);
      });
    }
  }
  var light = true;
  $scope.toggleColors = function() {
    if (light) {
      $('body').css('background-color', 'black');
      $('.text').css('color', 'white');
      $scope.cursor = '<div class="cursorwhite"> </div>';
      light = false;
    }
    else {
      $('body').css('background-color', 'white');
      $('.text').css('color', 'black');
      $scope.cursor = '<div class="cursor"> </div>';
      light = true;
    }
  }
    
  function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  } 
});
