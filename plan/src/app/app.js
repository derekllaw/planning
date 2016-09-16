//******************************************************************************
// MODULE: app
// $Date: $
// $Revision: $
// $LastChangedBy: $
// DESCRIPTION: Application Controller
//*******************************************************************************

angular.module('plan', [
  'restangular',
  'toaster',
  'templates-app',
  'templates-common',
  'templates-layout',
  'oc.lazyLoad',
  'ui.bootstrap',
  'ngSanitize',
  'uiGmapgoogle-maps',
  
  'plan.select',
  'plan.list',
  'plan.show',
  'plan-model',
  'plan-state'
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
  
.config(['uiGmapGoogleMapApiProvider',
function (uiGmapGoogleMapApiProvider) {
  
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
}])
;
