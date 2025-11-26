-- CreateTable
CREATE TABLE `Friend` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` INTEGER NOT NULL,
    `friendId` INTEGER NOT NULL,

    UNIQUE INDEX `Friend_ownerId_friendId_key`(`ownerId`, `friendId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Friend` ADD CONSTRAINT `Friend_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friend` ADD CONSTRAINT `Friend_friendId_fkey` FOREIGN KEY (`friendId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
