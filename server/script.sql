CREATE TABLE `listings` (
  `id` int(11) NOT NULL,
  `type` enum('lost','found') NOT NULL,
  `category` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `location` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
);