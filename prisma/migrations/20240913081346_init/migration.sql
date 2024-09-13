-- CreateTable
CREATE TABLE `Participant` (
    `participant_id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `is_organizer` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`participant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `event_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `start` DATETIME(3) NOT NULL,
    `end` DATETIME(3) NOT NULL,
    `voting_end` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TerminStatus` (
    `termin_status_id` VARCHAR(191) NOT NULL,
    `day` DATETIME(3) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `participant_id` VARCHAR(191) NOT NULL,
    `status` ENUM('AVAILABLE', 'NOT_AVAILABLE') NOT NULL,

    PRIMARY KEY (`termin_status_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Participant` ADD CONSTRAINT `Participant_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `Event`(`event_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TerminStatus` ADD CONSTRAINT `TerminStatus_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `Event`(`event_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TerminStatus` ADD CONSTRAINT `TerminStatus_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `Participant`(`participant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
