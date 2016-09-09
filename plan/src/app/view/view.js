angular.module( 'plan.view', [
  'ui.router'
])
  
  .config([ '$stateProvider', function config( $stateProvider ) {
    $stateProvider
      .state( 'view', {
        url: '/view',
        views: {
          "main": {
            controller: 'ViewCtrl',
            controllerAs: 'view',
            templateUrl: 'view/view.tpl.html'
          }
        }
      });
  }])
  
  /*******************************************************************************
   ViewCtrl controller
   
   Description:   controller for the view page.
   
   *******************************************************************************/
  .controller( 'ViewCtrl', ['$rootScope', '$window', '$stateParams', 'Restangular',
    function ViewController( $rootScope, $window, $stateParams, Restangular )
    {
      var self = this;
      
      self.streetList = [];
      self.street = "";
      
      console.log('ViewCtrl run');
  
      // test API
      Restangular.all('/').getList({ func: 'liststreets'}).then(
        function onSuccess(data) {
          self.streetList = data;
        },
        function onError(reason) {
          console.log("Error " + reason.status + ", " + reason.statusText);
        }
      );
      
    }])

;
