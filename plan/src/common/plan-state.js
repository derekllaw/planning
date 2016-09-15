//******************************************************************************
// MODULE: plan-state
// $Date: $
// $Revision: $
// $LastChangedBy: $
// DESCRIPTION:  state service for inter-module communication
//*******************************************************************************

angular.module('plan-state',[])

.factory('state',[ '$rootScope', function stateFactory($rootScope) {
  var state = {
    listOpen: false,
    listData: []
  };
  
  function stateChanged() {
    $rootScope.$broadcast('state-changed');
  }
  
  state.closeList = function() {
    state.listOpen = false;
    stateChanged();
  };
  
  state.openList = function(listData) {
    state.listData = listData;
    state.listOpen = true;
    stateChanged();
  };
  
  state.isListOpen = function() {
    return state.listOpen;
  };
  
  state.getListData = function() {
    return state.listData;
  };
  
  return state;
}]);