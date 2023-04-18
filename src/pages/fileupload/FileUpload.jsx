import { Button, Input } from "@mui/material";
import React, { useState } from "react";
import FileUploader from "react-mui-fileuploader";
import axios from "axios";
import Bike from "../../assets/Bike.png";
import { useTranslation } from "react-i18next";
import { useGlobalState } from "../../components/GlobalStateProvider";

function FileUpload() {
  const { t, i18n } = useTranslation("translation");
  const [oFileToUpload, fSetFileToUpload] = useState();
  const { oState, fSetState } = useGlobalState();
  const fHandeFileChange = (oEvent) => {
    fSetFileToUpload(oEvent.target.files[0]);
  };
  const fUploadFile = () => {
    const frXMLReader = new FileReader();
    const file = {};
    frXMLReader.readAsText(oFileToUpload);
    frXMLReader.onloadend = async (oEvent) => {
      const file = {
        content: oEvent.target.result,
      };
      const dpParser = new DOMParser();
      const jqXMLFile = dpParser.parseFromString(file.content, "text/xml");
      const oForecast = {};

      const aPeriods = ["p1", "p2", "p3"];

      aPeriods.forEach((sPeriod) => {
        oForecast[sPeriod] = jqXMLFile
          .getElementsByTagName("forecast")[0]
          .getAttributeNode(sPeriod).value;
      });

      await axios
        .post("/URL", file, {
          headers: {
            "Content-Type": "text/xml",
          },
        })
        .then((oResponse) => {
          fSetState(oResponse.data);
        });
    };
  };

  return (
    <>
      <input type="file" accept=".xml" onChange={fHandeFileChange} />
      <Button variant="contained" onClick={fUploadFile}>
        {t("fileupload.uploadButton")}
      </Button>
    </>
  );
}

export default FileUpload;
