'use strict';

/*globals vmxApi:false*/


describe("vmxApi", function() {
  var api;
  var hand_dets,face_dets;
  beforeEach(function() {
    api = new vmxApi();
    hand_dets = 
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
    face_dets = 
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
  });


  it("should not reject tautologies", function() {
    expect(3).toEqual(3);
  });

  it("should process detections form the server", function(){
    expect(api.processServerResponse(face_dets)).toBeTruthy();
  });



});
