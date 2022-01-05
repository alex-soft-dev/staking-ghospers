import { Fragment } from "react";
import { Button, Col, Form } from "react-bootstrap";

export function UpdateUnstakeFee(props) {
    return (
        <Fragment>
            <Col md={3}>{props.title} ({props.period}):</Col>
            <Col md={7}>
                <Form.Group className="mb-3 col-md-5 d-inline-block mx-5 amount-input">
                    <Form.Control
                        type="text"                        
                        name={props.name}
                        value={props.input_value[props.name]}
                        onChange={(e) => {
                            props.set_value(e);
                            props.set_error(props.name, false);
                            if (e.target.value < 0) {
                                e.target.value = e.target.value * -1;
                            }
                        }}
                    />
                </Form.Group>
                {props.input_error[props.name] ? <span
                    className="text-danger px-5 d-block"
                >
                    Please insert a valid number
                </span> : null}

            </Col>
            <Col md={2}>
                <Button
                    className="harvest_addbtn"
                    onClick={() => {
                        props.updateUnstakeFee(
                            props.idNum,
                            props.input_value[props.name]
                        );
                        console.log(props.input_value[props.name]);
                    }}
                >
                    Update
                </Button>
            </Col>
        </Fragment>
    )
}