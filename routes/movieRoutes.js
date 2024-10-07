const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController'); // Import movieController

// View all movies
router.get('/', movieController.getMovies);

// Add new movie
router.get('/new', (req, res) => res.render('addMovie'));
router.post('/', movieController.upload.single('poster'), movieController.addMovie);

// Edit movie
router.get('/:id/edit', movieController.editMovie);
router.post('/:id', movieController.upload.single('poster'), movieController.updateMovie);

// Delete movie
router.get('/:id/delete', movieController.deleteMovie);

module.exports = router;
