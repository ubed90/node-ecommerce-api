const {
  createOrder,
  getAllOrders,
  getCurrentUserOrders,
  getOrder,
  updateOrder,
} = require("../../controllers/orderController");

const {
  authenticateUser,
  authorizePermissionsForRole,
} = require("../../middleware/authentication");

const router = require("express").Router();

router
  .route("/")
  .get(authenticateUser, authorizePermissionsForRole("admin"), getAllOrders)
  .post(authenticateUser, createOrder);

router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrders);

router
  .route("/:id")
  .get(authenticateUser, getOrder)
  .patch(authenticateUser, updateOrder);


module.exports = router;