/*
  Warnings:

  - A unique constraint covering the columns `[day,event_id,participant_id]` on the table `TerminStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TerminStatus_day_event_id_participant_id_key` ON `TerminStatus`(`day`, `event_id`, `participant_id`);
