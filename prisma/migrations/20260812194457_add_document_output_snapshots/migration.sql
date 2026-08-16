-- AlterTable
ALTER TABLE `document` ADD COLUMN `footerBannerSnapshot` VARCHAR(191) NULL,
    ADD COLUMN `headerBannerSnapshot` VARCHAR(191) NULL,
    ADD COLUMN `quoteFooterSnapshot` LONGTEXT NULL,
    ADD COLUMN `signatureImageSnapshot` VARCHAR(191) NULL,
    ADD COLUMN `termsSnapshot` LONGTEXT NULL,
    ADD COLUMN `warrantySnapshot` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `documentitem` ADD COLUMN `annexureSnapshot` LONGTEXT NULL;
