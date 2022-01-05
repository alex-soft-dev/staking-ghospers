import { React, useState, useEffect } from "react";
import { Container, Row, Col, Button, ButtonGroup } from "react-bootstrap";
import "./maincomponent.css";
// import Farming from "../farming/farming";
// import NftStake from "../nftstake/nftstake";
import Heading from "../heading/heading";
import Ghosper from "../ghosper/ghosper";
import GHSP from "../ghsp/ghsp";
import { useSelector } from "react-redux";
import { ADMIN_TOTAL_SUPPLY, ALL_STAKES/*, IS_ADMIN*/ } from "../../redux/constants";

function MainComponent(props) {

  // const page_num = props.page;
  const [page, setPage] = useState(1);
  const [heading, setHeading] = useState("Parters and Investors");
  const [desc, setDesc] = useState("stake your Ghospers to earn $GHSP.");
  const [btnClass, setBtnClass] = useState([
    "outline active",
    "outline",
    "outline",
  ]);

  // const is_admin = useSelector((state) => state.wallet[IS_ADMIN]);
  const admin_total_supply = useSelector((state) => state.wallet[ADMIN_TOTAL_SUPPLY]);
  const allStakes = useSelector((state) => state.wallet[ALL_STAKES]);

  const nftAdmin_total_supply = useSelector((state) => state.nft[ADMIN_TOTAL_SUPPLY]);
  const nftAllStakes = useSelector((state) => state.nft[ALL_STAKES]);

  useEffect(() => {
    switch (page) {
      case 0:
        setBtnClass(["outline active", "outline", "outline"]);
        setHeading("Staking Ghosper");
        setDesc(`stake your Ghosper to earn ${nftAllStakes !== 0  ? Number((450 * 1000 / nftAllStakes * 100).toFixed(2)) : 300}% APR`);
        break;
      case 1:
        setBtnClass(["outline", "outline active", "outline"]);
        setHeading("Staking GHSP");
        setDesc(`stake your GHSP to earn ${allStakes !== 0  ? Number((3.8 * 1000 * 1000 / allStakes * 100 / 10 * 12).toFixed(2)) : 300}% APR`);
        break;      
    }
  }, [page, admin_total_supply, allStakes, nftAdmin_total_supply, nftAllStakes]);

  function render_page(para) {
    switch (para) {
      case 0:
        return <Ghosper></Ghosper>;
      case 1:
        return <GHSP></GHSP>;
      default:
        <Ghosper></Ghosper>;
        break;
    }
  }

  return (
    <Container>
      <Row className="header-row">
        <Col md={7} className="header-col">
          <Heading header={heading} desc={desc}></Heading>
        </Col>
        <Col md={5} className="toggle-btn-container">
          <ButtonGroup className="toggle-btn-group">
            <Button variant={btnClass[1]} onClick={() => setPage(1)}>
              GHSP
            </Button>
            <Button variant={btnClass[0]} onClick={() => setPage(0)}>
              NFTs
            </Button>            
          </ButtonGroup>
        </Col>
      </Row>
      <Row>{render_page(page)}</Row>
    </Container>
  );
}

export default MainComponent;
