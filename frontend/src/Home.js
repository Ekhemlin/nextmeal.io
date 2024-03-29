import React from 'react';
import { useCookies } from 'react-cookie';
import { useState} from "react";
import {
  CircularProgressbar
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { GoogleLogin } from 'react-google-login';
import InventoryDashboard from './InventoryDashboard';
import SavedRecipesDashboard from './SavedRecipesDashboard'
import { v4 as uuidv4 } from 'uuid';
import { request_POST, request_GET } from './networking/requests.js';


require('bootstrap');


function Home() {
  const [cookies, setCookie] = useCookies(['name']);
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  const [macroValues, setMacroValues] = useState({ "calories": 0, "fat": 0, "carbs": 0, "protein": 0 });
  const [macroPercentages, setMacroPercentages] = useState({ "calories": 0, "fat": 0, "carbs": 0, "protein": 0 });

  async function fetchUserData(userIdArg) {
    setCookie("id", userIdArg, {});
    var id = userIdArg;
    const result = await request_GET(`/getUser?id=${id}`)
    if (result["user"]) {
      var user = result["user"];
      var macroGoals = user["macroGoals"];
      var macroValuesJSON = user["macros"];
      var caloriesPercentage = macroValuesJSON.calories / macroGoals.calories * 100;
      var fatPercentage = macroValuesJSON.fat / macroGoals.fat * 100;
      var carbsPercentage = macroValuesJSON.carbs / macroGoals.carbs * 100;
      var proteinPercentage = macroValuesJSON.protein / macroGoals.fat * 100;

      var macroPerObj = { "calories": caloriesPercentage, "fat": fatPercentage, "carbs": carbsPercentage, "protein": proteinPercentage };
      setMacroPercentages(macroPerObj);
      setMacroValues(macroValuesJSON);
      console.log(macroPerObj);
    }
    setUserData(result);
  }

  async function searchUser() {
    fetchUserData(userId);
  }

  if (userData) {
    return (
      <div>
        <h1 class="display-1 text-center" style={{ "margin-bottom": "30px" }}>Dashboard</h1>
        <div class="container">
          <div class="row justify-content-center">
            <div class="col">
              <h3 class="text-center">Calories:</h3>
              <CircularProgressbar value={macroPercentages.calories} text={`${macroValues.calories} cals`} strokeWidth={5} />
            </div>
            <div class="col">
              <h3 class="text-center">Fat:</h3>
              <CircularProgressbar value={macroPercentages.fat} text={`${macroValues.fat} g`} strokeWidth={5} />
            </div>
            <div class="col">
              <h3 class="text-center">Carbs:</h3>
              <CircularProgressbar value={macroPercentages.carbs} text={`${macroValues.carbs} g`} strokeWidth={5} />
            </div>
            <div class="col">
              <h3 class="text-center">Protein:</h3>
              <CircularProgressbar value={macroPercentages.protein} text={`${macroValues.protein} g`} strokeWidth={5} />
            </div>
          </div>
        </div>
        <InventoryDashboard />
        <SavedRecipesDashboard />
      </div>
    )
  }
  else if (userId == '') {
    if (cookies["id"]) {
      fetchUserData(cookies["id"]);
    }
    else {
      const newID = uuidv4()
      setCookie("id", newID, {});
      fetchUserData(newID)
    }
  }

  const responseGoogle = (response) => {
    fetchUserData(response.googleId)
  }

  return (
    <div>
      { process.env.SHOULD_ADD_GOOGLE_LOGIN &&
        <div>
          <button onClick={() => searchUser()}>Create user</button>
          <label>
            ID:
      <input type="ID" onChange={(event) => setUserId(event.target.value)} />
          </label>
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_API_KEY}
            buttonText="Login"
            isSignedIn={true}
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={'single_host_origin'}
          />
        </div>
      }
    </div>
  );
}

export default Home;