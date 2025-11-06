const express = require('express');
const genreController = require('../controllers/genreController');

const router = express.Router();

router.get('/', genreController.getGenres.bind(genreController));
router.get('/:genre_id/movies', genreController.getMoviesByGenre.bind(genreController));

module.exports = router;
