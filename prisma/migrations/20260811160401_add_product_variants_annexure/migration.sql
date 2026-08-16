-- AlterTable
ALTER TABLE `documentitem` ADD COLUMN `productDescription` TEXT NULL,
    ADD COLUMN `productModel` VARCHAR(191) NULL,
    ADD COLUMN `variantId` INTEGER NULL,
    ADD COLUMN `variantName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `annexureContent` LONGTEXT NULL,
    ADD COLUMN `model` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ProductVariant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `productId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentItem` ADD CONSTRAINT `DocumentItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
