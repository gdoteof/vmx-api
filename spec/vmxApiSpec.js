'use strict';

/*globals vmxApi:false*/

describe("vmxApi", function() {
  var hand_dets,face_dets;
  var face_params;
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
    }
  });


  it("should not reject tautologies", function() {
    expect(3).toEqual(3);
  });

  it("should accept detections from the server", function(){
    expect(vmxApi.processServerResponse(face_params)).toBeTruthy();
  });

  it("should not find any detections if nothing's been processed", function(){
    expect(function(){vmxApi('hand')}).toThrow('No detector');
  });

  it("should find detections it has processed", function(){
    vmxApi.processServerResponse(face_params);
    expect(vmxApi('face')).toBeTruthy();
  });

  it("it should be able to fully reset itself", function(){
    //This test should probably be more robust
    vmxApi.processServerResponse(face_params);
    expect(vmxApi('face')).toBeTruthy();
    vmxApi.reset();
    expect(function(){vmxApi('hand')}).toThrow('No detector');
    expect(function(){vmxApi('face')}).toThrow('No detector');
  });

  it("it should know if it's ever seen a model", function(){
    vmxApi.processServerResponse(face_params);
    expect(vmxApi('face')).toBeTruthy();
    expect(vmxApi('face').everDetected()).toBe(true);
  });

  it("it should successfully execute a callback upon detection", function(){
    //We use the __test__ name space to test functions that aren't pubically accessible
    spyOn(vmxApi.__test__,'fireEnteredCallback').andCallFake(function(e){
      e.processServerResponse(face_params);
    })
  });
});
