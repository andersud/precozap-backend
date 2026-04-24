import { Router } from "express";
import { productController } from "./product.controller";
import { optionalAuth } from "../../shared/middlewares/auth";

const router = Router();

/**
 * 🔥 ROTAS PRINCIPAIS
 */

// CREATE PRODUCT
router.post("/", (req, res) =>
  productController.create(req, res)
);

// SEARCH (ANTES DO /:id)
router.get("/search", (req, res) =>
  productController.search(req, res)
);

// CATEGORIES
router.get("/categories", (req, res) =>
  productController.getCategories(req, res)
);

// GET ALL
router.get("/", (req, res) =>
  productController.getAll(req, res)
);

/**
 * ⚠️ ROTAS COM PARAMETROS (:id)
 */

// COMPARE
router.get("/:id/compare", (req, res) =>
  productController.compare(req, res)
);

// INSIGHTS
router.get("/:id/insights", (req, res) =>
  productController.getPriceInsights(req, res)
);

// ADD PRICE
router.post("/:id/prices", (req, res) =>
  productController.addPrice(req, res)
);

// TRACK CLICK (com auth opcional)
router.post(
  "/:id/track",
  optionalAuth,
  (req, res) => productController.trackClick(req, res)
);

// GET BY ID (SEMPRE POR ÚLTIMO)
router.get("/:id", (req, res) =>
  productController.getById(req, res)
);

export default router;