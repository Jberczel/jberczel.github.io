---
layout: post
title: Hartl's Rails Tutorial - Solutions for Ch 9 Exercises
comments: true
permalink: hartl-solutions-ch9
---

My solutions for Michael Hartl's Rails tutorial, [Ch. 9 exercises](http://www.railstutorial.org/book/updating_and_deleting_users#sec-updating_deleting_exercises).  I found a lot of help on [StackOverflow](http://stackoverflow.com/), which I recommend if you're looking for detailed-explanations, discussion, or different ways to complete some of these exercises.

<!--more-->

##Exercises 

[1](#step1)
[2](#step2)
[3](#step3)
[4](#step4)
[5](#step5)
[6](#step6)
[7](#step7)
[8](#step8)
[9](#step9)

---
<a name="step1"></a>
##1.

####By issuing a PATCH request directly to the update method, verify that the admin attribute isn’t editable through the web. Be sure to get first to Red, and then to Green. (Hint: Your first step should be to add admin to the list of permitted parameters in `user_params`.)

---

In `app/controllers/users_controller.rb`, add `:admin` to permitted parameters:

{% highlight ruby %}
...
private
  def user_params
      params.require(:user).permit(:name, :email, :password,
                                   :password_confirmation, :admin)
  end
...
{% endhighlight %}

Write a test in `spec/requests/user_pages_spec.rb`:

{% highlight ruby %}
describe "edit" do
    let(:user) { FactoryGirl.create(:user) }
    before do
      sign_in user
      visit edit_user_path(user)
    end
    .
    .
    .
    describe "forbidden attributes" do
      let(:params) do
        { user: { admin: true, password: user.password,
                  password_confirmation: user.password } }
      end
      before do
        sign_in user, no_capybara: true
        patch user_path(user), params
      end
      specify { expect(user.reload).not_to be_admin }
    end
{% endhighlight %}

Run `rspec spec/requests/user_pages_spec.rb`, and result should be failing test:

{% highlight bash %}

Failures:

  1) User pages edit forbidden attributes
     Failure/Error: specify { expect(user.reload).not_to be_admin }
       expected admin? to return false, got true
     # ./spec/requests/user_pages_spec.rb:138:in `block (4 levels) in <top (required)>'
...

{% endhighlight %}

Remove `:admin` from `user_params`, and re-run the test.  Now, the result should be a passing test.

---
<a name="step2"></a>
##2.

####Arrange for the Gravatar “change” link in Listing 9.3 to open in a new window (or tab). Hint: Search the web; you should find one particularly robust method involving something called `_blank`.

---

In `app/views/users/edit.html.erb`, modify the `<a>` tag to include `target` attribute:

{% highlight html %}
  <a href="http://gravatar.com/emails" target="_blank">change</a>
{% endhighlight %}

---
<a name="step3"></a>
##3.

####The current authentication tests check that navigation links such as “Profile” and “Settings” appear when a user is signed in. Add tests to make sure that these links don’t appear when a user isn’t signed in.

---

In `spec/requests/authentication_pages_spec.rb`, add the following tests:

{% highlight ruby %}
  describe "signin" do
      before { visit signin_path }
  
      it { should have_content('Sign in') }
      it { should have_title('Sign in') }
      .
      .
      .
      it { should_not have_link('Users') }
      it { should_not have_link('Profile') }
      it { should_not have_link('Settings') }
      it { should_not have_link('Sign out', href: signout_path) }
      it { should have_link('Sign in', href: signin_path) }

{% endhighlight %}

Ideally, you want the test to go from RED (fail) to GREEN (pass), so we can insert a "Profile" link in the header (`app/views/layouts/_header.html.erb`) where the user is not signed in:

{% highlight erb %}
<header class="navbar navbar-fixed-top navbar-inverse">
  <div class="navbar-inner">
    <div class="container">
      <%= link_to "sample app", root_path, id: "logo" %>
      <nav>
        <ul class="nav pull-right">
          <li><%= link_to "Home", root_path %></li>
          <li><%= link_to "Help", help_path %></li>

          <li><%= link_to "Profile", current_user %></li>

          <% if signed_in? %>
            <li><%= link_to "Users", users_path %></li>
          ...

{% endhighlight %}

Run `rspec spec/requests/authentication_pages_spec.rb` and confirm failing test:

{% highlight bash %}
Failures:

  1) Authentication signin
     Failure/Error: it { should_not have_link('Profile') }
       expected #has_link?("Profile") to return false, got true

{% endhighlight %}

Now, remove the added "Profile" link from header and confirm passing test.

---
<a name="step4"></a>
##4.

####Use the `sign_in` test helper in as many places as you can find.

---

In your spec files, replace:

{% highlight ruby %}
fill_in "Email",    with: user.email.upcase
fill_in "Password", with: user.password
click_button "Sign in"
{% endhighlight %}

with:

{% highlight ruby %}
sign_in user
{% endhighlight %}

---
<a name="step5"></a>
##5.

####Remove the duplicated form code by refactoring the `new.html.erb` and `edit.html.erb` views to use the partial in Listing 9.49. Note that you will have to pass the form variable f explicitly as a local variable, as shown in Listing 9.50. You will also have to update the tests, as the forms aren’t currently exactly the same; identify the slight difference and update the tests accordingly.

---

Create `app/views/users/_fields.html.erb`:

{% highlight erb %}
<%= render 'shared/error_messages', object: f.object %>

<%= f.label :name %>
<%= f.text_field :name %>

<%= f.label :email %>
<%= f.text_field :email %>

<%= f.label :password %>
<%= f.password_field :password %>

<%= f.label :password_confirmation, "Confirm Password" %>
<%= f.password_field :password_confirmation %>

{% endhighlight %}

Refactor forms:

{% highlight erb %}
# app/views/users/edit.html.erb

<% provide(:title, "Edit user") %>
<h1>Update your profile</h1>

<div class="row">
  <div class="span6 offset3">
    <%= form_for(@user) do |f| %>
      <%= render 'fields', f: f %>
      <%= f.submit "Save changes", class: "btn btn-large btn-primary" %>
    <% end %>

    <%= gravatar_for @user %>
    <a href="http://gravatar.com/emails" target="_blank">change</a>
  </div>
</div>
{% endhighlight %}

{% highlight erb %}
# app/views/users/new.html.erb

<% provide(:title, 'Sign up') %>
<h1>Sign up</h1>

<div class="row">
  <div class="span6 offset3">
    <%= form_for(@user) do |f| %>
      <%= render 'fields', f: f %>
      <%= f.submit "Create my account", class: "btn btn-large btn-primary" %>
    <% end %>
  </div>
</div>
{% endhighlight %}

The `:password_confirmation`label originally had different labels in each of the forms. Now that both forms are using the partial, need to make small update to test.

In `spec/requests/user_pages_spec.rb` update label for `password:confirmation`:

{% highlight ruby %}
...
describe "with valid information" do
  fill_in "Name",             with: "Example User"
  fill_in "Email",            with: "user@example.com"
  fill_in "Password",         with: "foobar"

  fill_in "Confirm Password", with: "foobar"
end
...

{% endhighlight %}

Run rspec test and confirm passing test.

---
<a name="step6"></a>
##6.

####Signed-in users have no reason to access the new and create actions in the Users controller. Arrange for such users to be redirected to the root URL if they do try to hit those pages.

---

In `app/controllers/users_controller.rb`, add a `before_action` filter and helper method to prevent signed-in users from accessing the #new and #create actions.

{% highlight ruby %}
class UsersController < ApplicationController
  before_action :restrict_registration, only: [:new, :create]
  .
  .
  .
  private
  .
  .
  .
    def restrict_registration
       redirect_to root_url, notice: "You are already regsitered." if signed_in?
    end
end
{% endhighlight %}

In `spec/requests/authentication_pages_spec.rb`, add tests to make sure signed-in user cannot acces #new and #create actions:

{% highlight ruby %}
describe "authorization" do

    describe "as signed-in user " do
      let(:user) { FactoryGirl.create(:user) }
      before { sign_in user, no_capybara:true }
      .
      .
      .
      describe "cannot access #new action" do
        before { get new_user_path }
        specify { response.should redirect_to(root_path) }
      end

      describe "cannot access #create action" do
        before { post users_path(user) }
        specify { response.should redirect_to(root_path) }
      end
    end
{% endhighlight %}


---
<a name="step7"></a>
##7.

####Learn about the `request` object by inserting some of the methods listed in the Rails API9 into the site layout. (Refer to Listing 7.1 if you get stuck.)
---

Pending...

---
<a name="step8"></a>
##8.

####Write a test to make sure that the friendly forwarding only forwards to the given URL the first time. On subsequent signin attempts, the forwarding URL should revert to the default (i.e., the profile page). See Listing 9.51 for a hint (and, by a hint, I mean the solution).

---

As stated in the question, you can find solution in the tutorial.

---
<a name="step9"></a>
##9.

####Modify the `destroy` action to prevent admin users from destroying themselves. (Write a test first.)

---

This exercise is an additional layer of protection.  In the tutorial, we prevent admin users from destroying themselves at the View layer. For this exercise, we prevent same thing at the Controller layer.

In `spec/requests/authentication_pages_spec.rb`, write following test:

{% highlight ruby %}
describe "authorization" do
  .
  .
  .
  describe "as admin user" do
    let(:admin) { FactoryGirl.create(:admin) }
    before { sign_in admin, no_capybara: true }

    describe "should not be able to delete themselves via #destroy action" do
      specify do
        expect { delete user_path(admin) }.not_to change(User, :count).by(-1)
      end
    end
  end
end
{% endhighlight %}

Run test and verify failing test.

In `app/controllers/users_controller.rb`, modify the `#destroy` action:

{% highlight ruby %}
def destroy
    user = User.find(params[:id])
    unless current_user?(user)
      user.destroy
      flash[:success] = "User deleted."
    end
    redirect_to users_url
  end
{% endhighlight %}

Run test and verify passing test.
