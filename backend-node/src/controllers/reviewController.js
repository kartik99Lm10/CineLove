const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');
const tmdbService = require('../services/tmdbService');

class ReviewController {
    validateReview(reviewData) {
        const errors = [];
        
        if (!reviewData.user_name || reviewData.user_name.trim().length === 0) {
            errors.push('User name is required');
        }
        if (reviewData.user_name && reviewData.user_name.length > 50) {
            errors.push('User name must be 50 characters or less');
        }
        
        if (reviewData.rating === undefined || reviewData.rating === null) {
            errors.push('Rating is required');
        }
        if (reviewData.rating < 0 || reviewData.rating > 10) {
            errors.push('Rating must be between 0 and 10');
        }
        
        if (!reviewData.review_text || reviewData.review_text.trim().length < 10) {
            errors.push('Review text must be at least 10 characters');
        }
        if (reviewData.review_text && reviewData.review_text.length > 1000) {
            errors.push('Review text must be 1000 characters or less');
        }
        
        return errors;
    }

    async createReview(req, res) {
        try {
            const { movie_id } = req.params;
            const reviewData = req.body;
            const db = getDatabase();
            
            // Validate input
            const validationErrors = this.validateReview(reviewData);
            if (validationErrors.length > 0) {
                return res.status(400).json({ error: validationErrors.join(', ') });
            }
            
            // Check if movie exists by trying to fetch it
            try {
                const movie = await tmdbService.getMovieDetails(movie_id);
                if (!movie) {
                    return res.status(404).json({ error: 'Movie not found' });
                }
            } catch (error) {
                console.error('Movie lookup error:', error.message);
                return res.status(404).json({ error: 'Movie not found' });
            }
            
            // Check if user already reviewed this movie
            const existingReview = await db.collection('reviews').findOne({
                movie_id: parseInt(movie_id),
                user_name: reviewData.user_name
            });
            
            if (existingReview) {
                return res.status(400).json({ error: 'You have already reviewed this movie' });
            }
            
            const review = {
                id: uuidv4(),
                movie_id: parseInt(movie_id),
                user_name: reviewData.user_name.trim(),
                rating: parseFloat(reviewData.rating),
                review_text: reviewData.review_text.trim(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                helpful_count: 0,
                language: reviewData.language || 'en'
            };
            
            // Insert into MongoDB
            await db.collection('reviews').insertOne(review);
            
            res.status(201).json(review);
        } catch (error) {
            console.error('Create review error:', error.message);
            res.status(500).json({ error: `Failed to create review: ${error.message}` });
        }
    }

    async getMovieReviews(req, res) {
        try {
            const { movie_id } = req.params;
            const { page = 1, language } = req.query;
            const db = getDatabase();
            
            // Build query
            const query = { movie_id: parseInt(movie_id) };
            if (language) {
                query.language = language;
            }
            
            // Get reviews with pagination
            const skip = (parseInt(page) - 1) * 10;
            const reviews = await db.collection('reviews')
                .find(query)
                .skip(skip)
                .limit(10)
                .sort({ created_at: -1 })
                .toArray();
            
            // Count total reviews
            const totalReviews = await db.collection('reviews').countDocuments(query);
            
            // Calculate review statistics
            const statsResult = await db.collection('reviews').aggregate([
                { $match: { movie_id: parseInt(movie_id) } },
                {
                    $group: {
                        _id: null,
                        average_rating: { $avg: '$rating' },
                        total_reviews: { $sum: 1 },
                        rating_distribution: { $push: '$rating' }
                    }
                }
            ]).toArray();
            
            let stats = {
                average_rating: 0,
                total_reviews: 0
            };
            let distribution = { '1-2': 0, '3-4': 0, '5-6': 0, '7-8': 0, '9-10': 0 };
            
            if (statsResult.length > 0) {
                stats = statsResult[0];
                const ratings = stats.rating_distribution || [];
                distribution = {
                    '1-2': ratings.filter(r => r >= 1 && r < 3).length,
                    '3-4': ratings.filter(r => r >= 3 && r < 5).length,
                    '5-6': ratings.filter(r => r >= 5 && r < 7).length,
                    '7-8': ratings.filter(r => r >= 7 && r < 9).length,
                    '9-10': ratings.filter(r => r >= 9 && r <= 10).length
                };
            }
            
            // Convert MongoDB documents to serializable format
            const serializedReviews = reviews.map(review => ({
                id: review.id || review._id.toString(),
                movie_id: review.movie_id,
                user_name: review.user_name,
                rating: review.rating,
                review_text: review.review_text,
                created_at: review.created_at,
                updated_at: review.updated_at,
                helpful_count: review.helpful_count || 0,
                language: review.language || 'en'
            }));
            
            res.json({
                reviews: serializedReviews,
                total_reviews: totalReviews,
                page: parseInt(page),
                total_pages: Math.ceil(totalReviews / 10),
                statistics: {
                    average_rating: Math.round((stats.average_rating || 0) * 10) / 10,
                    total_reviews: stats.total_reviews || 0,
                    rating_distribution: distribution
                }
            });
        } catch (error) {
            console.error('Get reviews error:', error.message);
            res.status(500).json({ error: `Failed to get reviews: ${error.message}` });
        }
    }

    async getLatestReviews(req, res) {
        try {
            const { limit = 10 } = req.query;
            const limitNum = Math.min(parseInt(limit), 50); // Max 50 reviews
            const db = getDatabase();
            
            // Get latest reviews
            const reviews = await db.collection('reviews')
                .find()
                .sort({ created_at: -1 })
                .limit(limitNum)
                .toArray();
            
            // Convert to serializable format
            const serializedReviews = reviews.map(review => ({
                id: review.id || review._id.toString(),
                movie_id: review.movie_id,
                user_name: review.user_name,
                rating: review.rating,
                review_text: review.review_text,
                created_at: review.created_at,
                updated_at: review.updated_at,
                helpful_count: review.helpful_count || 0,
                language: review.language || 'en'
            }));
            
            res.json({ reviews: serializedReviews });
        } catch (error) {
            console.error('Latest reviews error:', error.message);
            res.status(500).json({ error: `Failed to get latest reviews: ${error.message}` });
        }
    }
}

module.exports = new ReviewController();
