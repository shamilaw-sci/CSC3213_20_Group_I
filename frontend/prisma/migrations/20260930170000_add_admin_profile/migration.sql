-- Admin authentication remains in `user`; this table stores admin-only profile data.
CREATE TABLE `adminprofile` (
    `adminProfileId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `department` VARCHAR(100) NULL,
    `designation` VARCHAR(100) NOT NULL DEFAULT 'Administrator',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminProfile_userId_key`(`userId`),
    PRIMARY KEY (`adminProfileId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `adminprofile`
    ADD CONSTRAINT `AdminProfile_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `user`(`userId`)
    ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `adminprofile` (`adminProfileId`, `userId`, `department`, `designation`, `createdAt`, `updatedAt`)
SELECT UUID(), `userId`, 'Administration', 'Administrator', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `user`
WHERE `role` = 'ADMIN';
