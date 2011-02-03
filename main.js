Ext.setup({
	onReady: function() {
		var p = new Ext.form.FormPanel({
			fullscreen : true,
			items      : [
				{
					xtype : "fieldset",
					title : "Ext.form.ux.touch.CalendarPickerField",
					items : [
						{
							xtype: "calendarpickerfield",
							label: "Choose Date",
							dateFormat: 'm-d-Y',
							value: new Date()
						}
					]
				}
			]
		});
	}
});

