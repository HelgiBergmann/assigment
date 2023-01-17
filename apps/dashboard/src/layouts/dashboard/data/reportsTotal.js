import axios from "axios";
import React, { useEffect, useState, useLayoutEffect } from "react";

export default function useReportsForBarChart() {
  const [reports, setReports] = useState([]);

  useLayoutEffect(() => {
    axios
      .get("http://localhost:5000/barchart")
      .then((response) => {
        // handle success
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
  return reports;
}
