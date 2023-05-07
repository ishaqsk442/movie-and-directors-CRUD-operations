const express = require("express");

const app = express();

app.use(express.json());

const path = require("path");

const dbpath = path.join(__dirname, "moviesData.db");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

let db = null;

const initAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server started");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
    // movieid: dbObject.movie_id,
  };
};

const forsinglemovie = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const fordirectors = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  let quieryformovies = `SELECT * FROM movie`;

  let result = await db.all(quieryformovies);

  response.send(
    result.map((eachmovie) => convertDbObjectToResponseObject(eachmovie))
  );
});

app.post("/movies/", async (request, response) => {
  let movieDetails = request.body;

  let { directorId, movieName, leadActor } = movieDetails;

  let quiery = `INSERT INTO movie (director_id,movie_name,lead_actor) VALUES(${directorId},'${movieName}','${leadActor}');`;

  let result = await db.run(quiery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;

  let quiery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;

  let result = await db.get(quiery);
  response.send(forsinglemovie(result));

  //   response.send(convertDbObjectToResponseObject(result));
});

app.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;

  let { directorId, movieName, leadActor } = request.body;

  let queiry = `UPDATE movie SET director_id = ${directorId}, movie_name= '${movieName}' , lead_actor = '${leadActor}' WHERE movie_id = ${movieId};`;

  await db.run(queiry);

  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;

  let queiry = `DELETE FROM movie WHERE movie_id = ${movieId}`;

  await db.run(queiry);

  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  let queiry = `SELECT * FROM director`;

  let result = await db.all(queiry);

  response.send(result.map((eachDirector) => fordirectors(eachDirector)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;

  let queiry = `SELECT * FROM movie WHERE director_id = ${directorId}`;

  let result = await db.all(queiry);

  response.send(
    result.map((eachmovie) => convertDbObjectToResponseObject(eachmovie))
  );
});
module.exports = app;
