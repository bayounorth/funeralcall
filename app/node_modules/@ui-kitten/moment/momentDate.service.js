"use strict";
/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("@ui-kitten/components");
const moment_1 = __importDefault(require("moment"));
class MomentDateService extends components_1.DateService {
    constructor(locale = 'en') {
        super();
        this.setLocale(locale);
    }
    setLocale(locale) {
        super.setLocale(locale);
        this.setMomentLocaleData(locale);
    }
    addDay(date, days) {
        return this.clone(date).add({ days });
    }
    addMonth(date, months) {
        return this.clone(date).add({ months });
    }
    addYear(date, years) {
        return this.clone(date).add({ years });
    }
    clone(date) {
        return date.clone().locale(this.locale);
    }
    compareDates(date1, date2) {
        return this.getYear(date1) - this.getYear(date2) ||
            this.getMonth(date1) - this.getMonth(date2) ||
            this.getDate(date1) - this.getDate(date2);
    }
    createDate(year, month, date) {
        return moment_1.default.utc([year, month, date]);
    }
    format(date, format) {
        if (date) {
            return date.format(format || this.localeData.defaultFormat);
        }
        return '';
    }
    getDate(date) {
        return this.clone(date).date();
    }
    getDayOfWeek(date) {
        return this.clone(date).day();
    }
    getDayOfWeekNames(style = components_1.TranslationWidth.SHORT) {
        return this.localeData.days[style];
    }
    getFirstDayOfWeek() {
        return this.localeData.firstDayOfWeek;
    }
    getMonth(date) {
        return this.clone(date).month();
    }
    getMonthEnd(date) {
        return this.clone(date).endOf('month');
    }
    getMonthName(date, style = components_1.TranslationWidth.SHORT) {
        const month = this.getMonth(date);
        return this.getMonthNameByIndex(month, style);
    }
    getMonthNameByIndex(month, style = components_1.TranslationWidth.SHORT) {
        return this.localeData.months[style][month];
    }
    getMonthStart(date) {
        return this.clone(date).startOf('month');
    }
    getNumberOfDaysInMonth(date) {
        return this.clone(date).daysInMonth();
    }
    getYear(date) {
        return this.clone(date).year();
    }
    getYearEnd(date) {
        return this.clone(date).endOf('year');
    }
    getYearStart(date) {
        return this.clone(date).startOf('year');
    }
    isSameDay(date1, date2) {
        return this.isSameMonth(date1, date2) && this.getDate(date1) === this.getDate(date2);
    }
    isSameMonth(date1, date2) {
        return this.isSameYear(date1, date2) && this.getMonth(date1) === this.getMonth(date2);
    }
    isSameYear(date1, date2) {
        return this.getYear(date1) === this.getYear(date2);
    }
    isValidDateString(date, format) {
        return moment_1.default(date, format).isValid();
    }
    parse(date, format) {
        return moment_1.default(date, format);
    }
    today() {
        return moment_1.default();
    }
    getId() {
        return 'moment';
    }
    setMomentLocaleData(locale) {
        const momentLocaleData = moment_1.default.localeData(locale);
        this.localeData = {
            firstDayOfWeek: momentLocaleData.firstDayOfWeek(),
            defaultFormat: momentLocaleData.longDateFormat('L'),
            months: {
                [components_1.TranslationWidth.SHORT]: momentLocaleData.monthsShort(),
                [components_1.TranslationWidth.LONG]: momentLocaleData.months(),
            },
            days: {
                [components_1.TranslationWidth.SHORT]: momentLocaleData.weekdaysShort(),
                [components_1.TranslationWidth.LONG]: momentLocaleData.weekdays(),
            },
        };
    }
}
exports.MomentDateService = MomentDateService;
//# sourceMappingURL=momentDate.service.js.map