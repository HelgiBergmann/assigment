/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
/**
=========================================================
* Material Dashboard 2 React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";
import React, { useLayoutEffect, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Input from "@mui/material/Input";

// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

export default function data() {
  const [reports, setReports] = React.useState([]);
  const [columns, setColumns] = React.useState([]);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  useLayoutEffect(() => {
    axios.get("http://localhost:5000/reports").then((response) => {
      console.log(response);
      setReports(response.data);
      const headers = Object.keys(response.data.Items[0]).filter((el) => {
        return el !== "subcategory" && el !== "clientId" && el !== "id";
      });
      headers.push("action");
      const columns = headers.map((header) => {
        return { Header: header, accessor: header };
      });
      setColumns(columns);

      function onEditClick(item) {
        console.log(item);
        navigate(`/report/${item.id.S}`);
      }

      const rows = response.data.Items.map((item) => {
        return {
          userAgent: <Author image={team2} name={item.userAgent.S} />,
          category: <Job title={item.category.S} description={item.subcategory.S} />,
          countryId: (
            <MDBox ml={-1}>
              <MDBadge
                badgeContent={item.countryId.S}
                color="success"
                variant="gradient"
                size="sm"
              />
            </MDBox>
          ),
          creationDate: (
            <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
              {item.creationDate.S.split(" ").splice(1, 4).join(" ")}
            </MDTypography>
          ),
          action: (
            <MDTypography
              onClick={(e) => {
                e.preventDefault();
                onEditClick(item);
              }}
              id={item.id.S}
              component="a"
              href="#"
              variant="caption"
              color="text"
              fontWeight="medium"
            >
              Edit
            </MDTypography>
          ),
        };
      });
      setRows(rows);
    });
  }, []);
  console.log(columns);

  const Author = ({ image, name, email }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="sm" />
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption">{email}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const Job = ({ title, description }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {title}
      </MDTypography>
      <MDTypography variant="caption">{description}</MDTypography>
    </MDBox>
  );

  return {
    columns,
    rows,
  };
}
