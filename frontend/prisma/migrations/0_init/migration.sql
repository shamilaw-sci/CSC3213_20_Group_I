-- CreateTable
CREATE TABLE `auditlog` (
    `auditLogId` CHAR(36) NOT NULL,
    `adminId` CHAR(36) NULL,
    `action` VARCHAR(150) NOT NULL,
    `entityType` VARCHAR(100) NULL,
    `entityId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` VARCHAR(512) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_action_timestamp_idx`(`action`, `timestamp`),
    INDEX `AuditLog_adminId_timestamp_idx`(`adminId`, `timestamp`),
    INDEX `AuditLog_entityType_entityId_idx`(`entityType`, `entityId`),
    PRIMARY KEY (`auditLogId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `categoryId` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comparison` (
    `comparisonId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NULL,
    `guestSessionId` CHAR(36) NULL,
    `name` VARCHAR(150) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Comparison_guestSessionId_updatedAt_idx`(`guestSessionId`, `updatedAt`),
    INDEX `Comparison_userId_updatedAt_idx`(`userId`, `updatedAt`),
    PRIMARY KEY (`comparisonId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comparisonitem` (
    `comparisonItemId` CHAR(36) NOT NULL,
    `comparisonId` CHAR(36) NOT NULL,
    `productId` CHAR(36) NOT NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ComparisonItem_productId_idx`(`productId`),
    UNIQUE INDEX `ComparisonItem_comparisonId_productId_key`(`comparisonId`, `productId`),
    PRIMARY KEY (`comparisonItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `digitaltwin` (
    `digitalTwinId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `encryptedImagePath` VARCHAR(2048) NOT NULL,
    `previewImagePath` VARCHAR(2048) NULL,
    `measurementsSnapshot` JSON NULL,
    `encryptionKeyVersion` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('PROCESSING', 'READY', 'FAILED', 'DELETED') NOT NULL DEFAULT 'PROCESSING',
    `processingError` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `DigitalTwin_createdAt_idx`(`createdAt`),
    INDEX `DigitalTwin_userId_status_idx`(`userId`, `status`),
    PRIMARY KEY (`digitalTwinId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorite` (
    `favoriteId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `productId` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Favorite_productId_idx`(`productId`),
    UNIQUE INDEX `Favorite_userId_productId_key`(`userId`, `productId`),
    PRIMARY KEY (`favoriteId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedback` (
    `feedbackId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NULL,
    `guestSessionId` CHAR(36) NULL,
    `tryOnSessionId` CHAR(36) NULL,
    `resolvedById` CHAR(36) NULL,
    `type` ENUM('GENERAL', 'BUG_REPORT', 'PRODUCT', 'DIGITAL_TWIN', 'VIRTUAL_TRY_ON') NOT NULL DEFAULT 'GENERAL',
    `status` ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `rating` INTEGER NULL,
    `subject` VARCHAR(200) NULL,
    `message` TEXT NOT NULL,
    `resolutionNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `resolvedAt` DATETIME(3) NULL,

    INDEX `Feedback_guestSessionId_fkey`(`guestSessionId`),
    INDEX `Feedback_resolvedById_fkey`(`resolvedById`),
    INDEX `Feedback_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Feedback_tryOnSessionId_idx`(`tryOnSessionId`),
    INDEX `Feedback_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`feedbackId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guestsession` (
    `guestSessionId` CHAR(36) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `lastUsedAt` DATETIME(3) NULL,
    `convertedAt` DATETIME(3) NULL,
    `convertedUserId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GuestSession_tokenHash_key`(`tokenHash`),
    INDEX `GuestSession_convertedUserId_idx`(`convertedUserId`),
    INDEX `GuestSession_expiryDate_idx`(`expiryDate`),
    PRIMARY KEY (`guestSessionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `measurement` (
    `measurementId` CHAR(36) NOT NULL,
    `profileId` CHAR(36) NOT NULL,
    `heightCm` DECIMAL(6, 2) NULL,
    `weightKg` DECIMAL(6, 2) NULL,
    `chestCm` DECIMAL(6, 2) NULL,
    `waistCm` DECIMAL(6, 2) NULL,
    `hipsCm` DECIMAL(6, 2) NULL,
    `shoulderCm` DECIMAL(6, 2) NULL,
    `inseamCm` DECIMAL(6, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Measurement_profileId_key`(`profileId`),
    PRIMARY KEY (`measurementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `merchant` (
    `merchantId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NULL,
    `storeName` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(500) NULL,
    `merchantLogo` VARCHAR(2048) NULL,
    `websiteUrl` VARCHAR(2048) NULL,
    `apiBaseUrl` VARCHAR(2048) NULL,
    `encryptedApiConfig` JSON NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `lastSyncedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `businessCategory` VARCHAR(100) NULL,
    `ownerName` VARCHAR(150) NULL,
    `phone` VARCHAR(32) NULL,
    `socialMediaUrl` VARCHAR(2048) NULL,
    `storeDescription` TEXT NULL,
    `termsAcceptedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Merchant_userId_key`(`userId`),
    UNIQUE INDEX `Merchant_email_key`(`email`),
    INDEX `Merchant_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`merchantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `merchantredirect` (
    `merchantRedirectId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NULL,
    `guestSessionId` CHAR(36) NULL,
    `productId` CHAR(36) NOT NULL,
    `merchantId` CHAR(36) NOT NULL,
    `destinationUrl` VARCHAR(2048) NOT NULL,
    `source` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MerchantRedirect_guestSessionId_createdAt_idx`(`guestSessionId`, `createdAt`),
    INDEX `MerchantRedirect_merchantId_createdAt_idx`(`merchantId`, `createdAt`),
    INDEX `MerchantRedirect_productId_createdAt_idx`(`productId`, `createdAt`),
    INDEX `MerchantRedirect_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`merchantRedirectId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passwordresettoken` (
    `passwordResetTokenId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordResetToken_userId_expiryDate_idx`(`userId`, `expiryDate`),
    PRIMARY KEY (`passwordResetTokenId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `productId` CHAR(36) NOT NULL,
    `merchantId` CHAR(36) NOT NULL,
    `categoryId` CHAR(36) NOT NULL,
    `externalId` VARCHAR(191) NULL,
    `productName` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `primaryImageUrl` VARCHAR(2048) NULL,
    `merchantUrl` VARCHAR(2048) NOT NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `metadata` JSON NULL,
    `lastSyncedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Product_categoryId_status_idx`(`categoryId`, `status`),
    INDEX `Product_merchantId_status_idx`(`merchantId`, `status`),
    INDEX `Product_price_idx`(`price`),
    INDEX `Product_productName_idx`(`productName`),
    UNIQUE INDEX `Product_merchantId_externalId_key`(`merchantId`, `externalId`),
    PRIMARY KEY (`productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productimage` (
    `productImageId` CHAR(36) NOT NULL,
    `productId` CHAR(36) NOT NULL,
    `imageUrl` VARCHAR(2048) NOT NULL,
    `altText` VARCHAR(255) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductImage_productId_sortOrder_idx`(`productId`, `sortOrder`),
    PRIMARY KEY (`productImageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productvariant` (
    `productVariantId` CHAR(36) NOT NULL,
    `productId` CHAR(36) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `size` VARCHAR(50) NULL,
    `color` VARCHAR(100) NULL,
    `price` DECIMAL(12, 2) NULL,
    `stockQuantity` INTEGER NULL DEFAULT 0,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductVariant_productId_size_color_idx`(`productId`, `size`, `color`),
    UNIQUE INDEX `ProductVariant_productId_sku_key`(`productId`, `sku`),
    PRIMARY KEY (`productVariantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profile` (
    `profileId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `phone` VARCHAR(32) NULL,
    `dateOfBirth` DATE NULL,
    `gender` VARCHAR(32) NULL,
    `country` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Profile_userId_key`(`userId`),
    PRIMARY KEY (`profileId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `sessionId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `type` ENUM('TEMPORARY', 'PERSISTENT') NOT NULL DEFAULT 'TEMPORARY',
    `expiryDate` DATETIME(3) NOT NULL,
    `lastUsedAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
    INDEX `Session_expiryDate_revokedAt_idx`(`expiryDate`, `revokedAt`),
    INDEX `Session_userId_expiryDate_idx`(`userId`, `expiryDate`),
    PRIMARY KEY (`sessionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription` (
    `subscriptionId` CHAR(36) NOT NULL,
    `merchantId` CHAR(36) NOT NULL,
    `plan` ENUM('FREE', 'STANDARD', 'PRO') NOT NULL DEFAULT 'FREE',
    `status` ENUM('DEMO_ACTIVE', 'ACTIVE', 'CANCELLED') NOT NULL DEFAULT 'DEMO_ACTIVE',
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `renewalDate` DATETIME(3) NULL,
    `paymentReference` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscription_merchantId_key`(`merchantId`),
    PRIMARY KEY (`subscriptionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tryonresult` (
    `tryOnResultId` CHAR(36) NOT NULL,
    `tryOnSessionId` CHAR(36) NOT NULL,
    `resultImagePath` VARCHAR(2048) NOT NULL,
    `processingMs` INTEGER NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TryOnResult_tryOnSessionId_key`(`tryOnSessionId`),
    PRIMARY KEY (`tryOnResultId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tryonsession` (
    `tryOnSessionId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NULL,
    `guestSessionId` CHAR(36) NULL,
    `digitalTwinId` CHAR(36) NULL,
    `productId` CHAR(36) NOT NULL,
    `productVariantId` CHAR(36) NULL,
    `sourceImagePath` VARCHAR(2048) NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `errorMessage` TEXT NULL,
    `requestMetadata` JSON NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TryOnSession_digitalTwinId_fkey`(`digitalTwinId`),
    INDEX `TryOnSession_guestSessionId_createdAt_idx`(`guestSessionId`, `createdAt`),
    INDEX `TryOnSession_productId_createdAt_idx`(`productId`, `createdAt`),
    INDEX `TryOnSession_productVariantId_fkey`(`productVariantId`),
    INDEX `TryOnSession_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `TryOnSession_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`tryOnSessionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `userId` CHAR(36) NOT NULL,
    `userName` VARCHAR(100) NOT NULL,
    `userEmail` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('CUSTOMER', 'MERCHANT', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `status` ENUM('ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `emailVerifiedAt` DATETIME(3) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_userEmail_key`(`userEmail`),
    INDEX `User_createdAt_idx`(`createdAt`),
    INDEX `User_role_status_idx`(`role`, `status`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `auditlog` ADD CONSTRAINT `AuditLog_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `user`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comparison` ADD CONSTRAINT `Comparison_guestSessionId_fkey` FOREIGN KEY (`guestSessionId`) REFERENCES `guestsession`(`guestSessionId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comparison` ADD CONSTRAINT `Comparison_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comparisonitem` ADD CONSTRAINT `ComparisonItem_comparisonId_fkey` FOREIGN KEY (`comparisonId`) REFERENCES `comparison`(`comparisonId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comparisonitem` ADD CONSTRAINT `ComparisonItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`productId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `digitaltwin` ADD CONSTRAINT `DigitalTwin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite` ADD CONSTRAINT `Favorite_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`productId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite` ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback` ADD CONSTRAINT `Feedback_guestSessionId_fkey` FOREIGN KEY (`guestSessionId`) REFERENCES `guestsession`(`guestSessionId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback` ADD CONSTRAINT `Feedback_resolvedById_fkey` FOREIGN KEY (`resolvedById`) REFERENCES `user`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback` ADD CONSTRAINT `Feedback_tryOnSessionId_fkey` FOREIGN KEY (`tryOnSessionId`) REFERENCES `tryonsession`(`tryOnSessionId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback` ADD CONSTRAINT `Feedback_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guestsession` ADD CONSTRAINT `GuestSession_convertedUserId_fkey` FOREIGN KEY (`convertedUserId`) REFERENCES `user`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `measurement` ADD CONSTRAINT `Measurement_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `profile`(`profileId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `merchant` ADD CONSTRAINT `Merchant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `merchantredirect` ADD CONSTRAINT `MerchantRedirect_guestSessionId_fkey` FOREIGN KEY (`guestSessionId`) REFERENCES `guestsession`(`guestSessionId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `merchantredirect` ADD CONSTRAINT `MerchantRedirect_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `merchant`(`merchantId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `merchantredirect` ADD CONSTRAINT `MerchantRedirect_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`productId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `merchantredirect` ADD CONSTRAINT `MerchantRedirect_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passwordresettoken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`categoryId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `Product_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `merchant`(`merchantId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productimage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`productId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productvariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`productId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile` ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `merchant`(`merchantId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tryonresult` ADD CONSTRAINT `TryOnResult_tryOnSessionId_fkey` FOREIGN KEY (`tryOnSessionId`) REFERENCES `tryonsession`(`tryOnSessionId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tryonsession` ADD CONSTRAINT `TryOnSession_digitalTwinId_fkey` FOREIGN KEY (`digitalTwinId`) REFERENCES `digitaltwin`(`digitalTwinId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tryonsession` ADD CONSTRAINT `TryOnSession_guestSessionId_fkey` FOREIGN KEY (`guestSessionId`) REFERENCES `guestsession`(`guestSessionId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tryonsession` ADD CONSTRAINT `TryOnSession_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`productId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tryonsession` ADD CONSTRAINT `TryOnSession_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `productvariant`(`productVariantId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tryonsession` ADD CONSTRAINT `TryOnSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;
