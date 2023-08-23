const {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  uploadImage,
} = require("../../controllers/productController");

const { getProductReviews } = require("../../controllers/reviewController");


const {
  authorizePermissionsForRole,
  authenticateUser,
} = require("../../middleware/authentication");

const router = require("express").Router();

router
  .route("/")
  .post([authenticateUser, authorizePermissionsForRole("admin")], createProduct)
  .get(getAllProducts);

router.route("/uploadImage").post([authenticateUser, authorizePermissionsForRole("admin")], uploadImage);

router
  .route("/:id")
  .get(getSingleProduct)
  .patch(
    [authenticateUser, authorizePermissionsForRole("admin")],
    updateProduct
  )
  .delete(
    [authenticateUser, authorizePermissionsForRole("admin")],
    deleteProduct
  );

router.route("/:id/reviews").get(getProductReviews);


module.exports = router;
