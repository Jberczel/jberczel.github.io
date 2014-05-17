---
layout: post
title: Members Only Walkthrough
comments: true
permalink: members-only-walkthrough
---

Estimated Time: 3 hours

Course: Ruby on Rails >> Forms and Authentication >> [Project: Authentication](http://www.theodinproject.com/ruby-on-rails/authentication)

##Objective:
>In this project, you'll be building an exclusive clubhouse where your members can write embarrassing posts about non-members. Inside the clubhouse, members can see who the author of a post is but, outside, they can only see the story and wonder who wrote it.

<!--more-->

<div class="message">
<b>Disclaimer:</b> This is my implementation of the Members Only project from the Odin Curriculum. I'm not a Rails expert, so do not take this walkthrough as gospel. If you see any errors or something that is incorrect, please feel free to contact me in the comments.
</div>

At the end of the project, you should have a simple application that authenticates users to view authors and create posts.

![members_homepage](/assets/members_homepage.png)

Sign-in page should flash errors if invalid: 

![members_signin](/assets/members_signin.png)

Signed-in members can view authors and create new posts:

![members_success](/assets/members_success.png)

---

##Basic Steps:

1. [Basic Setup](#step1)
2. [Sessions and Sign In](#step 2)
3. [Sign Out](#step 3)
4. [Authentication and Posts](#step 4)

<a name="step1"></a>
##Step 1: Basic Setup

From the command line, create a new Rails app:

{% highlight console %}
jamies-air:~ jxberc$ rails new members-only
{% endhighlight %}

Change directory to members-only, and generate a `User` model:

{% highlight console %}
jamies-air:members-only jxberc$ rails generate model User name:string email:string password_digest:string
{% endhighlight %}

Migrate `user` model using `rake db:migrate` command.

Include `bcrypt` gem in your GemFile and run `bundle install` command:
{% highlight ruby %}
# Use ActiveModel has_secure_password
gem 'bcrypt', '~> 3.1.7'
{% endhighlight %}

Add `#has_secure_password` to `app/models/user.rb` file.  Can also add additional validations:

{% highlight ruby %}
class User < ActiveRecord::Base  
  has_secure_password
  validates :password, length: { minimum: 6 }
end
{% endhighlight %}

Load `rails console` and create a sample user from command line to verify `#has_secure_password` method validates `password` and `password_confirmation` fields:

{% highlight bash %}
2.0.0-p451 :001 > User.all
...
2.0.0-p451 :002 > User.create(name:'Thor', email: 'thor@email.com', password: 'foobar', password_confirmation: 'foobar')
   (0.1ms)  begin transaction
Binary data inserted for `string` type on column `password_digest`
  SQL (5.0ms)  INSERT INTO "users" ("created_at", "email", "name", "password_digest", "updated_at") VALUES (?, ?, ?, ?, ?)  [["created_at", Fri, 16 May 2014 16:39:42 UTC +00:00], ["email", "thor@email.com"], ["name", "Thor"], ["password_digest", "$2a$10$pAXWAKQsk3oTUdF/YrkGGOROZkDW.qzJElfurP2YsXLyLFUQZqZ/O"], ["updated_at", Fri, 16 May 2014 16:39:42 UTC +00:00]]
   (0.8ms)  commit transaction
 => #<User id: 1, name: "Thor", email: "thor@email.com", password_digest: "$2a$10$pAXWAKQsk3oTUdF/YrkGGOROZkDW.qzJElfurP2YsXLy...", created_at: "2014-05-16 16:39:42", updated_at: "2014-05-16 16:39:42">
2.0.0-p451 :003 >
{% endhighlight %}

In the above example, the `password` was validated against `password_confirmation` and saved as a hashed password in the `password_digest` field.

The`#has_secure_password` method provides an `#authenticate` command, which can be used to authenticate user by passing the password as an argument:

{% highlight bash %}
2.0.0-p451 :003 > u = User.first
...
2.0.0-p451 :004 > u.authenticate('barfoo')
 => false
2.0.0-p451 :005 > u.authenticate('foobar')
 => #<User id: 1, name: "Thor", email: "thor@email.com", password_digest: "$2a$10$pAXWAKQsk3oTUdF/YrkGGOROZkDW.qzJElfurP2YsXLy...", created_at: "2014-05-16 16:39:42", updated_at: "2014-05-16 16:39:42">
2.0.0-p451 :006 >
{% endhighlight %}

<a name="step2"></a>
##Step 2: Sessions and Sign In

Create a `sessions_controller.rb` and the corresponding routes.

{% highlight console %}
jamies-air:members-only jxberc$ rails generate controller Sessions
{% endhighlight %}

In `config/routes.rb`:

{% highlight ruby %}
MembersOnly::Application.routes.draw do

  resources :sessions, only: [:new, :create, :destroy]
  match '/signin',  to: 'sessions#new',         via: 'get'
  match '/signout', to: 'sessions#destroy',     via: 'delete'
...
{% endhighlight %}

In `app/controllers/sessions_controller.rb`, fill in the `#new` action to create a blank session and send it to the view.

{% highlight ruby %}
class SessionsController < ApplicationController
  def new
  end
...
{% endhighlight %}

In `app/views/sessions` create a `new.html.erb` file and then create a simple `#form_for` form to sign-in user:

{% highlight erb %}
<h1>Sign in</h1>

<%= form_for(:session, url: sessions_path) do |f| %>

  <%= f.label :email %>
  <%= f.text_field :email %>

  <%= f.label :password %>
  <%= f.password_field :password %>

  <%= f.submit "Sign in", class: "btn btn-large btn-primary" %>
<% end %>

{% endhighlight %}

Now, that users can sign-in, the app should remember when a user is signed-in.

Create a new string column for User table called `remember_token`.  The token will be stored as a cookie and used later to authenticate users.

{% highlight console %}
jamies-air:members-only jxberc$ rails generate migration add_remember_token_to_users
{% endhighlight %}

In the migration file, add the following:

{% highlight ruby %}
class AddRememberTokenToUsers < ActiveRecord::Migration
  def change
    add_column :users, :remember_token, :string
    add_index  :users, :remember_token
  end
end
{% endhighlight %}

Migrate using `rake db:migrate`.

When you create a new user, a new token should be created. Use a `#before_create` callback on the `User` model to create a new token. Use several helper functions to create random token and then encrypt it.  For an explanation of these helper methods, check out Hartl's Rails tutorial [Ch. 8](http://www.railstutorial.org/book/sign_in_out).

{% highlight ruby %}
class User < ActiveRecord::Base
  before_create :create_remember_token
  ...

  def User.new_remember_token
    SecureRandom.urlsafe_base64
  end

  def User.digest(token)
    Digest::SHA1.hexdigest(token.to_s)
  end

  private

    def create_remember_token
      self.remember_token = User.digest(User.new_remember_token)
    end
end

{% endhighlight %}


In `app/controllers/sessions_controller.rb`, fill in `#create` action to create the user's session.

{% highlight ruby %}
def create
  user = User.find_by(email: params[:session][:email].downcase)
  if user && user.authenticate(params[:session][:password])
    flash[:success] = 'Thank you for signing in!'
    sign_in user
    redirect_to root_path        
  else
    flash.now[:error] = 'Invalid email/password combination'
    render 'new'
  end
end
{% endhighlight %}

The above `#create` action searches for user using submitted e-mail, and then checks if user exists and authenticates using submitted password.  If these check out, then it will sign-in user.

The `#create` action uses a `sign_in` helper method which you can create in the `app/helpers/sessions_helper.rb`.

{% highlight ruby %}
module SessionsHelper

  def sign_in(user)
    remember_token = User.new_remember_token
    cookies.permanent[:remember_token] = remember_token
    user.update_attribute(:remember_token, User.digest(remember_token))
    self.current_user = user
  end
...
{% endhighlight %}

The `sign_in` method creates a new token and sets cookie equal to new token.  Then, the user's token is updated with hashed token.

(Note: in order to access helper method from controllers, use `include` statement in `app/controllers/application_controller.rb`)

{% highlight ruby %}
class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  include SessionsHelper
  ...
{% endhighlight %}

Notice the `self.current_user = user` line above.  This statement uses one of the additional helper methods we will create.  Again, for a deeper dive into what these methods do, check Hartl's Rails Tutorial Ch. 8.

{% highlight ruby %}
def current_user=(user)
  @current_user = user
end

def current_user
  remember_token = User.digest(cookies[:remember_token])
  @current_user ||= User.find_by(remember_token: remember_token)
end

def signed_in?
  !current_user.nil?
end
{% endhighlight %}

<a name="step3"></a>
##Step 3: Sign out

In `app/controllers/sessions_controller.rb`, update `destroy` action:

{% highlight ruby %}
class SessionsController < ApplicationController
  ...
  def destroy
    sign_out
    redirect_to root_path
  end
{% endhighlight %}

Most of the functionality is built in the `sign_out` helper method.  After signing out, redirect to your root directory (homepage).

In `app/helpers/sessions_helpers.rb', create `sign_out` method:

{% highlight ruby %}
def sign_out
  current_user.update_attribute(:remember_token,
                                User.digest(User.new_remember_token))
  cookies.delete(:remember_token)
  self.current_user = nil
end
{% endhighlight %}

<a name="step4"></a>
##Step 4: Authentication and Posts

Create a `Post` model and controller:

{% highlight console %}
jamies-air:members-only jxberc$ rails generate model Post title:string body:text
...
jamies-air:members-only jxberc$ rails generate controller Posts
{% endhighlight %}

After you create model, run `rake db:migrate` from the command line.

Update routes in `config/routes.rb`:

{% highlight ruby %}
  resources :posts, only: [:new, :create, :index]
  root 'posts#index'
{% endhighlight %}

(Note: Added a root path that directs to list of posts. As an example, the `#sign_out` helper method redirects to root path.)

In `app/controllers/posts_controller.rb`, add `before_action` method to restrict access to `#new` and `#create` actions to only signed-in users:

{% highlight ruby %}
class PostsController < ApplicationController
  before_action :signed_in_user, only: [:new, :create]
  ...

    # before filter/action
    def signed_in_user
      unless signed_in?
        redirect_to signin_url
      end
    end
end
{% endhighlight %}

Create `#new` action in PostsController:

{% highlight ruby %}
class PostsController < ApplicationController
  ...
  def new
    @post = Post.new
  end
  ...
end
{% endhighlight %}

Create a simple form and save as `app/views/posts/new.html.erb`:

{% highlight erb %}
<h1>New Post</h1>

<%= form_for @post do |f| %>

<p>
  <%= f.label :title %> <br/>
  <%= f.text_field :title %>
</p>
<p>
  <%= f.label :body %><br />
  <%= f.text_area :body %>
</p>

<p>
  <%= f.submit %>
</p>

<% end %>
{% endhighlight %}

Now, create `#create` action in PostsController which automatically updates Posts foreign key (`user_id`) with the signed-in user. (Note: Need to create a foreign key in the Post model first).

From command line:

{% highlight console %}
jamies-air:members-only jxberc$ rails generate migration AddForeignKeyToPost user:references
{% endhighlight %}

Run `rake db:migrate` and add associations to respective models:

{% highlight ruby %}
class Post < ActiveRecord::Base
  belongs_to :user

...

class User < ActiveRecord::Base
  has_many :posts
{% endhighlight %}

Back to the PostsController, fill in the `#create` action:

{% highlight ruby %}
class PostsController < ApplicationController
  ...
  def create
    @post = Post.new(post_params)
    @post.user_id = current_user.id
    @post.save
    redirect_to root_path
  end
{% endhighlight %}

The `#create` action creates a new post with help from `#post_params` and also updates post's foreign key (`user_id`) with the signed user's `id`.  Note the usage of `#current_user` helper function.  

Create the `#index` action to view all posts: 

{% highlight ruby %}
class PostsController < ApplicationController
  ...
  def index
    @posts = Post.all
  end
  ...
{% endhighlight %}

And finally create the corresponding view `app/views/posts/index.html.erb`:

{% highlight erb %}
<div class="float-right">
  <% if signed_in? %>
  <%= link_to "(#{current_user.name}) Sign out", signout_path, method: "delete" %>
  <% else %>
    <%= link_to 'Sign in', signin_path %>
  <% end %>
</div>

<h1>Members Only Posts</h1>

<% @posts.each do |post| %>
  <% if signed_in? %>
    <p class="float-right">
      Posted by:
      <%= post.user.name %>
    </p>
  <% end %>
  <h4 class="float-left"><%=post.title %></h4>  
  <p class="clear"><%= post.body %></p>
<% end %>

<% if signed_in? %>
  <%= link_to "Create a Post", new_post_path %>
<% end %>

{% endhighlight %}

Using the `#signed_in?` helper method only allows signed-in users to view authors of each post.

This project did not require registering new users, so from the command line, create several test users, sign-in, and verify that only signed-in users can view authors and create posts.

Lastly, add some custom CSS styling as practice.

Congratulations, you should have a working authentication system similar to the more comprehensive system built in Michael Hartl's Rails Tutorial.




