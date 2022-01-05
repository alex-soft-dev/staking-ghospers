import { Container, Navbar, Nav, NavbarBrand, Button } from "react-bootstrap";
import "./header.css";
// import NavBarPNG from "./assets/navbar.png";
// import NavBarRightPNG from "./assets/navrighticon.png";
import Logo from "./assets/logo.png";

function Header() {
  return (
    <Container fluid className="custom-header-container">
      <Navbar expand="lg" className="custom-navbar">
        <Navbar.Brand href="/" className='align-items-center brand-responsive'>
          <img className='logo-img' src={Logo} alt='logo'/>
        </Navbar.Brand>
        <div className="navbar-menu"  >
          <Navbar.Toggle aria-controls="basic-navbar-nav" className='toggler bg-light  primary-color' />
          <Navbar.Collapse color='white' id="basic-navbar-nav" className='align-self-end justify-content-end responsive-dropdown'>
            <Nav className="m-nav align-items-center justify-content-space-between">
              <Nav.Link href="https://www.ghospers.com" className="primary-color font-normal full-width">
                Home
              </Nav.Link>
              <Nav.Link href="https://www.ghospers.com/#gameplay" className="primary-color font-normal full-width">
                Gameplay
              </Nav.Link>
              <Nav.Link href="https://www.ghospers.com/#partners" className="primary-color font-normal full-width">
                Partners
              </Nav.Link>
              <Nav.Link href="https://www.ghospers.com/#collection" className="primary-color font-normal full-width">
                NFTs
              </Nav.Link>
              <Nav.Link href="https://staking.ghospers.com" target="_blank" className="primary-color font-normal full-width">
                Staking
              </Nav.Link>
              <Nav.Link href="https://ghospers.gitbook.io/ghospersgame/" target="_blank" className="primary-color font-normal full-width">
                Gitbook
              </Nav.Link>
              <Nav.Link href="https://drive.google.com/drive/folders/1UHZBgYHJV5wUQQoBaCyTh2yC3j-Xw00A?usp=sharing" target="_blank" className="primary-color font-normal">
                <div className="navbarlink-button" >Try Demo</div>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
    </Container>
  );
}

export default Header;
