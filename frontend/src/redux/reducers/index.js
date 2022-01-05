import {combineReducers} from "redux";
import walletReducer from "./walletReducer";
import nftReducer from "./nftReducer";



export default combineReducers({
    wallet: walletReducer,
    nft: nftReducer,    
});

