-- DropIndex
DROP INDEX "MarketplacePrice_productId_marketplace_price_idx";

-- CreateIndex
CREATE INDEX "MarketplacePrice_productId_marketplace_idx" ON "MarketplacePrice"("productId", "marketplace");

-- CreateIndex
CREATE INDEX "PriceHistory_productId_date_idx" ON "PriceHistory"("productId", "date");
