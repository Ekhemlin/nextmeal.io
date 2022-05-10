import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import ReactDataGrid from "react-data-grid";
import { request_POST, request_GET } from './networking/requests.js';
import { toast } from 'wc-toast'

function RecipesWithIngridients() {
  const [cookies, setCookie] = useCookies(['name']);
  const [recipeSearchRows, setRecipeSearchRows] = useState([]);


  async function saveRecipePOST(recipeId) {
    const request_body = JSON.stringify({ "id": cookies.id, recipeIds: [recipeId] });
    const result = await request_POST("/addRecipes", request_body)
  }

  async function searchRecipes() {
    const request_body = JSON.stringify({ "id": cookies.id });
    const result = await request_POST("/searchRecipeWithInventory", request_body)
    if (result) {
      var i;
      var generatedRows = [];
      var recipes = JSON.parse(result.recipes);
      for (i = 0; i < recipes.length; i++) {
        var recipe = recipes[i];
        console.log("title " + recipe.title);
        generatedRows.push({ title: recipe.title, id: recipe.id });
      }
      setRecipeSearchRows(generatedRows);
    }
  };

  useEffect(() => {
    searchRecipes();
  }, []);

  function headerRenderer(headerText) {
    return (
      <h3>{headerText}</h3>
    )
  }

  function textRowFormatter(row) {
    return (
      <h4 style={{ 'overflow-x': 'scroll' }}>{row.value}</h4>
    )
  }

  const recipeSearchColumns = [
    { key: "title", name: "Title", formatter: textRowFormatter, headerRenderer: headerRenderer("Ingredient") }
  ];


  function getSearchCellActions(column, row) {
    if (column.key == "title") {
      return ([
        {
          icon: <span className="glyphicon glyphicon-bookmark" />,
          callback: () => {
            toast.success(row.title + " was added to your saved recipes list")
            saveRecipePOST(row.id);
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


  const EmptyRowsView = () => {
    console.log("empty")
    const message = "Loading Recipes";
    return (
      <div
        style={{ textAlign: "center", backgroundColor: "#ddd", padding: "100px", height: "100%" }}>
        <h3>{message}</h3>
      </div>
    );
  };


  return (
    <div>
      <wc-toast></wc-toast>
      <div style={{ display: "flex", "justify-content": "space-between" }}>
        <h1 class="display-4" style={{ "margin-top": "50px" }}> Recipes you can cook right now</h1>
      </div>
      { <ReactDataGrid
        id="recipeSearchGrid"
        columns={recipeSearchColumns}
        minHeight={250}
        rowGetter={i => recipeSearchRows[i]}
        rowsCount={recipeSearchRows.length}
        emptyRowsView={EmptyRowsView}
        getCellActions={getSearchCellActions}
      />
      }
    </div>)
}

export default RecipesWithIngridients; 
