import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  FormHelperText,
  Tooltip,
  Select,
  MenuItem,
  Paper,
  Button,
  Typography,
  Popover,
  Input,
} from "@mui/material";
import { Box } from "@mui/system";
import { useTranslation } from "react-i18next";
import { useGlobalState } from "../../../components/GlobalStateProvider";
import { InfoOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProductionProgram(props) {
  const fSetGlobalValid = props.validate;
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [items, setItems] = useState([]);
  const { state, setState } = useGlobalState();
  const [bValid, setValid] = useState(true);
  const [iMaxValue, setMaxValue] = useState(0);
  const [iInputValue, setInputValue] = useState(0);
  const [oCurrentElement, setCurrentElement] = useState({});
  const [expandedItemIndex, setExpandedItemIndex] = useState(null);
  const [allInformationOpen, setAllInformationOpen] = useState(false); // New state for all information open/close
  const allowedKeys = [
    "ArrowLeft",
    "ArrowRight",
    "Backspace",
    "ArrowUp",
    "ArrowDown",
    "Tab",
  ];

  useEffect(() => {
    setItems(props.data);
  }, [state]);

  const fValidHandler = (bValid) => {
    setValid(bValid);
    fSetGlobalValid(bValid);
  };

  const bOpen = Boolean(anchorEl);
  const id = bOpen ? "splitting-popup" : undefined;

  const handleClick = (oEvent, oElement) => {
    setAnchorEl(oEvent.currentTarget);
    setMaxValue(oElement.quantity - 10);
    setInputValue(Math.floor(oElement.quantity / 2 / 10) * 10);
    setCurrentElement(oElement);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSplitItem = (oElement, oEvent) => {
    if (iInputValue % 10 !== 0) {
      toast.error(t("toast.errorNotDivisibleBy10"));
      return;
    }
    const newState = state;
    const iIndex = newState["productionlist"].indexOf(oCurrentElement);
    const iNewQuantity = iInputValue;
    const iOldQuantity = newState["productionlist"][iIndex].quantity;
    const oNewItem = {
      ...oCurrentElement,
      quantity: iNewQuantity,
      sequenceNumer: newState["productionlist"].length + 1,
      id: state["productionlist"].length,
    };
    newState["productionlist"][iIndex].quantity = iOldQuantity - iNewQuantity;
    newState["productionlist"].push(oNewItem);
    setState(newState);
    setItems(newState["productionlist"]);
    toast.info(t("toast.infoSplitItem"));
    setAnchorEl(null);
  };

  const handleSequenceNumberChange = (itemId, newSequenceNumber) => {
    const newState = state;
    const otherObject = state["productionlist"].find(
      (oObject) => oObject.sequenceNumer === newSequenceNumber
    );
    const currentObject = state["productionlist"].find(
      (oObject) => oObject.id === itemId
    );
    const iOldSequenceNumber = currentObject.sequenceNumer;
    const iCurrentIndex = state["productionlist"].indexOf(currentObject);
    const iOtherIndex = state["productionlist"].indexOf(otherObject);

    newState["productionlist"][iCurrentIndex].sequenceNumer = newSequenceNumber;
    newState["productionlist"][iOtherIndex].sequenceNumer = iOldSequenceNumber;
    newState["productionlist"].sort(
      (a, b) => a.sequenceNumer - b.sequenceNumer
    );
    setItems(newState["productionlist"]);
    setState(newState);
  };

  const handleToggleOrderInfos = (index) => {
    if (expandedItemIndex === index) {
      setExpandedItemIndex(null);
    } else {
      setExpandedItemIndex(index);
    }
  };

  const handleToggleAllInformation = () => {
    setAllInformationOpen(!allInformationOpen);
  };

  return (
    <>
      <Box alignContent="center">
        <Tooltip arrow title={t("simulation.tooltipProductionProgram")}>
          <InfoOutlined />
        </Tooltip>
        {items.length > 0 ? (
          items.map((oElement, index) => (
            <Paper
              key={oElement.sequenceNumer}
              elevation={3}
              sx={{
                margin: "1rem",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <InputLabel>{t("simulation.part")}</InputLabel>
                  <Box sx={{ marginLeft: "0.5rem" }}>{oElement.article}</Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "0.5rem",
                    margin: "1rem",
                  }}
                >
                  <Typography width="5.5rem">
                    {oElement.quantity} {t("simulation.amountPart")}
                  </Typography>
                </Box>

                <Box>
                  <InputLabel>{t("simulation.sequenceNumber")}</InputLabel>
                  <Select
                    variant="outlined"
                    value={oElement.sequenceNumer}
                    onChange={(e) =>
                      handleSequenceNumberChange(
                        oElement.id,
                        parseInt(e.target.value)
                      )
                    }
                    sx={{ marginLeft: "10px", width: "6rem" }}
                  >
                    {[...Array(state["productionlist"].length)].map(
                      (_, index) => (
                        <MenuItem key={index} value={index + 1}>
                          {index + 1}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </Box>
                <Box sx={{ marginLeft: "1rem" }}>
                  <Button
                    variant="outlined"
                    onClick={(oEvent) => handleClick(oEvent, oElement)}
                  >
                    {t("simulation.splitItem")}
                  </Button>
                </Box>
              </Box>
              {(expandedItemIndex === index || allInformationOpen) && (
                <Box
                  marginTop="1rem"
                  sx={{ fontSize: "16px", textAlign: "left" }}
                >
                  <p>
                    {t("simulation.component")}: {oElement.name}
                  </p>
                  {oElement.informations.map((info, infoIndex) => (
                    <p key={infoIndex}>{info}</p>
                  ))}
                </Box>
              )}
              <Popover
                id={id}
                open={bOpen}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "1rem",
                  }}
                >
                  <Typography variant="h6" sx={{ marginBottom: "1rem" }}>
                    {t("simulation.splitItem")}
                  </Typography>
                  <Input
                    id="input"
                    type="number"
                    sx={{
                      width: "12rem",
                      marginBottom: "1rem",
                      padding: "0.5rem",
                      fontSize: "1rem",
                    }}
                    value={iInputValue}
                    onChange={(e) => setInputValue(Number(e.target.value))}
                    inputProps={{
                      min: 1,
                      max: iMaxValue,
                    }}
                    onInput={(oEvent) => {
                      if (oEvent.target.value > iMaxValue) {
                        oEvent.target.value = iMaxValue;
                      }
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={(oEvent) => handleSplitItem(oElement, oEvent)}
                      sx={{
                        margin: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: "normal",
                      }}
                    >
                      {t("simulation.confirm")}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleClose}
                      sx={{
                        margin: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: "normal",
                      }}
                    >
                      {t("simulation.cancel")}
                    </Button>
                  </Box>
                </Box>
              </Popover>
            </Paper>
          ))
        ) : (
          <Typography>{t("simulation.noItems")}</Typography>
        )}
      </Box>
      <Box sx={{ display: "right", marginTop: "3rem" }}>
        <Button
          variant="contained"
          onClick={handleToggleAllInformation}
          sx={{
            backgroundColor: "white",
            color: "black",
            "&:hover": {
              backgroundColor: "lightskyblue",
            },
          }}
        >
          {allInformationOpen
            ? t("simulation.infosausblenden")
            : t("simulation.infosanzeigen")}
        </Button>
      </Box>
    </>
  );
}

export default ProductionProgram;
