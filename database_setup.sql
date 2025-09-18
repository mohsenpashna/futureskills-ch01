-- Database setup for futureskills-ch01
-- Create database
CREATE DATABASE IF NOT EXISTS `ch-01`;
USE `ch-01`;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Products table
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `image_url` varchar(255),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Ratings table
CREATE TABLE IF NOT EXISTS `ratings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `user` varchar(50) NOT NULL,
  `rating` int(1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`product_id`, `user`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100),
  `message` text NOT NULL,
  `email` varchar(100) NOT NULL,
  `date` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Insert sample products
INSERT INTO `products` (`id`, `name`, `description`, `image_url`) VALUES
(1, 'Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'),
(2, 'Smart Watch', 'Advanced smartwatch with fitness tracking and notifications', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'),
(3, 'Bluetooth Speaker', 'Portable Bluetooth speaker with excellent sound quality', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300');

-- Create an admin user (password: admin123)
INSERT INTO `users` (`username`, `password`, `is_admin`) VALUES
('admin', '$2b$10$8K1p/a0dclxKMS4QwqaduOUiNlVJLN/Zb8TdLhveLjAWUNWaWvHDO', 1);
