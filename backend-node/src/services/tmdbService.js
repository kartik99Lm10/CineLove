const axios = require('axios');
const { TMDB_CONFIG } = require('../config/constants');

class TMDBService {
    constructor() {
        this.baseURL = TMDB_CONFIG.BASE_URL;
        this.apiKey = TMDB_CONFIG.API_KEY;
        this.defaultLanguage = TMDB_CONFIG.DEFAULT_LANGUAGE;
    }

    async makeRequest(endpoint, params = {}) {
        try {
            const response = await axios.get(`${this.baseURL}${endpoint}`, {
                params: {
                    api_key: this.apiKey,
                    language: this.defaultLanguage,
                    ...params
                }
            });
            return response.data;
        } catch (error) {
            console.error('TMDB API error:', error.message);
            throw error;
        }
    }

    // Movie endpoints
    async getPopularMovies(page = 1) {
        return this.makeRequest('/movie/popular', { page });
    }

    async getTopRatedMovies(page = 1) {
        return this.makeRequest('/movie/top_rated', { page });
    }

    async getNowPlayingMovies(page = 1, region = 'IN') {
        return this.makeRequest('/movie/now_playing', { page, region });
    }

    async searchMovies(query, page = 1, includeAdult = false, year = null) {
        const params = { query, page, include_adult: includeAdult };
        if (year) params.year = year;
        return this.makeRequest('/search/movie', params);
    }

    async getMovieDetails(movieId) {
        return this.makeRequest(`/movie/${movieId}`);
    }

    async getMovieCredits(movieId) {
        return this.makeRequest(`/movie/${movieId}/credits`);
    }

    async getMovieVideos(movieId) {
        return this.makeRequest(`/movie/${movieId}/videos`);
    }

    // Genre endpoints
    async getGenres() {
        return this.makeRequest('/genre/movie/list');
    }

    async getMoviesByGenre(genreId, page = 1) {
        return this.makeRequest('/discover/movie', { with_genres: genreId, page });
    }
}

module.exports = new TMDBService();
