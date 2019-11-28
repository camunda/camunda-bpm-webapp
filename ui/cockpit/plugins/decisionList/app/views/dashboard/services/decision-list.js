'use strict';

// IE11 Polyfill
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
/* eslint-disable */
if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, 'assign', {
    value: function assign(target, varArgs) {
      // .length of function is 2
      'use strict';
      if (target == null) {
        // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
          // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}
/* eslint-enable */

module.exports = [
  '$q',
  'camAPI',
  function($q, camAPI) {
    var decisionDefinitionService = camAPI.resource('decision-definition');
    var drdService = camAPI.resource('drd');

    var drds, decisions;

    var defaultParams = {
      latestVersion: true,
      sortBy: 'name',
      sortOrder: 'asc',
      firstResult: 0,
      maxResults: 50
    };

    function getDecisions(params) {
      return decisionDefinitionService
        .list(Object.assign({}, defaultParams, params))
        .then(function(result) {
          decisions = result;

          if (drds) result = connectDrdsToDecisionDefinitions(drds, result);

          return result;
        });
    }

    function getDrds(params) {
      return drdService
        .list(Object.assign({}, defaultParams, params))
        .then(function(result) {
          drds = result;

          if (decisions)
            result = connectDrdsToDecisionDefinitions(drds, result);

          return result;
        });
    }

    function getDecisionsLists(decParams, drdParams) {
      var decisionsProm = decisionDefinitionService.list(
        Object.assign({}, defaultParams, decParams)
      );

      var decisionsCountProm = decisionDefinitionService.count({
        latestVersion: true
      });

      var drdsProm = drdService.list(
        Object.assign({}, defaultParams, drdParams)
      );

      var drdsCountProm = drdService.count({
        latestVersion: true
      });

      return $q
        .all({
          decisions: decisionsProm,
          decisionsCount: decisionsCountProm,
          drds: drdsProm,
          drdsCount: drdsCountProm
        })
        .then(function(results) {
          drds = results.drds;
          decisions = results.decisions;

          decisions = results.decisions = connectDrdsToDecisionDefinitions(
            results.drds,
            results.decisions
          );
          results.drdsCount = results.drdsCount.count;

          return results;
        });
    }

    function connectDrdsToDecisionDefinitions(drds, decisions) {
      return decisions.map(function(decision) {
        if (decision.decisionRequirementsDefinitionId) {
          decision.drd = findDrdById(
            drds,
            decision.decisionRequirementsDefinitionId
          ) || {
            key: decision.decisionRequirementsDefinitionKey,
            id: decision.decisionRequirementsDefinitionId
          };
        }

        return decision;
      });
    }

    function findDrdById(drds, id) {
      return drds.filter(function(drd) {
        return drd.id === id;
      })[0];
    }

    return {
      getDecisionsLists: getDecisionsLists,
      getDecisions: getDecisions,
      getDrds: getDrds
    };
  }
];
