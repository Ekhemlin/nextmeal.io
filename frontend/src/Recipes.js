import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect, useReducer } from "react";
import ReactDataGrid from "react-data-grid";
import { Nav, ProgressBar } from "react-bootstrap";
import RecipesWithIngridients from './RecipesWithIngridients'
import { request_POST, request_GET } from './networking/requests.js';


function Recipes() {
  const [cookies, setCookie] = useCookies(['name']);
  const [savedRecipesRows, setSavedRecipesRows] = useState([]);
  const [recipeSearchRows, setRecipeSearchRows] = useState([]);
  const [query, setQuery] = useState("");
  const [cuisineQuery, setCuisineQuery] = useState("");
  const [cuisineExclude, setCuisineExclude] = useState("");
  const [dietQuery, setDietQuery] = useState("");


  useEffect(() => {
    request_GET(`/getRecipes?id=${cookies.id}`)
      .then((data) => {
        if (data) {
          var i;
          var generatedRows = [];
          var recipes = data.savedRecipes;
          for (i = 0; i < recipes.length; i++) {
            var recipe = recipes[i];
            var cuisineString = "N/A";
            if (recipe.cuisines.length) {
              cuisineString = recipe.cuisines.toString();
            }
            var dietsString = "N/A";
            if (recipe.diets.length) {
              dietsString = recipe.diets.toString();
            }
            generatedRows.push({ title: recipe.title, cuisines: cuisineString, diets: dietsString, healthscore: recipe.healthScore, cookingTime: recipe.readyInMinutes, id: recipe.id });
          }
          setSavedRecipesRows(generatedRows);
        }
      })
  }, []);
  async function searchRecipes() {
    var request_body = JSON.stringify({ "id": cookies.id, query: query, cuisine: cuisineQuery, excludeCuisine: cuisineExclude, diet: dietQuery });
    const result = await request_POST("/searchRecipeWithQuery", request_body);
    if (result) {
      var generatedRows = [];
      var recipes = JSON.parse(result.recipes).results;
      for (var i = 0; i < recipes.length; i++) {
        var recipe = recipes[i];
        console.log("title " + recipe.title);
        generatedRows.push({ title: recipe.title, id: recipe.id });
      }
      setRecipeSearchRows(generatedRows);
      document.getElementById('recipeQuery').value = '';
  }
};

async function saveRecipePOST(recipeId, recipeTitle) {
  var request_body = JSON.stringify({ "id": cookies.id, recipeIds: [recipeId] });
  const result = await request_POST("/addRecipes", request_body);
  var newRows = [];
  for (var i = 0; i < savedRecipesRows.length; i++) {
    var id = savedRecipesRows[i].id;
    if (id != recipeId) {
      newRows.push(savedRecipesRows[i]);
    }
  }
  newRows.push({ "title": recipeTitle, diets: "Refresh page", cuisines: "Refresh page", cookingTime: "Refresh Page", healthscore: 0 });
  setSavedRecipesRows(newRows);
};

function getSearchCellActions(column, row) {
  if (column.key == "title") {
    return ([
      {
        icon: <span className="glyphicon glyphicon-bookmark" />,
        callback: () => {
          alert(row.title + " was added to your saved recipes list");
          saveRecipePOST(row.id, row.title);
        }
      },
      {
        icon: <span className="glyphicon glyphicon-info-sign" />,
        callback: () => {
          window.location = `../recipePage?recipeId=${row.id}`;
        }
      }
    ]
    );
  }
  return null;
}
const recipeSearchColumns = [
  { key: "title", name: "Title" }
];


if (savedRecipesRows) {
  return (
    <div>
      <RecipesWithIngridients />
      <div style={{ "padding-top": "20px" }}>
        <h1 style={{ "margin-top": "50px", "margin-bottom": "10px" }}>Search for recipes</h1>
        <div style={{ display: "flex", "justify-content": "space-between" }}>
          <Nav class="navbar navbar-light bg-light justify-content-between" style={{ "width": "100%" }}>
            <h5 style={{ marginTop: "0" }}>Query:</h5>
            <input type="text" id="recipeQuery" onChange={(event) => setQuery(event.target.value)} />
            <h5 style={{ bottom: "0" }}>Cusine:</h5>
            <input type="text" id="cuisineQuery" onChange={(event) => setCuisineQuery(event.target.value)} />
            <h5 style={{ bottom: "0" }}>Exclude Cuisine:</h5>
            <input type="text" id="cuisineExclude" onChange={(event) => setCuisineExclude(event.target.value)} />
            <h5 style={{ bottom: "0" }}>Diets:</h5>
            <input type="text" id="dietQuery" onChange={(event) => setDietQuery(event.target.value)} />
            <button type="submit" onClick={() => searchRecipes()} className="btn btn-primary">Search recipe</button>
          </Nav>
        </div>

        {recipeSearchRows.length > 0 &&
          <ReactDataGrid id="recipeSearchGrid"
            columns={recipeSearchColumns}
            rowGetter={i => recipeSearchRows[i]}
            rowsCount={recipeSearchRows.length}
            getCellActions={getSearchCellActions}
          />
        }
      </div>
    </div>)
}
}

export default Recipes; 
