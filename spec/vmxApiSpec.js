/*globals vmxApi:true,  spyOn: true, beforeEach: true, it: true, describe: true, expect:true*/

describe("vmxApi", function() {
  'use strict';
  var hand_dets_neg,face_dets_neg;
  var hand_dets_pos,face_dets_pos;
  var face_params_neg,hand_params_neg;
  var face_params_pos,hand_params_pos;
  var empty_params;
  var default_config;
  var DefaultConfig;
  // Used to test the param get/set functionality
  var VmxParams = function(){
    this.named_params = {}; 
    this.named_params['foo'] = 'bar';
  };

  var vmxParams;

  // return value of param
  VmxParams.prototype.get = function(name){
    return this.named_params[name].value;
  };

  // set value of param
  VmxParams.prototype.set = function(name, value){
    this.named_params[name].value = value;
  };

  beforeEach(function(){
    vmxParams = new VmxParams();
  });

  beforeEach(function() {
    //Before eachtest, we set up some useful face_params.
    vmxApi.reset();
    hand_dets_pos = [
      {
        bb: {
          0: 391.48,
          1: 542.64,
          2: 612.87,
          3: 627.4
        },
        name: "hand",
        image: "data:image/jpeg;base64,/9j/4AAQSk",
        score: 1
      }
    ];

    face_dets_pos = [
      {
        bb: {
          0: 391.48,
          1: 542.64,
          2: 612.87,
          3: 627.4
        },
        name: "face",
        image: "data:image/jpeg;base64,/9j/4AAQSk",
        score: 1
      }
    ];
    hand_dets_neg = [
      {
        bb: {
          0: 391.48,
          1: 542.64,
          2: 612.87,
          3: 627.4
        },
        name: "hand",
        image: "data:image/jpeg;base64,/9j/4AAQSk",
        score: -0.994451
      }
    ];

    face_dets_neg = [
      {
        bb: {
          0: 391.48,
          1: 542.64,
          2: 612.87,
          3: 627.4
        },
        name: "face",
        image: "data:image/jpeg;base64,/9j/4AAQSk",
        score: -0.994451
      }
    ];

    face_params_neg ={
      detections: face_dets_neg,
      connectionId: 'foo',
      detectorParams:  vmxParams
    };
    
    hand_params_neg ={
      detections: hand_dets_neg,
      connectionId: 'bar',
      detectorParams:  vmxParams
    };
    face_params_pos ={
      detections: face_dets_pos,
      connectionId: 'foo',
      detectorParams:  vmxParams
    };
    
    hand_params_pos ={
      detections: hand_dets_pos,
      connectionId: 'bar',
      detectorParams:  vmxParams
    };

    empty_params = {};
    
    DefaultConfig = function(){
     return {
       minScore : 0.01,
       minTime : 1000*60*5 //5 minutes;
     };
    };
    default_config = new DefaultConfig();
  });


  it("should not reject tautologies", function() {
    expect(3).toEqual(3);
  });

  it("should accept detections from the server", function(){
    expect(vmxApi.processServerResponse(face_params_pos)).toBeTruthy();
  });

  it("should not allow any params to everDetected()", function(){
    //var err = {name:"Too many parameters", message: "This functin takes no params!"};
    expect(function(){vmxApi('face').everDetected("anything");}).toThrow();
  });

  it("should not find any detections if nothing's been processed", function(){
    expect(vmxApi('face').everDetected()).toBe(false);
  });

  it("should find detections it has processed", function(){
    vmxApi.processServerResponse(face_params_pos);
    expect(vmxApi('face')).toBeTruthy();
  });

  it("should be able to fully reset itself", function(){
    //This test should probably be more robust
    vmxApi.processServerResponse(face_params_pos);
    expect(vmxApi('face')).toBeTruthy();
    vmxApi.reset();
    expect(vmxApi('face').everDetected()).toBe(false);
    expect(vmxApi('face').everDetected()).toBe(false);
  });

  it("should know if it's ever seen a model", function(){
    vmxApi.processServerResponse(face_params_pos);
    expect(vmxApi('face')).toBeTruthy();
    expect(vmxApi('face').everDetected()).toBe(true);
  });


  describe("onEnter", function() {
    it("should fire when it sees a detection with minimum score", function(){
      var toBeSpied = {
        callback                : function(){},
        callback_sanity_checker : function(){}
      };
      
      spyOn(toBeSpied,'callback');
      spyOn(toBeSpied,'callback_sanity_checker');

      vmxApi('hand').onEnter(toBeSpied.callback, empty_params, default_config);

      vmxApi.processServerResponse(hand_params_pos);

      expect(toBeSpied.callback)
            .toHaveBeenCalled();

      expect(toBeSpied.callback_sanity_checker)
            .not.toHaveBeenCalled();
    });
    it("should should handle time thresholds correctly", function(){

      var toBeSpied = {
        callback                : function(){},
        callback_sanity_checker : function(){}
      };

      var now = (new Date()).getTime();
      var fakeTime = now;
      spyOn(Date.prototype,'getTime').and.callFake(function(){
        return fakeTime;
      });

      spyOn(toBeSpied,'callback');
      spyOn(toBeSpied,'callback_sanity_checker');

      vmxApi('hand').onEnter(toBeSpied.callback, empty_params, default_config);

      expect(toBeSpied.callback)
            .not.toHaveBeenCalled();


      vmxApi.processServerResponse(hand_params_pos);
      expect(toBeSpied.callback)
            .toHaveBeenCalled();
      expect(toBeSpied.callback.calls.count()).toBe(1);
      
      fakeTime += 1000;
      vmxApi.processServerResponse(hand_params_pos);
      expect(toBeSpied.callback.calls.count()).toBe(1);
      // Lets make a hundred fake positives 1second apart
      for(var y = 0; y<100; ++y){
        fakeTime += 1000;
        vmxApi.processServerResponse(hand_params_pos);
        expect(toBeSpied.callback.calls.count()).toBe(1);
      }

      // Lets make a hundred fake positives 10 minutes apart
      for(var x = 2; x<100; ++x){
        fakeTime += 1000 * 60 * 10;
        vmxApi.processServerResponse(hand_params_pos);
        expect(toBeSpied.callback.calls.count()).toBe(x);
      }
      
    });
  });

  describe("onLeave", function() {
    it("should onLeave function when something leaves", function(){

      var toBeSpied = {
        callback  : function(){}
      };
      spyOn(toBeSpied,'callback');

      var config = new DefaultConfig();
      //Something has to be gone for ten minutes
      config.minTime = 1000 * 60 * 10;
      config.minScore = 0;

      var now = (new Date()).getTime();
      var fakeTime = now;
      spyOn(Date.prototype,'getTime').and.callFake(function(){
        return fakeTime;
      });
      
      vmxApi('hand').onLeave(toBeSpied.callback, empty_params, config);
      // Send server a positive so the leave function can fire
      vmxApi.processServerResponse(hand_params_pos);
      expect(toBeSpied.callback)
            .not.toHaveBeenCalled();

      // bumptime by a minute
      fakeTime += 1000 * 60;

      // Send it a negative
      vmxApi.processServerResponse(hand_params_neg);
      expect(toBeSpied.callback)
            .not.toHaveBeenCalled();

      // wait another ten minutes
      fakeTime += 1000 * 60 * 10;

      // send another negative
      vmxApi.processServerResponse(hand_params_neg);
      expect(toBeSpied.callback)
            .toHaveBeenCalled();

    });
  });
  describe("params", function() {
    it("should get the value of a param", function(){
      vmxApi.processServerResponse(face_params_pos);
      var val = vmxApi('face').params('ilearn');
      console.log(val);
      expect(vmxApi('face')).toBeTruthy();
      expect(vmxApi('face').everDetected()).toBe(true);
    });
  });


});
