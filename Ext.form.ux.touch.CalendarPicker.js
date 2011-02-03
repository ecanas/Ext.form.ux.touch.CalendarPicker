/*
    Author       : Edgar Canas
    Site         : 
    Contact Info : ed.canas@gmail.com
    Purpose      : Creation of a custom calendar picker

    License      : GPL v3 (http://www.gnu.org/licenses/gpl.html)
    Warranty     : none
    Price        : free
    Version      : .9b
    Date         : 02/02/2011
*/

Ext.ns("Ext.form.ux.touch");

Ext.form.ux.touch.CalendarPickerField = Ext.extend(Ext.form.Field, {
    ui: 'select',
    picker: null,
    destroyPickerOnHide: false,
    displaySlot: null,
    otherCls: "",
    renderTpl: null,
    displaySlot: "Date",
    dateFormat: "MM/dd/yyyy",
    initComponent: function() {
        if (this.displaySlot === null) {
            throw "Must specify a displaySlot";
        }
        this.addEvents(
        'select'
        );
        this.now = new Date();
        this.useMask = true;
        this.month;
        this.year;
        this.day;
		var zeroPad = function(n)
	    {
	        return (n < 10 ? '0': '') + n;
	    }
	
	    this.dateFormatters =
	    {
	        s: function(d)
	        {
	            return d.getSeconds();
	        }
	        ,
	        ss: function(d)
	        {
	            return zeroPad(d.getSeconds());
	        }
	        ,
	        m: function(d)
	        {
	            return d.getMinutes();
	        }
	        ,
	        mm: function(d)
	        {
	            return zeroPad(d.getMinutes());
	        }
	        ,
	        h: function(d)
	        {
	            return d.getHours() % 12 || 12;
	        }
	        ,
	        hh: function(d)
	        {
	            return zeroPad(d.getHours() % 12 || 12);
	        }
	        ,
	        H: function(d)
	        {
	            return d.getHours();
	        }
	        ,
	        HH: function(d)
	        {
	            return zeroPad(d.getHours());
	        }
	        ,
	        d: function(d)
	        {
	            return d.getDate();
	        }
	        ,
	        dd: function(d)
	        {
	            return zeroPad(d.getDate());
	        }
	        ,
	        ddd: function(d, o)
	        {
	            return o.dayNamesShort[d.getDay()];
	        }
	        ,
	        dddd: function(d, o)
	        {
	            return o.dayNames[d.getDay()];
	        }
	        ,
	        M: function(d)
	        {
	            return d.getMonth() + 1;
	        }
	        ,
	        MM: function(d)
	        {
	            return zeroPad(d.getMonth() + 1);
	        }
	        ,
	        MMM: function(d, o)
	        {
	            return o.monthNamesShort[d.getMonth()];
	        }
	        ,
	        MMMM: function(d, o)
	        {
	            return o.monthNames[d.getMonth()];
	        }
	        ,
	        yy: function(d)
	        {
	            return (d.getFullYear() + '').substring(2);
	        }
	        ,
	        yyyy: function(d)
	        {
	            return d.getFullYear();
	        }
	        ,
	        t: function(d)
	        {
	            return d.getHours() < 12 ? 'a': 'p';
	        }
	        ,
	        tt: function(d)
	        {
	            return d.getHours() < 12 ? 'am': 'pm';
	        }
	        ,
	        T: function(d)
	        {
	            return d.getHours() < 12 ? 'A': 'P';
	        }
	        ,
	        TT: function(d)
	        {
	            return d.getHours() < 12 ? 'AM': 'PM';
	        }
	        ,
	        u: function(d)
	        {
	            return formatDate(d, "yyyy-MM-dd'T'HH:mm:ss'Z'");
	        }
	        ,
	        S: function(d)
	        {
	            var date = d.getDate();
	            if (date > 10 && date < 20)
	            {
	                return 'th';
	            }
	            return ['st', 'nd', 'rd'][date % 10 - 1] || 'th';
	        }
	    };
	
		this.navBar = new Ext.Toolbar({
            dock: 'top',
            title: '',
            layout: {
                pack: 'justify',
                align: 'center'
                // align center is the default
            },
            items: [
            {
                xtype: 'button',
                ui: 'action',
                iconMask: true,
		        iconCls: "arrow_left",
                scope: this,
                handler: function() {
                    this.prevMonth();
                }
            },
            {
                xtype: 'component',
                flex: 1
            },
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
	
        this.calendar = new Ext.Panel({
            scroll: false,
            width: Ext.is.Phone ? Ext.Element.getViewportWidth() : 400,
            height: Ext.is.Phone ? Ext.Element.getViewportHeight() : 408,
            modal: false,
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
            }],
            listeners: {
                scope: this,
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

        this.setDate(this.now);
        this.renderTpl = this.renderTpl || renderTpl;
    },

    nextMonth: function() {
        if (this.month == 11) {
            this.month = 0;
            this.year += 1;
        }
        else this.month += 1;
        this.makePicker();
    },

    prevMonth: function() {
        if (this.month == 0) {
            this.month = 11;
            this.year -= 1;
        }
        else this.month = this.month - 1;
        this.makePicker();
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
        this.makePicker();
    },

    makePicker: function() {
	    var month = this.month;
        var year = this.year;
        var day = this.day;
		var today = this.now.getDate();
		var dayselected = this.value.getDate();
		
        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var dayNames = ['S', 'M', 'T', 'W', 'TH', 'F', 'S'];

        var m = 0;
        var table = '';

        this.navBar.setTitle(monthNames[month] + ' ' + year);
        table += ('<table class="calendar-month " ' + 'id="calendar-month' + i + ' " cellspacing="0">');

        table += '<tr>';

        for (d = 0; d < 7; d++) {
            table += '<th class="weekday">' + dayNames[d] + '</th>';
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
		if (Ext.isDate(this.value)) this.setDate(this.value);
        this.makePicker();
        if (Ext.is.Phone) this.calendar.show();
        else this.calendar.showBy(this, 'fade');
    },

    onPickerChange: function(picker, value) {
		this.setValue(value);
        this.fireEvent('select', this, this.getValue());
    },

    onPickerHide: function() {
	    // if (this.destroyPickerOnHide && this.fieldPicker) {
        //     this.fieldPicker.destroy();
        // }
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

    getText: function() {
        return this.formatDate(this.value, this.dateFormat, null);
    },

    getValue: function() {
        var value = this.value || null;
        return value;
    },

    onDestroy: function() {
        if (this.fieldPicker) {
            this.fieldPicker.destroy();
        }

        Ext.form.ux.touch.CalendarPickerField.superclass.onDestroy.call(this);
    }, 

	formatDate: function(date, format, options){
        return this.formatDates(date, null, format, options);
    },

    formatDates: function(date1, date2, format, options) {
        //options = options || defaults;
        var date = date1,
        otherDate = date2,
        i,
        len = format.length,
        c,
        i2,
        formatter,
        res = '';
        for (i = 0; i < len; i++)
        {
            c = format.charAt(i);
            if (c == "'")
            {
                for (i2 = i + 1; i2 < len; i2++)
                {
                    if (format.charAt(i2) == "'")
                    {
                        if (date)
                        {
                            if (i2 == i + 1)
                            {
                                res += "'";
                            }
                            else
                            {
                                res += format.substring(i + 1, i2);
                            }
                            i = i2;
                        }
                        break;
                    }
                }
            }
            else if (c == '(')
            {
                for (i2 = i + 1; i2 < len; i2++)
                {
                    if (format.charAt(i2) == ')')
                    {
                        var subres = formatDate(date, format.substring(i + 1, i2), options);
                        if (parseInt(subres.replace(/\D/, '')))
                        {
                            res += subres;
                        }
                        i = i2;
                        break;
                    }
                }
            }
            else if (c == '[')
            {
                for (i2 = i + 1; i2 < len; i2++)
                {
                    if (format.charAt(i2) == ']')
                    {
                        var subformat = format.substring(i + 1, i2);
                        var subres = formatDate(date, subformat, options);
                        if (subres != formatDate(otherDate, subformat, options))
                        {
                            res += subres;
                        }
                        i = i2;
                        break;
                    }
                }
            }
            else if (c == '{')
            {
                date = date2;
                otherDate = date1;
            }
            else if (c == '}')
            {
                date = date1;
                otherDate = date2;
            }
            else
            {
                for (i2 = len; i2 > i; i2--)
                {
                    if (formatter = this.dateFormatters[format.substring(i, i2)])
                    {
                        if (date)
                        {
                            res += formatter(date, options);
                        }
                        i = i2 - 1;
                        break;
                    }
                }
                if (i2 == i)
                {
                    if (date)
                    {
                        res += c;
                    }
                }
            }
        }
        return res;
    }

});

Ext.reg("calendarpickerfield", Ext.form.ux.touch.CalendarPickerField);