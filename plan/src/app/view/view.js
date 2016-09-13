angular.module( 'plan.view', [])
  
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
  .controller( 'ViewCtrl', ['$q', '$rootScope', '$window', '$stateParams', 'Restangular', 'model',
    function ViewController( $q, $rootScope, $window, $stateParams, Restangular, model )
    {
      var self = this;
      
      self.count = 0;
      
      self.streetList = [];
      self.street = null;
      
      self.numberList = [];
      self.number = null;
      
      self.apptypeList = [];
      self.apptype = null;
      
      console.log('ViewCtrl run');
      
      self.updateCount = function() {
        model.recordCount(self.street,self.number,self.apptype).then(
          function onSuccess(data) {
            self.count = data;
          },
          function onError(reason) {
            console.log("Error " + reason.status + ", " + reason.statusText);
          }
        );
      };

      // when street updated, renew numberList
      self.onStreetChange = function() {
        self.number = null;
        self.updateCount();
        model.numbers(self.street).then(
          function onSuccess(data) {
            self.numberList = data;
          },
          function onError(reason) {
            console.log("Error " + reason.status + ", " + reason.statusText);
          }
        );
      };
  
      // when apptype updated, update count
      self.onApptypeChange = function() {
        self.updateCount();
      };
  
      // when number updated, update count
      self.onNumberChange = function() {
        self.updateCount();
      };
  
      var promises = [];
  
      promises.push(model.streets());
      promises.push(model.apptypes());
  
      $q.all(promises).then(
        function success(data) {
          self.streetList = data[0];
          self.apptypeList = data[1];
          // Fetch count
          self.updateCount();
        },
        function onError(reason) {
          console.log("Error " + reason.status + ", " + reason.statusText);
        }
      );
  
    }])
;
