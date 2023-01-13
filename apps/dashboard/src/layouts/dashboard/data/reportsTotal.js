import axios from "axios";
import React, { useEffect, useState, useLayoutEffect } from "react";

export default function useReportsForBarChart() {
  const [reports, setReports] = useState([]);

  useLayoutEffect(() => {
    axios
      .get("http://localhost:3000/api/reports/barchart")
      .then((response) => {
        // handle success
        console.log(response);
        setReports(response.data);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      })
      .finally(() => {
        // always executed
        console.log("done");
      });
  }, []);
  console.log(reports);
  return reports;
}
