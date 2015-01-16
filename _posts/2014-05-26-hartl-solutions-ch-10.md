---
layout: post
title: Hartl's Rails Tutorial - Solutions for Ch 10 Exercises
comments: true
permalink: hartl-solutions-ch10
---

My solutions for Michael Hartl's Rails tutorial, [Ch. 10 exercises](http://www.railstutorial.org/book/user_microposts#sec-micropost_exercises). Some of these exercises are quite challenging; [StackOverflow](http://stackoverflow.com/) is a great resource if you get stuck.

<!--more-->

##Exercises

[1](#step1)
[2](#step2)
[3](#step3)
[4](#step4)
[5](#step5)
[6](#step6)
[7](#step7)

---
<a name="step1"></a>
##1.

####Add tests for the sidebar micropost counts (including proper pluralization).

---

For my implementation, I tested for the singular count, when there is only one micropost.  

In `spec/requests/static_pages_spec.rb`, add test inside "for signed-in users" section.  In the "micropost counts" test, remove one of the two created test microposts, and should expect page to have only one micropost.


{% highlight ruby %}
describe "for signed-in users" do
  let(:user) { FactoryGirl.create(:user) }
  before do
    FactoryGirl.create(:micropost, user: user, content: "Lorem ipsum")
    FactoryGirl.create(:micropost, user: user, content: "Dolor sit amet")
    sign_in user
    visit root_path
  end
  .
  .
  .
  describe "micropost counts" do
    before { click_link "delete", match: :first }
    it "should be singular when count eq to 1" do
      expect(page).to have_selector("span", text: "1 micropost")
    end
  end
  ...
{% endhighlight %}

---
<a name="step2"></a>
##2.

####Add tests for micropost pagination.

---

Like exercise 1, I probably could've included pagination test inside "for signed-in users" section, but I created a separate section to work with a new set of microposts.

In `spec/requests/static_pages_spec.rb`, test should verify that page has a pagination div when there are more than 30 microposts:

{% highlight ruby %}
describe "Static pages" do

  subject { page }
  .
  .
  .
  describe "micropost pagination" do
    let(:user) { FactoryGirl.create(:user) }
    before do
      31.times { FactoryGirl.create(:micropost, user: user) }
      sign_in user
      visit root_path
    end
    after { user.microposts.destroy_all }

    it { should have_selector("div.pagination") }
  end

{% endhighlight %}
---
<a name="step3"></a>
##3.

####Refactor the Home page to use separate partials for the two branches of the if-else statement.

---

The `app/views/static_pages/home.html.erb` file is cluttered, so create two new partials: `app/views/shared/_user_homepage.html.erb` and `app/views/shared/_homepage.html.erb`.

The first partial displays a user-based homepage, while the later displays generic homepage for users that are not signed in.

{% highlight html+erb %}
# app/views/shared/_user_homepage.html.erb

<div class="row">
  <aside class="span4">
    <section>
      <%= render 'shared/user_info' %>
    </section>

    <section>
      <%= render 'shared/stats' %>
    </section>

    <section>
      <%= render 'shared/micropost_form' %>
    </section>
  </aside>

  <div class="span8">
    <h3>Micropost Feed</h3>
    <%= render 'shared/feed' %>
  </div>
</div>
{% endhighlight %}


{% highlight html+erb %}
# app/views/shared/_homepage.html.erb

<div class="center hero-unit">
  <h1>Welcome to the Sample App</h1>

  <h2>
    This is the home page for the
    <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
    sample application.
  </h2>

  <%= link_to "Sign up now!", signup_path,
                              class: "btn btn-large btn-primary" %>
</div>

<%= link_to image_tag("rails.png", alt: "Rails"), 'http://rubyonrails.org/' %>
{% endhighlight %}

And now the refactored `app/views/static_pages/home.html.erb`:

{% highlight html+erb %}
<% if signed_in? %>
  <%= render 'shared/user_homepage' %>
<% else %>
  <%= render 'shared/homepage' %>
<% end %>

{% endhighlight %}

After completing this exercise, I think it may be more appropriate to put these partials in `app/views/static_pages` as opposed to `app/views/shared` directory.  Nevertheless, the partials still work as intended.

---
<a name="step4"></a>
##4.

####Write a test to make sure delete links do not appear for microposts not created by the current user.

---

In `spec/requests/authentication_pages_spec.rb`, add the following test:

{% highlight ruby %}
describe "authorization" do

  describe "as signed-in user " do
    let(:user) { FactoryGirl.create(:user) }
    before { sign_in user, no_capybara:true }
    .
    .
    .
    describe  "cannot delete other users' posts" do
      let(:other_user) { FactoryGirl.create(:user) }
      before { visit user_path(other_user) }
      it { should_not have_link('delete') }
    end
  end
...
{% endhighlight %}

---
<a name="step5"></a>
##5. 

####Using partials, eliminate the duplication in the delete links from Listing 10.43 and Listing 10.44.

---

First create a new partial, `app/views/shared/_delete_link.html.erb`:

{% highlight html+erb %}
 <%= link_to "delete", object, method: :delete,
                                     data: { confirm: "You sure?" },
                                     title: object.content %>
{% endhighlight %}

Then, update `app/views/shared/_feed_item.html.erb`:

{% highlight html+erb %}
<li id="<%= feed_item.id %>">
  ...
  <% if current_user?(feed_item.user) %>
    <%= render 'shared/delete_link', object: feed_item %>  
  <% end %>
</li>
{% endhighlight %}


And update `app/views/microposts/_micropost.html.erb`:

{% highlight html+erb %}
<li>
  ...
  <% if current_user?(micropost.user) %>
    <%= render 'shared/delete_link', object: micropost %>
  <% end %>
</li>
{% endhighlight %}

Note that we passed in different objects (`feed_item` and `micropost`) for each view.

---
<a name="step6"></a>
##6. 

####Very long words currently break our layout, as shown in Figure 10.18. Fix this problem using the wrap helper defined in Listing 10.47. Note the use of the raw method to prevent Rails from escaping the resulting HTML, together with the sanitize method needed to prevent cross-site scripting. This code also uses the strange-looking but useful ternary operator (Box 10.1).

---

This exercise provides us with the code to handle long words.  We just need to implement in our application.

If not already created, create `app/helpers/microposts_helper.rb` and add helper methods:

{% highlight ruby %}
module MicropostsHelper

  def wrap(content)
    sanitize(raw(content.split.map{ |s| wrap_long_string(s) }.join(' ')))
  end

  private

    def wrap_long_string(text, max_width = 30)
      zero_width_space = "&#8203;"
      regex = /.{1,#{max_width}}/
      (text.length < max_width) ? text :
                                  text.scan(regex).join(zero_width_space)
    end
end
{% endhighlight %}

Next, update views with `wrap` method. In `app/views/microposts/_micropost.html.erb`:

{% highlight ruby %}
<li>
  <span class="content"><%= wrap(micropost.content) %></span>
  ...
</li>

{% endhighlight %}

And in `app/views/shared/_feed_item.html.erb`:

{% highlight ruby %}
<li id="<%= feed_item.id %>">
  ...
  <span class="content"><%= wrap(feed_item.content) %></span>
  ...
</li>

{% endhighlight %}

---
<a name="step7"></a>
##7. 

####(challenging) Add a JavaScript display to the Home page to count down from 140 characters.

---

My javascript and jQuery skills are still rudimentary, so I used this [solution](http://stackoverflow.com/questions/10234939/add-a-javascript-display-to-the-home-page-to-count-down-from-140-characters-ra) from StackOverFlow.

{% highlight js %}
function updateCountdown() {

    var $countdown = $('.countdown');

    // 140 is the max message length
    var remaining = 140 - $('#micropost_content').val().length;

    $countdown.text(remaining + ' characters remaining');

    var color = 'grey';
    if (remaining < 21) { color = 'black'; }
    if (remaining < 11) { color = 'red'; }
    $countdown.css( { color: color} );
}

$(document).ready(function($) {
    updateCountdown();
    $micropost_content = $('#micropost_content');

    $micropost_content.change(updateCountdown);
    $micropost_content.keyup(updateCountdown);
    $micropost_content.keydown(updateCountdown);
});
{% endhighlight %}

**Update:** When I first attempted this problem, I could not understand much, so don't get discouraged.  After starting the Javascript course on Odin, I was able to start refactoring the code from StackOverFlow.
