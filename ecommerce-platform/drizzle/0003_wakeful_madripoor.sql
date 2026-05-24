CREATE TABLE `inquiry_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiry_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiry_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inquiryNumber` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(256),
	`contactName` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32),
	`country` varchar(64),
	`message` text,
	`items` text NOT NULL,
	`status` enum('pending','replied','closed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiry_submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `inquiry_submissions_inquiryNumber_unique` UNIQUE(`inquiryNumber`)
);
