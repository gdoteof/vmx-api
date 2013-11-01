/*globals vmxApi:true,  spyOn: true, beforeEach: true, it: true, describe: true, expect:true*/

describe("vmxApi", function() {
  'use strict';
  var hand_dets,face_dets;
  var face_params,hand_params;
  beforeEach(function() {
    //Before eachtest, we set up some useful face_params.
    vmxApi.reset();
    hand_dets = [
      {
        bb: {
          0: 391.48,
          1: 542.64,
          2: 612.87,
          3: 627.4,
        },
        cls: "hand",
        image: "data:image/jpeg;base64,/9j/4AAQSk",
        score: -0.994451,
      }
    ];

    face_dets = [
      {
        bb: {
          0: 391.48,
          1: 542.64,
          2: 612.87,
          3: 627.4,
        },
        cls: "face",
        image: "data:image/jpeg;base64,/9j/4AAQSk",
        score: -0.994451,
      }
    ];

    face_params ={
      detections: face_dets,
      connectionId: 'foo',
    };
    
    hand_params ={
      detections: hand_dets,
      connectionId: 'bar',
    };
  });


  it("should not reject tautologies", function() {
    expect(3).toEqual(3);
  });

  it("should accept detections from the server", function(){
    expect(vmxApi.processServerResponse(face_params)).toBeTruthy();
  });

  it("should not allow any params to everDetected()", function(){
    var err = {name:"Too many parameters", message: "This functin takes no params!"};
    expect(function(){vmxApi('face').everDetected("anything");}).toThrow(err);
  });

  it("should not find any detections if nothing's been processed", function(){
    expect(vmxApi('face').everDetected()).toBe(false);
  });

  it("should find detections it has processed", function(){
    vmxApi.processServerResponse(face_params);
    expect(vmxApi('face')).toBeTruthy();
  });

  it("should be able to fully reset itself", function(){
    //This test should probably be more robust
    vmxApi.processServerResponse(face_params);
    expect(vmxApi('face')).toBeTruthy();
    vmxApi.reset();
    expect(vmxApi('face').everDetected()).toBe(false);
    expect(vmxApi('face').everDetected()).toBe(false);
  });

  it("should know if it's ever seen a model", function(){
    vmxApi.processServerResponse(face_params);
    expect(vmxApi('face')).toBeTruthy();
    expect(vmxApi('face').everDetected()).toBe(true);
  });

  it("should try and execute a callback upon detection", function(){
    //We use the __test__ name space to test functions that aren't pubically accessible
    spyOn(vmxApi.__test__,'fireEnteredCallback');
    vmxApi.processServerResponse(face_params);
    expect(vmxApi('face').__test__.fireEnteredCallback).toHaveBeenCalled();
  });

  it("should successfully fire a callback registerd as an onEnter function when something enters", function(){
    var toBeSpied = {
      callback                : function(){},
      callback_sanity_checker : function(){},
    };
    
    spyOn(toBeSpied,'callback');
    spyOn(toBeSpied,'callback_sanity_checker');

    vmxApi('hand').onEnter(toBeSpied.callback);

    vmxApi.processServerResponse(hand_params);

    expect(toBeSpied.callback)
          .toHaveBeenCalled();

    expect(toBeSpied.callback_sanity_checker)
          .not.toHaveBeenCalled();
  });

  it("should successfully fire a callback registered as an onLeave function when something leaves", function(){
    var toBeSpied = {
      callback                : function(){},
      callback_sanity_checker : function(){},
    };
    
    spyOn(toBeSpied,'callback');
    spyOn(toBeSpied,'callback_sanity_checker');

    vmxApi('hand').onLeave(toBeSpied.callback);

    vmxApi.processServerResponse(hand_params);

    expect(toBeSpied.callback)
          .toHaveBeenCalled();

    expect(toBeSpied.callback_sanity_checker)
          .not.toHaveBeenCalled();
  });


});
