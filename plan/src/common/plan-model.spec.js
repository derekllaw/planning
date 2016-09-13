//******************************************************************************
// MODULE:       plan-model
// $Date: $
// $Revision: $
// $LastChangedBy: $
// DESCRIPTION:  Test file for plan-model
//*******************************************************************************

describe('Model',function()
{
  beforeEach(function(){
    module('plan-model');
  });
  
  afterEach(function () {
    inject(function($httpBackend) {
      //These two calls will make sure that at the end of the test, all expected http calls were made
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });
  
  // factory test
  it('can get an instance of the model', inject(function(model){
    expect(model).toBeDefined();
    expect(model.streets).toBeDefined();
    expect(model.numbers).toBeDefined();
    expect(model.apptypes).toBeDefined();
    expect(model.recordCount).toBeDefined();
  }));
  
  it('should call API to list streets',inject(function($httpBackend,model) {
    var streetList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=liststreets').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { name: 'Balland Field' },
          { name: 'Berrycroft' },
          { name: 'Brickhills' }
        ], {}, ''];
      });
    
    model.streets().then(
      function onSuccess(data) {
        streetList = data;
      });
    
    $httpBackend.flush();
    expect(streetList.length).toBe(3);
    expect(streetList[2].name).toBe('Brickhills');
  }));
  
  it('should call API to list street numbers',inject(function($httpBackend,model) {
    var numberList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=listlocations&street=1').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { number: '1' },
          { number: '2A' },
          { number: 'DunRoamin' }
        ], {}, ''];
      });
    
    model.numbers({id:1}).then(
      function onSuccess(data) {
        numberList = data;
      });
    
    $httpBackend.flush();
    expect(numberList.length).toBe(3);
    expect(numberList[1].number).toBe('2A');
  }));
  
  it('should call API to list apptypes',inject(function($httpBackend,model) {
    var apptypeList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=listapptypes').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { label: 'dwelling' },
          { label: 'extension' },
          { label: 'development' }
        ], {}, ''];
      });
    
    model.apptypes().then(
      function onSuccess(data) {
        apptypeList = data;
      });
    
    $httpBackend.flush();
    expect(apptypeList.length).toBe(3);
    expect(apptypeList[1].label).toBe('extension');
  }));
  
  it('should call API to count records',inject(function($httpBackend,model) {
    var result = 0;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=count').respond(
      function (method, url, data, headers, params) {
        return [200, { NumberOfRecords: 921 }, {}, ''];
      });
    
    model.recordCount(null,null,null).then(
      function onSuccess(data) {
        result = data;
      }
    );
    
    $httpBackend.flush();
    expect(result).toBe(921);
  }));
  
  it('should call API to count records in a street',inject(function($httpBackend,model) {
    var result = 0;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=count&street=1').respond(
      function (method, url, data, headers, params) {
        return [200, { NumberOfRecords: 21 }, {}, ''];
      });
    
    model.recordCount({id:1},null,null).then(
      function onSuccess(data) {
        result = data;
      }
    );
    
    $httpBackend.flush();
    expect(result).toBe(21);
  }));
  
  it('should call API to count records for a type',inject(function($httpBackend,model) {
    var result = 0;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=count&apptype=3').respond(
      function (method, url, data, headers, params) {
        return [200, { NumberOfRecords: 51 }, {}, ''];
      });
    
    model.recordCount(null,null,{id:3}).then(
      function onSuccess(data) {
        result = data;
      }
    );
    
    $httpBackend.flush();
    expect(result).toBe(51);
  }));
  
  it('should call API to count records for a type in a street',inject(function($httpBackend,model) {
    var result = 0;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=count&street=1&apptype=3').respond(
      function (method, url, data, headers, params) {
        return [200, { NumberOfRecords: 5 }, {}, ''];
      });
    
    model.recordCount({id:1},null,{id:3}).then(
      function onSuccess(data) {
        result = data;
      }
    );
    
    $httpBackend.flush();
    expect(result).toBe(5);
  }));
  
  it('should call API to count records for a type at a street number',inject(function($httpBackend,model) {
    var result = 0;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=count&street=1&number=2&apptype=3').respond(
      function (method, url, data, headers, params) {
        return [200, { NumberOfRecords: 1 }, {}, ''];
      });
    
    model.recordCount({id:1},{number:2},{id:3}).then(
      function onSuccess(data) {
        result = data;
      }
    );
    
    $httpBackend.flush();
    expect(result).toBe(1);
  }));
  
});