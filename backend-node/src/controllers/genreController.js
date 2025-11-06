const tmdbService = require('../services/tmdbService');
const { filterGoodMovies, transformMovieToSearchResult } = require('../utils/movieUtils');

class GenreController {
    async getGenres(req, res) {
        try {
            const genresResult = await tmdbService.getGenres();
            
            const genres = (genresResult.genres || []).map(genre => ({
                id: genre.id,
                name: genre.name,
                movie_count: 0 // Would need separate API calls to get counts
            }));
            
            res.json(genres);
        } catch (error) {
            console.error('Genres error:', error.message);
            res.status(500).json({ error: `Failed to get genres: ${error.message}` });
        }
    }

    async getMoviesByGenre(req, res) {
        try {
            const { genre_id } = req.params;
            const { page = 1 } = req.query;
            
            // For now, fallback to popular movies
            const results = await tmdbService.getPopularMovies(parseInt(page));
            
            const movies = [];
            if (results.results) {
                const allMovies = filterGoodMovies(results.results);
                for (const movie of allMovies) {
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
            console.error('Genre movies error:', error.message);
            res.status(500).json({ error: `Failed to get movies by genre: ${error.message}` });
        }
    }
}

module.exports = new GenreController();
