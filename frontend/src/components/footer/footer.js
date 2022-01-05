import { Container, NavLink, Row, Col } from "react-bootstrap";
import "./footer.css";

function Footer() {
  return (
    <Container fluid className="footer-container">
      <Row className="footer-row">
        <Col md={6} className="official-link">
          <label>Official Links</label>
        </Col>
        <Col md={6} className="footernav-link">
          <NavLink>Opensea</NavLink>
          <NavLink>Pancakeswap</NavLink>
          <NavLink>Twitter</NavLink>
          <NavLink>Telegram chat</NavLink>
          <NavLink>Telegram Announcements</NavLink>
          <NavLink>Discord</NavLink>
          <NavLink>Contract Address (BSC Scan)</NavLink>
        </Col>
      </Row>
      <Row className="footer-row">
        <Col md={4} className="ghosper-col">
          <p>GHOSPERS</p>
          <NavLink>info@ghospers.com</NavLink>
        </Col>
        <Col md={8} className="connect-col">
          <span>Connect</span>
          <label>
            Join our social channels to keep up to date with our developments
            and chat directly with the team.
          </label>
          <div className="connect-link">
            <NavLink>
              <img src="https://static.wixstatic.com/media/88742b_518fe665c3a74c5780b5f929f045378d~mv2.png/v1/fill/w_24,h_24,al_c,q_85,usm_0.66_1.00_0.01/88742b_518fe665c3a74c5780b5f929f045378d~mv2.webp" alt=""></img>
            </NavLink>
            <NavLink>
              <img src="https://static.wixstatic.com/media/88742b_5f2113b39bfd4953b4c5da24b59b9654~mv2.png/v1/fill/w_24,h_24,al_c,q_85,usm_0.66_1.00_0.01/88742b_5f2113b39bfd4953b4c5da24b59b9654~mv2.webp" alt=""></img>
            </NavLink>
            <NavLink>
              <img src="https://static.wixstatic.com/media/88742b_9f58ef07fffa4c959ef75d51d5dcf7e2~mv2.png/v1/fill/w_24,h_24,al_c,q_85,usm_0.66_1.00_0.01/88742b_9f58ef07fffa4c959ef75d51d5dcf7e2~mv2.webp" alt=""></img>
            </NavLink>
            <NavLink>
              <img src="https://static.wixstatic.com/media/88742b_f90b8929c4d84e69a4b186ddec16fba0~mv2.png/v1/fill/w_24,h_24,al_c,q_85,usm_0.66_1.00_0.01/88742b_f90b8929c4d84e69a4b186ddec16fba0~mv2.webp" alt=""></img>
            </NavLink>
          </div>
        </Col>
      </Row>
      <Row className="copyright-container">
        <Col md={8} className="copyright-tag">
          ©2022 Ghospers Game.
        </Col>
        <Col md={4} className="copyright-nav">
          <NavLink>Privacy Policy</NavLink>
          <NavLink>Terms of Use</NavLink>
        </Col>
      </Row>
    </Container>
  );
}

export default Footer;
