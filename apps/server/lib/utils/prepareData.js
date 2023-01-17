"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareDataForChart = exports.getDataForReport = void 0;
// Rewrite to query dynamoDB
const getDataForReport = (reports) => {
    const report = {
        clients: {},
        daysOfWeek: {},
        countries: {},
        categories: {},
        totalReports: {
            reportAmount: reports.length,
            partnerCount: 0,
            countryCount: 0,
            requestPerDay: 0,
        }
    };
    for (let i = 0; i < reports.length; i++) {
        const field = reports[i].creationDate.S.toString().split(" ").slice(0, 1).join(" ");
        if (report.daysOfWeek[`${field}`]) {
            report.daysOfWeek[`${field}`]++;
        }
        else {
            report.daysOfWeek[`${field}`] = 1;
        }
        if (report.countries[`${reports[i].countryId.S}`]) {
            report.countries[`${reports[i].countryId.S}`]++;
        }
        else {
            report.countries[`${reports[i].countryId.S}`] = 1;
        }
        if (report.categories[`${reports[i].category.S}`]) {
            report.categories[`${reports[i].category.S}`]++;
        }
        else {
            report.categories[`${reports[i].category.S}`] = 1;
        }
        if (report.clients[`${reports[i].clientId.S}`]) {
            report.clients[`${reports[i].clientId.S}`]++;
        }
        else {
            report.clients[`${reports[i].clientId.S}`] = 1;
        }
    }
    report.totalReports.countryCount = Object.keys(report.countries).length;
    report.totalReports.partnerCount = Object.keys(report.clients).length;
    report.totalReports.requestPerDay = getReportAvrByTimeline(reports.length, Object.keys(report.daysOfWeek).length);
    return report;
};
exports.getDataForReport = getDataForReport;
const getReportAvrByTimeline = (total, weekdays) => {
    return Math.floor(total / weekdays);
};
const prepareDataForChart = (data) => {
    const countryArray = [];
    const weekdayArray = [];
    const categoryArray = [];
    const countryChart = {
        labels: [],
        datasets: {
            labels: "",
            data: [],
        }
    };
    const weekdayChart = {
        labels: [],
        datasets: {
            labels: "",
            data: [],
        }
    };
    const categoryChart = {
        labels: [],
        datasets: {
            labels: "",
            data: [],
        }
    };
    countryChart.labels = Object.keys(data.countries);
    weekdayChart.labels = Object.keys(data.daysOfWeek);
    categoryChart.labels = Object.keys(data.categories);
    for (let key in data.countries) {
        countryArray.push(data.countries[key]);
    }
    for (let key in data.daysOfWeek) {
        weekdayArray.push(data.daysOfWeek[key]);
    }
    for (let key in data.categories) {
        categoryArray.push(data.categories[key]);
    }
    countryChart.datasets = {
        labels: "Reports",
        data: countryArray,
    };
    weekdayChart.datasets = {
        labels: "Reports",
        data: weekdayArray,
    };
    categoryChart.datasets = {
        labels: "Reports",
        data: categoryArray,
    };
    return {
        countryChart,
        weekdayChart,
        categoryChart,
    };
};
exports.prepareDataForChart = prepareDataForChart;
