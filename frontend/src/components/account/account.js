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
import "./account.css";
import Ghospertest from "./assets/ghospertest.png";
import Ghospertest1 from "./assets/ghospertest1.png";

function Account(props) {
  return (
    <Container fluid>      
      <Row>
        <Col
          lg={{ span: 4, offset: 2 }}
          md={12}
          className="account-headcontainer"
        >
          <Wallet button_click = {props.button_click}></Wallet>
        </Col>
        <Col lg={6} md={12} className="video-container">
          <Image className="video-player" src={props.route ? Ghospertest : Ghospertest1}></Image>
        </Col>
      </Row>
    </Container>
  );
}

export default Account;
