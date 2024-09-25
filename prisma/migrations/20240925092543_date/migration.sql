-- AlterTable
ALTER TABLE `event` MODIFY `start` DATE NOT NULL,
    MODIFY `end` DATE NOT NULL;

-- AlterTable
ALTER TABLE `terminstatus` MODIFY `day` DATE NOT NULL;
