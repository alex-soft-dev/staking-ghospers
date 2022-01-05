import { React, Fragment } from "react";
import { Container } from "react-bootstrap";
import Header from "../components/header/header";
import MainComponent from "../components/maincomponent/maincomponent";
import Footer from "../components/footer/footer";
import "./finance.css";

import Background from "./assets/background.mp4";
import { useSelector } from "react-redux";
import { SPINNERSHOW, SPINNERTEXT } from "../redux/constants";
import {PropagateLoader} from 'react-spinners';

function Finance() {
  // const [page, setPage] = useState(0);
  const spinner_show = useSelector((state)=>state.wallet[SPINNERSHOW]);
  const spinner_text = useSelector((state)=>state.wallet[SPINNERTEXT]);

  return (
    <Fragment>
      <Container fluid>
        <Header></Header>
        <MainComponent />
        <Footer></Footer>
        <video autoPlay loop muted id="background_video">
          <source src={Background} type="video/mp4"></source>
        </video>

      </Container>
      <Container className="spinner-container" style={{display: spinner_show? "block":"none"}}>
        <PropagateLoader size={20} margin={3} color="white"></PropagateLoader>
        <span className="spinner-text">{spinner_text}</span>
      </Container>

    </Fragment>
  );
}

export default Finance;
