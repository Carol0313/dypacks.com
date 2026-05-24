CREATE TABLE `product_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(128),
	`rating` int NOT NULL,
	`title` varchar(256),
	`content` text,
	`status` enum('approved','pending','rejected') NOT NULL DEFAULT 'approved',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_reviews_id` PRIMARY KEY(`id`)
);
