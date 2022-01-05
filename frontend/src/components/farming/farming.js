import { React, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Badge,
  Button,
  ButtonGroup,
  Table,
  Image,
  Accordion,
} from "react-bootstrap";
import { FaAngleDown } from "react-icons/fa";
import "./farming.css";
import image from "./assets/noFilter.webp";
function Farming() {
  // 0:all, 1:stackonly
  const [stackShow, setStackShow] = useState(0);
  const [liveShow, setLiveShow] = useState(0);
  const [harvest, setHarvest] = useState(false);
  const [btnStackState, setBtnStackState] = useState([
    "outline active",
    "outline",
  ]);
  const [btnLiveState, setBtnLiveState] = useState([
    "outline active",
    "outline",
  ]);

  return (
    <Container fluid className="farming-container">
      <Row className="farming-toggle-row">
        <Col md={5} className="score-col">
          <span className="point-span">0.0</span>
          <span className="scores-span">$GHSP from 0 farms</span>
          <Button className="harvest_btn" variant="outline">
            Harvest all
          </Button>
        </Col>
        <Col md={6} className="farm-toggle-col">
          <ButtonGroup className="farm-toggle-group">
            <Button
              variant={btnStackState[0]}
              onClick={() => {
                setStackShow(0);
                setBtnStackState(["outline active", "outline"]);
              }}
            >
              All
            </Button>
            <Button
              variant={btnStackState[1]}
              onClick={() => {
                setStackShow(1);
                setBtnStackState(["outline", "outline active"]);
              }}
            >
              Staked only
            </Button>
          </ButtonGroup>
          {/* <ButtonGroup className="farm-toggle-group">
                        <Button variant={btnLiveState[0]} onClick={()=>{setLiveShow(0); setBtnLiveState(["outline active", "outline"]);}}>Live</Button>
                        <Button variant={btnLiveState[1]} onClick={()=>{setLiveShow(1); setBtnLiveState(["outline", "outline active"]);}}>Finished</Button>                        
                    </ButtonGroup> */}
        </Col>
      </Row>
      <Row>
        <Container
          className="harvest-container"
          style={{ display: !(stackShow || liveShow) ? "block" : "none" }}
        >
          <Row className="harvest-header">
            <Col md={1}></Col>
            <Col md={2}>Farms</Col>
            <Col md={2}></Col>
            <Col md={2}>Staked Value</Col>
            <Col md={2}>APY</Col>
            <Col md={2}>Share</Col>
            <Col md={1}></Col>
          </Row>
          <Row className="harvest-row">
            <Col md={1} onClick={() => setHarvest(!harvest)}></Col>
            <Col md={2} onClick={() => setHarvest(!harvest)}>
              <span>GHSP</span>
              <br />
              network
            </Col>
            <Col md={2} onClick={() => setHarvest(!harvest)}></Col>
            <Col md={2} onClick={() => setHarvest(!harvest)}>
              $ 5,586,316.6797
            </Col>
            <Col md={2} onClick={() => setHarvest(!harvest)}>
              0.0%
            </Col>
            <Col md={2} onClick={() => setHarvest(!harvest)}>
              100%
            </Col>
            <Col md={1} onClick={() => setHarvest(!harvest)}>
              <FaAngleDown></FaAngleDown>
            </Col>
            <div
              className="harvest-addrow row"
              style={{ display: harvest ? "flex" : "none" }}
            >
              <Col className="harvest-addcol" md={4}>
                <div>
                  <span>GHSP EARNED:</span>
                  <br />
                  0.0
                </div>
                <div>
                  <Button className="harvest_addbtn">Harvest</Button>
                </div>
              </Col>
              <Col className="harvest-addcol start-farming" md={4}>
                <div>
                  <span>START FARMING:</span>
                  <br />
                  <br />
                </div>
                <div>
                  <Button className="wallet_addbtn">Connect Wallet</Button>
                </div>
              </Col>
            </div>
          </Row>
        </Container>
        <Container
          className="stack-container"
          style={{ display: stackShow || liveShow ? "block" : "none" }}
        >
          <div className="stack-div">
            <Image src={image} roundedCircle />
          </div>
          <label className="nofilter-header">No results to show</label>
          We didn’t find any Polychain Monsters matching your filter settings.
        </Container>
      </Row>
    </Container>
  );
}

export default Farming;
