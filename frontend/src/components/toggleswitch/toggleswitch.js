import React, { useState, useEffect } from "react";
import "./toggleswitch.css";

function ToggleSwitch(props) {
  const [isToggled, setIsToggled] = useState(props.onlyShow);
  useEffect(() => {
    setIsToggled(props.onlyShow);
  }, [props.onlyShow])
  const onToggle = () => {setIsToggled(!isToggled); if(props.click)props.click(!props.onlyShow);};
  return (
    <label className="toggle-switch" style={{width:'67px'}}>
      <input id="stakeStatus" type="checkbox" checked={isToggled} onChange={onToggle}/>
      <span className="switch" />
    </label>
  );
}
export default ToggleSwitch;