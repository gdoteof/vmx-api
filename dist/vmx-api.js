/*! vmx-api - v0.1.0 - 2015-03-13
* Copyright (c) 2015 ; Licensed  */
var vmxApi;
var VmxApi;
(function(){
"use strict";
var inited = false;
var _vmxApi;

// `detectors` is a hashed array, keyed by model name; 
//  Each element is itself a hashed array of detectors, keyed by connectionId
var detectors = {};


// `callbacks` is a hashed array, keyed by model name,
// each element is a an array of callbacks,
// ex:

// * callbacks
//      0. face
//          - onEnter : 
//              - `callback`: `function(params){ console.log("Hello,", params.name) }`
//              - `params` : `{name: 'Bobby Tables'}`
//              - minScore: 0,  // any score above this will count as the object 'being here'
//              - minTime: 1000 * 60 * 5, //something must be gone for five minutes to be able to enter
//              - lastMet: 1383677047   //time stamp for last time minScore was met
//          - onExit : function(){ console.log("face left"); },
//              - callback: function(params){ console.log("Goodbye,", params.name) },
//              - params: {name: 'Bobby Tables'},
//              - minScore: 0, // any score below this will count as the object 'not being here'
//              - minTime: 1000 * 60 * 5, //something must be gone for five minutes to be considered to have left
//              - lastMet: 1383677047  //timestamp for lastitme min score was NOT met
//              - canFire: false,   // a flag saying whether or not this can fire (can't leave if you never entered) -- this is used internally only
//              - startedLeaving: 1383657047  // a flag to keep track of when this started leaving
//      1. hand
//          - onEnter : 
//              - callback ...
//              - ...
//          - onExit : 
//              - callback ...
//              - ...

  var callbacks = {};

  VmxApi = function VmxApi(){
    return this;
  };

  // Here we set up the datatype for the main datastructure being maintained to do selections against
  var Detector = function(detections,params){
    this.detections = detections;
    this.params     = params;
  };
  
  // doCallbacks takes a model_name (string), an array of detections (from a detector) and the timestamp for "now" 

  var doCallbacks = function(model_name, detections, now){
    // Do nothing if no registered callbacks;
    if(! callbacks[model_name] ) { return this; }
    var _cbs = callbacks[model_name];
    var score = detections[0].score;  // score is the highest scoring detection

    // Process onEnter
    var onEnter = _cbs.onEnter;
    if (onEnter && score >= onEnter.minScore){
      if(!onEnter.lastMet || onEnter.lastMet + onEnter.minTime <= now){
        onEnter.callback(onEnter.params);
      }
      onEnter.lastMet = now;
    }

    // Process onLeave
    var onLeave = _cbs.onLeave;
    if (onLeave && score < onLeave.minScore){
      if(onLeave.startedLeaving === undefined) { 
        onLeave.startedLeaving = now; 
      }
      if(onLeave.canFire && onLeave.startedLeaving + onLeave.minTime <= now){
        onLeave.canFire = false;
        onLeave.callback(onLeave.params);
      }
      onLeave.lastMet = now;
    } else if(onLeave) {
      onLeave.canFire = true;
      onLeave.startedLeaving = undefined;
    }
  };


  // registerCallback sets up a callback for a model

  // - modelName(string)
  // - type(string) - onEnter, onLeave
  // - callbackFunction(function) - a function to be called
  // - params(object) - the params that will be sent to the callback function
  // - config(object) - a config option to control thresholds on the callback (ie, minScore or minTime)
  var registerCallback = function (modelName, type, callbackFunction, params, config){
     if (!config) { config = {}; }
     var minScore = config.minScore ||   0.1;
     var minTime  = config.minTime  ||   500;
     var canFire  = config.canFire;
     if(!callbacks[modelName]) { callbacks[modelName] = {}; }
     callbacks[modelName][type] = {
        callback : callbackFunction, 
        params   : params,
        minScore : minScore,
        minTime  : minTime,
        lastMet  : undefined,
        canFire  : undefined
     };

     if (type === 'onLeave') {
       var onEnter = callbacks[modelName].onEnter;
       if((onEnter && onEnter.lastMet) || canFire){
          callbacks[modelName][type].canFire = true; 
       }
     }
  };
  

    VmxApi.prototype.reset = function() {
      detectors = {};
      callbacks = {};
    };

    VmxApi.prototype.select  = function(selector){
      this.selector = selector;
      if(selector && !(this.$selected = detectors[selector])) {
        this.$selected = null;
      }
      return this;
    };

    VmxApi.prototype.processServerResponse  = function(vars){
      //console.log(vars);
      var detections   = vars.detections;
      var detectorParams = vars.detectorParams;
      //NOTE: Detectors should be able to receive have their own name
      var model_name   = vars.name || detections[0].name;
      var connectionId = vars.connectionId;
      var _detector;
      var now = (new Date()).getTime();
      doCallbacks(model_name, detections, now);
      if(_detector = detectors[model_name]){
        _detector[connectionId] = detections;
      } else {
        // This is the first firing of ANY detector for this model_name 
        _detector = new Detector(detections,detectorParams);
        detectors[model_name] = {};
        detectors[model_name][connectionId] = _detector;
      }
      return this;
    };

    VmxApi.prototype.onEnter  = function(callbackFunction, params, config){
      registerCallback(this.selector, 'onEnter', callbackFunction, params, config);
      return this;
    };

    VmxApi.prototype.onLeave  = function(callbackFunction, params, config){
      registerCallback(this.selector, 'onLeave', callbackFunction, params, config);
      return this;
    };
    
    VmxApi.prototype.everDetected  = function(notUsed){
      if(notUsed){
        //This function should not be given a param
        var err = {name:"Too many parameters", message: "This functin takes no params!"};
        throw err;
      }
      // This weird check makes sure that $selected hasn't changed itself to something that is falsy but not 'null'
      return (this.$selected !== null && !!(this.$selected));
    };

    VmxApi.prototype.getSelector = function(){
      return this.selector;
    };

    VmxApi.prototype.params = function(paramName, setVal){
      var readOnly = null;
      if (setVal === null) { readOnly = true; }
      else { readOnly = false; }
      console.log(this.$selected);
      return this;
    };

vmxApi = function(selector){
  if(!inited){
    _vmxApi = new VmxApi();
    inited = true;
  }
  if(selector){
    return _vmxApi.select(selector);
  } else {
    return _vmxApi;
  }
};
vmxApi();

// Here we are attaching functions to the object that is vmxApi; which is also a function.
// Javascript is insane, so we use it's insanity to have sexier Api calls..
// ie, we can do vmxApi.reset() instead of having to do vmxApi().reset()
vmxApi.reset = _vmxApi.reset;
vmxApi.processServerResponse = _vmxApi.processServerResponse;
vmxApi.fn = VmxApi.prototype;


})();
