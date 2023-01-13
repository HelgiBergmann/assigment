import { Report } from "../barchart";

type daysOfWeek = { [key: string]: number };
type countries = { [key: string]: number };
type categories = { [key: string]: number };
type clients = { [key: string]: number };

interface ReportTotal {
  reportAmount: number;
  partnerCount: number;
  countryCount: number;
  requestPerDay: number;
}

interface ReportData {
    daysOfWeek: daysOfWeek,
    countries: countries,
    categories: categories,
    clients: clients,
    totalReports:  ReportTotal
}

interface Chart {
  labels: string[];
  datasets: {
    labels: string;
    data: number[];
  }
}

export const getDataForReport = (reports: Report[]) => {
  
  const report: ReportData = {
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
  }

  for (let i = 0; i < reports.length; i++) {
    const field = reports[i].creationDate.toString().split(" ").slice(0,1).join(" ");

    if (report.daysOfWeek[`${field}`]) {
      report.daysOfWeek[`${field}`]++;
    } else {
      report.daysOfWeek[`${field}`] = 1;
    }

    if (report.countries[`${reports[i].countryId}`]) {
      report.countries[`${reports[i].countryId}`]++;
    } else {
      report.countries[`${reports[i].countryId}`] = 1;
    }

    if (report.categories[`${reports[i].category}`]) {
      report.categories[`${reports[i].category}`]++;
    } else {
      report.categories[`${reports[i].category}`] = 1;
    }

    if (report.clients[`${reports[i].clientId}`]) {
      report.clients[`${reports[i].clientId}`]++;
    } else {
      report.clients[`${reports[i].clientId}`] = 1;
    }
  }

  report.totalReports.countryCount = Object.keys(report.countries).length;
  report.totalReports.partnerCount = Object.keys(report.clients).length;
  report.totalReports.requestPerDay = getReportAvrByTimeline(reports.length, Object.keys(report.daysOfWeek).length);
  return report;
}

const getReportAvrByTimeline = (total:number, weekdays: number) => {
  return Math.floor(total/weekdays);
}


export const prepareDataForChart = (data: ReportData) => {
  const countryArray: number[] = [];
  const weekdayArray: number[] = [];
  const categoryArray: number[] = [];

  const countryChart: Chart  = {
    labels: [],
    datasets: {
      labels: "",
      data: [],
    }
  };

  const weekdayChart: Chart = {
    labels: [],
    datasets: {
      labels: "",
      data: [],
    }
  }

  const categoryChart: Chart = { 
    labels: [],
    datasets: {
      labels: "",
      data: [],
    }
  }

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

  countryChart.datasets  = {
    labels: "Reports",
    data: countryArray,
  }

  weekdayChart.datasets = {
    labels: "Reports",
    data: weekdayArray,
  }

  categoryChart.datasets = {
    labels: "Reports",
    data: categoryArray,
  }

  return {
    countryChart,
    weekdayChart,
    categoryChart,
  };
}


// Commited because for every operation we run the loop again

// export const getReportInfoByTimeline = (reports: Report[]) => {
//   const daysOfWeek: { [key: string]: number } = {};
//   for (let i = 0; i < reports.length; i++) {
//     const field = reports[i].creationDate.toString().split(" ").slice(0,1).join(" ");
//     if (daysOfWeek[`${field}`]) {
//       daysOfWeek[`${field}`]++;
//     } else {
//       daysOfWeek[`${field}`] = 1;
//     }
//   }
//   return daysOfWeek;
// }

// export const getReportInfoByCountries = (reports: Report[]) => {
//   const countries: { [key: string]: number } = {};
//   for (let i = 0; i < reports.length; i++) {
//     const field = reports[i].countryId;
//     if (countries[`${field}`]) {
//       countries[`${field}`]++;
//     } else {
//       countries[`${field}`] = 1;
//     }
//   }
//   return countries;
// }

// export const getReportInfoByCategories = (reports: Report[]) => {
//   const categories: { [key: string]: number } = {};
//   for (let i = 0; i < reports.length; i++) {
//     const field = reports[i].category;
//     if (categories[`${field}`]) {
//       categories[`${field}`]++;
//     } else {
//       categories[`${field}`] = 1;
//     }
//   }
//   return categories;
// }

// export const getCountries = (reports: Report[]) => {
//   const counties = new Set();
//   for (let i = 0; i < reports.length; i++) {
//     counties.add(reports[i].countryId);
//   }
//   return counties;
// }

// export const getPartners = (reports: Report[]) => {
//   const partners = new Set();
//   for (let i = 0; i < reports.length; i++) {
//     partners.add(reports[i].clientId);
//   }
//   return partners;
// }


