const tmdbService = require('../services/tmdbService');
const { 
    filterGoodMovies, 
    filterIndianMovies, 
    transformMovieToSearchResult 
} = require('../utils/movieUtils');

class MovieController {
    async searchMovies(req, res) {
        try {
            const { query, language = 'english', page = 1, year, include_adult = false } = req.query;
            
            if (!query) {
                return res.status(400).json({ error: 'Query parameter is required' });
            }

            const searchResults = await tmdbService.searchMovies(
                query, 
                parseInt(page), 
                include_adult === 'true', 
                year ? parseInt(year) : null
            );
            
            // Filter for Indian movies only
            const indianMovies = [];
            if (searchResults.results) {
                for (const movie of searchResults.results) {
                    if (['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'gu', 'pa', 'or'].includes(movie.original_language)) {
                        indianMovies.push(transformMovieToSearchResult(movie));
                    }
                }
            }

            res.json({
                results: indianMovies,
                total_pages: searchResults.total_pages || 1,
                total_results: indianMovies.length,
                page: parseInt(page)
            });
        } catch (error) {
            console.error('Search error:', error.message);
            res.status(500).json({ error: `Search failed: ${error.message}` });
        }
    }

    async getPopularMovies(req, res) {
        try {
            const { language = 'english', page = 1, region = 'IN' } = req.query;
            
            const allMovies = [];
            
            // Fetch multiple pages to get more variety
            for (let pageNum = 1; pageNum <= 6; pageNum++) {
                try {
                    const popularResults = await tmdbService.getPopularMovies(pageNum);
                    if (popularResults.results) {
                        const pageMovies = filterGoodMovies(popularResults.results);
                        for (const movie of pageMovies) {
                            if (!allMovies.some(existing => existing.id === movie.id)) {
                                allMovies.push(transformMovieToSearchResult(movie));
                            }
                        }
                    }
                    
                    if (allMovies.length >= 50) break;
                } catch (error) {
                    console.warn(`Error fetching page ${pageNum}:`, error.message);
                    continue;
                }
            }

            // Sort by popularity
            allMovies.sort((a, b) => b.popularity - a.popularity);
            
            // Paginate results
            const pageSize = 20;
            const startIdx = (parseInt(page) - 1) * pageSize;
            const endIdx = startIdx + pageSize;
            const paginatedMovies = allMovies.slice(startIdx, endIdx);
            
            res.json({
                results: paginatedMovies,
                total_pages: Math.ceil(allMovies.length / pageSize),
                total_results: allMovies.length,
                page: parseInt(page)
            });
        } catch (error) {
            console.error('Popular movies error:', error.message);
            res.status(500).json({ error: `Failed to get popular movies: ${error.message}` });
        }
    }

    async getNowPlayingMovies(req, res) {
        try {
            const { language = 'english', page = 1, region = 'IN' } = req.query;
            
            const nowPlayingResults = await tmdbService.getNowPlayingMovies(parseInt(page), region);
            
            const indianMovies = [];
            if (nowPlayingResults.results) {
                const allMovies = filterGoodMovies(nowPlayingResults.results);
                for (const movie of allMovies) {
                    const result = transformMovieToSearchResult(movie);
                    if (result.is_currently_in_theaters) {
                        indianMovies.push(result);
                    }
                }
            }
            
            // If no movies in theaters, fallback to recent popular movies
            if (indianMovies.length === 0) {
                try {
                    const popularResults = await tmdbService.getPopularMovies(1);
                    if (popularResults.results) {
                        const popularMovies = filterGoodMovies(popularResults.results);
                        for (const movie of popularMovies.slice(0, 5)) {
                            const result = transformMovieToSearchResult(movie);
                            result.is_currently_in_theaters = true;
                            result.booking_platforms = require('../utils/movieUtils').getBookingPlatforms(movie);
                            indianMovies.push(result);
                        }
                    }
                } catch (error) {
                    console.warn('Fallback popular movies error:', error.message);
                }
            }
            
            res.json({
                results: indianMovies,
                total_pages: nowPlayingResults.total_pages || 1,
                total_results: indianMovies.length,
                page: parseInt(page)
            });
        } catch (error) {
            console.error('Now playing error:', error.message);
            res.status(500).json({ error: `Failed to get now playing movies: ${error.message}` });
        }
    }

    async getIndianMovies(req, res) {
        try {
            const { language = 'english', page = 1 } = req.query;
            
            const allIndianMovies = [];
            
            // Get popular movies - be more inclusive for better user experience
            try {
                for (let pageNum = 1; pageNum <= 10; pageNum++) {
                    const popularResults = await tmdbService.getPopularMovies(pageNum);
                    if (popularResults.results) {
                        const goodMoviesPage = filterGoodMovies(popularResults.results);
                        const indianMoviesPage = filterIndianMovies(goodMoviesPage);
                        
                        // Add Indian movies first
                        for (const movie of indianMoviesPage) {
                            if (!allIndianMovies.some(existing => existing.id === movie.id)) {
                                const result = transformMovieToSearchResult(movie);
                                result.ott_platforms = require('../utils/movieUtils').getOttPlatforms(movie);
                                allIndianMovies.push(result);
                            }
                        }
                        
                        // If we don't have enough Indian movies, add other good movies
                        if (allIndianMovies.length < 20) {
                            for (const movie of goodMoviesPage) {
                                if (!allIndianMovies.some(existing => existing.id === movie.id)) {
                                    const result = transformMovieToSearchResult(movie);
                                    result.ott_platforms = require('../utils/movieUtils').getOttPlatforms(movie);
                                    allIndianMovies.push(result);
                                    
                                    if (allIndianMovies.length >= 40) break;
                                }
                            }
                        }
                    }
                    
                    if (allIndianMovies.length >= 60) break;
                }
            } catch (error) {
                console.warn('Error fetching popular movies:', error.message);
            }
            
            // Also get top-rated movies for more variety
            if (allIndianMovies.length < 50) {
                try {
                    for (let pageNum = 1; pageNum <= 5; pageNum++) {
                        const topRatedResults = await tmdbService.getTopRatedMovies(pageNum);
                        if (topRatedResults.results) {
                            const goodMoviesPage = filterGoodMovies(topRatedResults.results);
                            const indianMoviesPage = filterIndianMovies(goodMoviesPage);
                            for (const movie of indianMoviesPage) {
                                if (!allIndianMovies.some(existing => existing.id === movie.id)) {
                                    const result = transformMovieToSearchResult(movie);
                                    result.ott_platforms = require('../utils/movieUtils').getOttPlatforms(movie);
                                    allIndianMovies.push(result);
                                }
                            }
                            
                            if (allIndianMovies.length >= 60) break;
                        }
                    }
                } catch (error) {
                    console.warn('Error fetching top rated movies:', error.message);
                }
            }
            
            // Sort by vote average and popularity
            allIndianMovies.sort((a, b) => {
                if (b.vote_average !== a.vote_average) {
                    return b.vote_average - a.vote_average;
                }
                return b.popularity - a.popularity;
            });
            
            // Remove duplicates
            const seenIds = new Set();
            const uniqueIndianMovies = allIndianMovies.filter(movie => {
                if (seenIds.has(movie.id)) return false;
                seenIds.add(movie.id);
                return true;
            });
            
            // Paginate results
            const pageSize = 20;
            const startIdx = (parseInt(page) - 1) * pageSize;
            const endIdx = startIdx + pageSize;
            const paginatedMovies = uniqueIndianMovies.slice(startIdx, endIdx);
            
            res.json({
                results: paginatedMovies,
                total_pages: Math.ceil(uniqueIndianMovies.length / pageSize),
                total_results: uniqueIndianMovies.length,
                page: parseInt(page)
            });
        } catch (error) {
            console.error('Indian movies error:', error.message);
            res.status(500).json({ error: `Failed to get Indian movies: ${error.message}` });
        }
    }

    async getDailyRecommendations(req, res) {
        try {
            const { language = 'english', page = 1 } = req.query;
            
            // Use current date as seed for consistent daily recommendations
            const today = new Date();
            const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
            
            const allRecommendedMovies = [];
            
            // Get popular movies
            try {
                const popularResults = await tmdbService.getPopularMovies(1);
                if (popularResults.results) {
                    const popularMovies = filterGoodMovies(popularResults.results);
                    allRecommendedMovies.push(...popularMovies.slice(0, 10));
                }
            } catch (error) {
                console.warn('Error fetching popular movies for recommendations:', error.message);
            }
            
            // Get top rated movies
            try {
                const topRatedResults = await tmdbService.getTopRatedMovies(1);
                if (topRatedResults.results) {
                    const topRatedMovies = filterGoodMovies(topRatedResults.results);
                    allRecommendedMovies.push(...topRatedMovies.slice(0, 10));
                }
            } catch (error) {
                console.warn('Error fetching top rated movies for recommendations:', error.message);
            }
            
            // Remove duplicates
            const seenIds = new Set();
            const uniqueMovies = allRecommendedMovies.filter(movie => {
                if (seenIds.has(movie.id)) return false;
                seenIds.add(movie.id);
                return true;
            });
            
            // Shuffle using seed for consistent daily results
            const shuffled = uniqueMovies.sort(() => 0.5 - Math.sin(seed * 9999) % 1);
            const dailyRecommendations = shuffled.slice(0, 8);
            
            // Transform results
            const recommendedResults = dailyRecommendations.map(movie => transformMovieToSearchResult(movie));
            
            res.json({
                results: recommendedResults,
                total_pages: 1,
                total_results: recommendedResults.length,
                page: parseInt(page)
            });
        } catch (error) {
            console.error('Daily recommendations error:', error.message);
            res.status(500).json({ error: `Failed to get daily recommendations: ${error.message}` });
        }
    }

    async getMovieDetails(req, res) {
        try {
            const { movie_id } = req.params;
            const { language = 'english' } = req.query;
            
            const movie = await tmdbService.getMovieDetails(movie_id);
            
            if (!movie) {
                return res.status(404).json({ error: 'Movie not found' });
            }
            
            // Transform movie details
            const movieUtils = require('../utils/movieUtils');
            const movieDetails = {
                id: movie.id,
                title: movie.title || movie.original_title || '',
                original_title: movie.original_title || '',
                overview: movie.overview || '',
                tagline: movie.tagline || null,
                release_date: movie.release_date || null,
                runtime: movie.runtime || null,
                budget: movie.budget || 0,
                revenue: movie.revenue || 0,
                popularity: movie.popularity || 0,
                vote_average: movie.vote_average || 0,
                vote_count: movie.vote_count || 0,
                adult: movie.adult || false,
                backdrop_path: movie.backdrop_path || null,
                poster_path: movie.poster_path || null,
                homepage: movie.homepage || null,
                imdb_id: movie.imdb_id || null,
                original_language: movie.original_language || '',
                status: movie.status || '',
                genres: (movie.genres || []).map(g => ({ id: g.id, name: g.name })),
                production_companies: (movie.production_companies || []).map(company => ({
                    id: company.id,
                    name: company.name,
                    logo_path: company.logo_path,
                    origin_country: company.origin_country || ''
                })),
                production_countries: (movie.production_countries || []).map(country => ({
                    iso_3166_1: country.iso_3166_1,
                    name: country.name
                })),
                spoken_languages: (movie.spoken_languages || []).map(lang => ({
                    english_name: lang.english_name || '',
                    iso_639_1: lang.iso_639_1,
                    name: lang.name || ''
                })),
                is_currently_in_theaters: movieUtils.isCurrentlyInTheaters(movie),
                ott_platforms: movieUtils.getOttPlatforms(movie),
                booking_platforms: movieUtils.getBookingPlatforms(movie)
            };
            
            res.json(movieDetails);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(404).json({ error: 'Movie not found' });
            }
            console.error('Movie details error:', error.message);
            res.status(500).json({ error: `Failed to get movie details: ${error.message}` });
        }
    }

