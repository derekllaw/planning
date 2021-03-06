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
    listData: [],
    showOpen: false,
    showData: {},
    adminFlag: false
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
  
  state.closeShow = function() {
    state.showOpen = false;
    stateChanged();
  };
  
  state.openShow = function(showData) {
    state.showData = showData;
    state.showOpen = true;
    stateChanged();
  };
  
  state.isShowOpen = function() {
    return state.showOpen;
  };
  
  state.getShowData = function() {
    return state.showData;
  };

  state.setAdmin = function(flag) {
    state.adminFlag = flag;
    stateChanged();
  };
  
  state.isAdmin = function() {
    return state.adminFlag;
  };
  
  return state;
}]);