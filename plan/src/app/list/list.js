//******************************************************************************
// MODULE: list
// $Date: $
// $Revision: $
// $LastChangedBy: $
// DESCRIPTION:  List Component Controller
//*******************************************************************************

angular.module( 'plan.list', [
  'smart-table'
])
  
  /*******************************************************************************
   ListCtrl controller
   
   Description:   controller for the list component.
   *******************************************************************************/
  .controller( 'ListCtrl', [ '$scope', 'model', 'state',
    function ListController( $scope, model, state )
    {
      var self = this;
      
      self.emptyList = [];
      self.appList = [];
      self.selected = "";
      
      self.onRowClick = function(app) {
        state.openShow(app);
      };
      
      $scope.$on('list-state-changed', function(event, args){
        self.isOpen = state.isListOpen();
        if (self.isOpen)
        {
          self.appList = state.getListData();
        }
      });
    
      self.isOpen = state.isListOpen();
    }])
;
