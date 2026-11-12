CREATE TABLE `customer_subscription` (
    `subscriptionId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `plan` ENUM('STARTER', 'STYLE_PLUS', 'STYLE_PRO') NOT NULL DEFAULT 'STARTER',
    `status` ENUM('DEMO_ACTIVE', 'ACTIVE', 'CANCELLED') NOT NULL DEFAULT 'DEMO_ACTIVE',
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `customer_subscription_userId_key`(`userId`),
    PRIMARY KEY (`subscriptionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `customer_subscription` ADD CONSTRAINT `customer_subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
