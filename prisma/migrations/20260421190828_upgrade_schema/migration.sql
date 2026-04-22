/*
  Warnings:

  - You are about to alter the column `price` on the `MarketplacePrice` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `originalPrice` on the `MarketplacePrice` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `createdAt` on the `PriceHistory` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `PriceHistory` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `PriceHistory` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `bestPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - A unique constraint covering the columns `[productId,marketplace]` on the table `MarketplacePrice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId,marketplace,recordedAt]` on the table `PriceHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MarketplacePrice_productId_marketplace_idx";

-- DropIndex
DROP INDEX "PriceHistory_date_idx";

-- DropIndex
DROP INDEX "PriceHistory_productId_date_idx";

-- AlterTable
ALTER TABLE "MarketplacePrice" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "originalPrice" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "PriceHistory" DROP COLUMN "createdAt",
DROP COLUMN "date",
ADD COLUMN     "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "bestPrice" SET DATA TYPE DECIMAL(65,30);

-- CreateIndex
CREATE UNIQUE INDEX "MarketplacePrice_productId_marketplace_key" ON "MarketplacePrice"("productId", "marketplace");

-- CreateIndex
CREATE INDEX "PriceHistory_recordedAt_idx" ON "PriceHistory"("recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PriceHistory_productId_marketplace_recordedAt_key" ON "PriceHistory"("productId", "marketplace", "recordedAt");
