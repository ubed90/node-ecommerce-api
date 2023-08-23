const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Product Name is required"],
      maxlength: [100, "Name can't be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [1000, "Description can't be more than 1000 characters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      enum: ["office", "kitchen", "bedroom"],
      required: [true, "Product category is required"],
    },
    company: {
      type: String,
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported.",
      },
      required: [true, "Product company is required"],
    },
    colors: {
      type: [String],
      default: ["222"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: [true, "Product inventory is required"],
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { 
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: { 
        virtuals: true
    }
  }
);

// * Way to create Custom / Virtual Field on a Model which can be populated at run time
productSchema.virtual('reviews', {
    ref: "Review",
    localField: "_id",
    foreignField: "product",
    justOne: false
})


// * Delete all Reviews on Product deletion
productSchema.pre('remove', async function(next) {
    await this.model('Review').deleteMany({ product: this._id })
})

module.exports = mongoose.model("Product", productSchema);
