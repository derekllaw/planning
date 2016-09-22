//******************************************************************************
// MODULE: show
// $Date: $
// $Revision: $
// $LastChangedBy: $
// DESCRIPTION:  Show Component Controller
//*******************************************************************************

angular.module('plan.show', [])

/*******************************************************************************
 ShowCtrl controller
 
 Description:   controller for the show component.
 *******************************************************************************/
  .controller('ShowCtrl', ['$scope', 'uiGmapIsReady', 'model', 'state',
    function ShowController($scope, uiGmapIsReady, model, state) {
      var self = this;
      
      self.app = {};
      self.details = {};
      self.mapOptions = {
        center: {
          latitude: "52.3156",
          longitude: "0.0632"
        },
        zoom: 16
      };
      self.mapMarkers = [];
      self.isAdmin = state.isAdmin();
      self.isEdit = false;
      
      // We need to refresh the map when it is ready, otherwise we will
      // end up with an broken view of the map.
      // See https://github.com/angular-ui/angular-google-maps/issues/1114
      $scope.googlemap = {};
      uiGmapIsReady.promise(1).then(
        function onGmapReady(instances) {
          instances.forEach(function (inst) {
            if ($scope.googlemap)
            {
              $scope.googlemap.refresh();
            }
          });
        });
      
      $scope.$on('state-changed', function (event, args) {
        self.isOpen = state.isShowOpen();
        if (self.isOpen)
        {
          self.isAdmin = state.isAdmin();
          self.app = state.getShowData();
          model.getApplicationDetails(self.app.id).then(
            function onSuccess(data) {
              self.details = data;
              if ((self.details.geolat !== null) && (self.details.geolng !== null))
              {
                self.mapOptions.center.latitude = self.details.geolat;
                self.mapOptions.center.longitude = self.details.geolng;
  
                self.mapMarkers.length = 0;
                self.mapMarkers.push({
                  id: self.app.id,
                  coords: {
                    latitude: self.details.geolat,
                    longitude: self.details.geolng
                  },
                  options: {labelClass: 'maplabels'}
                });
                
                $scope.googlemap.refresh();
              }
            },
            function onError(reason) {
              console.log("Error " + reason.status + ", " + reason.statusText);
            }
          );
        }
      });
      
      self.onEditClick = function() {
        self.isEdit = true;
      };
  
      self.onDeleteClick = function() {
    
      };
  
      self.onSaveClick = function() {
        self.isEdit = false;
      };
  
      self.onCancelClick = function() {
        self.isEdit = false;
      };
  
      self.isOpen = state.isShowOpen();
    }])
;
