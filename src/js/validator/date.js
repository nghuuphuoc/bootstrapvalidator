(function($) {
    $.fn.bootstrapValidator.i18n.date = $.extend($.fn.bootstrapValidator.i18n.date || {}, {
        'default': 'Please enter a valid date',
        min: 'Please enter a date after %s',
        max: 'Please enter a date before %s',
        range: 'Please enter a date in the range %s - %s'
    });

    $.fn.bootstrapValidator.validators.date = {
        html5Attributes: {
            message: 'message',
            format: 'format',
            min: 'min',
            max: 'max',
            separator: 'separator'
        },

        /**
         * Return true if the input value is valid date
         *
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field Field element
         * @param {Object} options Can consist of the following keys:
         * - message: The invalid message
         * - min: the minimum date
         * - max: the maximum date
         * - separator: Use to separate the date, month, and year.
         * By default, it is /
         * - format: The date format. Default is MM/DD/YYYY
         * The format can be:
         *
         * i) date: Consist of DD, MM, YYYY parts which are separated by the separator option
         * ii) date and time:
         * The time can consist of h, m, s parts which are separated by :
         * ii) date, time and A (indicating AM or PM)
         * @returns {Boolean|Object}
         */
        validate: function(validator, $field, options) {
            var value = $field.val();
            if (value === '') {
                return true;
            }

            options.format = options.format || 'MM/DD/YYYY';

            // #683: Force the format to YYYY-MM-DD as the default browser behaviour when using type="date" attribute
            if ($field.attr('type') === 'date') {
                options.format = 'YYYY-MM-DD';
            }

            var formats    = options.format.split(' '),
                dateFormat = formats[0],
                timeFormat = (formats.length > 1) ? formats[1] : null,
                amOrPm     = (formats.length > 2) ? formats[2] : null,
                sections   = value.split(' '),
                date       = sections[0],
                time       = (sections.length > 1) ? sections[1] : null;

            if (formats.length !== sections.length) {
                return {
                    valid: false,
                    message: options.message || $.fn.bootstrapValidator.i18n.date['default']
                };
            }

            // Determine the separator
            var separator = options.separator;
            if (!separator) {
                separator = (date.indexOf('/') !== -1) ? '/' : ((date.indexOf('-') !== -1) ? '-' : null);
            }
            if (separator === null || date.indexOf(separator) === -1) {
                return {
                    valid: false,
                    message: options.message || $.fn.bootstrapValidator.i18n.date['default']
                };
            }

            // Determine the date
            date       = date.split(separator);
            dateFormat = dateFormat.split(separator);
            if (date.length !== dateFormat.length) {
                return {
                    valid: false,
                    message: options.message || $.fn.bootstrapValidator.i18n.date['default']
                };
            }

            var year  = date[$.inArray('YYYY', dateFormat)],
                month = date[$.inArray('MM', dateFormat)],
                monthFul = date[$.inArray('MMM', dateFormat)],
                day   = date[$.inArray('DD', dateFormat)];
            
                if (isNaN(month)) {
					var monthArr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
					month = ($.inArray(monthFul.toLowerCase(), monthArr)+1).toString();
				}

            if (!year || !month || !day || year.length !== 4) {
                return {
                    valid: false,
                    message: options.message || $.fn.bootstrapValidator.i18n.date['default']
                };
            }

            // Determine the time
            var minutes = null, hours = null, seconds = null;
            if (timeFormat) {
                timeFormat = timeFormat.split(':');
                time       = time.split(':');

                if (timeFormat.length !== time.length) {
                    return {
                        valid: false,
                        message: options.message || $.fn.bootstrapValidator.i18n.date['default']
                    };
                }

                hours   = time.length > 0 ? time[0] : null;
                minutes = time.length > 1 ? time[1] : null;
                seconds = time.length > 2 ? time[2] : null;

                // Validate seconds
                if (seconds) {
                    if (isNaN(seconds) || seconds.length > 2) {
                        return {
                            valid: false,
                            message: options.message || $.fn.bootstrapValidator.i18n.date['default']
                        };
                    }
                    seconds = parseInt(seconds, 10);
                    if (seconds < 0 || seconds > 60) {
                        return {
                            valid: false,
                            message: options.message || $.fn.bootstrapValidator.i18n.date['default']
                        };
                    }
                }

                // Validate hours
                if (hours) {
                    if (isNaN(hours) || hours.length > 2) {
                        return {
                            valid: false,
                            message: options.message || $.fn.bootstrapValidator.i18n.date['default']
                        };
                    }
                    hours = parseInt(hours, 10);
                    if (hours < 0 || hours >= 24 || (amOrPm && hours > 12)) {
                        return {
                            valid: false,
                            message: options.message || $.fn.bootstrapValidator.i18n.date['default']
                        };
                    }
                }

                // Validate minutes
                if (minutes) {
                    if (isNaN(minutes) || minutes.length > 2) {
                        return {
                            valid: false,
                            message: options.message || $.fn.bootstrapValidator.i18n.date['default']
                        };
                    }
                    minutes = parseInt(minutes, 10);
                    if (minutes < 0 || minutes > 59) {
                        return {
                            valid: false,
                            message: options.message || $.fn.bootstrapValidator.i18n.date['default']
                        };
                    }
                }
            }

            // Validate day, month, and year
            var valid   = $.fn.bootstrapValidator.helpers.date(year, month, day),
                message = options.message || $.fn.bootstrapValidator.i18n.date['default'];

            // declare the date, min and max objects
            var min       = null,
                max       = null,
                minOption = options.min,
                maxOption = options.max;

            if (minOption) {
                if (isNaN(Date.parse(minOption))) {
                    minOption = validator.getDynamicOption($field, minOption);
                }
                min = this._parseDate(minOption, dateFormat, separator);
            }

            if (maxOption) {
                if (isNaN(Date.parse(maxOption))) {
                    maxOption = validator.getDynamicOption($field, maxOption);
                }
                max = this._parseDate(maxOption, dateFormat, separator);
            }

            date = new Date(year, month, day, hours, minutes, seconds);

            switch (true) {
                case (minOption && !maxOption && valid):
                    valid   = date.getTime() >= min.getTime();
                    message = options.message || $.fn.bootstrapValidator.helpers.format($.fn.bootstrapValidator.i18n.date.min, minOption);
                    break;

                case (maxOption && !minOption && valid):
                    valid   = date.getTime() <= max.getTime();
                    message = options.message || $.fn.bootstrapValidator.helpers.format($.fn.bootstrapValidator.i18n.date.max, maxOption);
                    break;

                case (maxOption && minOption && valid):
                    valid   = date.getTime() <= max.getTime() && date.getTime() >= min.getTime();
                    message = options.message || $.fn.bootstrapValidator.helpers.format($.fn.bootstrapValidator.i18n.date.range, [minOption, maxOption]);
                    break;

                default:
                    break;
            }

            return {
                valid: valid,
                message: message
            };
        },

        /**
         * Return a date object after parsing the date string
         *
         * @param {String} date   The date string to parse
         * @param {String} format The date format
         * The format can be:
         *   - date: Consist of DD, MM, YYYY parts which are separated by the separator option
         *   - date and time:
         *     The time can consist of h, m, s parts which are separated by :
         * @param {String} separator The separator used to separate the date, month, and year
         * @returns {Date}
         */
        _parseDate: function(date, format, separator) {
            var minutes     = 0, hours = 0, seconds = 0,
                sections    = date.split(' '),
                dateSection = sections[0],
                timeSection = (sections.length > 1) ? sections[1] : null;

            dateSection = dateSection.split(separator);
            var year  = dateSection[$.inArray('YYYY', format)],
                month = dateSection[$.inArray('MM', format)],
                day   = dateSection[$.inArray('DD', format)];
            if (timeSection) {
                timeSection = timeSection.split(':');
                hours       = timeSection.length > 0 ? timeSection[0] : null;
                minutes     = timeSection.length > 1 ? timeSection[1] : null;
                seconds     = timeSection.length > 2 ? timeSection[2] : null;
            }

            return new Date(year, month, day, hours, minutes, seconds);
        }
    };
}(window.jQuery));
