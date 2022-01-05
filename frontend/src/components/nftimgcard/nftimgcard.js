import { Fragment, React, useEffect, useState} from "react";
import {
  Card} from "react-bootstrap";
// import { PRODUCT_MODE } from "../../config";
// import { MAIN_GHOSPER_ADDRESS, OPENSEA_LINKMAIN, OPENSEA_LINKTEST, OPENSEA_MAIN, OPENSEA_TEST, TEST_GHOSPER_ADDRESS } from "../../redux/constants";

// let GHOSPER_ADDRESS = PRODUCT_MODE ? MAIN_GHOSPER_ADDRESS : TEST_GHOSPER_ADDRESS;
// let OPENSEA_URL = PRODUCT_MODE ? OPENSEA_LINKMAIN : OPENSEA_LINKTEST;

function NftImgCard(props) {

  // let img_url = "";

  // async function image_url(){
    
  //   return await axios.get(`https://api.opensea.io/api/v1/assets?order_direction=desc&offset=0&limit=20&token_ids=${2965}&asset_contract_address=${GHOSPER_ADDRESS}`)
  //   .then(res => {
  //     console.log(res);
  //     return  res.data.assets[0].image_url;
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     return false;
  //   });
  // }   
  // image_url();

  // 0:unstackonly, 1:stackonly
  const [toggleCheck, setToggleCheck] = useState(false);

  useEffect(() => {
    return () => {
      setToggleCheck(false);
    }
    
  }, [])

  return (
    <Fragment>   
    
    <Card className="text-white">
      {/* <a href={`${OPENSEA_URL}/${GHOSPER_ADDRESS}/${props.title}`} style={{zIndex:"10"}} target="_blank">#{props.title} </a> */}
      <a href="#">{props.title}</a>
      <Card.Img src={props.img} className={toggleCheck ? "card-selected":""}/>
      <Card.ImgOverlay onClick={()=>{setToggleCheck(!toggleCheck);props.set(!toggleCheck, props.title)}}>
      </Card.ImgOverlay>
    </Card>    
    </Fragment>
  )
}

export default NftImgCard;
