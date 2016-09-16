//******************************************************************************
// MODULE: show
// $Date: $
// $Revision: $
// $LastChangedBy: $
// DESCRIPTION:  Show Component Controller
//*******************************************************************************

angular.module( 'plan.show', [])
  
  /*******************************************************************************
   ShowCtrl controller
   
   Description:   controller for the show component.
   *******************************************************************************/
  .controller( 'ShowCtrl', [ '$scope', 'model', 'state',
    function ShowController( $scope, model, state )
    {
      var self = this;
      
      self.app = {};
      self.details = {};
      
      $scope.$on('show-state-changed', function(event, args){
        self.isOpen = state.isShowOpen();
        if (self.isOpen)
        {
          self.app = state.getShowData();
          model.getApplicationDetails(self.app.id).then(
            function onSuccess(data) {
              self.details = data;
            },
            function onError(reason) {
              console.log("Error " + reason.status + ", " + reason.statusText);
            }
          );
        }
      });
    
      self.isOpen = state.isShowOpen();
    }])
;
