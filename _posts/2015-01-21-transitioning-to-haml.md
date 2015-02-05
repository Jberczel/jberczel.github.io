---
layout: post
title: Transitioning to HAML
comments: true
permalink: transitioning-to-haml
---

Well I finally experimented with [haml](http://haml.info/). Surprisingly, it felt
relatively easy transitioning from  html files (embedded with erb) to haml
files.

As the documentation suggests:

>Give yourself 5 minutes to read the tutorial and then convert one of
your ERB templates to Haml. Simplify. Enjoy. Laugh. 20 minutes later,
you will never go back.

So that's exactly what I did with my guitar forum website.  Here's one of the
views displaying list of guitars before and after using haml (note I did some additional refactoring which I'll explain below):

<!--more-->

###Before (html + erb)

{% highlight html+erb %}
<!-- app/views/posts/index.html.erb -->
<div class="wrapper">
<section class="search">

<h3>Guitars</h3>

<table id="guitars" class="display" cellspacing="0" width="100%">
  <thead>
    <tr>
      <th class="listing">Thread</th>
      <th class="last-post">Last Post</th>
      <th class="replies">Replies</th>
      <th class="views">Views</th>
    </tr>
  </thead>

  <tbody>
    <% cache(cache_key_for_posts) do %>
    <% @posts.each do |p| %>
      <tr>
        <td class="listing">
          <a href="http://www.acousticguitarforum.com/forums/<%= p.link %>" target="_blank">
            <%= p.title %>
          </a>
          <br>
            <span class="author"><%= p.author%></span>
        </td>
        <% date, person = getDateAndPerson(p.last_post) %>
        <td class="last-post"><%= date %> <br>by <%= person %></td>
        <td class="replies"><%= p.replies %></td>
        <td class="views"><%= p.views %></td>
      </tr>
    <% end %>
    <% end %>
  </tbody>

</table>
</section>
<div class="push"></div>
</div>
{% endhighlight %}

###After (haml)
{% highlight haml %}
-# app/views/posts/index.html.haml
.wrapper
  .search
    %h3 Guitars

    %table.display#guitars{:cellspacing => "0", :width => "100%"}
      %thead
        %tr
          %th.listing Thread
          %th.last-post Last Post
          %th.replies Replies
          %th.views Views
      %tbody
        - cache(cache_key_for_posts) do
          = render @posts
  .push

-# app/views/posts/_post.html.haml
%tr
  %td.listing= post.listing
  %td.last-post=  post.formatted_last_post
  %td.replies= post.replies
  %td.views= post.views
{% endhighlight %}

How does that look?  I think it's much easier to read.

While I was converting form erb to haml, I also noticed that there was a bit of
presentation logic that could be taken out of the views.  I used a
decorator pattern (another blog post) to get some of the presentation logic out of the view. In addition, I
noticed that `@posts` could also be extracted out into its own partial,
and rails has its own convention we can use with haml: `= render @posts`.
These two changes really helped to make the new files much cleaner.

Afer getting comfortable with haml, you don't have to manually convert
your old files from erb to haml.  Check out the
[html2haml](https://github.com/haml/html2haml) gem, or you
can also use this [website]( http://html2haml.herokuapp.com/) to convert individual pages.

Rewriting some of my views in haml was fun and invigorating. I recommend at least taking
a stab at it in one of your small projects.
