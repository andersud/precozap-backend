"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const auth_1 = require("../../shared/middlewares/auth");
const router = (0, express_1.Router)();
// 🔥 CREATE PRODUCT
// POST /api/products
router.post("/", product_controller_1.productController.create.bind(product_controller_1.productController));
// 🔍 SEARCH (ANTES DO /:id)
router.get("/search", product_controller_1.productController.search.bind(product_controller_1.productController));
// 📦 GET CATEGORIES
router.get("/categories", product_controller_1.productController.getCategories.bind(product_controller_1.productController));
// 📦 GET ALL PRODUCTS
router.get("/", product_controller_1.productController.getAll.bind(product_controller_1.productController));
/**
 * ⚠️ ROTAS COM :id DEVEM VIR POR ÚLTIMO
 */
// 📊 COMPARE PRODUCT
router.get("/:id/compare", product_controller_1.productController.compare.bind(product_controller_1.productController));
// 📈 PRICE INSIGHTS
router.get("/:id/insights", product_controller_1.productController.getPriceInsights.bind(product_controller_1.productController));
// 💰 ADD PRICE
router.post("/:id/prices", product_controller_1.productController.addPrice.bind(product_controller_1.productController));
// 🖱️ TRACK CLICK
router.post("/:id/track", auth_1.optionalAuth, product_controller_1.productController.trackClick.bind(product_controller_1.productController));
// 🔍 GET BY ID (SEMPRE POR ÚLTIMO)
router.get("/:id", product_controller_1.productController.getById.bind(product_controller_1.productController));
exports.default = router;
//# sourceMappingURL=product.routes.js.map