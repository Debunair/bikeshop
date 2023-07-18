import {
  FormControl,
  Input,
  InputLabel,
  FormHelperText,
  Tooltip,
  Box,
  Typography,
  Grid,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalState } from "../../../components/GlobalStateProvider";
import { InfoOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Workinghours({ data, calculations, validate }) {
  const [items, setItems] = useState([]);
  const fSetGlobalValid = validate;
  const { t, i18n } = useTranslation();
  const { state, setState } = useGlobalState();
  const [iMaxNumber, setMaxNumber] = useState(240);

  const allowedKeys = [
    "ArrowLeft",
    "ArrowRight",
    "Backspace",
    "ArrowUp",
    "ArrowDown",
    "Tab",
  ];

  useEffect(() => {
    setItems(state["workingtimelist"]);
  }, [items]);

  const getCalculationExplanation = (element) => {
    if (calculations) {
      const calculation = calculations.find((calc) => calc.element === element);
      if (calculation) {
        return calculation.explanation;
      }
    }
    return " ";
  };

  return (
    <Box>
      <Tooltip arrow title={t("simulation.tooltipWorkhours")}>
        <InfoOutlined />
      </Tooltip>
      <Box sx={{ fontSize: "14px", textAlign: "start" }}>
        <Typography>{t("simulation.workhoursInfo.info1")}</Typography>
        <br />
        <Typography>{t("simulation.workhoursInfo.info2")}</Typography>
        <br />
        <Typography>{t("simulation.workhoursInfo.info3")}</Typography>
        <br />
        <Typography>{t("simulation.workhoursInfo.info4")}</Typography>
        <br />
        <Typography>{t("simulation.workhoursInfo.info5")}</Typography>
        <br />
      </Box>
      {items &&
        items.length > 0 &&
        items.map((oElement) => {
          return (
            <Box
              key={oElement.station}
              sx={{
                margin: "2rem",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
                width: "650px",
              }}
            >
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" marginBottom="0.5rem">
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: "bold", marginLeft: "1rem" }}
                    >
                      {t("simulation.workstation")} {oElement.station}:
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t("simulation.shift")}</InputLabel>
                    <Input
                      type="number"
                      id={"inputshift" + oElement.station}
                      aria-describedby="form-helper"
                      onInput={(oEvent) => {
                        if (oEvent.target.value > 3) {
                          oEvent.target.value = 3;
                        }
                        if (oEvent.target.value < 0) {
                          oEvent.target.value = 0;
                        }
                      }}
                      inputProps={{
                        min: 0,
                        max: 3,
                        onKeyDown: (event) => {
                          if (
                            (!/^\d$/.test(event.key) &&
                              !allowedKeys.includes(event.key)) ||
                            (event.key === "Backspace" &&
                              event.target.value.length === 1)
                          ) {
                            event.preventDefault();
                          }
                        },
                      }}
                      value={oElement.shift}
                      onChange={(oEvent) => {
                        const oNewState = state;
                        const oIndex = oNewState["workingtimelist"].find(
                          (oObject) => oObject.station === oElement.station
                        );

                        const iIndex =
                          oNewState["workingtimelist"].indexOf(oIndex);
                        oNewState["workingtimelist"][iIndex].shift =
                          oEvent.target.valueAsNumber;
                        if (oEvent.target.valueAsNumber === 3) {
                          oNewState["workingtimelist"][iIndex].overtime = 0;
                          document.getElementById(
                            `inputovertime${oElement.station}`
                          ).value = 0;
                        }
                        /* setItems(...oNewState["workingtimelist"]); */
                        setState(oNewState);
                      }}
                    />
                  </FormControl>
                  {calculations && (
                    <Typography
                      variant="body2"
                      alignContent="start"
                      marginTop="0.5rem"
                    >
                      Produktions- und Rüstzeiten:
                      {getCalculationExplanation(oElement.station)}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t("simulation.overtime")}</InputLabel>
                    <Input
                      id={"inputovertime" + oElement.station}
                      type="number"
                      inputProps={{
                        min: 0,
                        max: iMaxNumber,
                        onKeyDown: (event) => {
                          if (
                            (!/^\d$/.test(event.key) &&
                              !allowedKeys.includes(event.key)) ||
                            (event.key === "Backspace" &&
                              event.target.value.length === 1)
                          ) {
                            event.preventDefault();
                          }
                        },
                      }}
                      defaultValue={oElement.overtime}
                      onInput={(oEvent) => {
                        if (oElement.shift === 3 && oEvent.target.value > 0) {
                          oEvent.target.value = 0;
                          toast.error(
                            t("toast.errorInvalidInputShiftOvertime")
                          );
                        }
                        if (oElement.shift !== 3 && oEvent.target.value > 240) {
                          oEvent.target.value = 240;
                          toast.error(
                            t("toast.errorInvalidInputOvertimeExceed")
                          );
                        }
                      }}
                      onChange={(oEvent) => {
                        const oNewState = state;
                        if (oElement.shift === 3) {
                          oEvent.preventDefault();
                          return;
                        }
                        const oIndex = oNewState["workingtimelist"].find(
                          (oObject) => oObject.station === oElement.station
                        );
                        const iIndex =
                          oNewState["workingtimelist"].indexOf(oIndex);
                        oNewState["workingtimelist"][iIndex].overtime =
                          oEvent.target.valueAsNumber;
                        setItems(oNewState["workingtimelist"]);
                        setState(oNewState);
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          );
        })}
    </Box>
  );
}

export default Workinghours;
