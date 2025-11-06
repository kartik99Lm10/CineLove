const { INDIAN_LANGUAGE_CODES, INDIAN_KEYWORDS } = require('../config/constants');

function isGoodMovie(movie) {
    if (!movie) return false;
    
    const voteAverage = movie.vote_average || 0;
    const voteCount = movie.vote_count || 0;
    const popularity = movie.popularity || 0;
    
    if (voteAverage >= 5.0 || voteCount >= 100 || popularity >= 10.0) {
        return true;
    }
    
    const releaseDate = movie.release_date;
    if (releaseDate) {
        try {
            const releaseYear = parseInt(releaseDate.split('-')[0]);
            const currentYear = new Date().getFullYear();
            if (releaseYear >= currentYear - 2) {
                return true;
            }
        } catch (error) {
            // ignore parsing errors
        }
    }
    
    return true; // Default to accepting movies
}

function isCurrentlyInTheaters(movie) {
    const releaseDateStr = movie.release_date;
    if (!releaseDateStr) return false;

    try {
        const releaseDate = new Date(releaseDateStr);
        const currentDate = new Date();
        const daysSinceRelease = Math.floor((currentDate - releaseDate) / (1000 * 60 * 60 * 24));

        if (daysSinceRelease >= 0 && daysSinceRelease <= 120) {
            return true;
        }
        
        if (daysSinceRelease < 0 && daysSinceRelease >= -30) {
            return true;
        }

        return false;
    } catch (error) {
        return false;
    }
}

function getOttPlatforms(movie) {
    const platforms = [];
    
    if (isCurrentlyInTheaters(movie)) {
        return platforms;
    }
    
    const title = (movie.title || '').replace(/ /g, '%20');
    const originalLang = movie.original_language || '';
    const releaseDate = movie.release_date || '';
    const voteAverage = movie.vote_average || 0;
    
    let movieYear = new Date().getFullYear();
    if (releaseDate) {
        try {
            movieYear = parseInt(releaseDate.split('-')[0]);
        } catch (error) {
            // ignore parsing errors
        }
    }
    
    const currentYear = new Date().getFullYear();
    const isOldEnough = movieYear < currentYear || (movieYear === currentYear && releaseDate < new Date().toISOString().split('T')[0]);
    
    if (!isOldEnough || voteAverage < 5.5) {
        return platforms;
    }
    
    if (voteAverage >= 7.0 && movieYear >= 2015) {
        platforms.push(
            { name: 'Netflix', url: `https://www.netflix.com/search?q=${title}`, color: '#E50914' },
            { name: 'Amazon Prime', url: `https://www.primevideo.com/search?phrase=${title}`, color: '#00A8E1' }
        );
    }
    
    if (['hi', 'mr'].includes(originalLang) && movieYear >= 2010) {
        platforms.push({ name: 'ZEE5', url: `https://www.zee5.com/search?q=${title}`, color: '#6C2C91' });
    }
    
    if (['ta', 'te', 'ml', 'kn'].includes(originalLang) && movieYear >= 2012) {
        platforms.push({ name: 'SonyLIV', url: `https://www.sonyliv.com/search?q=${title}`, color: '#0078D4' });
    }
    
    if (voteAverage >= 6.5 && ['hi', 'ta', 'te', 'ml', 'kn'].includes(originalLang)) {
        platforms.push({ name: 'Disney+ Hotstar', url: `https://www.hotstar.com/in/search?q=${title}`, color: '#0F1419' });
    }
    
    // Remove duplicates and limit to 3
    const seen = new Set();
    const uniquePlatforms = platforms.filter(platform => {
        if (seen.has(platform.name)) return false;
        seen.add(platform.name);
        return true;
    });
    
    return uniquePlatforms.slice(0, 3);
}

function getBookingPlatforms(movie) {
    if (!isCurrentlyInTheaters(movie)) {
        return [];
    }

    const title = movie.title || '';
    const movieTitle = title.replace(/ /g, '-').toLowerCase();
    
    return [
        { name: 'BookMyShow', url: `https://in.bookmyshow.com/explore/movies-${movieTitle}`, color: '#dc2626' },
        { name: 'Paytm', url: `https://paytm.com/movies/search?q=${title}`, color: '#0ea5e9' },
        { name: 'PVR', url: `https://www.pvrcinemas.com/movies/${movieTitle}`, color: '#7c3aed' },
        { name: 'INOX', url: `https://www.inox-movies.com/search?q=${title}`, color: '#059669' }
    ];
}

function transformMovieToSearchResult(movie) {
    const title = movie.title || movie.original_title || '';
    const inTheaters = isCurrentlyInTheaters(movie);
    const ottPlatforms = getOttPlatforms(movie);
    const bookingPlatforms = getBookingPlatforms(movie);

    return {
        id: movie.id,
        title: title,
        original_title: movie.original_title || '',
        overview: movie.overview || '',
        release_date: movie.release_date || null,
        poster_path: movie.poster_path || null,
        backdrop_path: movie.backdrop_path || null,
        vote_average: movie.vote_average || 0,
        vote_count: movie.vote_count || 0,
        popularity: movie.popularity || 0,
        original_language: movie.original_language || '',
        adult: movie.adult || false,
        is_currently_in_theaters: inTheaters,
        ott_platforms: ottPlatforms,
        booking_platforms: bookingPlatforms
    };
}

function filterGoodMovies(movies) {
    return movies.filter(movie => isGoodMovie(movie));
}

function filterIndianMovies(movies) {
    return movies.filter(movie => {
        const originalLang = (movie.original_language || '').toLowerCase();
        const title = (movie.title || '').toLowerCase();
        const originalTitle = (movie.original_title || '').toLowerCase();
        const productionCountries = movie.production_countries || [];
        
        // Check if it's an Indian language movie
        if (INDIAN_LANGUAGE_CODES.includes(originalLang)) {
            return true;
        }
        
        // Check if produced in India
        if (productionCountries.some(country => {
            const countryCode = typeof country === 'object' ? country.iso_3166_1 : country;
            return countryCode && countryCode.toUpperCase() === 'IN';
        })) {
            return true;
        }
        
        // Check for Indian movie keywords
        if (INDIAN_KEYWORDS.some(keyword => title.includes(keyword) || originalTitle.includes(keyword))) {
            return true;
        }
        
        return false;
    });
}

module.exports = {
    isGoodMovie,
    isCurrentlyInTheaters,
    getOttPlatforms,
    getBookingPlatforms,
    transformMovieToSearchResult,
    filterGoodMovies,
    filterIndianMovies
};
