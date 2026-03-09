title:	feat(scraper): Scrape and store event images
state:	OPEN
author:	javiersanag
labels:	
comments:	0
assignees:	
projects:	
milestone:	
number:	53
--
We need to scrape event images from the sources and store them in the database to be used on the Event Detail page.

- Update database schema to include \image_url\.
- Update scrapers to extract the image URL.
- Update Event Detail page to use the image instead of the gradient fallback.
