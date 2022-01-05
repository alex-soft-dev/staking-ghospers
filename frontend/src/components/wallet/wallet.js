import { Container, Row, Button, Image, Form } from "react-bootstrap";
import "./wallet.css";
import Metamask from "./assets/metamask.png";
import Coinbase from "./assets/coinbase.png";
import WalletConnect from "./assets/wallet_connect.png";
import { useDispatch } from 'react-redux';
import * as actions from "../../redux/actions";
import { useActions } from "../../redux/useActions";

function Wallet(props) {

  const actioncreator = useActions(actions);
  console.log(actioncreator);
  return (
    <Container fluid className="wallet-container">
      <Row>Connect Your Wallet</Row>
      {/* <Row>
                Network
            </Row> */}
      <Row>
        <Button onClick={()=>actioncreator.ghsp_connect()}>Connect</Button>
      </Row>
    </Container>
  );
}

export default Wallet;
