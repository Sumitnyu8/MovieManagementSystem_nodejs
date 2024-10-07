const Movie = require('../models/movieModel');
const multer = require('multer');
const fs = require('fs');

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

exports.upload = upload;  // Export multer's upload configuration

// Display all movies
exports.getMovies = async (req, res) => {
    const movies = await Movie.find();
    res.render('movies', { movies });
};

// Add new movie
exports.addMovie = async (req, res) => {
    const { title, description, releaseDate, genre, rating } = req.body;
    const poster = req.file ? '/images/' + req.file.filename : '';
    
    const newMovie = new Movie({ title, description, releaseDate, genre, rating, poster });
    await newMovie.save();
    res.redirect('/');
};

// Edit movie
exports.editMovie = async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    res.render('editMovie', { movie });
};

// Update movie
const path = require('path');

exports.updateMovie = async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
        return res.status(404).send('Movie not found');
    }

    // If a new poster is uploaded, delete the old one
    if (req.file) {
        const oldPosterPath = path.join('public', movie.poster);

        if (fs.existsSync(oldPosterPath)) {
            // Only try to delete the old poster if it exists
            try {
                fs.unlinkSync(oldPosterPath);  // Remove the old poster from the file system
            } catch (err) {
                console.error(`Failed to delete old poster: ${err}`);
            }
        }

        // Update movie with the new poster path
        movie.poster = '/images/' + req.file.filename;
    }

    // Update the rest of the movie details
    movie.title = req.body.title;
    movie.description = req.body.description;
    movie.genre = req.body.genre;
    movie.releaseDate = req.body.releaseDate;
    movie.rating = req.body.rating;

    await movie.save();  // Save updated movie details

    res.redirect('/');
};


// Delete movie
exports.deleteMovie = async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
        return res.status(404).send('Movie not found');
    }
    
    // Delete the associated poster if it exists
    if (movie.poster) {
        const posterPath = 'public' + movie.poster;
        if (fs.existsSync(posterPath)) {
            fs.unlinkSync(posterPath);  // Remove poster from filesystem
        }
    }
    
    // Use deleteOne or findByIdAndDelete to delete the movie
    await Movie.findByIdAndDelete(req.params.id);  // This replaces movie.remove()

    res.redirect('/');
};
