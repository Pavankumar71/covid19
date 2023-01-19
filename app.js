const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET ALL states API

app.get("/states/", async (request, response) => {
  const getStatesQuery = `SELECT * FROM state`;
  const responseStatesArray = await db.all(getStatesQuery);
  let convertResponse = responseStatesArray.map((x) => ({
    stateId: x.state_id,
    stateName: x.state_name,
    population: x.population,
  }));
  //console.log(convertResponse);
  response.send(convertResponse);
});

//GET state Based on stateId API

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `SELECT * FROM state WHERE state_id=${stateId}`;
  const stateDetailsResponse = await db.get(getStateQuery);
  const convertStateResponse = {
    stateId: stateDetailsResponse.state_id,
    stateName: stateDetailsResponse.state_name,
    population: stateDetailsResponse.population,
  };
  // console.log(convertStateResponse);
  response.send(convertStateResponse);
});

//Add API
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictDetailsQuery = `INSERT INTO
  district (district_name,state_id,cases,cured,active,deaths)
   VALUES
      (
        
        '${districtName}',
         ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths}
      );`;
  const insertedDetails = await db.run(addDistrictDetailsQuery);
  console.log(insertedDetails);
  response.send("District Successfully Added");
});

//GET district details based on id
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `SELECT * FROM district WHERE district_id=${districtId}`;
  const districtDetailsResponse = await db.get(getDistrictQuery);
  const convertDistrictResponse = {
    districtName: districtDetailsResponse.district_name,
    stateId: districtDetailsResponse.state_id,
    cases: districtDetailsResponse.cases,
    cured: districtDetailsResponse.cured,
    active: districtDetailsResponse.active,
    deaths: districtDetailsResponse.deaths,
  };
  console.log(convertDistrictResponse);
  response.send(convertDistrictResponse);
});

//DELETE API
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `DELETE FROM district WHERE district_id=${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

// UPDATE API

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictDetailsQuery = `UPDATE
  district
   SET
        district_name='${districtName}',
        state_id=${stateId},
        cases=${cases},
        cured=${cured},
        active=${active},
       deaths=${deaths}
       WHERE district_id=${districtId};`;
  const updatedDetails = await db.run(updateDistrictDetailsQuery);
  console.log(updatedDetails);
  response.send("District Details Updated");
});

// GET API

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getDistrictQuery = `SELECT cases,cured,active,deaths FROM district WHERE state_id=${stateId} GROUP BY state_id;`;
  const districtDetailsResponse = await db.get(getDistrictQuery);
  const convertDistrictResponse = {
    totalCases: districtDetailsResponse.cases,
    totalCured: districtDetailsResponse.cured,
    totalActive: districtDetailsResponse.active,
    totalDeaths: districtDetailsResponse.deaths,
  };
  console.log(convertDistrictResponse);
  response.send(convertDistrictResponse);
});

//GET API
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateQuery = `SELECT state.state_name FROM state INNER JOIN district ON state.state_id=district.state_id WHERE district_id=${districtId};`;
  const stateDetailsResponse = await db.get(getStateQuery);
  const convertStateResponse = {
    stateName: stateDetailsResponse.state_name,
  };
  console.log(convertStateResponse);
  // console.log(stateDetailsResponse);
  response.send(convertStateResponse);
});

module.exports = app;
