import {
  Container,
  Row,
  Col,
  Badge,
  Button,
  ButtonGroup,
  Table,
  Image,
  Form,
} from "react-bootstrap";
import Wallet from "../wallet/wallet";
import Ghospertest from "./assets/ghospertest.png";
function NftStake() {
  return (
    <Container fluid>
      <Row>
        <Col
          lg={{ span: 4, offset: 2 }}
          md={12}
          className="account-headcontainer"
        >          
        </Col>
        <Col lg={6} md={12} className="video-container">
          <Image className="video-player" src={Ghospertest}></Image>
        </Col>
      </Row>
    </Container>
  );
}

export default NftStake;
