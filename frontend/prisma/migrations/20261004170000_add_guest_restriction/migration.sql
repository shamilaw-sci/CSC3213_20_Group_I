ALTER TABLE `guestsession`
  ADD COLUMN `restrictedAt` DATETIME(3) NULL,
  ADD INDEX `GuestSession_restrictedAt_createdAt_idx` (`restrictedAt`, `createdAt`);
