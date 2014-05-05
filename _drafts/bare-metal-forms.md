---
layout: post
title: Bare Metal Forms and Helpers
---

Basic Steps:

1. [Setup](#step1)
2. [Build HTML Form](#step2)
3. [Build #form_tag Form](#step3)
4. [Build #form_for Form](#step4)

<a name="step1"></a>
##Setup

Create new Rails App:

{% highlight console %}
jamies-air:~ jxberc$ rails new re-former
{% endhighlight %}

Create and Migrate User Model:

{% highlight console %}
jamies-air:re-former jxberc$ rails generate model User username:string email:string password:string
{% endhighlight %}

{% highlight console %}
jamies-air:re-former jxberc$ db:migrate
{% endhighlight %}

In `app/models/user.rb`, add validations for presence:

{% highlight ruby %}
class User < ActiveRecord::Base
  validates :username, presence: true
  validates :email, presence: true
  validates :password, presence: true
end

{% endhighlight %}

In `config/routes.rb`, create routes for `#new` and `#create` actions:

{% highlight ruby %}
ReFormer::Application.routes.draw do
  resources :users, :only => [:new, :create]
end
{% endhighlight %}

In console, check to make sure routes were created:

{% highlight console %}
jamies-air:re-former jxberc$ rake routes
    Prefix Verb URI Pattern         Controller#Action
user_index POST /user(.:format)     user#create
  new_user GET  /user/new(.:format) user#new
jamies-air:re-former jxberc$

{% endhighlight %}

Generate a UsersController:

{% highlight console %}
jamies-air:re-former jxberc$ rails generate controller Users
{% endhighlight %}

In `app/controllers/users_controller.rb`, write empty methods for `#new` and `#create`:

{% highlight ruby %}
class UsersController < ApplicationController
  def new
  end

  def create
  end
end
{% endhighlight %}

In `app/views/users` folder, create `new.html.erb` file.  Add boilerplate text to file.

From the command line, load development server using `rails s`.  You should see the boilerplate text at ` http://localhost:3000/users/new`.

<a name="step2"></a>
##Build HTML Form

Build a form for creating a new user:

{% highlight html %}
<form accept-charset="UTF-8" action="/users" method="post">

  <label for="username">Username:</label>
  <input id="username"  name="username" type="text"><br>

  <label for="email">e-mail:</label>
  <input id="email" name="email" type="text"><br>

  <label for="password">Password:</label>
  <input id="password" name="password" type="password"><br>

  <input type="submit" value="Submit">
</form>
{% endhighlight %}

If you try to submit data now you will receive an `ActionController::InvalidAuthenticityToken` error. Add authenticity token as follows:

{% highlight html %}
<form accept-charset="UTF-8" action="/users" method="post">
  <input type="hidden" name="authenticity_token" value="<%= form_authenticity_token %>">
  ...
{% endhighlight %}

Now if you try to submit data, you will get a `template is missing` error.

![ template missing ](/assets/template_missing.png)

That is okay.  This means we've reached our `#create` action in the controller and by default it looks for an `app/views/users/create.html.erb` file.

Instead, lets build the `#create` action to go elsewhere:

{% highlight ruby %}
def create
  @user = User.new(:username => params[:username], :email => params[:email], :password => params[:password])
  if @user.save
    redirect_to new_user_path
  else
    render :new
  end
end
{% endhighlight %}

 In `app/controllers/users_controller.rb`, create and implement a `#user_params` helper method:

 {% highlight ruby %}
class UsersController < ApplicationController
  ...
  private

  def user_params
    params.require(:user).permit(:username, :email, :password)
  end
{% endhighlight %}

Update html form to submit hash of user parameters:

{% highlight html %}
<form accept-charset="UTF-8" action="/users" method="post">
  ...
  <input id="username"  name="user[username]" type="text"><br>
  ...
  <input id="email" name="user[email]" type="text"><br>
  ...
  <input id="password" name="user[password]" type="password"><br>
  ...
  <input type="submit" value="Submit">
</form>

{% endhighlight %}

Update `#create` action with new helper method:

{% highlight ruby %}
class UsersController < ApplicationController
  ...
  def create
    @user = User.new(user_params)
      if @user.save
        redirect_to new_user_path
      else
        render :new
      end
  end
  ...
{% endhighlight %}

Finally, confirm you can submit data using the form:

![ html_form ](/assets/html_form.png)

Log output:

{% highlight console %}
Started POST "/users" for 127.0.0.1 at 2014-05-05 17:56:21 -0400
Processing by UsersController#create as HTML
  Parameters: {"authenticity_token"=>"vapWanzKp+ZGIdvaE1HTcwS5ybQs/6pQJyuobJOcsmM=", "user"=>{"username"=>"thor", "email"=>"thor@email.com", "password"=>"[FILTERED]"}}
   (0.1ms)  begin transaction
  SQL (0.4ms)  INSERT INTO "users" ("created_at", "email", "password", "updated_at", "username") VALUES (?, ?, ?, ?, ?)  [["created_at", Mon, 05 May 2014 21:56:21 UTC +00:00], ["email", "thor@email.com"], ["password", "thor"], ["updated_at", Mon, 05 May 2014 21:56:21 UTC +00:00], ["username", "thor"]]
   (0.6ms)  commit transaction
Redirected to http://localhost:3000/users/new
Completed 302 Found in 14ms (ActiveRecord: 2.4ms)

{% endhighlight %}

<a name="step3"></a>
##Build \#form_tag Form






