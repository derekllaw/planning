//******************************************************************************
// MODULE: select
// $Date: $
// $Revision: $
// $LastChangedBy: $
// DESCRIPTION:  Select Component Controller
//*******************************************************************************

angular.module('plan.select', [])

/*******************************************************************************
 SelectCtrl controller
 
 Description:   controller for the select component.
 *******************************************************************************/
  .controller('SelectCtrl', ['model', 'state',
    function SelectController(model, state) {
      var self = this;
      
      self.count = 0;
      
      self.streetList = [];
      self.street = null;
      
      self.numberList = [];
      self.number = null;
      
      self.apptypeList = [];
      self.apptype = null;
      
      self.updateCount = function () {
        model.recordCount(self.street, self.number, self.apptype).then(
          function onSuccess(data) {
            self.count = parseInt(data);
          },
          function onError(reason) {
            console.log("Error " + reason.status + ", " + reason.statusText);
          }
        );
      };
      
      self.updateNumbers = function () {
        self.number = null;
        self.numberList = [];
        if (self.street!==null)
        {
          model.numbers(self.street, self.apptype).then(
            function onSuccess(data) {
              self.numberList = data;
              if (self.numberList.length === 1)
              {
                self.number = self.numberList[0];
              }
            },
            function onError(reason) {
              console.log("Error " + reason.status + ", " + reason.statusText);
            }
          );
        }
      };
      
      self.updateApptypes = function () {
        self.apptype = null;
        model.apptypes(self.street).then(
          function onSuccess(data) {
            self.apptypeList = data;
            if (self.apptypeList.length === 1)
            {
              self.apptype = self.apptypeList[0];
            }
          },
          function onError(reason) {
            console.log("Error " + reason.status + ", " + reason.statusText);
          }
        );
      };
      
      self.updateStreets = function () {
        self.street = null;
        model.streets(self.apptype).then(
          function onSuccess(data) {
            self.streetList = data;
            if (self.streetList.length === 1)
            {
              self.street = self.streetList[0];
            }
          },
          function onError(reason) {
            console.log("Error " + reason.status + ", " + reason.statusText);
          }
        );
      };
      
      self.reset = function () {
        self.apptype = null;
        self.street = null;
        self.updateApptypes();
        self.updateStreets();
        self.updateNumbers();
        self.updateCount();
        state.closeList();
        state.closeShow();
      };
      
      // when street updated
      self.onStreetChange = function () {
        if (self.apptype === null)
        {
          self.updateApptypes();
        }
        self.updateNumbers();
        self.updateCount();
      };
      
      // when apptype updated
      self.onApptypeChange = function () {
        if (self.street === null)
        {
          self.updateStreets();
        }
        self.updateNumbers();
        self.updateCount();
      };
      
      // when number updated, update count
      self.onNumberChange = function () {
        self.updateCount();
      };
      
      self.onResetClick = function () {
        self.reset();
      };
      
      self.onFetchClick = function () {
        model.applications(self.apptype,self.number,self.street).then(
          function onSuccess(data) {
            state.openList(data);
          },
          function onError(reason) {
            console.log("Error " + reason.status + ", " + reason.statusText);
          }
        );
      };
      
      // when starting
      self.updateApptypes();
      self.updateStreets();
      self.updateCount();
    }])
;
