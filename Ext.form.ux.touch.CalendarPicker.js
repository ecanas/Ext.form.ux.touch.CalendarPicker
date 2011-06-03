/*
    Author       : Edgar Canas
    Site         : 
    Contact Info : ed.canas@gmail.com
    Purpose      : Creation of a custom calendar picker

    License      : MIT
    Warranty     : none
    Price        : free
    Version      : .92b
    Date         : 02/02/2011
*/

Ext.ns("Ext.form.ux.touch");

Ext.form.ux.touch.CalendarPickerField = Ext.extend(Ext.form.Field, {
    ui: 'select',
    picker: null,
    destroyPickerOnHide: false,
    otherCls: "",
	showYearArrows: true, 
    renderTpl: null,
    dateFormat: 'Y-m-d',
    initComponent: function() {
       	this.addEvents(['select', 'beforeselect']);
		
        this.useMask = true;

        var renderTpl = [
        '<tpl if="label">',
        '<div class="x-form-label"><span>{label}</span></div>',
        '</tpl>',
        '<tpl if="fieldEl">',
        '<div class="x-form-field-container">',
        '<div id="{inputId}" name="{name}" class="x-form-calendar-picker-field ' + this.otherCls + ' {fieldCls}"',
        '<tpl if="style">style="{style}" </tpl> >&nbsp;',
        '</div>',
        '<tpl if="useMask"><div class="x-field-mask" style="width:100%;height:100%;"></div></tpl>',
        '</div>',
        '<tpl if="useClearIcon"><div class="x-field-clear-container"><div class="x-field-clear x-hidden-visibility">&#215;</div></div></tpl>',
        '</tpl>'
        ];

        this.renderTpl = this.renderTpl || renderTpl;
    },

    initCalendar: function() {
        this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.dayNames = ['S', 'M', 'T', 'W', 'TH', 'F', 'S'];
		this.pYear = new Ext.Button({
            ui: 'action',
            iconMask: true,
            iconCls: "rewind",
            scope: this,
			hidden: !this.showYearArrows,
            handler: function() {
                this.prevYear();
            }
        });

		this.nYear = new Ext.Button({
            ui: 'action',
            iconMask: true,
            iconCls: "fforward",
            scope: this,
			hidden: !this.showYearArrows,
            handler: function() {
                this.nextYear();
            }
        });

        this.navBar = new Ext.Toolbar({
            dock: 'top',
            title: '',
            layout: {
                pack: 'justify',
                align: 'center'
                // align center is the default
            },
            items: [{
                xtype: 'button',
                ui: 'action',
                iconMask: true,
                iconCls: "arrow_left",
                scope: this,
                handler: function() {
                    this.prevMonth();
                }
            },
            (Ext.is.Phone ? {xtype: 'spacer'}: this.pYear),
            {
                xtype: 'component',
                flex: 1
            },
            (Ext.is.Phone ? {xtype: 'spacer'}: this.nYear),
			{
	            xtype: 'button',
	            ui: 'action',
	            iconMask: true,
	            iconCls: "arrow_right",
	            scope: this,
	            handler: function() {
	                this.nextMonth();
	            }
	        }
            ]
        });

        if (Ext.is.Phone) {
            this.titleBar = new Ext.Toolbar({
                ui: 'light',
                height: 40,
                dock: 'top',
                title: this.label,
				items: [this.pYear,{xtype: 'spacer'}, this.nYear]
            });
        }

        this.calendar = new Ext.Panel({
            scroll: false,
            width: Ext.is.Phone ? Ext.Element.getViewportWidth() : 400,
            height: Ext.is.Phone ? Ext.Element.getViewportHeight() : 408,
            modal: Ext.is.Phone ? undefined: true,
            hideOnMaskTap: Ext.is.Phone ? undefined: false,
            floating: true,
            centered: true,
            hidden: true,
            styleHtmlContent: true,
            hideOnMaskTap: false,
            bodyMargin: 0,
            bodyPadding: 0,
            margin: 0,
            padding: Ext.is.Phone ? 2: 4,
            //id: 'pnCalendar',
            html: '<div id="calendar"></div>',
            dockedItems: [this.navBar, {
                xtype: 'toolbar',
                dock: 'bottom',
                layout: {
                    pack: 'justify',
                    align: 'center'
                },
                items: [
                {
                    xtype: 'button',
                    text: 'Cancel',
                    scope: this,
                    handler: function() {
                        this.calendar.hide();
                    }
                },
                {
                    xtype: 'button',
                    text: 'Today',
                    ui: 'action',
                    scope: this,
                    handler: function() {
                        this.today();
                    }
                }
                ]
            },
            ((this.titleBar) ? this.titleBar: {})],
	        listeners: {
                scope: this,
				//orientationchange: function(pn, orientation, w, h) {
	            //    pn.setSize(w, h);
	            //},
                render: function() {
                    this.calendar.mon(this.calendar.el, {
                        swipe: function(directiion) {
                            if (directiion.direction == "left") {
                                this.nextMonth();
                            } else if (directiion.direction == "right") {
                                this.prevMonth();
                            }
                        },
                        tap: function(obj, e) {
                            var currSelection;
                            if ((e.className.search('date') != -1)) {
                                dateTap = true;
                                currSelection = e.getAttribute("date").split(',');
                            }
                            else {
                                if ((e.className.search('day') != -1)) {
                                    dateTap = true;
                                    currSelection = e.parentNode.getAttribute("date").split(',');
                                }
                            }
                            if (currSelection) {
                                var d = new Date(currSelection[0], currSelection[1], currSelection[2]);
                                this.onPickerChange(this, d);
                                this.calendar.hide();
                            }
                        },
                        scope: this
                    });
                }
            }
        });
    },

    nextMonth: function() {
        if (this.month == 11) {
            this.month = 0;
            this.year += 1;
        }
        else this.month += 1;
        this.drawCalendar();
    },

    prevMonth: function() {
        if (this.month == 0) {
            this.month = 11;
            this.year -= 1;
        }
        else this.month = this.month - 1;
        this.drawCalendar();
    },

    nextYear: function() {
        this.year += 1;
        this.drawCalendar();
    },

    prevYear: function() {
        this.year = this.year - 1;
        this.drawCalendar();
    },

    getDaysInMonth: function(month, year) {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if ((month == 1) && (year % 4 == 0) && ((year % 100 != 0) || (year % 400 == 0))) {
            return 29;
        } else {
            return daysInMonth[month];
        }
    },

    setDate: function(d) {
        this.day = d.getDate();
        this.month = d.getMonth();
        this.year = d.getYear() + 1900;
    },

    today: function() {
        this.now = new Date();
        this.setDate(this.now);
        this.drawCalendar();
    },

    drawCalendar: function() {
        var month = this.month;
        var year = this.year;
        var day = this.day;
        var today = this.now.getDate();
        var dayselected = this.value.getDate();

        var m = 0;
        var table = '';

        this.navBar.setTitle(this.monthNames[month] + ' ' + year);
        table += ('<table class="calendar-month " ' + 'id="calendar-month' + i + ' " cellspacing="0">');
        table += '<tr>';

        for (d = 0; d < 7; d++) {
            table += '<th class="weekday">' + this.dayNames[d] + '</th>';
        }

        table += '</tr>';

        var days = this.getDaysInMonth(month, year);
        var firstDayDate = new Date(year, month, 1);
        var firstDay = firstDayDate.getDay();

        var prev_days = this.getDaysInMonth(month, year);
        var firstDayDate = new Date(year, month, 1);
        var firstDay = firstDayDate.getDay();

        var prev_m = month == 0 ? 11: month - 1;
        var prev_y = prev_m == 11 ? year - 1: year;
        var prev_days = this.getDaysInMonth(prev_m, prev_y);
        firstDay = (firstDay == 0 && firstDayDate) ? 7: firstDay;
        var prev_m2 = month == 11 ? 0: month + 1;
        var prev_y2 = month == 11 ? year + 1: year;


        var i = 0;
        var isToday = false;
        var isSelected = false;
        var rowday
        for (j = 0; j < 42; j++) {

            if ((j < firstDay)) {
                rowday = (prev_days - firstDay + j + 1);
                table += ('<td class="calendar-other date" date="' + prev_y + ',' + prev_m + ',' + rowday + '"><span class="day">' + rowday + '</span></td>');
            } else if ((j >= firstDay + this.getDaysInMonth(month, year))) {
                i = i + 1;
                table += ('<td class="calendar-other date" date="' + prev_y2 + ',' + prev_m2 + ',' + i + '"><span class="day">' + i + '</span></td>');
            } else {
                rowday = (j - firstDay + 1);
                clsToday = '';
                clsSelected = ''
                if (rowday == today) {
                    if (year == this.now.getFullYear() && month == this.now.getMonth()) clsToday = ' calendar-today';
                }
                if (rowday == dayselected) {
                    if (year == this.value.getFullYear() && month == this.value.getMonth()) clsSelected = ' calendar-select';
                }
                table += ('<td class="current-month date day' + (j - firstDay + 1) + clsToday + clsSelected + '" date="' + year + ',' + month + ',' + rowday + '"><span class="day">' + rowday + '</span></td>');
            }
            if (j % 7 == 6) table += ('</tr>');
        }

        table += ('</table>');

        this.calendar.update(table);
    },

    onMaskTap: function() {
        if (Ext.form.ux.touch.CalendarPickerField.superclass.onMaskTap.apply(this, arguments) !== true) {
            return false;
        }
        this.now = new Date();
        if (Ext.isDate(this.value)) this.setDate(this.value);
        else this.setDate(this.now);

        if (!this.calendar) this.initCalendar();


        this.drawCalendar();

        if (Ext.is.Phone) this.calendar.show();
        else this.calendar.showBy(this, 'fade');
    },

    onPickerChange: function(picker, value) {
		this.fireEvent('beforeselect', this, this.getValue(), value);
	    this.setValue(value);
        this.fireEvent('select', this, this.getValue());
    },

    setValue: function(value, animated) {
        if (!Ext.isDate(value)) return

        this.value = value;
        if (this.rendered) {
            var text = this.getText();
            this.fieldEl.dom.innerHTML = text;
        }
        this.setDate(value)
        return this;
    },
	
	setDateFormat: function(value) {
		this.dateFormat = value;
	},
	
    getText: function() {
        return this.value.format(this.dateFormat);
    },

    getValue: function() {
        var value = this.value || null;
        return value;
    },

    onDestroy: function() {
        Ext.form.ux.touch.CalendarPickerField.superclass.onDestroy.call(this);
    }

});

Ext.reg("calendarpickerfield", Ext.form.ux.touch.CalendarPickerField);