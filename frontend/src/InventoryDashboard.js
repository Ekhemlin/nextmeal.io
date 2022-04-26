import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import ReactDataGrid from "react-data-grid";
import {request_POST, request_GET} from './networking/requests.js';

function InventoryDashboard() {
  const [cookies, setCookie] = useCookies(['name']);
  const [inventoryRows, setInventoryRows] = useState([]);
  const [addItemString, setAddItemString] = useState('')


  async function deleteItemPOST(item) {
    const request_body = JSON.stringify({ "id": cookies.id, items: [item] })
    const result = await request_POST("/removeItems", request_body)
    var newRows = [];
    for (var i = 0; i < inventoryRows.length; i++) {
      var row = inventoryRows[i];
      if (row.title != item) {
        newRows.push(row);
      }
    }
    setInventoryRows(newRows);
    return result;
  };

  async function addItemPOST(item) {
    var rows = inventoryRows;
    var isItemDupe = false
    for(var row in rows){
      if(row.title==item){
        isItemDupe = true
      }  
    }
    console.log(isItemDupe)
    if(! isItemDupe){
      rows.push({ "title": item });
      setInventoryRows(rows);
      var request_body = JSON.stringify({ "id": cookies.id, items: [item] });
      const result = await request_POST("/addItems", request_body);
    }
  };


  useEffect(() => {
    request_GET(`/getItems?id=${cookies.id}`)
    .then((inventory_data) => {
      if (inventory_data) {
        var generatedRows = [];
        var inventory = inventory_data.inventory;
        for (var i = 0; i < inventory.length; i++) {
          var item = inventory[i];
            generatedRows.push({ title: item });
        }
        setInventoryRows(generatedRows);
      }
    })
  }, []);

  function rowFormatter(row){
    return(
      <h4>{row.value}</h4>
    )
  }

  function headerRenderer(headerText){
    return(
      <h3>{headerText}</h3>
    )
  }
  

  const inventoryColumns = [
    { key: "title", name: "Ingredient name" , formatter: rowFormatter, headerRenderer: headerRenderer("Ingredient")}
  ];

  function getInventoryCellActions(column, row) {
    if (column.key == "title") {
      return ([
        {
          icon: <span className="glyphicon glyphicon-remove" />,
          callback: () => {
            const deletePOST = deleteItemPOST(row.title);
          }
        }
      ]);
    }
    return null;
  }


  function handleInputKeyDown(event) {
    if (event.key === 'Enter') {
      if(addItemString.length){
        console.log(addItemString);
        addItemPOST(addItemString);
        setAddItemString('');
        document.getElementById('itemInput').value = '';
      }
    }
  }


  if (inventoryRows) {
    const headerRowHeight = 50;
    const rowHeight = 60;
    const totalInventoryHeight = headerRowHeight + (rowHeight * inventoryRows.length);
    return (
    <div style={{ "margin-top": "50px"}}>
      <div style={{ display: "flex", "justify-content": "space-between" }}>
        <h1 class="display-4" style={{ "margin-right": "60%"}}>Inventory</h1>
        <div class="input-group input-group-lg ">
          <input type="text" class="form-control" placeholder="Press Enter to submit" onChange={(event) => setAddItemString(event.target.value)}
            aria-describedby="basic-addon2" id="itemInput" style={{ height: "100%"}} onKeyDown={(event) => handleInputKeyDown(event)}/>
          <div class="input-group-append">
            <span class="input-group-text" id="basic-addon2">Add items</span>
          </div>
        </div>
      </div>
      <ReactDataGrid id="inventoryGrid"
        columns={inventoryColumns}
        rowGetter={i => inventoryRows[i]}
        rowsCount={inventoryRows.length}
        minHeight={totalInventoryHeight}
        headerRowHeight={headerRowHeight}
        rowHeight={rowHeight}
        headerRenderer={headerRenderer}
        getCellActions={getInventoryCellActions}
      />
    </div>)
  }
}

export default InventoryDashboard; 
