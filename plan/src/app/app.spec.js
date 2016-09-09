//*******************************************************************************
// Project RABIN Test file
//
// (c) Fen Technology Ltd. 2015. All rights reserved.
//
// All rights reserved. Copying, compilation, modification, distribution or
// any other use whatsoever of this material is strictly prohibited except in
// accordance with a Software License Agreement.
//******************************************************************************
// COMPONENT:    webgui
// MODULE:       rb-time.spec.js
// $Date: 2016-03-24 12:30:16 +0000 (Thu, 24 Mar 2016) $
// $Revision: 269 $
// $LastChangedBy: derek $
// DESCRIPTION:  Test file for rb-time service
//               This code is based on mhub/node/test/time_test.js
//*******************************************************************************

describe("application", function() {
  var mainCtrl;
  var $scope;
  
  beforeEach(function () {
    module('plan');
  });
  
  beforeEach(inject(function($controller,$rootScope) {
    $scope = $rootScope.$new();
    mainCtrl = $controller('mainCtrl', { $scope: $scope });
  }));
  
  // After running each test
  afterEach(function () {
  });
  
  it("Runs", function() {
    expect(mainCtrl).toBeDefined();
  });

});
