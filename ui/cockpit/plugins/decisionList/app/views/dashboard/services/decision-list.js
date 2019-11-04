'use strict';

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
