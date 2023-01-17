import React, { useEffect } from "react";
import { useMatch, useLocation } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import axios from "axios";
export default function Report(props) {
  console.log(props);
  const match = useMatch("/report/:id/");
  const [report, setReport] = React.useState({});
  console.log(match);
  useEffect(() => {
    axios.get(`http://localhost:5000/report/${match?.params?.id}`).then((response) => {
      console.log(response.data, "get report");
      setReport(response.data);
    });
  }, []);
  function onButtonClick(e) {
    e.preventDefault();
    console.log(report);
    axios
      .put(`http://localhost:5000/report/${match?.params?.id}`, {
        data: JSON.stringify(report),
      })
      .then((response) => {
        setReport(response.data);
      });
  }

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <MDBox
                  mx={2}
                  mt={-3}
                  py={3}
                  px={2}
                  variant="gradient"
                  bgColor="info"
                  borderRadius="lg"
                  coloredShadow="info"
                >
                  {report?.id?.S && (
                    <MDTypography variant="h6" color="white">
                      Report {report.id.S}
                    </MDTypography>
                  )}
                </MDBox>
                <MDBox mx={2} pt={3} mb={3}>
                  {report?.id?.S && (
                    <TextField
                      id="standard-basic"
                      defaultValue={report.id.S}
                      disabled
                      label="Id"
                      variant="standard"
                    />
                  )}
                </MDBox>
                <MDBox mx={2} pt={3} mb={3}>
                  {report?.countryId?.S && (
                    <TextField
                      id="standard-basic"
                      defaultValue={report.countryId.S}
                      label="Country"
                      variant="standard"
                    />
                  )}
                </MDBox>
                <MDBox mx={2} pt={3} mb={3}>
                  {report?.category?.S && (
                    <TextField
                      id="standard-basic"
                      onChange={(e) => {
                        setReport({ ...report, category: { S: e.target.value } });
                      }}
                      defaultValue={report.category.S}
                      label="Category"
                      variant="standard"
                    />
                  )}
                </MDBox>
                <MDBox mx={2} pt={3} mb={3}>
                  {report?.userAgent?.S && (
                    <TextField
                      id="standard-basic"
                      disabled
                      defaultValue={report.userAgent.S}
                      label="User Agent"
                      variant="standard"
                    />
                  )}
                </MDBox>
                <MDBox mx={2} pt={3} mb={3}>
                  <Button onClick={onButtonClick}>Save chagnges</Button>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </DashboardLayout>
    </>
  );
}
