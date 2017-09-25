'use strict';

module.exports = [
  'configuration',
  function(configuration) {
    this.appVendor = configuration.getAppVendor();
    this.appName = configuration.getAppName();
    this.langs = configuration.getAvailableLocales();
    this.langCurrent = localStorage.getItem('lang_cam') || navigator.language
      || window.navigator.language || configuration.getFallbackLocale();
    this.selectLang = function(langSelect) {
      localStorage.setItem('lang_cam', langSelect);
      location.reload();
    };
  }];
