import React, { Fragment, useState, useEffect } from "react";
import { create } from "xmlbuilder";
import {
  Button,
  Container,
  Divider,
  Step,
  StepLabel,
  Stepper,
  Typography,
  TableContainer,
  TableBody,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Input,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Tooltip,
  InputLabel,
} from "@mui/material";
import axios from "axios";
import { Box } from "@mui/system";
import { useTranslation } from "react-i18next";
import DeliveryProgram from "./components/DeliveryProgram";
import ProductionProgram from "./components/ProductionProgram";
import Workinghours from "./components/Workhours";
import Overview from "./components/Overview";
import { useGlobalState } from "../../components/GlobalStateProvider";
import { InfoOutlined, WineBarRounded } from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Simulation() {
  const { t, i18n } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [bProductionPlanned, fSetProductionPlanned] = useState(false);
  const [bForecastLoaded, fSetForecastLoaded] = useState(false);
  const { state, setState } = useGlobalState();
  const [bValid, fSetValid] = useState(true);
  const [bGlobalValid, fSetGlobalValid] = useState(true);
  const [oPlanning, fSetPlanning] = useState({});
  const [skipped, setSkipped] = React.useState(new Set());
  const [items, setItems] = useState([]);
  const [partListItems, setPartListItems] = useState({});
  const aSteps = [
    t("simulation.production"),
    t("simulation.shifts"),
    t("simulation.delivery"),
    t("simulation.overview"),
  ];
  const allowedKeys = [
    "ArrowLeft",
    "ArrowRight",
    "Backspace",
    "ArrowUp",
    "ArrowDown",
    "Tab",
  ];
  const fValidHandler = (bValid) => {
    fSetValid(bValid);
  };
  const fGlobalValidHandler = (bValid) => {
    fSetGlobalValid(bValid);
  };

  useEffect(() => {
    if (oPlanning["inventory"]) {
      setItems([...oPlanning["inventory"]]);
    }
  }, [oPlanning["inventory"]]);

  useEffect(() => {
    if (oPlanning["partList"]) {
      setPartListItems((prevState) => oPlanning["partList"]);
    }
  }, [oPlanning["partList"], partListItems]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/forecasts").then((oReponse) => {
      const oObj = {
        prognosis: [
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
        ],
        forecast: [
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
        ],
        production: [
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
        ],
        distribution: [
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
          {
            p1: 0,
            p2: 0,
            p3: 0,
          },
        ],
        inventory: [
          { p1: 0, p2: 0, p3: 0 },
          { p1: 0, p2: 0, p3: 0 },
          { p1: 0, p2: 0, p3: 0 },
          { p1: 0, p2: 0, p3: 0 },
        ],
        direct: {
          p1: {
            quantity: 0,
            price: 0,
            penalty: 0,
          },
          p2: {
            quantity: 0,
            price: 0,
            penalty: 0,
          },
          p3: {
            quantity: 0,
            price: 0,
            penalty: 0,
          },
        },
        partList: {
          p1: [],
          p2: [],
          p3: [],
        },
      };
      oObj.distribution = oReponse.data.forecasts.map((oElement) => {
        return {
          p1: oElement.p1,
          p2: oElement.p2,
          p3: oElement.p3,
        };
      });

      oObj.prognosis = oReponse.data.forecasts.map((oElement) => {
        return {
          p1: oElement.p1,
          p2: oElement.p2,
          p3: oElement.p3,
        };
      });
      const aInitialInventory = [];
      const oFirstPeriodInventory = {};

      oFirstPeriodInventory["p1"] =
        oReponse.data["p1"].find((e) => e.productId === 1).stock -
        oObj["distribution"][0]["p1"];
      oFirstPeriodInventory["p2"] =
        oReponse.data["p2"].find((e) => e.productId === 2).stock -
        oObj["distribution"][0]["p2"];
      oFirstPeriodInventory["p3"] =
        oReponse.data["p3"].find((e) => e.productId === 3).stock -
        oObj["distribution"][0]["p3"];

      aInitialInventory.push(oFirstPeriodInventory);

      const oSecondPeriodInventory = {};

      oSecondPeriodInventory["p1"] =
        oFirstPeriodInventory["p1"] - oObj.distribution[1]["p1"];
      oSecondPeriodInventory["p2"] =
        oFirstPeriodInventory["p2"] - oObj.distribution[1]["p2"];
      oSecondPeriodInventory["p3"] =
        oFirstPeriodInventory["p3"] - oObj.distribution[1]["p3"];

      aInitialInventory.push(oSecondPeriodInventory);

      const oThirdPeriodInventory = {};

      oThirdPeriodInventory["p1"] =
        oSecondPeriodInventory["p1"] - oObj.distribution[2]["p1"];
      oThirdPeriodInventory["p2"] =
        oSecondPeriodInventory["p2"] - oObj.distribution[2]["p2"];
      oThirdPeriodInventory["p3"] =
        oSecondPeriodInventory["p3"] - oObj.distribution[2]["p3"];

      aInitialInventory.push(oThirdPeriodInventory);

      const oFourthPeriodInventory = {};

      oFourthPeriodInventory["p1"] =
        oThirdPeriodInventory["p1"] - oObj.distribution[3]["p1"];
      oFourthPeriodInventory["p2"] =
        oThirdPeriodInventory["p2"] - oObj.distribution[3]["p2"];
      oFourthPeriodInventory["p3"] =
        oThirdPeriodInventory["p3"] - oObj.distribution[3]["p3"];

      aInitialInventory.push(oFourthPeriodInventory);

      oObj.inventory = aInitialInventory;

      const aProductlists = Object.entries(oReponse.data).filter(
        (oElement) => oElement[0].length === 2
      );

      aProductlists.forEach((oProduct) => {
        oObj.partList[oProduct[0]] = oProduct[1];
      });

      oObj.partList["p1"] = oObj.partList["p1"].map((oElement) => {
        return {
          ...oElement,
          reserveStock:
            oElement.stock +
            oElement.waitingListQuantity +
            oElement.ordersInWorkQuantity,
        };
      });
      oObj.partList["p2"] = oObj.partList["p2"].map((oElement) => {
        return {
          ...oElement,
          reserveStock:
            oElement.stock +
            oElement.waitingListQuantity +
            oElement.ordersInWorkQuantity,
        };
      });
      oObj.partList["p3"] = oObj.partList["p3"].map((oElement) => {
        return {
          ...oElement,
          reserveStock:
            oElement.stock +
            oElement.waitingListQuantity +
            oElement.ordersInWorkQuantity,
        };
      });

      oObj.partList["p1"].sort((a, b) => a.productId - b.productId);
      oObj.partList["p2"].sort((a, b) => a.productId - b.productId);
      oObj.partList["p3"].sort((a, b) => a.productId - b.productId);

      fSetForecastLoaded(true);
      fSetPlanning(oObj);
      setItems([...oObj["inventory"]]);
      setPartListItems({ ...oObj["partList"] });
    });
  }, []);
  const fSendForecastForPlanning = () => {
    const oObj = {};
    oObj.production = oPlanning.production;
    const aProducts = [];
    Object.entries(oPlanning.partList).forEach((aArray) => {
      aArray[1].forEach((oElement) => {
        if (
          !aProducts.find(
            (oProduct) => oProduct.productId === oElement.productId
          )
        ) {
          aProducts.push({
            productId: oElement.productId,
            reserveStock: oElement.reserveStock,
          });
        }
      });
    });
    oObj.products = aProducts;
    toast.info(t("toast.infoStartCalculation"));

    axios
      .post("http://localhost:8080/api/productionorders", oObj, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((oReponse) => {
        if (oReponse.status === 200) {
          fSetProductionPlanned(true);
          setState({
            productionlist: oReponse.data,
          });
          toast.success(t("toast.successPeriodCalculation"));
        }
      });
  };
  const fDownLoadXMLFile = (sXmlString, sFileName) => {
    const blob = new Blob([sXmlString], { type: "text/xml" });
    const sUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = sUrl;
    link.download = sFileName;
    link.click();
    URL.revokeObjectURL(sUrl);
  };
  const fHandleFinish = () => {
    toast.info(t("toast.generateXML"));
    const oData = state;
    const oProduction = oPlanning;
    const oObj = {
      input: {
        qualitycontrol: {
          "@type": "no",
          "@losequantity": "0",
          "@delay": "0",
        },
        sellwish: {
          item: [],
        },
        selldirect: {
          item: [],
        },
        orderlist: {
          order: [],
        },
        productionlist: {
          production: [],
        },
        workingtimelist: {
          workingtime: [],
        },
      },
    };

    oData.orderlist
      .filter((e) => e.quantity !== 0)
      .forEach((oOrder) => {
        oObj.input.orderlist.order.push({
          "@article": oOrder.article,
          "@quantity": oOrder.quantity,
          "@modus": oOrder.modus,
        });
      });

    oData.productionlist.forEach((oProduction) => {
      oObj.input.productionlist.production.push({
        "@article": oProduction.article,
        "@quantity": oProduction.quantity,
      });
    });

    oData.workingtimelist.forEach((oWorkstation) => {
      oObj.input.workingtimelist.workingtime.push({
        "@station": oWorkstation.station,
        "@shift": oWorkstation.shift,
        "@overtime": oWorkstation.overtime,
      });
    });

    Object.entries(oProduction["distribution"][0]).forEach((oArticle) => {
      oObj.input.sellwish.item.push({
        "@article":
          oArticle[0] === "p1" ? "1" : oArticle[0] === "p2" ? "2" : "3",
        "@quantity": oArticle[1],
      });
    });

    Object.entries(oProduction["direct"]).forEach((oArticle) => {
      oObj.input.selldirect.item.push({
        "@article":
          oArticle[0] === "p1" ? "1" : oArticle[0] === "p2" ? "2" : "3",
        "@quantity": oArticle[1].quantity,
        "@price": oArticle[1].price,
        "@penalty": oArticle[1].penalty,
      });
    });

    const xmlresult = create(oObj).end({ prettyPrint: true });

    const sFileName = "inputFile.xml";

    fDownLoadXMLFile(xmlresult, sFileName);
  };

  const fUpdateProduction = (oEvent) => {
    const sKey = oEvent.currentTarget.getAttribute("t-key");
    const aKeys = sKey.split(" ");
    const sAmount = oEvent.target.value;
    const aInitialKeys = [...aKeys];

    fSetPlanning((oNewPlanning) => {
      const iNewProductionValue = Number(sAmount);
      const iOldProductionValue = Number(
        oNewPlanning["production"][aInitialKeys[0]][aInitialKeys[1]]
      );

      oNewPlanning["production"][aInitialKeys[0]][aInitialKeys[1]] =
        Number(sAmount);
      const iValueDifference = iNewProductionValue - iOldProductionValue;

      let iNewValue;

      for (aKeys[0]; aKeys[0] < 4; aKeys[0]++) {
        iNewValue =
          oNewPlanning["inventory"][aKeys[0]][aKeys[1]] + iValueDifference;
        oNewPlanning["inventory"][aKeys[0]][aKeys[1]] = iNewValue;
      }

      setItems([...oNewPlanning["inventory"]]);
      return oNewPlanning;
    });
  };

  const fUpdateDistribution = (oEvent) => {
    const sKey = oEvent.currentTarget.getAttribute("t-key");
    const aKeys = sKey.split(" ");
    const sAmount = oEvent.target.value;
    const aInitialKeys = [...aKeys];

    fSetPlanning((oNewPlanning) => {
      const iNewProductionValue = Number(sAmount);
      const iOldProductionValue = Number(
        oNewPlanning["distribution"][aInitialKeys[0]][aInitialKeys[1]]
      );

      oNewPlanning["distribution"][aInitialKeys[0]][aInitialKeys[1]] =
        Number(sAmount);
      const iValueDifference = iOldProductionValue - iNewProductionValue;

      let iNewValue;

      for (aKeys[0]; aKeys[0] < 4; aKeys[0]++) {
        iNewValue =
          oNewPlanning["inventory"][aKeys[0]][aKeys[1]] + iValueDifference;
        oNewPlanning["inventory"][aKeys[0]][aKeys[1]] = iNewValue;
      }
      setItems([...oNewPlanning["inventory"]]);
      return oNewPlanning;
    });
  };

  const fUpdateDirectAmount = (oEvent) => {
    const sKey = oEvent.currentTarget.getAttribute("t-key");
    const sAmount = oEvent.target.value;
    const bValid = /^[0-9]*$/.test(sAmount) && sAmount.length > 0;
    fValidHandler(bValid);
    fSetPlanning((oForecast) => {
      oForecast["direct"][sKey].quantity = Number(sAmount);
      return oForecast;
    });
  };

  const fUpdateDirectPrice = (oEvent) => {
    const sKey = oEvent.currentTarget.getAttribute("t-key");
    const sAmount = oEvent.target.value;
    const bValid = /^[0-9]*$/.test(sAmount) && sAmount.length > 0;
    fValidHandler(bValid);
    fSetPlanning((oForecast) => {
      oForecast["direct"][sKey].price = Number(sAmount);
      return oForecast;
    });
  };

  const fUpdateDirectPenalty = (oEvent) => {
    const sKey = oEvent.currentTarget.getAttribute("t-key");
    const sAmount = oEvent.target.value;
    const bValid = /^[0-9]*$/.test(sAmount) && sAmount.length > 0;
    fValidHandler(bValid);
    fSetPlanning((oForecast) => {
      oForecast["direct"][sKey].penalty = Number(sAmount);
      return oForecast;
    });
  };

  const fIsStepOptional = (step) => {
    return step === aSteps.length;
  };

  const fIsStepSkipped = (step) => {
    return skipped.has(step);
  };

  const fHandleNext = () => {
    let newSkipped = skipped;
    if (fIsStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const fHandleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const fHandleBackInitial = () => {
    fSetProductionPlanned(false);
  };

  const fHandleSkip = () => {
    if (!fIsStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const fUpdatepartList = (oEvent, propertyName, productId) => {
    const aPropertyArray = ["p1", "p2", "p3"];
    const aIndex = [];

    aPropertyArray.forEach((oProperty) => {
      const oIndex = oPlanning["partList"][oProperty].find(
        (e) => e.productId === productId
      );
      aIndex.push(oPlanning["partList"][oProperty].indexOf(oIndex));
    });

    const iNewValue = Number(oEvent.target.value);

    fSetPlanning((oObj) => {
      aPropertyArray.forEach((oProperty, index) => {
        const iIndex = aIndex[index];
        if (iIndex >= 0) {
          oObj["partList"][oProperty][iIndex].reserveStock = iNewValue;
        }
      });
      setPartListItems((prevState) => {
        return { ...oObj["partList"] };
      });
      return oObj;
    });
  };

  const fHandleCalcWorktimes = () => {
    axios
      .post("http://localhost:8080/api/capacity", state["productionlist"], {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((oReponse) => {
        if (oReponse.status === 200) {
          const newState = { ...state };
          newState["workingtimelist"] = oReponse.data.sort(
            (a, b) => a.station - b.station
          );
          newState["calculations"] = calculateValuesFromData(
            oReponse.data.sort((a, b) => a.station - b.station)
          );
          setState(newState);
          let newSkipped = skipped;
          if (fIsStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
          }
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          setSkipped(newSkipped);
        }
      });
  };

  const calculateValuesFromData = (data) => {
    const calculatedValues = [];

    data.forEach((element) => {
      const prodTimes = element.productionTimes;
      const setupTimes = element.setupTimes;
      const waitingDuration = element.waitingDuration;
      const overallDuration = element.overallDuration;

      const explanation = generateExplanation(
        prodTimes,
        setupTimes,
        waitingDuration,
        overallDuration
      );

      calculatedValues.push({
        element: element.station,
        explanation: explanation,
      });
    });

    return calculatedValues;
  };

  const generateExplanation = (
    prodTimes,
    setupTimes,
    waitingDuration,
    overallDuration
  ) => {
    const tableRows = prodTimes.map((prodTime) => {
      const { productId, quantity, durationPerUnit } = prodTime;
      const duration = quantity * durationPerUnit;
      const setup = setupTimes.find((setup) => setup.productId === productId);
      const setupTime = setup.setupTime;
      const setupQuantity = setup.setupQunatity;
      const setupTimeTotal = setupTime * setupQuantity;

      return (
        <tr key={productId}>
          <td>Produkt {productId}:</td>
          <td>
            {durationPerUnit}*{quantity} = {duration} Min
          </td>
          <td>
            | {setupQuantity}*{setupTime} = {setupTimeTotal} Min
          </td>
        </tr>
      );
    });

    return (
      <table>
        <tbody>
          {tableRows}
          <tr>
            <td>Wartezeit:</td>
            <td>{waitingDuration} Min</td>
          </tr>
          <tr>
            <td>Gesamtzeit:</td>
            <td>{overallDuration} Min</td>
          </tr>
        </tbody>
      </table>
    );
  };

  const calculateSetupTimes = (setupTimes) => {
    const calculatedSetupTimes = {};

    setupTimes.forEach((setup) => {
      const { productId, setupTime, setupQunatity } = setup;
      const totalSetupTime = setupTime * setupQunatity;

      if (calculatedSetupTimes[productId]) {
        calculatedSetupTimes[productId] += totalSetupTime;
      } else {
        calculatedSetupTimes[productId] = totalSetupTime;
      }
    });

    return calculatedSetupTimes;
  };

  const fHandleCalcOrders = () => {
    axios
      .post(
        "http://localhost:8080/api/orders",
        { production: oPlanning["production"] },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((oResponse) => {
        const newState = { ...state };
        newState["orderlist"] = oResponse.data;
        //newState["orderInfos"] = oResponse.data.map((obj) => obj.orderInfos);
        setState(newState);
        let newSkipped = skipped;
        if (fIsStepSkipped(activeStep)) {
          newSkipped = new Set(newSkipped.values());
          newSkipped.delete(activeStep);
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
      });
  };

  const fSendProductionPlan = (oEvent) => {
    const oObj = {};
    oObj.production = oPlanning.production;
    const aProducts = [];
    Object.entries(oPlanning.partList).forEach((aArray) => {
      aArray[1].forEach((oElement) => {
        if (
          !aProducts.find(
            (oProduct) => oProduct.productId === oElement.productId
          )
        ) {
          aProducts.push({
            productId: oElement.productId,
            reserveStock: oElement.reserveStock,
          });
        }
      });
    });
    oObj.products = aProducts;

    axios
      .post("http://localhost:8080/api/productionorders", oObj, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((oResponse) => {
        const aNewQuantities = oResponse.data.map((oItem) => ({
          id: oItem.article,
          quantity: oItem.quantity,
        }));
        const aProductArray = ["p1", "p2", "p3"];
        aProductArray.forEach((product) => {
          aNewQuantities.forEach((oElement) => {
            const oProduction = document.getElementById(
              `quantityPart${product}${oElement.id}`
            );
            if (oProduction) {
              oProduction.value = oElement.quantity;
            }
          });
        });
      });
  };

  const fHandleUpdateSafetyStock = (oEvent) => {
    const oObj = {};
    oObj.production = oPlanning.production;
    const aProducts = [];
    Object.entries(oPlanning.partList).forEach((aArray) => {
      aArray[1].forEach((oElement) => {
        if (
          !aProducts.find(
            (oProduct) => oProduct.productId === oElement.productId
          )
        ) {
          aProducts.push({
            productId: oElement.productId,
            reserveStock: oElement.reserveStock,
          });
        }
      });
    });
    oObj.products = aProducts;

    axios
      .post("http://localhost:8080/api/productionorders", oObj, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((oResponse) => {
        const aNewQuantities = oResponse.data.map((oItem) => ({
          id: oItem.article,
          quantity: oItem.quantity,
        }));
        const aProductArray = ["p1", "p2", "p3"];
        aProductArray.forEach((product) => {
          aNewQuantities.forEach((oElement) => {
            const oProduction = document.getElementById(
              `quantityPart${product}${oElement.id}`
            );
            if (oProduction) {
              oProduction.value = oElement.quantity;
            }
          });
        });
      });
  };

  return (
    <>
      {bForecastLoaded && (
        <>
          {!bProductionPlanned && (
            <Container maxWidth="xl">
              <Box sx={{ p: 5 }}>
                <Box sx={{ marginBottom: "20px", backgroundColor: "#f0f0f0" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography fontSize="20px" fontWeight="bold">
                      {t("simulation.forecastInformation")}
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          {oPlanning.prognosis.map((oPeriod, index) => {
                            return (
                              <TableCell align="center">
                                <InputLabel>
                                  {t("simulation.forecastAmount") +
                                    " P+" +
                                    (index + 1)}
                                </InputLabel>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(oPlanning.prognosis[0]).map(
                          (oProduct) => {
                            return (
                              <TableRow>
                                <TableCell align="center">
                                  {t(`fileupload.product${oProduct[0]}`)}
                                </TableCell>
                                {oPlanning.prognosis.map((oPeriod, index) => {
                                  return (
                                    <TableCell>
                                      <Input
                                        type="number"
                                        style={{ width: "8rem" }}
                                        value={oPeriod[oProduct[0]]}
                                        disabled
                                      />
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          }
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <Box sx={{ marginBottom: "20px" }}>
                  {/* Vetriebssplanung */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Tooltip
                      title={t(
                        "simulation.tooltipInventoryOverviewEndOfPeriod"
                      )}
                    >
                      <InfoOutlined />
                    </Tooltip>
                    <Typography fontSize="20px" fontWeight="bold">
                      {t("simulation.distributionPlanning")}
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          {oPlanning.distribution.map((oPeriod, index) => {
                            return (
                              <TableCell align="center">
                                <InputLabel>
                                  {t("simulation.distributionAmount") +
                                    " P+" +
                                    (index + 1)}
                                </InputLabel>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(oPlanning.distribution[0]).map(
                          (oProduct) => {
                            return (
                              <TableRow>
                                <TableCell align="center">
                                  {t(`fileupload.product${oProduct[0]}`)}
                                </TableCell>
                                {oPlanning.distribution.map(
                                  (oPeriod, index) => {
                                    return (
                                      <TableCell
                                        t-key={`${index} ${oProduct[0]}`}
                                        onChange={fUpdateDistribution}
                                        align="center"
                                      >
                                        <Input
                                          type="number"
                                          error={!bValid}
                                          t-key={oProduct[0]}
                                          style={{ width: "8rem" }}
                                          defaultValue={oPeriod[oProduct[0]]}
                                          onInput={(oEvent) => {
                                            const value = oEvent.target.value;
                                            if (value === "") {
                                              oEvent.target.value = 0;
                                            }
                                          }}
                                          inputProps={{
                                            min: 0,
                                            onKeyDown: (event) => {
                                              if (
                                                (!/^\d$/.test(event.key) &&
                                                  !allowedKeys.includes(
                                                    event.key
                                                  )) ||
                                                (event.key === "Backspace" &&
                                                  event.target.value.length ===
                                                    1)
                                              ) {
                                                event.preventDefault();
                                              }
                                            },
                                          }}
                                        />
                                      </TableCell>
                                    );
                                  }
                                )}
                              </TableRow>
                            );
                          }
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <Box sx={{ marginBottom: "20px" }}>
                  {/* Produktionsplanung */}
                  <Box>
                    <Tooltip title={t("simulation.tooltipProductionPlanning")}>
                      <InfoOutlined />
                    </Tooltip>
                  </Box>
                  <Typography fontSize="20px" fontWeight="bold">
                    {t("simulation.productionPlanning")}
                  </Typography>
                  {/* <Button
                    variant="contained"
                    onClick={(oEvent) => fSendProductionPlan(oEvent)}
                  >
                    {t("simulation.planProduction")}
                  </Button> */}

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          {oPlanning.production.map((oPeriod, index) => {
                            return (
                              <TableCell align="center">
                                <InputLabel>
                                  {t("simulation.productionPlanningAmount") +
                                    " P+" +
                                    (index + 1)}
                                </InputLabel>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(oPlanning.production[0]).map(
                          (oProduct) => {
                            return (
                              <TableRow>
                                <TableCell align="center">
                                  {t(`fileupload.product${oProduct[0]}`)}
                                </TableCell>
                                {oPlanning.production.map((oPeriod, index) => {
                                  return (
                                    <TableCell
                                      t-key={`${index} ${oProduct[0]}`}
                                      onChange={fUpdateProduction}
                                      align="center"
                                    >
                                      <Input
                                        type="number"
                                        error={!bValid}
                                        t-key={oProduct[0]}
                                        style={{ width: "8rem" }}
                                        defaultValue={oPeriod[oProduct[0]]}
                                        onBlur={(oEvent) => {
                                          fSendProductionPlan(oEvent);
                                        }}
                                        onInput={(oEvent) => {
                                          const value = oEvent.target.value;
                                          if (value === "") {
                                            oEvent.target.value = 0;
                                          }
                                        }}
                                        inputProps={{
                                          min: 0,
                                          onKeyDown: (event) => {
                                            if (
                                              (!/^\d$/.test(event.key) &&
                                                !allowedKeys.includes(
                                                  event.key
                                                )) ||
                                              (event.key === "Backspace" &&
                                                event.target.value.length === 1)
                                            ) {
                                              event.preventDefault();
                                            }
                                          },
                                        }}
                                      />
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          }
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <Box sx={{ marginBottom: "20px", backgroundColor: "#f0f0f0" }}>
                  {/* Inventarüberblick */}
                  <Box>
                    <Tooltip
                      title={t(
                        "simulation.tooltipInventoryOverviewEndOfPeriod"
                      )}
                    >
                      <InfoOutlined />
                    </Tooltip>
                  </Box>
                  <Typography fontSize="20px" fontWeight="bold">
                    {t("simulation.inventoryOverview")}
                  </Typography>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          {items &&
                            Array.isArray(items) &&
                            items.map((oPeriod, index) => {
                              return (
                                <TableCell align="center" key={index}>
                                  <InputLabel>
                                    {t("simulation.inventoryAmount") +
                                      " P+" +
                                      (index + 1)}
                                  </InputLabel>
                                </TableCell>
                              );
                            })}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items &&
                          Object.entries(items[0]).map((oProduct) => {
                            return (
                              <TableRow>
                                <TableCell align="center">
                                  {t(`fileupload.product${oProduct[0]}`)}
                                </TableCell>
                                {items.map((oPeriod, index) => {
                                  return (
                                    <TableCell
                                      aria-disabled
                                      key={index + oPeriod[oProduct[0]]}
                                      t-key={`${index} ${oProduct[0]}`}
                                      align="center"
                                    >
                                      <Input
                                        style={{ width: "8rem" }}
                                        value={oPeriod[oProduct[0]]}
                                        disabled
                                        inputProps={{
                                          readOnly: true,
                                        }}
                                      />
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <Box sx={{ marginBottom: "20px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Tooltip title={t("simulation.tooltipPartList")}>
                      <InfoOutlined />
                    </Tooltip>
                    <Typography fontSize="20px" fontWeight="bold">
                      {t("simulation.partListCalculation")}
                    </Typography>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("simulation.part")}</TableCell>
                          <TableCell>{t("simulation.stock")}</TableCell>
                          <TableCell>
                            {t("simulation.ordersInWorkQuantity")}
                          </TableCell>
                          <TableCell>
                            {t("simulation.waitingListQuantity")}
                          </TableCell>
                          <TableCell>{t("simulation.safetyStock")}</TableCell>
                          <TableCell>
                            {t("simulation.partProduction")}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {partListItems &&
                          Object.entries(partListItems).map(
                            ([propertyName, dataArray]) => (
                              <React.Fragment key={propertyName}>
                                <TableRow>
                                  <TableCell colSpan={2}>
                                    <Typography
                                      sx={{
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {t("simulation." + propertyName)}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                                {dataArray.map(
                                  ({
                                    productId,
                                    reserveStock,
                                    stock,
                                    name,
                                    ordersInWorkQuantity,
                                    waitingListQuantity,
                                  }) => (
                                    <TableRow key={productId}>
                                      <TableCell>
                                        {productId}: {t("simulation."+name)}
                                      </TableCell>
                                      <TableCell>{stock}</TableCell>
                                      <TableCell>
                                        {ordersInWorkQuantity}
                                      </TableCell>
                                      <TableCell>
                                        {waitingListQuantity}
                                      </TableCell>
                                      <TableCell
                                        onChange={(oEvent) => {
                                          fUpdatepartList(
                                            oEvent,
                                            propertyName,
                                            productId
                                          );
                                        }}
                                      >
                                        <Input
                                          value={reserveStock}
                                          style={{ width: "8rem" }}
                                          onInput={(oEvent) => {
                                            const value = oEvent.target.value;
                                            if (value === "") {
                                              oEvent.target.value = 0;
                                            }
                                          }}
                                          onBlur={(oEvent) =>
                                            fHandleUpdateSafetyStock(oEvent)
                                          }
                                          inputProps={{
                                            min: 0,
                                            onKeyDown: (event) => {
                                              if (
                                                (!/^\d$/.test(event.key) &&
                                                  !allowedKeys.includes(
                                                    event.key
                                                  )) ||
                                                (event.key === "Backspace" &&
                                                  event.target.value.length ===
                                                    1)
                                              ) {
                                                event.preventDefault();
                                              }
                                            },
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          id={`quantityPart${propertyName}${productId}`}
                                          defaultValue={0}
                                          disabled
                                        ></Input>
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </React.Fragment>
                            )
                          )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <Box sx={{ marginBottom: "20px" }}>
                  {/* Direktverkauf */}
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <TableCell align="center">
                            <Box>
                              <Tooltip
                                title={t("simulation.tooltipDirectSelling")}
                              >
                                <InfoOutlined />
                              </Tooltip>
                            </Box>
                            <Typography fontSize="20px" fontWeight="bold">
                              {t("fileupload.directSelling")}
                            </Typography>
                          </TableCell>
                          <TableCell />
                        </TableRow>
                        <TableRow>
                          {Object.entries(oPlanning.direct).map((oProduct) => {
                            return (
                              <TableCell>
                                {t(`fileupload.product${oProduct[0]}`)}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          {Object.entries(oPlanning.direct).map((oProduct) => {
                            return (
                              <TableCell
                                t-key={oProduct[0]}
                                onChange={fUpdateDirectAmount}
                              >
                                <InputLabel>
                                  {t("simulation.directSellingQuantity")}
                                </InputLabel>
                                <Input
                                  type="number"
                                  error={!bValid}
                                  style={{ width: "8rem" }}
                                  defaultValue={oProduct[1].quantity}
                                  onInput={(oEvent) => {
                                    const value = oEvent.target.value;
                                    if (value === "") {
                                      oEvent.target.value = 0;
                                    }
                                  }}
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
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                        <TableRow>
                          {Object.entries(oPlanning.direct).map((oProduct) => {
                            return (
                              <TableCell
                                t-key={oProduct[0]}
                                onChange={fUpdateDirectPrice}
                              >
                                <InputLabel>
                                  {t("simulation.directSellingPrice")}
                                </InputLabel>
                                <Input
                                  type="number"
                                  error={!bValid}
                                  style={{ width: "8rem" }}
                                  defaultValue={oProduct[1].price}
                                  onInput={(oEvent) => {
                                    const value = oEvent.target.value;
                                    if (value === "") {
                                      oEvent.target.value = 0;
                                    }
                                  }}
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
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                        <TableRow>
                          {Object.entries(oPlanning.direct).map((oProduct) => {
                            return (
                              <TableCell
                                t-key={oProduct[0]}
                                onChange={fUpdateDirectPenalty}
                              >
                                <InputLabel>
                                  {t("simulation.directSellingPenalty")}
                                </InputLabel>
                                <Input
                                  type="number"
                                  error={!bValid}
                                  style={{ width: "8rem" }}
                                  defaultValue={oProduct[1].penalty}
                                  onInput={(oEvent) => {
                                    const value = oEvent.target.value;
                                    if (value === "") {
                                      oEvent.target.value = 0;
                                    }
                                  }}
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
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
              <Button
                variant="contained"
                onClick={fSendForecastForPlanning}
                disabled={!bValid}
                sx={{ mt: 0 }}
              >
                {t("simulation.planPeriod")}
              </Button>
              {!bValid && (
                <FormHelperText id="form-helper" error>
                  {t("simulation.inputInvalid")}
                </FormHelperText>
              )}
            </Container>
          )}
          {bProductionPlanned && (
            <Box sx={{ bgcolor: "rgb(250, 250, 250)", height: "900px", p: 5 }}>
              <Stepper activeStep={activeStep}>
                {aSteps.map((sStep) => {
                  return (
                    <Step>
                      <StepLabel>{sStep}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
              {activeStep != aSteps.length ? (
                <Fragment>
                  <Typography>{aSteps[activeStep]}</Typography>
                  <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                    <div>
                      <Button
                        color="inherit"
                        disabled={activeStep === 0 || !bGlobalValid}
                        onClick={fHandleBack}
                        sx={{
                          mr: 1,
                          visibility: activeStep !== 0 ? "visible" : "hidden",
                        }}
                      >
                        {t("simulation.back")}
                      </Button>
                      <Button
                        color="inherit"
                        sx={{
                          mr: 1,
                          visibility: activeStep === 0 ? "visible" : "hidden",
                        }}
                        onClick={fHandleBackInitial}
                      >
                        {t("simulation.back")}
                      </Button>
                    </div>

                    {activeStep === 0 && (
                      <ProductionProgram
                        data={state.productionlist}
                        validate={fGlobalValidHandler}
                      />
                    )}
                    {activeStep === 1 && (
                      <Workinghours
                        data={state.workingtimelist}
                        calculations={state.calculations}
                        validate={fGlobalValidHandler}
                      />
                    )}
                    {activeStep === 2 && (
                      <DeliveryProgram
                        data={state.orderlist}
                        validate={fGlobalValidHandler}
                      />
                    )}
                    {activeStep === 3 && <Overview data={state} />}
                    <Box sx={{ flex: "1 1 auto" }} />
                    <div>
                      {fIsStepOptional(activeStep) && (
                        <Button
                          color="inherit"
                          onClick={fHandleSkip}
                          sx={{ mr: 1 }}
                          disabled={!bGlobalValid}
                        >
                          {t("simulation.skip")}
                        </Button>
                      )}
                    </div>
                    <div>
                      <Button
                        onClick={fHandleNext}
                        style={{
                          visibility:
                            activeStep !== aSteps.length - 1 &&
                            activeStep !== aSteps.length - 4 &&
                            activeStep !== aSteps.length - 3
                              ? "visible"
                              : "hidden",
                        }}
                        disabled={!bGlobalValid}
                      >
                        {t("simulation.next")}
                      </Button>
                      <Button
                        onClick={fHandleCalcWorktimes}
                        style={{
                          visibility:
                            activeStep === aSteps.length - 4
                              ? "visible"
                              : "hidden",
                        }}
                      >
                        {t("simulation.calcWorktimes")}
                      </Button>
                      <Button
                        onClick={fHandleCalcOrders}
                        style={{
                          visibility:
                            activeStep === aSteps.length - 3
                              ? "visible"
                              : "hidden",
                        }}
                      >
                        {t("simulation.calcOrders")}
                      </Button>
                      <Button
                        onClick={fHandleFinish}
                        style={{
                          visibility:
                            activeStep === aSteps.length - 1
                              ? "visible"
                              : "hidden",
                        }}
                        disabled={!bGlobalValid}
                      >
                        {t("simulation.finish")}
                      </Button>
                    </div>
                  </Box>
                </Fragment>
              ) : (
                <Fragment></Fragment>
              )}
            </Box>
          )}
        </>
      )}
      {!bForecastLoaded && (
        <>
          <Typography fontWeight="bold" fontSize="40px">
            {t("simulation.waitingForData")}
          </Typography>
        </>
      )}
    </>
  );
}

export default Simulation;
