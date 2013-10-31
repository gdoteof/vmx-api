'use strict';

/*globals vmxApi:false*/

describe("vmxApi", function() {
  var hand_dets,face_dets;
  beforeEach(function() {
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
  });


  it("should not reject tautologies", function() {
    expect(3).toEqual(3);
  });

  it("should accept detections from the server", function(){
    var params ={
      detections: face_dets,
      connectionId: 'foo',
    }
    expect(vmxApi.processServerResponse(params)).toBeTruthy();
  });

  it("should not find any detections if nothings been processed", function(){
    expect(function(){vmxApi('hand')}).toThrow('No detector');
  });

  it("should find detections it has processed", function(){
    var params ={
      detections: face_dets,
      connectionId: 'foo',
    }
    vmxApi.processServerResponse(params);
    expect(vmxApi('face')).toBeTruthy();
  });

});
