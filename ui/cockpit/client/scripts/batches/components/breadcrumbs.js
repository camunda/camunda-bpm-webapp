'use strict';

module.exports = function(page, rootScope, translateFilter) {
  rootScope.showBreadcrumbs = true;

  page.breadcrumbsClear();

  page.breadcrumbsAdd({
    label: translateFilter('BATCHES_BREAD_BATCHES')
  });

  page.titleSet(translateFilter('BATCHES_TITLE_BATCHES'));
};
