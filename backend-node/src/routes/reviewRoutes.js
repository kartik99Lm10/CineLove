const express = require('express');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.post('/movies/:movie_id/reviews', reviewController.createReview.bind(reviewController));
router.get('/movies/:movie_id/reviews', reviewController.getMovieReviews.bind(reviewController));
router.get('/reviews/latest', reviewController.getLatestReviews.bind(reviewController));

module.exports = router;
