import {
  none
} from "./chunk-OG2T2WAP.js";
import "./chunk-KY3Y3TWH.js";
import "./chunk-TFWDKVI3.js";

// ../../node_modules/@hookstate/subscribable/dist/index.es.js
function subscribable() {
  var subscribers = [];
  var stateAtRoot;
  return function() {
    return {
      onCreate: function(s) {
        stateAtRoot = s;
        function pathsEqual(p1, p2) {
          if (p1.length !== p2.length) {
            return false;
          }
          for (var i = 0; i < p1.length; i += 1) {
            if (p1[i] !== p2[i]) {
              return false;
            }
          }
          return true;
        }
        return {
          subscribe: function(state) {
            return function(cb) {
              if (!subscribers.find(function(i) {
                return pathsEqual(i[0], state.path) && i[1] === cb;
              })) {
                subscribers.push([state.path, cb]);
              }
              return function() {
                var found = subscribers.findIndex(function(i) {
                  return pathsEqual(i[0], state.path) && i[1] === cb;
                });
                if (found !== -1) {
                  subscribers.splice(found, 1);
                }
              };
            };
          }
        };
      },
      onSet: function(s, d) {
        function pathStartsWith(p1, p2) {
          if (p1.length < p2.length) {
            return false;
          }
          for (var i = 0; i < p2.length; i += 1) {
            if (p1[i] !== p2[i]) {
              return false;
            }
          }
          return true;
        }
        function getValueAtPath(path) {
          var result = stateAtRoot.value;
          for (var _i2 = 0, path_1 = path; _i2 < path_1.length; _i2++) {
            var p = path_1[_i2];
            if (result === void 0 || result == null) {
              return none;
            }
            result = result[p];
          }
          return result;
        }
        if (s.promise || s.error) {
          return;
        }
        for (var _i = 0, subscribers_1 = subscribers; _i < subscribers_1.length; _i++) {
          var subscriber = subscribers_1[_i];
          if (pathStartsWith(s.path, subscriber[0]) || pathStartsWith(subscriber[0], s.path)) {
            var v = getValueAtPath(subscriber[0]);
            if (v !== none) {
              subscriber[1](v);
            }
          }
        }
      }
    };
  };
}
export {
  subscribable
};
//# sourceMappingURL=@hookstate_subscribable.js.map
