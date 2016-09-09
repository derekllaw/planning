//*******************************************************************************
// Project PLAN Application file
//
// (c) Fen Technology Ltd. 2015. All rights reserved.
//
// All rights reserved. Copying, compilation, modification, distribution or
// any other use whatsoever of this material is strictly prohibited except in
// accordance with a Software License Agreement.
//******************************************************************************
// MODULE:       app.js
// $Date: $
// $Revision: $
// $LastChangedBy: $
// DESCRIPTION:  
//*******************************************************************************

angular.module('plan', [
  'restangular',
  'toaster',
  'templates-app',
  'templates-common',
  'templates-layout',
  'oc.lazyLoad',
  'ui.bootstrap',
  'ui.router',
  'ngSanitize',
  'uiGmapgoogle-maps',
  
  'plan.view'
])
  
.controller('mainCtrl', ['$scope', 'Restangular',
function mainController($scope,Restangular) {
  
  $scope.setVersion = function (sessionString) {
//      session.setVersion(sessionString);
//      $scope.version = session.getVersion();
    $scope.version = sessionString;
  };
  
  // keep the copyright notice current
  $scope.copyrightYear = moment().format('YYYY');
  
}])
  
.config(['$stateProvider', '$urlRouterProvider', 'uiGmapGoogleMapApiProvider',
function ($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {
  
  // Set the default URL
  $urlRouterProvider.otherwise('view');
  
/*
  $stateProvider
    .state('plan', {
      abstract: true,
      url: "/plan",
      views: {
        "top-level": {
          templateUrl: "page.tpl.html"
        }
      }
    });
*/
  
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyCUaIqnBzxh9KI4Dw18_MYiBsrWGC_ScIE',
    libraries: 'weather,geometry,visualization'
  });
  
}])
  
.run(['Restangular', 'uiGmapGoogleMapApi',
function (Restangular, uiGmapGoogleMapApi) {
  
  uiGmapGoogleMapApi.then(function (maps) {
  });
  
  Restangular.setBaseUrl("http://planning.ballandia.co.uk/api.php");
  
  console.log('App.ps Started');
}])
;
