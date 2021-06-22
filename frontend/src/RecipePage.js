import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import ReactHtmlParser from 'react-html-parser';
import ListGroup from 'react-bootstrap/ListGroup';


function RecipePage() {
    const [cookies, setCookie] = useCookies(['name']);
    const [recipeData, setRecipeData] = useState(null);
    const [ingridients, setIngridients] = useState([]);
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const recipeId = urlParams.get("recipeId");

    function predictML(recipe){
            
        console.log("test")
        var i;
        var calories; 
        var fat; 
        var protein;
        var carbs;
        var chol; 
        var sodium; 
        var servingSize; 
        for(i=0; i<recipe.nutrition.nutrients.length; i++){
            var nutrient = recipe.nutrition.nutrients[i]
            if(nutrient.name == "Calories"){ calories = nutrient.amount}
            if(nutrient.name == "Fat"){ fat = nutrient.amount}
            if(nutrient.name == "Carbohydrates"){ carbs = nutrient.amount}
            if(nutrient.name == "Cholesterol"){ chol = nutrient.amount}
            if(nutrient.name == "Sodium"){ sodium = nutrient.amount}
            if(nutrient.name == "Protein"){ protein = nutrient.amount}
            if(nutrient.name == "weightPerServing"){ servingSize = nutrient.amount}            
        }
        console.log("test2")
        const mlServerURL = process.env.REACT_APP_ML_ENDPOINT + `/predict?carbs=${carbs}&fat=${fat}&calories=${calories}&protein=${protein}&sodium=${sodium}&chol=${chol}&servingWeight=${200}`;
        fetch(mlServerURL)
        .then((data) => {
            console.log(data)
        })

    }


    useEffect(() => {
        const getRecipeURL = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=` + process.env.REACT_APP_SPOON_API_KEY;
        fetch(getRecipeURL)
            .then(response => response.json())
            .then((recipe) => {
                if (recipe) {
                    var ingridientsArray = recipe.extendedIngredients;
                    var ingridientListItems = [];
                    for (var i = 0; i < ingridientsArray.length; i++) {
                        var ingridient = ingridientsArray[i];
                        if (ingridient.originalString) {
                            ingridientListItems.push(<ListGroup.Item>{ingridient.originalString}</ListGroup.Item>)
                        }
                    }
                    setIngridients(ingridientListItems);
                    setRecipeData(recipe);
                    predictML(recipe)
                }
            })
        }, []);

    if (recipeData) {
        // predictML()
        return (
            <div>
                <h1 style={{ "margin-bottom": "50px" }} class="display-1 text-center">{recipeData.title}</h1>
                <h2 style={{ "margin-bottom": "20px" }}>Will be ready in {recipeData.readyInMinutes} and serve {recipeData.servings} people</h2>
                <div style={{ "font-size": "150%", "margin-bottom": "20px" }}> {ReactHtmlParser(recipeData.summary)} </div>
                <h2 style={{ "margin-bottom": "20px" }}>Ingredients:</h2>
                <ListGroup style={{ "margin-bottom": "20px", "font-size": "120%" }}>
                    {ingridients}
                </ListGroup>
                { recipeData.instructions &&
                    <div>
                        <h2 style={{ "margin-bottom": "20px" }}>Instructions:</h2>
                        <div style={{ "font-size": "150%" }}> {ReactHtmlParser(recipeData.instructions)} </div>
                    </div>
                }
                <h2 style={{ "margin-top": "50px", "margin-bottom": "10px" }}>Tags</h2>
                <div class="container">
                    <div class="row  justify-content-right" style={{ "width": "100%" }}>
                        <h2 style={{ "margin-right": "10px" }}><span class="badge badge-secondary">{"Vegetarian: " + recipeData.vegetarian.toString()}</span></h2>
                        <h2 style={{ "margin-right": "10px" }}><span class="badge badge-secondary">{"Vegan: " + recipeData.vegan.toString()}</span></h2>
                        <h2 style={{ "margin-right": "10px" }}><span class="badge badge-secondary">{"Gluten Free: " + recipeData.glutenFree.toString()}</span></h2>
                        <h2 style={{ "margin-right": "10px" }}><span class="badge badge-secondary">{"Very Healthy: " + recipeData.veryHealthy.toString()}</span></h2>
                    </div>
                </div>



            </div>
        )
    }
    else {
        return (
            <div>
                <h2>loading recipe</h2>
            </div>

        )
    }
}

export default RecipePage; 
