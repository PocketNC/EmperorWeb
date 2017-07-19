define(function(require) {

    var template = require('text!./view_tooling.html');
    var nls = require('i18n!./nls/resources');

	var ViewModel = function(moduleContext) {

		var self = this;
        self.panel = null;
        self.linuxCNCServer = moduleContext.getSettings().linuxCNCServer;

        this.getTemplate = function()
        {
            return template;
        }
        this.getNls = function()
        {
            return nls;
        }

		this.initialize = function( Panel ) {
            if (_.isNull( self.panel ))
            {
                self.panel = Panel;

                // var data = self.linuxCNCServer.vars.file_content.data().split('\n');
                var data = [[0,0,0,0,0,0,0]];

                self.toolListTable = $("#ToolListTable", self.panel.getJQueryElement());
                self.toolListTable.handsontable({

                    stretchH: "all",
                    rowHeaders: true,
                    //colHeaders: ["Tool Number", "Z Offset", "X Offset", "Diameter", "Front Angle", "Back Angle", "Orientation"],
                    colHeaders: ["Tool Number", "Z Offset", "Diameter"],
                    height: 255,
                    startCols: 3,
                    outsideClickDeselects: false,

                    afterChange: function(changes, source){
                        if (!_.isArray(changes))
                            return;

                        var ht = self.toolListTable.handsontable('getInstance');

                        changes.forEach( function(change) {
                            try {

                                var row = change[0];
                                var col = change[1];
                                var oldVal = change[2];
                                var newVal = change[3];

                                if (source == "edit")
                                    if (col == 0)
                                        ht.setDataAtCell(row,col, parseFloat(newVal.toString()).toFixed(0), "update" );
                                    else
                                        ht.setDataAtCell(row,col, parseFloat(newVal.toString()).toFixed(5), "update" );
                                else
                                {
                                    var rowDat = ht.getDataAtRow(row);
                                    self.linuxCNCServer.setToolTableFull( rowDat[0],rowDat[1],0,rowDat[2],0,0,0);
                                }
                            } catch(ex){
                                console.log(ex);
                            };
                        })
                    }
                });

                // monitor file contents
                self.linuxCNCServer.vars.tool_table.data.subscribe( self.updateData );
                self.linuxCNCServer.RmtManualInputAllowed.subscribe(function(newValue) {
                    console.log(newValue);
                    var ht = self.toolListTable.handsontable('getInstance');
                    if(newValue) {
                        ht.updateSettings({
                            readOnly: false, // make table cells read-only
                            contextMenu: true, // disable context menu to change things
                            disableVisualSelection: false, // prevent user from visually selecting
                            manualColumnResize: false, // prevent dragging to resize columns
                            manualRowResize: false, // prevent dragging to resize rows
                            comments: false // prevent editing of comments
                        });
                    } else {
                        ht.updateSettings({
                            readOnly: true, // make table cells read-only
                            contextMenu: false, // disable context menu to change things
                            disableVisualSelection: true, // prevent user from visually selecting
                            manualColumnResize: false, // prevent dragging to resize columns
                            manualRowResize: false, // prevent dragging to resize rows
                            comments: false // prevent editing of comments
                        });
                    }
                });
            }

            setTimeout( function() {
                self.updateData(self.linuxCNCServer.vars.tool_table.data());
            },2);

		};

        this.updateData = function( newfilecontent )
        {
            var ht = self.toolListTable.handsontable('getInstance');

            var dat = [];
            newfilecontent.forEach( function(d,idx){ dat.push( [ d[0].toFixed(0), d[3].toFixed(5), d[10].toFixed(5)] ); } );
            ht.loadData(dat);

            var rh = [];
            var rc = ht.countRows();
            for (idx = 0; idx < rc; idx++)
                rh.push(idx.toString());
            ht.updateSettings({rowHeaders: rh});

            self.resize();

            ht.render();
        }

        self.resize = function(event){
            try {

                var height_of_tool_table_area = $("#TOOLING_INNER_WRAP",self.panel.getJQueryElement()).height() -
                    ( $("#TOOLING_CONTENT",self.panel.getJQueryElement()).offset().top - $("#TOOLING_INNER_WRAP",self.panel.getJQueryElement()).offset().top ) - 0;

                if (height_of_tool_table_area < 100)
                    height_of_tool_table_area = 100;

                var ht = self.toolListTable.handsontable('getInstance');
                ht.updateSettings({height: height_of_tool_table_area});

            } catch (ex){  };
        }

        $(window).resize( _.throttle(self.resize, 100 ) );

	};

	return ViewModel;
});
