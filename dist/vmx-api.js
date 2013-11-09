/*! vmx-api - v0.0.0 - 2013-11-08
* Copyright (c) 2013 ; Licensed  */
var vmxApi;
(function(){
"use strict";
var inited = false;
var _vmxApi;

function VmxApi(){
  // `detectors` is a hashed array, keyed by model name; 
  //  Each element is itself a hashed array of detectors, keyed by connectionId
  var detectors = {};

  // `callbacks` is a hashed array, keyed by model name,
  // each element is a an array of callbacks,
  // ex:
  
  // * callbacks
  //      0. face
  //          - onEnter : 
  //              - callback: function(params){ console.log("Hello,", params.name) },
  //              - params: {name: 'Bobby Tables'},
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

  var doCallbacks = function(model_name,detections, now){
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


  // params(object) is used to configure the callback (setting timing thresholds, for example)
  var registerCallback = function (modelName, type, callbackFunction, params, config){
     var minScore = config.minScore ||   0.1;
     var minTime  = config.minTime  || 30000;
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
  
  return {
    reset: function() {
      detectors = {};
      callbacks = {};
    },
    select : function(selector){
      this.selector = selector;
      if(selector && !(this.$selected = detectors[selector])) {
        this.$selected = null;
      }
      return this;
    },
    processServerResponse : function(params){
      var detections   = params.detections;
      //NOTE: Detectors should be able to receive have their own name
      var model_name   = params.name || detections[0].cls;
      var connectionId = params.connectionId;
      var _detector;
      var now = (new Date()).getTime();
      doCallbacks(model_name, detections, now);
      if(_detector = detectors[model_name]){
        _detector[connectionId] = detections;
      } else {
        // This is the first firing of ANY detector for this model_name 
        detectors[model_name] = {};
        detectors[model_name][connectionId] = detections;
      }
      return this;
    },
    onEnter : function(callbackFunction, params, config){
      registerCallback(this.selector, 'onEnter', callbackFunction, params, config);
      return this;
    },
    onLeave : function(callbackFunction, params, config){
      registerCallback(this.selector, 'onLeave', callbackFunction, params, config);
      return this;
    },
    everDetected : function(notUsed){
      if(notUsed){
        //This function should not be given a param
        var err = {name:"Too many parameters", message: "This functin takes no params!"};
        throw err;
      }
      // This weird check makes sure that $selected hasn't changed itself to something that is falsy but not 'null'
      return (this.$selected !== null && !!(this.$selected));
    }
  };
}

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


})();
