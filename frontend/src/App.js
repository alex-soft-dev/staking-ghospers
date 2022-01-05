import { Fragment} from "react";
import Finance from "./pages/finance";
import "bootstrap/dist/js/bootstrap.min.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./global.css";
import { Provider} from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import appReducer from "./redux/reducers";
import thunk from 'redux-thunk';

const store = createStore(appReducer, applyMiddleware(thunk))

function App() {
  return (
    <Provider store = {store}>      
    <Fragment>            
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Finance />} />
        </Routes>
      </div>
    </Router>        
    </Fragment>
    </Provider>
  );
}

export default App;
