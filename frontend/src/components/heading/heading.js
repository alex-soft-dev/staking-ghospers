import { Container, NavLink } from "react-bootstrap";
// import styles from "./heading.css";
import { IoInformationCircle } from "react-icons/io5";

function Heading(props) {
  return (
    <Container fluid className="page-heading-container text-left">
      <h1 className="page-heading">
        {props.header}
        <span>.</span>
      </h1>
      {props.desc}
      <NavLink className="page-heading-link" href="https://www.ghospers.com/staking-info">
        <IoInformationCircle className="info-icon"></IoInformationCircle>More
        Information
      </NavLink>
    </Container>
  );
}

export default Heading;
