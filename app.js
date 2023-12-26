const express = require('express')

const app = express()

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const path = require('path')

const dbPath = path.join(__dirname, 'moviesData.db')

app.use(express.json())

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    })
  } catch (e) {
    console.log('DB Error message ${e.message}')

    process.exit(1)
  }
}

app.listen(3000, () => {
  console.log('Server running at http://localshost:3000/')
})

initializeDBAndServer()

const convertMovieName = DbObject => {
  return {
    movieName: DbObject.movie_name,
  }
}

const convertMovie = DbObject => {
  return {
    movieId: DbObject.movie_id,

    directorId: DbObject.director_id,

    movieName: DbObject.movie_name,

    leadActor: DbObject.lead_actor,
  }
}

//GET movies List

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`

  const moviesArray = await db.all(getMoviesQuery)

  response.send(moviesArray.map(eachmovie => convertMovieName(eachmovie)))
})

//Creates a new movie in the movie table

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body

  const {directorId, movieName, leadActor} = movieDetails

  const addMovieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor) VALUES (${directorId},'${movieName}','${leadActor}') ;`

  await db.run(addMovieQuery)

  response.send('Movie Successfully Added')
})

//Returns a movie based on the movie ID

app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params

  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`

  const dbResponse = await db.get(getMovieQuery)

  response.send(convertMovie(dbResponse))
})

//Updates the details of a movie in the movie table based on the movie ID

app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params

  const movieDetails = request.body

  const {directorId, movieName, leadActor} = movieDetails

  const updateMovieQuery = `UPDATE movie SET 

  director_id=${directorId},

  movie_name='${movieName}',

  lead_actor='${leadActor}'`

  await db.run(updateMovieQuery)

  response.send('Movie Details Updated')
})

//Deletes a movie from the movie table based on the movie ID

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params

  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId};`

  await db.run(deleteMovieQuery)

  response.send('Movie Removed')
})

const convertDirector = dbObject => {
  return {
    directorId: dbObject.director_id,

    directorName: dbObject.director_name,
  }
}

//Returns a list of all directors in the director table

app.get('/directors', async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director;`

  const directorArray = await db.all(getDirectorsQuery)

  response.send(
    directorArray.map(eachdirector => convertDirector(eachdirector)),
  )
})

//Returns a list of all movie names directed by a specific director

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params

  const getDirectorMoviesQuery = `SELECT movie_name FROM movie WHERE director_id='${directorId}';`

  const moviesArray = await db.all(getDirectorMoviesQuery)

  response.send(
    moviesArray.map((eachmovie )=> ({
      movieName: eachmovie.movie_name,
    })),
  )
})

module.exports = app
