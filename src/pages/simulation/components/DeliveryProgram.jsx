import React, { useState, useRef } from "react";
import {
  Input,
  FormControl,
  InputLabel,
  FormHelperText,
  Tooltip,
  Button,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useTranslation } from "react-i18next";
import ModeMenu from "./ModeMenu";
import { useGlobalState } from "../../../components/GlobalStateProvider";

import { InfoOutlined } from "@mui/icons-material";

function DeliveryProgram(props) {
  const fSetGlobalValid = props.validate;
  const { t, i18n } = useTranslation();
  const orderInfos = props.data.map((obj) => obj.orderInfos.join("\n"));
  const deliveryProgramRefs = useRef([]);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState(null);

  const handleToggleOrderInfos = (index) => {
    if (expandedOrderIndex === index) {
      setExpandedOrderIndex(null);
    } else {
      setExpandedOrderIndex(index);
    }
  };
  const allowedKeys = [
    "ArrowLeft",
    "ArrowRight",
    "Backspace",
    "ArrowUp",
    "ArrowDown",
    "Tab",
  ];

  return (
    <Box>
      <Tooltip arrow title={t("simulation.tooltipDeliveryProgram")}>
        <InfoOutlined />
      </Tooltip>
      {props.data.map((oElement, index) => {
        let [bValid, fSetValid] = useState(true);
        const { state, setState } = useGlobalState();

        const fValidHandler = (bValid) => {
          fSetValid(bValid);
          fSetGlobalValid(bValid);
        };

        return (
          <Box
            key={oElement.article}
            ref={(el) => (deliveryProgramRefs.current[index] = el)}
            marginBottom="2rem"
            border={1}
            borderRadius="5px"
            display="flex"
            alignItems="flex-start"
            padding="1rem"
            boxShadow="0px 2px 4px rgba(0, 0, 0, 0.1)"
            bgcolor="white"
          >
            <Box>
              {/* Inhalte der Bestellungsbox */}
              <Box display="flex" alignItems="center">
                <strong>{t("simulation.component")}:</strong>
                <Box marginLeft="0.5rem">
                  {oElement.article}: {t("simulation."+oElement.name)}
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <strong>{t("simulation.orderAmount")}:</strong>
                <FormControl
                  required={true}
                  size="small"
                  sx={{ display: "inline-flex", marginLeft: "0.5rem" }}
                >
                  <Input
                    type="number"
                    error={!bValid}
                    sx={{ width: "5rem", marginRight: "2rem" }}
                    inputProps={{
                      min: 0,
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
                    aria-describedby="form-helper"
                    defaultValue={oElement.quantity}
                    onChange={(oEvent) => {
                      const bIsValid =
                        /^[0-9]*$/.test(oEvent.target.value) &&
                        oEvent.target.value.length > 0;
                      fValidHandler(bIsValid);
                      if (!bIsValid) return;
                      const oNewState = state;
                      const oIndex = oNewState["orderlist"].find(
                        (oObject) => oObject.article === oElement.article
                      );
                      const iIndex = oNewState["orderlist"].indexOf(oIndex);
                      oNewState["orderlist"][iIndex].quantity =
                        oEvent.target.valueAsNumber;
                      setState(oNewState);
                    }}
                  />
                  {!bValid && (
                    <FormHelperText id="form-helper" error>
                      {t("simulation.errorMissingInput")}
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>
              {expandedOrderIndex === index && (
                <Box marginLeft="3rem" marginTop="2rem">
                  <pre
                    style={{
                      maxWidth: "100%",
                      overflow: "hidden",
                      whiteSpace: "pre-wrap",
                      textAlign: "left",
                    }}
                  >
                    {/* Name: {oElement.name}<br/> */}
                    {orderInfos[index]}
                  </pre>
                </Box>
              )}
              <Box marginLeft="3rem" marginTop="1rem">
                <Button
                  onClick={() => handleToggleOrderInfos(index)}
                  variant="contained"
                  sx={{
                    backgroundColor: "white",
                    color: "black",
                    "&:hover": {
                      backgroundColor: "aliceblue",
                    },
                  }}
                >
                  {expandedOrderIndex === index
                    ? t("simulation.infosausblenden")
                    : t("simulation.infosanzeigen")}
                </Button>
              </Box>
            </Box>
            <Box marginLeft="auto" marginRight="0rem">
              <ModeMenu value={oElement.modus} element={oElement} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default DeliveryProgram;
