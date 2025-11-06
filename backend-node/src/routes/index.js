const express = require('express');
const movieRoutes = require('./movieRoutes');
const reviewRoutes = require('./reviewRoutes');
const genreRoutes = require('./genreRoutes');
const { INDIAN_LANGUAGES } = require('../config/constants');
const tmdbService = require('../services/tmdbService');
const { filterGoodMovies, transformMovieToSearchResult } = require('../utils/movieUtils');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Cinalove API is running!', version: '1.0.0' });
});

router.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Cinalove API', 
        tmdb_configured: !!process.env.TMDB_API_KEY 
    });
});

router.get('/languages', (req, res) => {
    const supportedLanguages = Object.entries(INDIAN_LANGUAGES).map(([key, config]) => ({
        key: key,
        code: config.code,
        name: config.name,
        tmdb_code: config.tmdb_code
    }));
    
    res.json({ supported_languages: supportedLanguages });
});

router.get('/discover', async (req, res) => {
    try {
        const { 
            language = 'english', 
            sort_by = 'popularity.desc', 
            with_genres, 
            year, 
            vote_average_gte, 
            page = 1 
        } = req.query;
        
        const results = await tmdbService.getPopularMovies(parseInt(page));
        
        const movies = [];
        if (results.results) {
            const allMovies = filterGoodMovies(results.results);
            for (const movie of allMovies) {
                if (year && movie.release_date) {
                    try {
                        const movieYear = parseInt(movie.release_date.split('-')[0]);
                        if (movieYear !== parseInt(year)) {
                            continue;
                        }
                    } catch (error) {
                    }
                }

                if (vote_average_gte && (movie.vote_average || 0) < parseFloat(vote_average_gte)) {
                    continue;
                }
                
                movies.push(transformMovieToSearchResult(movie));
            }
        }
        
        res.json({
            results: movies,
            total_pages: results.total_pages || 1,
            total_results: movies.length,
            page: parseInt(page)
        });
    } catch (error) {
        console.error('Discover error:', error.message);
        res.status(500).json({ error: `Discovery failed: ${error.message}` });
    }
});

router.use('/movies', movieRoutes);
router.use('/genres', genreRoutes);
router.use('/', reviewRoutes); // Reviews are mounted at root level for backward compatibility

module.exports = router;
