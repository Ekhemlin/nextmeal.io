import React from 'react';
import { useCookies } from 'react-cookie';
import { useState, useEffect } from "react";
import ReactDataGrid from "react-data-grid";


function InventoryDashboard() {
  const [cookies, setCookie] = useCookies(['name']);
  const [inventoryRows, setInventoryRows] = useState([]);
  const [addItemString, setAddItemString] = useState('')


  async function deleteItemPOST(item) {
    const result = await fetch(process.env.REACT_APP_ENDPOINT + "/removeItems", {
      method: 'POST',
      body: JSON.stringify({ "id": cookies.id, items: [item] }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    var newRows = [];
    var i;
    for (i = 0; i < inventoryRows.length; i++) {
      var row = inventoryRows[i];
      if (row.title != item) {
        newRows.push(row);
      }
    }
    setInventoryRows(newRows);
    const body = await result.json();
    console.log(body);
    return body;
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
      const result = await fetch(process.env.REACT_APP_ENDPOINT + "/addItems", {
        method: 'POST',
        body: JSON.stringify({ "id": cookies.id, items: [item] }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setInventoryRows(rows);
    }
  };


  useEffect(() => {
    const getItemsURL = process.env.REACT_APP_ENDPOINT + `/getItems?id=${cookies.id}`;
    fetch(getItemsURL)
      .then(response => response.json())
      .then((data) => {
        if (data) {
          var i;
          var generatedRows = [];
          var inventory = data.inventory;
          for (i = 0; i < inventory.length; i++) {
            var item = inventory[i];
            generatedRows.push({ title: item });
          }
          setInventoryRows(generatedRows);
        }
      })
  }, []);

  const inventoryColumns = [
    { key: "title", name: "Ingredient name" },
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
    const rowHeight = 50;
    const totalInventoryHeight = headerRowHeight + (rowHeight * inventoryRows.length);
    return (
    <div style={{ "margin-top": "50px" }}>
      <div style={{ display: "flex", "justify-content": "space-between" }}>
        <h1 style={{ "margin-right": "60%"}}>Inventory</h1>
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
        getCellActions={getInventoryCellActions}
      />
    </div>)
  }
}

export default InventoryDashboard; 
