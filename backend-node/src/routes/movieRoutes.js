const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

router.get('/search', movieController.searchMovies.bind(movieController));
router.get('/popular', movieController.getPopularMovies.bind(movieController));
router.get('/now-playing', movieController.getNowPlayingMovies.bind(movieController));
router.get('/indian', movieController.getIndianMovies.bind(movieController));
router.get('/daily-recommendations', movieController.getDailyRecommendations.bind(movieController));
router.get('/:movie_id', movieController.getMovieDetails.bind(movieController));
router.get('/:movie_id/credits', movieController.getMovieCredits.bind(movieController));
router.get('/:movie_id/videos', movieController.getMovieVideos.bind(movieController));

module.exports = router;
