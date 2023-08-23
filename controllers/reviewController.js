const Review = require("../models/Review");
const { isValidObjectId } = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const Product = require("../models/Product");
const { checkPermissions } = require("../utils");

const createReview = async (req, res) => {
  // * Check if product exists
  const { product: _id } = req.body;

  if (!_id || !isValidObjectId(_id)) {
    throw new CustomError.BadRequestError(`Invalid Product Id: ${_id}`);
  }

  const product = await Product.findOne({ _id });

  if (!product) {
    throw new CustomError.BadRequestError(`No product with Id: ${_id}`);
  }

  // ! Check if user has already added a review for this product (One user is only allowed to add one Review) (Controller method !== Indexes)
//   const isAlreadySubmitted = await Review.findOne({
//     product: _id,
//     user: req.user.userId,
//   });

//   if (isAlreadySubmitted) {
//     throw new CustomError.BadRequestError(
//       "Already Submitted review for this product."
//     );
//   }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  return res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({}).populate(
        'product', 'name price company'
    ).populate(
        'user', 'name'
    )
    return res.status(StatusCodes.OK).json({ reviews, nbHits: reviews.length });
};

const getReview = async (req, res) => {
    const { id: _id } = req.params;

    if(!_id || !isValidObjectId(_id)) {
        throw new CustomError.BadRequestError(`Invalid Product Id: ${_id}`)
    }

    const review = await Review.findOne({ _id });

    if(!review) {
        throw new CustomError.BadRequestError(`No review with Id: ${_id}`)
    }


    return res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
    const { params: { id: _id }, body: { rating, title, comment } } = req;

    if(!rating || !title || !comment) {
        throw new CustomError.BadRequestError("Insufficient values for review.")
    }

    if(!_id || !isValidObjectId(_id)) {
        throw new CustomError.BadRequestError(`Invalid Review Id: ${_id}`)
    }

    const review = await Review.findOne({ _id });

    checkPermissions(req.user, review.user);

    review.rating = rating;
    review.title = title;
    review.comment = comment;

    await review.save();

    return res.status(StatusCodes.OK).json({ review })
};

const deleteReview = async (req, res) => {
    const { id: _id } = req.params;

    if(!_id || !isValidObjectId(_id)) {
        throw new CustomError.BadRequestError(`Invalid Review Id: ${_id}`)
    }

    const review = await Review.findOne({ _id });

    checkPermissions(req.user, review.user);

    await review.remove();

    return res.status(StatusCodes.OK).json({ msg: 'Success! Review deleted successfully.' })
};


const getProductReviews = async (req, res) => {
    const { id: productId } = req.params;


    const reviews = await Review.find({ product: productId });

    return res.status(StatusCodes.OK).json({ reviews, nbHits: reviews.length })
}

module.exports = {
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
  getProductReviews
};
