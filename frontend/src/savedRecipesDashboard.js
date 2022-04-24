import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect, useReducer } from "react";
import ReactDataGrid from "react-data-grid";
import { ProgressBar } from "react-bootstrap";
import { request_POST, request_GET } from './networking/requests.js';


const ProgressBarFormatter = ({ value }) => {
  return <ProgressBar now={value} label={`${value}%`} width="50" height="50" />;
};


function SavedRecipesDashboard() {
  const [cookies, setCookie] = useCookies(['name']);
  const [savedRecipesRows, setSavedRecipesRows] = useState([]);  

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
            generatedRows.push({ title: recipe.title, cuisines: cuisineString, diets: dietsString, healthscore: recipe.healthScore, cookingTime: recipe.readyInMinutes, id:recipe.id});
          }
          setSavedRecipesRows(generatedRows);
        }
      })
  }, []);

 
  async function functionSendDeleteRecipe(recipeId){
    var request_body = JSON.stringify({"id" : cookies.id, recipeIds : [recipeId]});
    const result = await request_POST("/removeRecipes", request_body);
    var newRows = [];
    for(var i=0; i<savedRecipesRows.length; i++){
      var row = savedRecipesRows[i];
      if(row.id!=recipeId){
        newRows.push(row);
      }
    }
    setSavedRecipesRows(newRows);
    return result;
  };

  const savedRecipeColumns = [
    { key: "title", name: "Title" },
    { key: "cuisines", name: "Cuisines" },
    { key: "diets", name: "Diets" },
    { key: "cookingTime", name: "Cooking Time (Minutes)" },
    { key: "healthscore", name: "Health Score", formatter: ProgressBarFormatter }
  ];

  function getSavedCellActions(column, row) {
    if(column.key=="title"){
      return ([
        {
          icon: <span className="glyphicon glyphicon-remove" />,
          callback: () => {
            if(window.confirm("Are you sure you want to remove \"" + row.title + "\" from your saved recipes?")){
              const deletePOST = functionSendDeleteRecipe(row.id);
            }
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


  if (savedRecipesRows) {
    const headerRowHeight = 50;
    const rowHeight = 50; 
    const totalHeight = headerRowHeight + (rowHeight*savedRecipesRows.length);

    return (
    <div  style={{"padding-bottom" : "20px"}}>
      <h1 style={{"margin-top" : "50px"}}>Saved recipes</h1>
      <ReactDataGrid
        columns={savedRecipeColumns}
        rowGetter={i => savedRecipesRows[i]}
        rowsCount={savedRecipesRows.length}
        minHeight={totalHeight}
        headerRowHeight={headerRowHeight}
        rowHeight={rowHeight}
        getCellActions={getSavedCellActions}
      />
    </div>)
  }
}

export default SavedRecipesDashboard; 
