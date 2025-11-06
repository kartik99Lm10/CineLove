import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

// Debug logging
console.log('🔧 Debug Info:');
console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
console.log('BACKEND_URL:', BACKEND_URL);
console.log('API:', API);

// Hero Slideshow Component
const HeroSlideshow = ({ nowPlayingMovies }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (nowPlayingMovies.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % nowPlayingMovies.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [nowPlayingMovies.length]);

  if (nowPlayingMovies.length === 0) {
    return (
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title" data-testid="hero-title">
              Discover Amazing
              <span className="gradient-text"> Indian Cinema</span>
            </h1>
            <p className="hero-subtitle">
              Your ultimate destination for movie reviews, ratings, and booking tickets for the latest Indian films
            </p>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1643753072729-d54252008db0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBtb3ZpZSUyMHRoZWF0ZXJ8ZW58MHx8fGJsYWNrfDE3NTk4NDIwMDB8MA&ixlib=rb-4.1.0&q=85"
              alt="Movie Theater"
              className="hero-cinema-image"
            />
          </div>
        </div>
      </section>
    );
  }

  const currentMovie = nowPlayingMovies[currentSlide];
  const backdropUrl = currentMovie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${currentMovie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1643753072729-d54252008db0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBtb3ZpZSUyMHRoZWF0ZXJ8ZW58MHx8fGJsYWNrfDE3NTk4NDIwMDB8MA&ixlib=rb-4.1.0&q=85';

  return (
    <section 
      className="hero-slideshow"
      style={{ backgroundImage: `url(${backdropUrl})` }}
      data-testid="hero-slideshow"
    >
      <div className="slideshow-overlay">
        <div className="slideshow-content">
          <div className="slideshow-text">
            <span className="now-showing-badge">NOW SHOWING IN THEATERS</span>
            <h1 className="slideshow-title">{currentMovie.title}</h1>
            <p className="slideshow-overview">
              {currentMovie.overview.substring(0, 200)}...
            </p>
            <div className="slideshow-meta">
              <span className="rating">⭐ {currentMovie.vote_average.toFixed(1)}/10</span>
              <span className="year">
                {currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : 'TBA'}
              </span>
            </div>
            <div className="slideshow-actions">
              {currentMovie.booking_platforms.map((platform, idx) => (
                <a 
                  key={idx}
                  href={platform.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`booking-btn ${platform.name.toLowerCase().replace(' ', '')}`}
                  style={{ backgroundColor: platform.color }}
                  data-testid={`${platform.name.toLowerCase()}-slideshow-link`}
                >
                  Book on {platform.name}
                </a>
              ))}
            </div>
          </div>
          <div className="slideshow-poster">
            <img 
              src={currentMovie.poster_path ? `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}` : '/api/placeholder/400/600'}
              alt={currentMovie.title}
              className="slideshow-poster-image"
            />
          </div>
        </div>
        
        {/* Slideshow indicators */}
        <div className="slideshow-indicators">
          {nowPlayingMovies.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              data-testid={`slideshow-indicator-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Movie Card Component
const MovieCard = ({ movie, onClick }) => {
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/api/placeholder/400/600';

  return (
    <div 
      className="movie-card" 
      onClick={onClick}
      data-testid={`movie-card-${movie.id}`}
    >
      <div className="movie-poster">
        <img 
          src={posterUrl} 
          alt={movie.title}
          onError={(e) => {
            e.target.src = '/api/placeholder/400/600';
          }}
        />
        <div className="movie-overlay">
          <div className="movie-rating">
            ⭐ {movie.vote_average.toFixed(1)}
          </div>
          
          <div className="movie-actions">
            {movie.is_currently_in_theaters ? (
              <button className="theater-btn" data-testid="book-tickets-btn">
                📍 In Theaters
              </button>
            ) : movie.ott_platforms && movie.ott_platforms.length > 0 ? (
              <button className="ott-btn" data-testid="watch-ott-btn">
                📺 Stream Now
              </button>
            ) : (
              <button className="info-btn" data-testid="more-info-btn">
                ℹ️ More Info
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-year">
          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
        </p>
        <p className="movie-overview">{movie.overview.substring(0, 120)}...</p>
      </div>
    </div>
  );
};

// Search Component
const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies worldwide..."
          className="search-input"
          data-testid="search-input"
        />
        <button type="submit" className="search-btn" data-testid="search-btn">
          🔍 Search
        </button>
      </form>
    </div>
  );
};

// Review Component
const ReviewSection = ({ movieId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    user_name: '',
    rating: 0,
    review_text: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (movieId) {
      fetchReviews();
    }
  }, [movieId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/movies/${movieId}/reviews`);
      setReviews(response.data.reviews || []);
      setReviewStats(response.data.statistics);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.user_name.trim() || !newReview.review_text.trim() || newReview.rating === 0) {
      alert('Please fill in all fields and provide a rating');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API}/movies/${movieId}/reviews`, newReview);
      setNewReview({ user_name: '', rating: 0, review_text: '' });
      setShowReviewForm(false);
      fetchReviews(); // Refresh reviews
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    return stars.join('');
  };

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2>User Reviews</h2>
        {reviewStats && (
          <div className="review-stats">
            <div className="average-rating">
              <span className="rating-number">{reviewStats.average_rating}/10</span>
              <span className="rating-stars">{renderStars(reviewStats.average_rating)}</span>
              <span className="review-count">({reviewStats.total_reviews} reviews)</span>
            </div>
          </div>
        )}
        <button 
          className="write-review-btn"
          onClick={() => setShowReviewForm(!showReviewForm)}
        >
          {showReviewForm ? 'Cancel' : 'Write Review'}
        </button>
      </div>

      {showReviewForm && (
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Your name"
              value={newReview.user_name}
              onChange={(e) => setNewReview({...newReview, user_name: e.target.value})}
              maxLength={50}
              required
            />
          </div>
          <div className="form-group">
            <label>Rating: {newReview.rating}/10</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={newReview.rating}
              onChange={(e) => setNewReview({...newReview, rating: parseFloat(e.target.value)})}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Write your review (minimum 10 characters)"
              value={newReview.review_text}
              onChange={(e) => setNewReview({...newReview, review_text: e.target.value})}
              minLength={10}
              maxLength={1000}
              rows={4}
              required
            />
          </div>
          <button type="submit" disabled={submitting} className="submit-review-btn">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="loading-spinner">Loading reviews...</div>
      ) : reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.user_name}</span>
                  <span className="review-date">{formatDate(review.created_at)}</span>
                </div>
                <div className="review-rating">
                  <span className="rating-stars">⭐ {review.rating}/10</span>
                </div>
              </div>
              <div className="review-content">
                <p>{review.review_text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this movie!</p>
        </div>
      )}
    </div>
  );
};

// Movie Detail Modal
const MovieDetailModal = ({ movie, onClose, language }) => {
  const [movieDetails, setMovieDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (movie && movie.id) {
      fetchMovieDetails();
    }
  }, [movie, language]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching movie details for ID:', movie.id);
      
      const [detailsRes, creditsRes, videosRes] = await Promise.all([
        axios.get(`${API}/movies/${movie.id}?language=${language}`),
        axios.get(`${API}/movies/${movie.id}/credits?language=${language}`),
        axios.get(`${API}/movies/${movie.id}/videos?language=${language}`)
      ]);
      
      console.log('Videos API URL:', `${API}/movies/${movie.id}/videos?language=${language}`);
      console.log('Videos response status:', videosRes.status);
      console.log('Videos response data:', videosRes.data);
      console.log('Videos response headers:', videosRes.headers);
      
      setMovieDetails(detailsRes.data);
      setCredits(creditsRes.data);
      setVideos(videosRes.data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;

  const mainTrailer = videos?.trailers?.[0];
  
  // Debug logging for trailer
  console.log('Videos data:', videos);
  console.log('Main trailer:', mainTrailer);
  console.log('Has trailers array:', videos?.trailers);
  console.log('Trailers length:', videos?.trailers?.length);
  console.log('Should show trailer:', !!mainTrailer);

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="movie-detail-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} data-testid="modal-close-btn">×</button>
        
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <div className="movie-detail-content">
            {/* Hero Section */}
            <div 
              className="movie-hero"
              style={{
                backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none'
              }}
            >
              <div className="movie-hero-content">
                <div className="movie-poster-large">
                  <img 
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/api/placeholder/400/600'}
                    alt={movie.title}
                  />
                </div>
                <div className="movie-hero-info">
                  <h1 className="movie-title-large">{movie.title}</h1>
                  {movieDetails?.tagline && (
                    <p className="movie-tagline">"{movieDetails.tagline}"</p>
                  )}
                  <div className="movie-meta">
                    <span className="rating">⭐ {movie.vote_average.toFixed(1)}/10</span>
                    <span className="year">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                    </span>
                    {movieDetails?.runtime && (
                      <span className="runtime">{movieDetails.runtime} min</span>
                    )}
                  </div>
                  
                  {/* Smart Booking/OTT Links */}
                  {movieDetails?.is_currently_in_theaters && movieDetails?.booking_platforms?.length > 0 && (
                    <div className="booking-links">
                      <h3>🎬 Book Tickets (Now in Theaters):</h3>
                      <div className="booking-buttons">
                        {movieDetails.booking_platforms.map((platform, idx) => (
                          <a 
                            key={idx}
                            href={platform.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="booking-btn"
                            style={{ backgroundColor: platform.color }}
                            data-testid={`${platform.name.toLowerCase().replace(' ', '')}-link`}
                          >
                            {platform.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {movieDetails?.ott_platforms?.length > 0 && (
                    <div className="ott-links">
                      <h3>📺 {movieDetails?.is_currently_in_theaters ? 'Also Available on OTT:' : 'Watch on OTT Platforms:'}</h3>
                      <div className="ott-buttons">
                        {movieDetails.ott_platforms.map((platform, idx) => (
                          <a 
                            key={idx}
                            href={platform.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="ott-btn"
                            style={{ backgroundColor: platform.color }}
                            data-testid={`${platform.name.toLowerCase().replace(' ', '')}-ott-link`}
                          >
                            {platform.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Trailer Section - Prominently displayed */}
            {mainTrailer ? (
              <div className="trailer-section-prominent">
                <div className="trailer-header">
                  <h2>🎬 Watch Trailer</h2>
                  <p className="trailer-subtitle">Experience the movie before watching</p>
                </div>
                <div className="trailer-container-large">
                  <iframe
                    src={`https://www.youtube.com/embed/${mainTrailer.key}?autoplay=0&rel=0&modestbranding=1`}
                    title={mainTrailer.name || `${movie.title} Trailer`}
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    data-testid="movie-trailer"
                    className="trailer-iframe"
                  ></iframe>
                </div>
                {videos?.trailers && videos.trailers.length > 1 && (
                  <div className="additional-trailers">
                    <h3>More Trailers & Videos</h3>
                    <div className="trailer-list">
                      {videos.trailers.slice(1, 4).map((trailer, idx) => (
                        <div key={idx} className="trailer-item">
                          <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0&modestbranding=1`}
                            title={trailer.name}
                            frameBorder="0"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="trailer-iframe-small"
                          ></iframe>
                          <p className="trailer-name">{trailer.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-trailer-section">
                <div className="no-trailer-content">
                  <h2>🎬 Trailer</h2>
                  <p>No trailer available for this movie</p>
                  <div className="trailer-placeholder">
                    <div className="placeholder-icon">🎥</div>
                    <p>Check back later for trailer updates</p>
                    {/* Debug info */}
                    <div style={{color: '#666', fontSize: '0.8rem', marginTop: '1rem'}}>
                      <p>Debug: Videos object exists: {videos ? 'Yes' : 'No'}</p>
                      <p>Debug: Trailers array exists: {videos?.trailers ? 'Yes' : 'No'}</p>
                      <p>Debug: Trailers count: {videos?.trailers?.length || 0}</p>
                      <p>Debug: Main trailer key: {mainTrailer?.key || 'None'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Movie Details */}
            <div className="movie-details-grid">
              <div className="movie-overview-section">
                <h2>Overview</h2>
                <p className="movie-overview-full">{movie.overview || 'No description available for this movie.'}</p>
                
                {/* Movie Information */}
                <div className="movie-info-details">
                  {movieDetails?.runtime && (
                    <div className="info-item">
                      <strong>Duration:</strong> {movieDetails.runtime} minutes
                    </div>
                  )}
                  {movieDetails?.status && (
                    <div className="info-item">
                      <strong>Status:</strong> {movieDetails.status}
                    </div>
                  )}
                  {movie.original_language && (
                    <div className="info-item">
                      <strong>Original Language:</strong> {movie.original_language.toUpperCase()}
                    </div>
                  )}
                  {movieDetails?.budget > 0 && (
                    <div className="info-item">
                      <strong>Budget:</strong> ${movieDetails.budget.toLocaleString()}
                    </div>
                  )}
                  {movieDetails?.revenue > 0 && (
                    <div className="info-item">
                      <strong>Box Office:</strong> ${movieDetails.revenue.toLocaleString()}
                    </div>
                  )}
                </div>
                
                {movieDetails?.genres && movieDetails.genres.length > 0 && (
                  <div className="genres">
                    <h3>Genres</h3>
                    <div className="genre-tags">
                      {movieDetails.genres.map(genre => (
                        <span key={genre.id} className="genre-tag">{genre.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Production Information */}
                {movieDetails?.production_companies && movieDetails.production_companies.length > 0 && (
                  <div className="production-info">
                    <h3>Production Companies</h3>
                    <div className="production-companies">
                      {movieDetails.production_companies.slice(0, 5).map((company, idx) => (
                        <span key={idx} className="production-company">
                          {company.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cast Section - Below overview section */}
            {credits?.cast && credits.cast.length > 0 && (
              <div className="cast-section">
                <h2>Main Cast</h2>
                <div className="cast-horizontal">
                  {credits.cast.slice(0, 8).map(actor => (
                    <div key={actor.id} className="cast-member-horizontal">
                      <div className="cast-photo">
                        <img 
                          src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/api/placeholder/185/278'}
                          alt={actor.name}
                          onError={(e) => {
                            e.target.src = '/api/placeholder/185/278';
                          }}
                        />
                      </div>
                      <div className="cast-info-horizontal">
                        <p className="actor-name">{actor.name}</p>
                        <p className="character-name">{actor.character || 'Unknown Role'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <ReviewSection movieId={movie.id} />
          </div>
        )}
      </div>
    </div>
  );
};

// Indian Section Component
const IndianSection = () => {
  const [indianMovies, setIndianMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchIndianMovies();
  }, [currentPage]);

  const fetchIndianMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/movies/indian?language=english&page=${currentPage}`);
      setIndianMovies(response.data.results || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('Error fetching Indian movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movie) => {
    // This will be handled by the parent component
    window.dispatchEvent(new CustomEvent('movieClick', { detail: movie }));
  };

  return (
    <div className="indian-section" data-testid="indian-section">
      <div className="indian-header">
        <h2 className="section-title">🇮🇳 Indian Cinema</h2>
        <p className="indian-subtitle">
          Discover the best of Indian cinema - from Bollywood blockbusters to regional masterpieces across all languages
        </p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading Indian movies...</div>
      ) : indianMovies.length > 0 ? (
        <>
          <div className="movies-grid">
            {indianMovies.map(movie => (
              <div key={movie.id} className="indian-movie-card">
                <MovieCard 
                  movie={movie} 
                  onClick={() => handleMovieClick(movie)} 
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-indian-movies">
          <p>No Indian movies found. Please try again later.</p>
        </div>
      )}
    </div>
  );
};

// Genres Section Component
const GenresSection = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreMovies, setGenreMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${API}/genres`);
      setGenres(response.data || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const handleGenreClick = async (genre) => {
    try {
      setLoading(true);
      setSelectedGenre(genre);
      const response = await axios.get(`${API}/genres/${genre.id}/movies`);
      setGenreMovies(response.data.results || []);
    } catch (error) {
      console.error('Error fetching genre movies:', error);
      setGenreMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="genres-section" data-testid="genres-section">
      <h2 className="section-title">Browse by Genre</h2>
      
      <div className="genres-grid">
        {genres.map(genre => (
          <button
            key={genre.id}
            className={`genre-card ${selectedGenre?.id === genre.id ? 'active' : ''}`}
            onClick={() => handleGenreClick(genre)}
            data-testid={`genre-${genre.id}`}
          >
            <span className="genre-name">{genre.name}</span>
          </button>
        ))}
      </div>

      {selectedGenre && (
        <div className="genre-movies-section">
          <h3>Movies in {selectedGenre.name}</h3>
          {loading ? (
            <div className="loading-spinner">Loading movies...</div>
          ) : (
            <div className="movies-grid">
              {genreMovies.slice(0, 8).map(movie => (
                <MovieCard key={movie.id} movie={movie} onClick={() => {}} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Reviews Section Component
const ReviewsSection = () => {
  const [latestReviews, setLatestReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestReviews();
  }, []);

  const fetchLatestReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews/latest?limit=10`);
      setLatestReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching latest reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="reviews-section" data-testid="reviews-section">
      <h2 className="section-title">Latest Reviews</h2>
      
      {loading ? (
        <div className="loading-spinner">Loading reviews...</div>
      ) : latestReviews.length > 0 ? (
        <div className="reviews-grid">
          {latestReviews.map(review => (
            <div key={review.id} className="review-card" data-testid={`review-${review.id}`}>
              <div className="review-header">
                <div className="review-user">
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{review.user_name}</span>
                </div>
                <div className="review-rating">
                  <span className="rating-stars">⭐ {review.rating}/10</span>
                  <span className="review-date">{formatDate(review.created_at)}</span>
                </div>
              </div>
              <div className="review-content">
                <p className="review-text">
                  {review.review_text.length > 150 
                    ? `${review.review_text.substring(0, 150)}...`
                    : review.review_text
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review a movie!</p>
        </div>
      )}
    </div>
  );
};

// Main App Component
const Home = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [dailyRecommendations, setDailyRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    fetchHomeData();
  }, []);

  useEffect(() => {
    // Listen for movie clicks from classics section
    const handleMovieClick = (event) => {
      setSelectedMovie(event.detail);
    };

    window.addEventListener('movieClick', handleMovieClick);
    return () => window.removeEventListener('movieClick', handleMovieClick);
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [popularRes, nowPlayingRes, recommendationsRes] = await Promise.all([
        axios.get(`${API}/movies/indian?language=english&page=1`),
        axios.get(`${API}/movies/now-playing?language=english&page=1`),
        axios.get(`${API}/movies/daily-recommendations?language=english&page=1`)
      ]);
      
      setPopularMovies(popularRes.data.results || []);
      setNowPlayingMovies(nowPlayingRes.data.results || []);
      setDailyRecommendations(recommendationsRes.data.results || []);
      
      console.log('Fetched data:', {
        popular: popularRes.data.results?.length || 0,
        nowPlaying: nowPlayingRes.data.results?.length || 0,
        recommendations: recommendationsRes.data.results?.length || 0
      });
      
      console.log('Popular movies:', popularRes.data.results?.slice(0, 3));
      console.log('Now playing:', nowPlayingRes.data.results?.slice(0, 3));
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      console.log('🔍 Searching for:', query);
      const response = await axios.get(`${API}/movies/search?query=${encodeURIComponent(query)}&language=english`);
      console.log('🔍 Search response:', response.data);
      setSearchResults(response.data.results || []);
      setSearchMode(true);
      setActiveTab('search');
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
      setActiveTab('home');
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'search') {
      setSearchMode(false);
      setSearchResults([]);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">Loading amazing movies...</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'popular':
        return (
          <section className="movie-section">
            <h2 className="section-title" data-testid="popular-movies-title">Popular Indian Movies</h2>
            <div className="movies-grid">
              {popularMovies.map(movie => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onClick={() => handleMovieClick(movie)} 
                />
              ))}
            </div>
          </section>
        );

      case 'genres':
        return <GenresSection />;

      case 'reviews':
        return <ReviewsSection />;

      case 'indian':
        return <IndianSection />;

      case 'search':
        return (
          <section className="movie-section">
            <h2 className="section-title" data-testid="search-results-title">Search Results</h2>
            {searchResults.length > 0 ? (
              <div className="movies-grid">
                {searchResults.map(movie => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onClick={() => handleMovieClick(movie)} 
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No movies found. Try a different search term.</p>
              </div>
            )}
          </section>
        );

      default: // home
        return (
          <div className="content-container">
            {/* Daily Recommendations Section */}
            {dailyRecommendations.length > 0 && (
              <section className="movie-section">
                <h2 className="section-title" data-testid="daily-recommendations-title">
                  🎯 Today's Recommendations
                  <span className="recommendations-subtitle">Fresh picks for you • Updated daily</span>
                </h2>
                <div className="movies-grid">
                  {dailyRecommendations.map(movie => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      onClick={() => handleMovieClick(movie)} 
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Popular Movies Section */}
            {popularMovies.length > 0 && (
              <section className="movie-section">
                <h2 className="section-title" data-testid="popular-movies-home-title">🔥 Popular Indian Movies</h2>
                <div className="movies-grid">
                  {popularMovies.slice(0, 12).map(movie => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      onClick={() => handleMovieClick(movie)} 
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Now Playing Section */}
            {nowPlayingMovies.length > 0 && (
              <section className="movie-section">
                <h2 className="section-title" data-testid="now-playing-title">🎬 Now Playing in Theaters</h2>
                <div className="movies-grid">
                  {nowPlayingMovies.slice(0, 8).map(movie => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      onClick={() => handleMovieClick(movie)} 
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Popular Movies Section */}
            {popularMovies.length > 0 && (
              <section className="movie-section">
                <h2 className="section-title" data-testid="popular-movies-title">Popular Indian Movies</h2>
                <div className="movies-grid">
                  {popularMovies.slice(0, 12).map(movie => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      onClick={() => handleMovieClick(movie)} 
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        );
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section - Only show on home tab */}
      {activeTab === 'home' && (
        <HeroSlideshow nowPlayingMovies={nowPlayingMovies} />
      )}

      {/* Header with Brand and Tab Navigation */}
      <header className="app-header">
        <div className="brand-section">
          <h1 className="app-title">🎬 Cinelove</h1>
          <p className="app-subtitle">Worldwide Cinema Hub</p>
        </div>
      </header>
      
      {/* Navigation Bar with Search */}
      <nav className="navbar-container" data-testid="navbar-container">
        {/* Search Section - Left Side */}
        <div className="navbar-search">
          <SearchBar 
            onSearch={handleSearch}
          />
        </div>
        
        {/* Tab Navigation - Right Side */}
        <div className="tab-navigation" data-testid="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleTabChange('home')}
            data-testid="home-tab"
          >
            🏠 Home
          </button>
          <button 
            className={`tab-btn ${activeTab === 'popular' ? 'active' : ''}`}
            onClick={() => handleTabChange('popular')}
            data-testid="popular-tab"
          >
            🔥 Popular
          </button>
          <button 
            className={`tab-btn ${activeTab === 'genres' ? 'active' : ''}`}
            onClick={() => handleTabChange('genres')}
            data-testid="genres-tab"
          >
            🎭 Genres
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => handleTabChange('reviews')}
            data-testid="reviews-tab"
          >
            ⭐ Reviews
          </button>
          <button 
            className={`tab-btn ${activeTab === 'indian' ? 'active' : ''}`}
            onClick={() => handleTabChange('indian')}
            data-testid="indian-tab"
          >
            🇮🇳 Indian
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {renderContent()}
      </div>

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <MovieDetailModal 
          movie={selectedMovie}
          onClose={handleCloseModal}
          language="english"
        />
      )}
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>🎬 Cinelove</h3>
          <p>Your ultimate destination for worldwide cinema</p>
          <p className="footer-note">Featuring movies from around the world with smart booking and OTT integration</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#popular">Popular Movies</a></li>
            <li><a href="#genres">Genres</a></li>
            <li><a href="#reviews">Reviews</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Indian Languages</h4>
          <ul>
            <li>Hindi • Tamil • Telugu</li>
            <li>Malayalam • Kannada • Bengali</li>
            <li>Marathi • Gujarati • Punjabi</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Book Tickets & Stream</h4>
          <ul>
            <li><strong>In Theaters:</strong></li>
            <li><a href="https://in.bookmyshow.com" target="_blank" rel="noopener noreferrer">BookMyShow</a> • <a href="https://paytm.com/movies" target="_blank" rel="noopener noreferrer">Paytm</a></li>
            <li><a href="https://www.pvrcinemas.com" target="_blank" rel="noopener noreferrer">PVR</a> • <a href="https://www.inox-movies.com" target="_blank" rel="noopener noreferrer">INOX</a></li>
            <li><strong>OTT Platforms:</strong></li>
            <li>Netflix • Prime • Hotstar • ZEE5</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Cinelove. All rights reserved. | Powered by TMDb API | Indian Movies Only</p>
      </div>
    </footer>
  );
};

// Main App
function App() {
  useEffect(() => {
    // Test API connection
    const testApi = async () => {
      try {
        const response = await axios.get(`${API}/health`);
        console.log('API Status:', response.data);
      } catch (error) {
        console.error('API connection failed:', error);
      }
    };

    testApi();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;