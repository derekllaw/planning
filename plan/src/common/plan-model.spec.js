//******************************************************************************
// MODULE: plan-model
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
    expect(model.applications).toBeDefined();
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
    
    model.streets(null).then(
      function onSuccess(data) {
        streetList = data;
      });
    
    $httpBackend.flush();
    expect(streetList.length).toBe(3);
    expect(streetList[2].name).toBe('Brickhills');
  }));
  
  it('should call API to list streets for an apptype',inject(function($httpBackend,model) {
    var streetList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?apptype=1&func=liststreets').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { name: 'Balland Field' },
          { name: 'Brickhills' }
        ], {}, ''];
      });
    
    model.streets({id:1}).then(
      function onSuccess(data) {
        streetList = data;
      });
    
    $httpBackend.flush();
    expect(streetList.length).toBe(2);
    expect(streetList[1].name).toBe('Brickhills');
  }));
  
  it('should call API to list numbers for a street',inject(function($httpBackend,model) {
    var numberList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=listnumbers&street=1').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { number: '1' },
          { number: '2A' },
          { number: 'DunRoamin' }
        ], {}, ''];
      });
    
    model.numbers({id:1},null).then(
      function onSuccess(data) {
        numberList = data;
      });
    
    $httpBackend.flush();
    expect(numberList.length).toBe(3);
    expect(numberList[1].number).toBe('2A');
  }));
  
  it('should call API to list numbers for a street and type',inject(function($httpBackend,model) {
    var numberList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?apptype=2&func=listnumbers&street=1').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { number: '1' },
          { number: 'DunRoamin' }
        ], {}, ''];
      });
    
    model.numbers({id:1},{id:2}).then(
      function onSuccess(data) {
        numberList = data;
      });
    
    $httpBackend.flush();
    expect(numberList.length).toBe(2);
    expect(numberList[0].number).toBe('1');
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
    
    model.apptypes(null).then(
      function onSuccess(data) {
        apptypeList = data;
      });
    
    $httpBackend.flush();
    expect(apptypeList.length).toBe(3);
    expect(apptypeList[1].label).toBe('extension');
  }));
  
  it('should call API to list apptypes for given street',inject(function($httpBackend,model) {
    var apptypeList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=listapptypes&street=1').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { label: 'dwelling' },
          { label: 'extension' }
        ], {}, ''];
      });
    
    model.apptypes({id:1}).then(
      function onSuccess(data) {
        apptypeList = data;
      });
    
    $httpBackend.flush();
    expect(apptypeList.length).toBe(2);
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
  
  it('should call API to list applications',inject(function($httpBackend,model) {
    var appList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=list').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { id:"4", code:"S\/0691\/00\/F", number:"14", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"},
          { id:"5", code:"S\/0692\/00\/F", number:"15", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"},
          { id:"6", code:"S\/0693\/00\/F", number:"16", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"},
          { id:"7", code:"S\/0695\/00\/F", number:"19", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"}
        ], {}, ''];
      });
    
    model.applications(null,null,null).then(
      function onSuccess(data) {
        appList = data;
      });
    
    $httpBackend.flush();
    expect(appList.length).toBe(4);
    expect(appList[1].label).toBe('Extension');
  }));
  
  it('should call API to list applications',inject(function($httpBackend,model) {
    var appList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=list').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { id:"4", code:"S\/0691\/00\/F", number:"14", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"},
          { id:"5", code:"S\/0692\/00\/F", number:"15", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"},
          { id:"6", code:"S\/0693\/00\/F", number:"16", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"},
          { id:"7", code:"S\/0695\/00\/F", number:"19", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"}
        ], {}, ''];
      });
    
    model.applications(null,null,null).then(
      function onSuccess(data) {
        appList = data;
      });
    
    $httpBackend.flush();
    expect(appList.length).toBe(4);
    expect(appList[1].label).toBe('Extension');
  }));
  
  it('should call API to list applications by street',inject(function($httpBackend,model) {
    var appList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=list&street=1').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { id:"6", code:"S\/0693\/00\/F", number:"16", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"},
          { id:"7", code:"S\/0695\/00\/F", number:"19", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"}
        ], {}, ''];
      });
    
    model.applications(null,null,{id:1}).then(
      function onSuccess(data) {
        appList = data;
      });
    
    $httpBackend.flush();
    expect(appList.length).toBe(2);
    expect(appList[1].label).toBe('Extension');
  }));
  
  it('should call API to list applications by location',inject(function($httpBackend,model) {
    var appList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?func=list&location=1').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { id:"7", code:"S\/0695\/00\/F", number:"19", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"}
        ], {}, ''];
      });
  
    model.applications(null,{id:1},null).then(
      function onSuccess(data) {
        appList = data;
      });
    
    $httpBackend.flush();
    expect(appList.length).toBe(1);
    expect(appList[0].label).toBe('Extension');
  }));
  
  it('should call API to list applications by apptype',inject(function($httpBackend,model) {
    var appList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?apptype=1&func=list').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { id:"4", code:"S\/0691\/00\/F", number:"14", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"},
          { id:"5", code:"S\/0692\/00\/F", number:"15", name:"Balland Field", date:"2000-04-12", label:"Toilet", wpc:"n", scdc:"a"},
          { id:"7", code:"S\/0695\/00\/F", number:"19", name:"Balland Field", date:"2000-04-12", label:"Extension", wpc:"n", scdc:"a"}
        ], {}, ''];
      });
    
    model.applications({id:1},null,null).then(
      function onSuccess(data) {
        appList = data;
      });
    
    $httpBackend.flush();
    expect(appList.length).toBe(3);
    expect(appList[1].label).toBe('Toilet');
  }));
  
  it('should call API to list applications by location and apptype',inject(function($httpBackend,model) {
    var appList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?apptype=1&func=list&location=1').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { id:"7", code:"S\/0695\/00\/F", number:"19", name:"Balland Field", date:"2000-04-12", label:"Robots", wpc:"n", scdc:"a"}
        ], {}, ''];
      });
    
    model.applications({id:1},{id:1},null).then(
      function onSuccess(data) {
        appList = data;
      });
    
    $httpBackend.flush();
    expect(appList.length).toBe(1);
    expect(appList[0].label).toBe('Robots');
  }));
  
  it('should call API to list applications by street and apptype',inject(function($httpBackend,model) {
    var appList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?apptype=1&func=list&street=1').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { id:"5", code:"S\/0692\/00\/F", number:"15", name:"Balland Field", date:"2000-04-12", label:"Toilet", wpc:"n", scdc:"a"},
          { id:"7", code:"S\/0695\/00\/F", number:"19", name:"Balland Field", date:"2000-04-12", label:"Robots", wpc:"n", scdc:"a"}
        ], {}, ''];
      });
    
    model.applications({id:1},null,{id:1}).then(
      function onSuccess(data) {
        appList = data;
      });
    
    $httpBackend.flush();
    expect(appList.length).toBe(2);
    expect(appList[1].label).toBe('Robots');
  }));
  
  it('should call API to list applications by location and apptype ignoring street',inject(function($httpBackend,model) {
    var appList;
    //Create an expectation for the correct url, and respond with a mock object
    $httpBackend.expectGET('/?apptype=1&func=list&location=1').respond(
      function (method, url, data, headers, params) {
        return [200, [
          { id:"7", code:"S\/0695\/00\/F", number:"19", name:"Balland Field", date:"2000-04-12", label:"Robots", wpc:"n", scdc:"a"}
        ], {}, ''];
      });
    
    model.applications({id:1},{id:1},{id:1}).then(
      function onSuccess(data) {
        appList = data;
      });
    
    $httpBackend.flush();
    expect(appList.length).toBe(1);
    expect(appList[0].label).toBe('Robots');
  }));
  
});