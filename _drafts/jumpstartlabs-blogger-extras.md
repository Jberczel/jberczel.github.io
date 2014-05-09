---
layout: post
title: Jumpstart Labs Blogger Tutorial - Extras
permalink: jumpstart-labs-blogger-walkthrough
---

#Objective
Complete Extra Credit section of the Jumpstart Labs Blogger 2 Tutorial.

Steps

1. Site-wide sidebar 
2. Date-based navigation links
3. View Count
4. Most Popular Articles
5. RSS Feed

## Step 1: Site-Wide Sidebar

I used twitter bootstrap to add a site-wide sidebar that holds navigation links.

In your `Gemfile`, add twitter `bootstrap-sass` gem:

{% highlight ruby %}

source 'https://rubygems.org'
ruby '2.0.0'
...
# use bootstrap for styling
gem 'bootstrap-sass', '~> 3.1.1'
...

{% endhighlight %}

Afer you include gem, install `bootstrap-sass`:

{% highlight console %}
jamies-air:blogger jxberc$ bundle install
{% endhighlight %}

After installation, you should restart your server to see changes in development application.  In the terminal running server, type `CTRL-C`, and then restart by running `rails server`.

In `app/assets/stylesheets/styles.css.scss`, include bootstrap:

{% highlight css %}
@import "bootstrap";
{% endhighlight %}

This one line of code inclues the entire bootstrap framework.  Next, I added custom blog styling. You can find custom layouts on bootstrap website.

{% highlight css %}
body {
  color: #555;
}

h1, .h1,
h2, .h2,
h3, .h3,
h4, .h4,
h5, .h5,
h6, .h6 {
  margin-top: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: normal;
  color: #333;
}
...
{% endhighlight %}

There is more css styling.  View my `app/assets/stylesheet/styles.css.scss`.

After including bootstrap and custom stylings, create a sidebar partial:



