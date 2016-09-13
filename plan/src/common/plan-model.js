angular.module('plan-model',['restangular'])

.factory('model',['$q', 'Restangular', function($q,Restangular) {
  var model = {};
  
  /*******************************************************************************
   model::streets
   
   Description:   Return list of street records
   Params:        none
   Returns:       promise which resolves to array of streets, or rejects with reason
   *******************************************************************************/
  model.streets = function() {
    return Restangular.all('/').getList({ func: 'liststreets'});
  };
  
  /*******************************************************************************
   model::numbers
   
   Description:   Return list of number records for given street
   Params:        street record
   Returns:       promise which resolves to array of numbers, or rejects with reason
   *******************************************************************************/
  model.numbers = function(street) {
    return Restangular.all('/').getList({ func: 'listlocations', street: street.id });
  };
  
  /*******************************************************************************
   model::apptypes
   
   Description:   Return list of apptype records
   Params:        none
   Returns:       promise which resolves to array of apptypes, or rejects with reason
   *******************************************************************************/
  model.apptypes = function() {
    return Restangular.all('/').getList({ func: 'listapptypes' });
  };
  
  /*******************************************************************************
   model::recordCount
   
   Description:   Return count of records which match parameters
   Params:        street - street record, or null
                  number - number record, or null
                  apptype - apptype record, or null
   Returns:       promise which resolves to count of records, or rejects with reason
   *******************************************************************************/
  model.recordCount = function(street,number,apptype) {
    var deferred = $q.defer();
    var params = { func: 'count' };

    if (street!==null)
    {
      params.street = street.id;
    }
  
    if (number!==null)
    {
      params.number = number.number;
    }
  
    if (apptype!==null)
    {
      params.apptype = apptype.id;
    }
  
    Restangular.one('/').get(params).then(
      function onSuccess(data) {
        deferred.resolve(data.NumberOfRecords);
      },
      function onError(reason) {
        deferred.reject(reason);
      }
    );

    return deferred.promise;
  };
  
  return model;
}]);