---
layout: post
title: Hartl's Rails Tutorial - Solutions for Ch 11 Exercises 
permalink: hartl-solutions-ch11
---

My solutions for Michael Hartl's Rails tutorial, [Ch. 11 exercises](http://rails-3-2.railstutorial.org/book/following_users#sec-following_exercises). Some of my solutions didn't seem as robust this time around, but I posted for others to compare.

Ch. 11 also has several add-on features (messaging, password reminders, REST API, etc.), which I plan to work on in the near future.

<!--more-->

##Exercises 

[1](#step1)
[2](#step2)
[3](#step3)
[4](#step4)

---
<a name="step1"></a>
##1.

####Add tests for destroying relationships associated with a given user (i.e., as implemented by `dependent: :destroy` in Listing 11.4 and Listing 11.16). Hint: Follow the example in Listing 10.15.

---

I added one test to check that an associated relationship is destoryed when user is destoryed.  

In `spec/models/user_spec.rb`, you can add test inside describe "following" block:

{% highlight ruby %}
describe "following" do
  let(:other_user) { FactoryGirl.create(:user) }
  before do
    @user.save
    @user.follow!(other_user)
  end
  .
  .
  .
  it "should destroy associated relationships" do
    relationships = @user.relationships.to_a
    @user.destroy
    relationships.should_not be_empty
    relationships.each do |relationship|
      expect(Relationship.where(id: relationship.id)).to be_empty
    end
  end
end
{% endhighlight %}

Verify failing test when you remove `dependent: :destroy` from the `has_many` association in User model:

{% highlight ruby %}
class User < ActiveRecord::Base
  has_many :microposts, dependent: :destroy
  has_many :relationships, foreign_key: "follower_id", dependent: :destroy
  ...

{% endhighlight %}

Once you get failing test, add back `dependent: :destroy` and verify passing test.


---
<a name="step2"></a>
##2.

####The `respond_to` method seen in Listing 11.38 can actually be hoisted out of the actions into the Relationships controller itself, and the `respond_to` blocks can be replaced with a Rails method called `respond_with`. Prove that the resulting code, shown in Listing 11.47, is correct by verifying that the test suite still passes. (For details on this method, do a Google search on “rails respond_with”.)`

---

Not too much to do here, but simply replace code that Hartl provides.  Replace code, re-run rSpec tests, and verify passing tests.


{% highlight ruby %}
class RelationshipsController < ApplicationController
  before_filter :signed_in_user

  respond_to :html, :js

  def create
    @user = User.find(params[:relationship][:followed_id])
    current_user.follow!(@user)
    respond_with @user
  end

  def destroy
    @user = Relationship.find(params[:id]).followed
    current_user.unfollow!(@user)
    respond_with @user
  end
end

{% endhighlight %}
---
<a name="step3"></a>
##3.

####Refactor Listing 11.31 by adding partials for the code common to the following/followers pages, the Home page, and the user show page.

---

I coudldn't find much to refactor in this case.  

Here's **Listing 11.31**:

{% highlight erb %}
<% provide(:title, @title) %>
<div class="row">
  <aside class="span4">
    <section>
      <%= gravatar_for @user %>
      <h1><%= @user.name %></h1>
      <span><%= link_to "view my profile", @user %></span>
      <span><b>Microposts:</b> <%= @user.microposts.count %></span>
    </section>
    <section>
      <%= render 'shared/stats' %>
      <% if @users.any? %>
        <div class="user_avatars">
          <% @users.each do |user| %>
            <%= link_to gravatar_for(user, size: 30), user %>
          <% end %>
        </div>
      <% end %>
    </section>
  </aside>
  <div class="span8">
    <h3><%= @title %></h3>
    <% if @users.any? %>
      <ul class="users">
        <%= render @users %>
      </ul>
      <%= will_paginate %>
    <% end %>
  </div>
</div>

{% endhighlight %}

I updated the user profile with the `shared/user_info` partial and left the rest as is:

{% highlight erb %}
<% provide(:title, @title) %>
<div class="row">
  <aside class="span4">
    <section>
      <%= render 'shared/user_info' %>
    </section>
    <section>
      <%= render 'shared/stats' %>
      <% if @users.any? %>
        <div class="user_avatars">
          <% @users.each do |user| %>
            <%= link_to gravatar_for(user, size: 30), user %>
          <% end %>
        </div>
      <% end %>
    </section>
  </aside>
  <div class="span8">
    <h3><%= @title %></h3>
    <% if @users.any? %>
      <ul class="users">
        <%= render @users %>
      </ul>
      <%= will_paginate %>
    <% end %>
  </div>
</div>
{% endhighlight %}


---
<a name="step4"></a>
##4.

####Following the model in Listing 11.19, write tests for the stats on the profile page.

---

With the help of **Listing 11.19**, this additional test seemed pretty straight forward.

In `spec/reqeuests/user_pages.rb`, inside the describe "profile page" block, add following tests:

{% highlight ruby %}
describe "profile page" do
  let(:user) { FactoryGirl.create(:user) }
  let!(:m1) { FactoryGirl.create(:micropost, user: user, content: "Foo") }
  let!(:m2) { FactoryGirl.create(:micropost, user: user, content: "Bar") }
  before { visit user_path(user) }
  .
  .
  .
  describe "follower/following counts" do
    let(:other_user) { FactoryGirl.create(:user) }
    
    before do
      other_user.follow!(user)
      visit user_path(user)
    end

    it { should have_link("0 following", href: following_user_path(user)) }
    it { should have_link("1 followers", href: followers_user_path(user)) }
  end
  ...
{% endhighlight %}

In `app/views/users/show.html.erb`, verify failing tests by commenting out `<%= render 'shared/stats %>`:

{% highlight erb %}
<% provide(:title, @user.name) %>
<div class="row">
  <aside class="span4">
    <section>
      <h1>
        <%= gravatar_for @user %>
        <%= @user.name %> <br>
      </h1>
    </section>
    <section>
      <!-- <%= render 'shared/stats' %> -->
    </section>
    ...

{% endhighlight %}

Add back the stats, and confirm passing tests.


