define(function(require) {

    // Load the dependencies
    var Boiler = require('Boiler'), 
        template = require('text!./view.html'),
        nls = require('i18n!./nls/resources');

    var ViewModel_dro = require('../tabWidgets/viewmodel_dro');
    var ViewModel_backplot = require('../tabWidgets/viewmodel_backplot');

    var Component = function(moduleContext) {
		var panel = null;
        var panel_dro = null;
        var panel_backplot = null;
        var vm_dro = null;
        var vm_backplot = null;
		return {
			activate : function(parent) {
				if (!panel) {
					panel = new Boiler.ViewTemplate(parent, template, nls);
                    ko.applyBindings( moduleContext.getSettings(), panel.getDomElement());
				}

                if (!panel_dro) {
                    vm_dro = new ViewModel_dro(moduleContext);
                    panel_dro = new Boiler.ViewTemplate(panel.getJQueryElement().find("#DRO_PANEL"), vm_dro.getTemplate(), vm_dro.getNls());
                    ko.applyBindings( vm_dro, panel_dro.getDomElement());
                }
                vm_dro.initialize(panel_dro);

                if (!panel_backplot) {
                    vm_backplot = new ViewModel_backplot(moduleContext);
                    panel_backplot = new Boiler.ViewTemplate(panel.getJQueryElement().find("#BACKPLOT_PANEL"), vm_backplot.getTemplate(), vm_backplot.getNls());
                    ko.applyBindings( vm_backplot, panel_backplot.getDomElement());
                    vm_backplot.initialize(panel_backplot);
                }

                panel.show();
                //panel_dro.show();
//                panel_backplot.show();
			},

			deactivate : function() {
				if (panel) {
					panel.hide();
//                    panel_dro.hide();
//                    panel_backplot.hide();
				}
			}
		};
	};

	return Component;

});
