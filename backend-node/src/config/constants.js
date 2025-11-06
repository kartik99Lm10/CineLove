const INDIAN_LANGUAGES = {
    'hindi': { code: 'hi', region: 'IN', name: 'Hindi', tmdb_code: 'hi' },
    'tamil': { code: 'ta', region: 'IN', name: 'Tamil', tmdb_code: 'ta' },
    'telugu': { code: 'te', region: 'IN', name: 'Telugu', tmdb_code: 'te' },
    'malayalam': { code: 'ml', region: 'IN', name: 'Malayalam', tmdb_code: 'ml' },
    'kannada': { code: 'kn', region: 'IN', name: 'Kannada', tmdb_code: 'kn' },
    'bengali': { code: 'bn', region: 'IN', name: 'Bengali', tmdb_code: 'bn' },
    'marathi': { code: 'mr', region: 'IN', name: 'Marathi', tmdb_code: 'mr' },
    'gujarati': { code: 'gu', region: 'IN', name: 'Gujarati', tmdb_code: 'gu' },
    'punjabi': { code: 'pa', region: 'IN', name: 'Punjabi', tmdb_code: 'pa' },
    'english': { code: 'en', region: 'IN', name: 'English', tmdb_code: 'en' }
};

const OTT_PLATFORMS = {
    'netflix': { name: 'Netflix', color: '#E50914', search_url: 'https://www.netflix.com/search?q=' },
    'amazon_prime': { name: 'Amazon Prime', color: '#00A8E1', search_url: 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase=' },
    'hotstar': { name: 'Disney+ Hotstar', color: '#0F1419', search_url: 'https://www.hotstar.com/in/search?q=' },
    'zee5': { name: 'ZEE5', color: '#6C2C91', search_url: 'https://www.zee5.com/search?q=' },
    'sonyliv': { name: 'SonyLIV', color: '#0078D4', search_url: 'https://www.sonyliv.com/search?q=' },
    'voot': { name: 'Voot', color: '#FF6600', search_url: 'https://www.voot.com/search?q=' },
    'mx_player': { name: 'MX Player', color: '#FF9500', search_url: 'https://www.mxplayer.in/search?q=' }
};

const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.TMDB_API_KEY,
    DEFAULT_LANGUAGE: 'en-US'
};

const INDIAN_LANGUAGE_CODES = ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'gu', 'pa', 'as', 'or', 'ur', 'ne', 'si', 'my', 'bh', 'ks', 'sd', 'sa', 'mai', 'sat', 'kok', 'brx', 'mni'];

const INDIAN_KEYWORDS = ['bollywood', 'tollywood', 'kollywood', 'mollywood', 'sandalwood', 'bengali', 'punjabi', 'marathi', 'gujarati', 'tamil', 'telugu', 'malayalam', 'kannada', 'hindi'];

module.exports = {
    INDIAN_LANGUAGES,
    OTT_PLATFORMS,
    TMDB_CONFIG,
    INDIAN_LANGUAGE_CODES,
    INDIAN_KEYWORDS
};
