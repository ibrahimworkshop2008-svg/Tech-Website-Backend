const productModel = require("../model/product.model");

const client = require("../service/storage");
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const uploadPromises = req.files.map((file) =>
      client.files.upload({
        file: file.buffer.toString("base64"), // base64 mein convert karna zaroori hai
        fileName: file.originalname,
        folder: "/products", // optional — organize karne ke liye
      }),
    );

    const results = await Promise.all(uploadPromises);
    console.log(JSON.stringify(results, null, 2));
    const images = results.map((result) => ({
      url: result.url,
      fileId: result.fileId,
    }));

    const product = await productModel.create({
      name,
      description,
      price,
      category,
      images, // ← ab {url, fileId} objects ka array save hoga
    });

    console.log(JSON.stringify(product, null, 2)); // ← ye add karo

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find().sort({ createdAt: -1 }); // Sort by creation date, newest first
     res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, category } = req.body;

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { name, description, price, category },
      { new: true },
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
     if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        client.files.upload({
          file: file.buffer.toString("base64"),
          fileName: file.originalname,
          folder: "/products",
        })
      );

      const results = await Promise.all(uploadPromises);

      const newImages = results.map((result) => ({
        url: result.url,
        fileId: result.fileId,
      }));

      product.images.push(...newImages);
     }

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await productModel.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const deletePromises = deletedProduct.images.map((image) =>
      client.files.delete(image.fileId)
    );

    await Promise.all(deletePromises);

    res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
