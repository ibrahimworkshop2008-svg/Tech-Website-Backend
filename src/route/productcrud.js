const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");
const upload = require("../middleware/multer");
// Create a new product
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

// Sirf admin — create, update, delete
router.post("/create", verifyToken, isAdmin, upload.array("images", 5), productController.createProduct);
router.put("/updateProduct/:id", verifyToken, isAdmin, upload.array("images", 5), productController.updateProduct);
router.delete("/deleteProduct/:id", verifyToken, isAdmin, productController.deleteProduct);

// Logged-in user (admin ya normal user dono) — sirf dekhna/read
router.get("/getProducts",  productController.getAllProducts);
router.get("/getProductById/:id", verifyToken, productController.getProductById);


module.exports = router; 