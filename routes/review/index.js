const { createReview, deleteReview, getAllReviews, getReview, updateReview } = require("../../controllers/reviewController");
const { authenticateUser } = require("../../middleware/authentication");


const router = require('express').Router();


router.route("/").get(getAllReviews).post(authenticateUser, createReview);

router.route("/:id").get(getReview).patch(authenticateUser, updateReview).delete(authenticateUser, deleteReview);


module.exports = router;