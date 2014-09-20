---
layout: post
title: Web Scraping Project - Guitar Forum Search
comments: true
permalink: web-scraping
---
![agf example](/assets/agf2.png)

Currently, there are no web-scraping projects in the Odin Curicculum, but there's a great [article](http://ruby.bastardsbook.com/chapters/html-parsing/) on web-scraping from The Bastards Book of Ruby, which we've read in previous lessons.

<!--more-->

A friend had asked me to help pull pdf files from a website with a ton of links.  Rather than clicking each one (hundreds of research papers) and saving them with more specific file names, I wrote a simple [ruby script](https://github.com/Jberczel/pdf_scraper) to download the links, organize into folders, and rename the files based on their titles (extracted from the html).  This was a huge time saver, and a great small project to learn web scraping.  It also led me to build a website with actual users.

After finishing that small project, I decided to write a scraper for my own interests: acoustic guitars.
You can see the website [here](http://agf.herokuapp.com/), and the source code [here](https://github.com/Jberczel/GuitarForumSearch).

I like to browse this online [forum](http://www.acousticguitarforum.com/forums/forumdisplay.php?f=17), which posts used guitars.  However, it is hard to keep track of the daily ads, and the 
website has no efficient way of searching, so I decided to parse the data, so I could search the ads from my
own computer.  

After writing the parsing script, I realized others might be interested.  Sharing the script with non-programmers, didn't make sense, so I decided to incorporate the script into a Rails application, which other forum members could use to search as well.

##Things I Learned from this project

Here are the key things I learned.  These may be separate blog posts in the future if there is any interest.

- **Web Parsing** - using [Nokgiri gem](http://nokogiri.org/) is very straightforward.

- **dataTables (jQuery plugin)** - [dataTables](http://www.datatables.net/) is great for fast, responsive searching.  It works very well for forum searches, where you can see results as you type.

- **Using Bourbon and Neat** - great alternative to the ubiquitous twitter bootstrap; also a good
  introduction to [SASS](http://sass-lang.com/) (css pre-processor).  [Bourbon](http://bourbon.io/) is a lightweight SASS library, and [Neat](http://neat.bourbon.io/) is a lightweight grid framework for SASS and Bourbon.  These are a lot of fun to use.

- **How to use Heroku Scheduler** - in this case to parse the guitar forum pages every hour to get the latest data.  [Scheduler](https://devcenter.heroku.com/articles/scheduler) can run `rake` commands for you daily, hourly, or even every 10 minutes.

- **Create Staging Environment** - an intermediary between your local development and production environment.  You can read this [article](http://robots.thoughtbot.com/multiple-environments-on-heroku) to get the gist. A staging environemnt is helpful when you want to push changes, but not sure how they would look in production compared to your development environment (especially useful so your users don't experience any issues that might arise). Heroku also has an [article](https://devcenter.heroku.com/articles/multiple-environments) which shows you how to fork your current production environment to create a staging environment.

- **Caching** - I pull 6 months of ads, and cache the data.  Whenever user seraches, they use cahced results, cahce gets
updated after each hourly parse.  Check out the Rails [guide](http://guides.rubyonrails.org/caching_with_rails.html) for caching strategies.







