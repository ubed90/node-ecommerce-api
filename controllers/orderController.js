const Order = require("../models/Order");
const Product = require("../models/Product");
const { isValidObjectId } = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require('../utils'); 

// * Fake Stripe Api
const fakeStripeApi = async ({ amount, currency }) => {
  const client_secret = "somerandomvalue";
  return { client_secret, amount };
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  return res.status(StatusCodes.OK).json({ orders, nbHits: orders.length });
};

const getOrder = async (req, res) => {
  const { id: _id } = req.params;

  if(!_id || !isValidObjectId(_id)) {
    throw new CustomError.BadRequestError(`Invalid Order Id: ${_id}`)
  }

  const order = await Order.findOne({ _id });

  if(!order) {
    throw new CustomError.BadRequestError(`No Order with Id: ${_id}`)
  }

  checkPermissions(req.user, order.user);

  return res.status(StatusCodes.OK).send({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  return res.status(StatusCodes.OK).send({ orders, nbHits: orders.length });
};

const createOrder = async (req, res) => {
  // * Getting Data from Request body
  const { items: cartItems, tax, shippingFee } = req.body;

  // * Checking for errors
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No cart items provided");
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      "Please provide tax and shipping fee"
    );
  }

  // * Actual Order data
  let orderItems = [];
  let subTotal = 0;

  // * Looping through Cart Items and Getting single order items from DB
  // ! Basically not relying on frontend
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CustomError.NotFoundError(
        `No Product with Id: ${item.product}`
      );
    }

    const { name, price, image, _id } = dbProduct;

    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    orderItems = [...orderItems, singleOrderItem];

    subTotal += item.amount * price;
  }

  const total = tax + shippingFee + subTotal;

  const paymentIntent = await fakeStripeApi({
    amount: total,
    currency: "inr",
  });

  const order = await Order.create({
    tax,
    shippingFee,
    subtotal: subTotal,
    total,
    orderItems,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  console.log(orderItems);
  console.log(subTotal);

  return res.status(StatusCodes.CREATED).json({ order, clientSecret: order.clientSecret });
};

const updateOrder = async (req, res) => {
  const { id: _id } = req.params;
  const { paymentIntentId } = req.body;

  if(!_id || !isValidObjectId(_id)) {
    throw new CustomError.BadRequestError(`Invalid Order Id: ${_id}`)
  }

  const order = await Order.findOne({ _id });

  if(!order) {
    throw new CustomError.BadRequestError(`No Order with Id: ${_id}`)
  }

  checkPermissions(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = 'success';

  await order.save();

  res.status(StatusCodes.OK).send({ order });
};

module.exports = {
  getAllOrders,
  getOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
