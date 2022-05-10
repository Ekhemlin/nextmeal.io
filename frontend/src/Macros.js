import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import { request_POST, request_GET } from './networking/requests.js';
import "react-circular-progressbar/dist/styles.css";
import "react-bootstrap";
import { toast } from 'wc-toast'
import ReactDataGrid from "react-data-grid";



function Macros() {
    const [cookies, setCookie] = useCookies(['name']);
    const [data, setData] = useState(null);
    const [addCaloriesValue, setAddCalories] = useState(0);
    const [addFatValue, setAddFat] = useState(0);
    const [addCarbsValue, setAddCarbs] = useState(0);
    const [addProteinValue, setAddProtein] = useState(0);
    const [calorieGoalValue, setCalorieGoalValue] = useState(0);
    const [fatGoalValue, setFatGoalValue] = useState(0);
    const [carbGoalValue, setCarbGoalValue] = useState(0);
    const [proteinGoalValue, setProteinGoalValue] = useState(0);
    const [mealJournalRows, setMealJournalRows] = useState([]);

    function headerRenderer(headerText) {
        return (
            <h4>{headerText}</h4>
        )
    }

    function textRowFormatter(row) {
        return (
            <h5 style={{ 'overflow-x': 'scroll' }}>{row.value}</h5>
        )
    }

    function handleInputKeyDown(event, macro) {
        if (event.key === 'Enter') {
            addMacrosPOST(macro)
        }
    }
    const mealJournalColumns = [
        { key: "date", name: "Date", headerRenderer: headerRenderer("Date"), formatter: textRowFormatter },
        { key: "calories", name: "Calories", headerRenderer: headerRenderer("Calories"), formatter: textRowFormatter },
        { key: "carbs", name: "Carbs", headerRenderer: headerRenderer("Carbs"), formatter: textRowFormatter },
        { key: "fat", name: "Fat", headerRenderer: headerRenderer("Fat"), formatter: textRowFormatter },
        { key: "protein", name: "Protein", headerRenderer: headerRenderer("protein"), formatter: textRowFormatter }
    ];

    async function addMacrosPOST(macro) {
        var stringMessage;
        var intCal = parseInt(addCaloriesValue);
        var intFat = parseInt(addFatValue);
        var intCarbs = parseInt(addCarbsValue);
        var intProt = parseInt(addProteinValue);
        if (macro == "cals") {
            stringMessage = `Added ${addCaloriesValue} calories to daily macro intake`
        }
        else if (macro == "fat") {
            stringMessage = `Added ${addFatValue} grams of fat to daily macro intake`
        }
        else if (macro == "carbs") {
            stringMessage = `Added ${addCarbsValue} grams of fat to daily macro intake`
        }
        else if (macro == "protein") {
            stringMessage = `Added ${addFatValue} grams of fat to daily macro intake`
        }
        else {
            stringMessage = "there has been a problem"
        }
        toast.success(stringMessage);
        var request_body = JSON.stringify({ "id": cookies.id, calories: intCal, fat: intFat, carbs: intCarbs, protein: intProt });
        const result = await request_POST("/addMacros", request_body);
        document.getElementById('caloriesInput').value = '';
        document.getElementById('carbsInput').value = '';
        document.getElementById('fatInput').value = '';
        document.getElementById('proteinInput').value = '';
        return result;
    }

    async function changeMacroGoalsPOST() {
        var intCal = parseInt(calorieGoalValue);
        var intCarbs = parseInt(carbGoalValue);
        var intFat = parseInt(fatGoalValue);
        var intProt = parseInt(proteinGoalValue);
        var request_body = JSON.stringify({ "id": cookies.id, calories: intCal, fat: intFat, carbs: intCarbs, protein: intProt });
        const result = await request_POST("/changeMacroGoals", request_body);
        document.getElementById('carbGoalInput').value = '';
        document.getElementById('proteinGoalInput').value = '';
        document.getElementById('fatGoalInput').value = '';
        document.getElementById('caloriesGoalInput').value = '';
        return result;
    }


    useEffect(() => {
        request_GET(`/getMacros?id=${cookies.id}`)
            .then((res) => {
                setData(res)
                const macros = res["macros"]
                console.log(macros)
                let date = new Date()
                let formatteDate = date.toISOString().split('T')[0]
                let macroRow = {"date" : formatteDate, "calories" : macros.calories, "carbs" : macros.carbs, "fat" : macros.fat, "protein" : macros.protein}
                console.log(macroRow)
                setMealJournalRows([macroRow]);
            }) 
    }, [mealJournalRows]);

    if (data) {
        const headerRowHeight = 50;
        const rowHeight = 60;
        const totalHeight = headerRowHeight + (rowHeight * mealJournalRows.length);
        return (
            <div>
                <wc-toast></wc-toast>
                <h1 class="display-1 text-center" style={{ "margin-bottom": "30px" }}>Macro Tracking</h1>
                <div class="container">
                    <h1 style={{ "margin-bottom": "20px" }}>Track Daily Macros</h1>
                    <div class="row justify-content-center">
                        <div class="col">
                            <h4 htmlFor="caloriesInput">Calories</h4>
                            <input type="number" className="form-control" id="caloriesInput" onKeyDown={(event) => handleInputKeyDown(event, "cals")} onChange={(event) => setAddCalories(event.target.value)} placeholder="Calories in your meal" />
                        </div>
                        <div class="col">
                            <h4 htmlFor="fatInput">Fat</h4>
                            <input type="number" className="form-control" id="fatInput" onKeyDown={(event) => handleInputKeyDown(event, "fat")} onChange={(event) => setAddFat(event.target.value)} placeholder="Fat (in grams)" />
                        </div>
                        <div class="col">
                            <h4 htmlFor="carbsInput">Carbs</h4>
                            <input type="number" className="form-control" id="carbsInput" onKeyDown={(event) => handleInputKeyDown(event, "carbs")} onChange={(event) => setAddCarbs(event.target.value)} placeholder="Carbs (in grams)" />
                        </div>
                        <div class="col">
                            <h4 htmlFor="proteinInput">Protein</h4>
                            <input type="number" className="form-control" id="proteinInput" onKeyDown={(event) => handleInputKeyDown(event > "protein")} onChange={(event) => setAddProtein(event.target.value)} placeholder="Protein (in grams)" />
                        </div>
                    </div>
                    <h1 style={{ "margin-top": "20px", "padding-bottom": "20px" }}>Macro Journal</h1>
                    <div style={{ "padding-bottom": "20px"}}>
                        <ReactDataGrid
                            columns={mealJournalColumns}
                            rowGetter={i => mealJournalRows[i]}
                            rowsCount={mealJournalRows.length}
                            minHeight={totalHeight}
                            headerRowHeight={headerRowHeight}
                            rowHeight={rowHeight}
                        />
                    </div>
                    {/* <h1 style={{ "margin-bottom": "20px" }}>Change Macro Goals</h1>
                    <div class="row justify-content-center">
                        <div class="col">
                            <h4 htmlFor="caloriesInput">Calorie Goal</h4>
                            <input type="number" className="form-control" id="caloriesInput" onKeyDown={(event) => handleInputKeyDown(event, "cals")} onChange={(event) => setAddCalories(event.target.value)} placeholder="Calories in your meal" />
                        </div>
                        <div class="col">
                            <h4 htmlFor="fatInput">Fat Goal (g)</h4>
                            <input type="number" className="form-control" id="fatInput" onKeyDown={(event) => handleInputKeyDown(event, "fat")} onChange={(event) => setAddFat(event.target.value)} placeholder="Fat (in grams)" />
                        </div>
                        <div class="col">
                            <h4 htmlFor="carbsInput">Carbs Goal (g)</h4>
                            <input type="number" className="form-control" id="carbsInput" onKeyDown={(event) => handleInputKeyDown(event, "carbs")} onChange={(event) => setAddCarbs(event.target.value)} placeholder="Carbs (in grams)" />
                        </div>
                        <div class="col">
                            <h4 htmlFor="proteinInput">Protein Goal (g)</h4>
                            <input type="number" className="form-control" id="proteinInput" onKeyDown={(event) => handleInputKeyDown(event > "protein")} onChange={(event) => setAddProtein(event.target.value)} placeholder="Protein (in grams)" />
                        </div>
                    </div> */}
                </div>
            </div>
        )
    }
    else {
        return (<div>
        </div>)
    }
}

export default Macros; 
