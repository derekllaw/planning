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
    showData: {}
  };
  
  function stateChanged(stateName) {
    $rootScope.$broadcast(stateName + '-state-changed');
  }
  
  function listStateChanged() {
    stateChanged('list');
  }
  
  function showStateChanged() {
    stateChanged('show');
  }
  
  state.closeList = function() {
    state.listOpen = false;
    listStateChanged();
  };
  
  state.openList = function(listData) {
    state.listData = listData;
    state.listOpen = true;
    listStateChanged();
  };
  
  state.isListOpen = function() {
    return state.listOpen;
  };
  
  state.getListData = function() {
    return state.listData;
  };
  
  state.closeShow = function() {
    state.showOpen = false;
    showStateChanged();
  };
  
  state.openShow = function(showData) {
    state.showData = showData;
    state.showOpen = true;
    showStateChanged();
  };
  
  state.isShowOpen = function() {
    return state.showOpen;
  };
  
  state.getShowData = function() {
    return state.showData;
  };
  
  return state;
}]);