    async getMovieCredits(req, res) {
        try {
            const { movie_id } = req.params;
            const { language = 'english' } = req.query;
            
            const credits = await tmdbService.getMovieCredits(movie_id);
            
            if (!credits) {
                return res.status(404).json({ error: 'Credits not found' });
            }
            
            const result = {
                cast: (credits.cast || []).map(cast => ({
                    id: cast.id,
                    name: cast.name || '',
                    character: cast.character || null,
                    credit_id: cast.credit_id || '',
                    order: cast.order || 0,
                    adult: cast.adult || false,
                    gender: cast.gender || null,
                    known_for_department: cast.known_for_department || '',
                    original_name: cast.original_name || '',
                    popularity: cast.popularity || 0,
                    profile_path: cast.profile_path || null
                })),
                crew: (credits.crew || []).map(crew => ({
                    id: crew.id,
                    name: crew.name || '',
                    job: crew.job || '',
                    department: crew.department || '',
                    credit_id: crew.credit_id || '',
                    adult: crew.adult || false,
                    gender: crew.gender || null,
                    known_for_department: crew.known_for_department || '',
                    original_name: crew.original_name || '',
                    popularity: crew.popularity || 0,
                    profile_path: crew.profile_path || null
                }))
            };
            
            res.json(result);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(404).json({ error: 'Credits not found' });
            }
            console.error('Credits error:', error.message);
            res.status(500).json({ error: `Failed to get movie credits: ${error.message}` });
        }
    }

    async getMovieVideos(req, res) {
        try {
            const { movie_id } = req.params;
            const { language = 'english' } = req.query;
            
            const videosResult = await tmdbService.getMovieVideos(movie_id);
            
            const videos = [];
            if (videosResult.results) {
                for (const video of videosResult.results) {
                    let videoUrl = null;
                    const site = video.site || '';
                    const key = video.key || '';
                    
                    if (site.toLowerCase() === 'youtube') {
                        videoUrl = `https://www.youtube.com/watch?v=${key}`;
                    }
                    
                    videos.push({
                        id: video.id || '',
                        key: key,
                        name: video.name || '',
                        site: site,
                        size: video.size || 0,
                        type: video.type || '',
                        official: video.official || false,
                        published_at: video.published_at || null,
                        url: videoUrl
                    });
                }
            }
            
            // Separate trailers from other videos
            const trailers = videos.filter(v => v.type.toLowerCase() === 'trailer');
            const otherVideos = videos.filter(v => v.type.toLowerCase() !== 'trailer');
            
            res.json({
                trailers: trailers,
                other_videos: otherVideos,
                total_count: videos.length
            });
        } catch (error) {
            console.error('Videos error:', error.message);
            res.status(500).json({ error: `Failed to get movie videos: ${error.message}` });
        }
    }
}

module.exports = new MovieController();
