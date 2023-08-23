const {
  getAllUsers,
  getUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../../controllers/userController");

const router = require('express').Router();

// * MW
const { authenticateUser, authorizePermissionsForRole } = require("../../middleware/authentication");

// * Routes for User
router.route("/").get(authenticateUser, authorizePermissionsForRole('admin', 'owner'), getAllUsers);


router.route("/showMe").get(authenticateUser, showCurrentUser);

router.route("/updateUser").patch(authenticateUser, updateUser);

router.route("/updateUserPassword").post(authenticateUser, updateUserPassword);

router.route("/:id").get(authenticateUser, getUser);


module.exports = router;