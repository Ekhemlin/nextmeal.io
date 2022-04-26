import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect, useReducer } from "react";
import ReactDataGrid from "react-data-grid";
import { ProgressBar } from "react-bootstrap";
import { request_POST, request_GET } from './networking/requests.js';


const ProgressBarFormatter = ({ value }) => {
  return <ProgressBar now={value} label={`${value}%`} width="30" height="50" />;
};

function headerRenderer(headerText){
  return(
    <h3>{headerText}</h3>
  )
}

function textRowFormatter(row){
  return(
    <h4>{row.value}</h4>
  )
}

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
    { key: "title", name: "Title", headerRenderer: headerRenderer("Title"), formatter: textRowFormatter },
    { key: "cuisines", name: "Cuisines", headerRenderer: headerRenderer("Cuisines"), formatter: textRowFormatter, width: '100%', resizable: true},
    { key: "diets", name: "Diets", headerRenderer: headerRenderer("Diets"), formatter: textRowFormatter  },
    { key: "cookingTime", name: "Cooking Time (Minutes)", headerRenderer: headerRenderer("Cooking Time (Minutes)"), formatter: textRowFormatter },
    { key: "healthscore", name: "Health Score", formatter: ProgressBarFormatter, headerRenderer: headerRenderer("Health Score") }
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
    const rowHeight = 60; 
    const totalHeight = headerRowHeight + (rowHeight*savedRecipesRows.length);

    return (
    <div  style={{"padding-bottom" : "20px"}}>
      <h1 class="display-4" style={{"margin-top" : "50px"}}>Saved recipes</h1>
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
