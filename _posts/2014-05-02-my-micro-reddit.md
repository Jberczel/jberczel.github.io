---
layout: post
title:  Micro-Reddit walkthrough
comments: true
permalink: micro-reddit-Walkthrough
---

Estimated Time: 1 hr

Course: Ruby on Rails >> Databases and Active Record >> [Project: Building With Active Record](http://www.theodinproject.com/ruby-on-rails/building-with-active-record)

##Objective:
> Let's build Reddit. Well, maybe a very junior version of it called micro-reddit. In this project, you'll build the data structures necessary to support link submissions and commenting. We won't build a front end for it because we don't need to... you can use the Rails console to play around with models without the overhead of making HTTP requests and involving controllers or views.

<!--more-->

<div class="message">
<b>Disclaimer:</b> This is my implementation of an Odin Project for reference. I'm not a Rails Master, so do not take this walkthrough as gospel. If you see any errors or something that is completely wrong, please feel free to contact me in the comments.
</div>

Basic Steps:

1. [Create Rails App](#step1)
2. [Create User Model](#step2)
3. [Create Post Model](#step3)
4. [Build Associations between User and Post models](#step4)
5. [Create Comment Model](#step5)
6. [Build additional assocations](#step6)
7. [Add Validations to Comment Model](#step7)
8. [Check Associations in Console](#step8)

<a name="step1"></a>
## Step 1: Create Rails App

Create a basic Rails app. Rails does all the heavy lifting. All you have to do is run
the `rails new <project name>` command from your terminal, which creates a basic Rails directory structure with everything you need to run a simple app.

From the command line, run:
{% highlight console %}
jamies-air:~ jxberc$ rails new micro-reddit
{% endhighlight %}

And you should see:
{% highlight console %}
jamies-air:~ jxberc$ rails new micro-reddit
      create
      create  README.rdoc
      create  Rakefile
      create  config.ru
      create  .gitignore
      create  Gemfile
      create  app
      create  app/assets/javascripts/application.js
      create  app/assets/stylesheets/application.css
      create  app/controllers/application_controller.rb
      create  app/helpers/application_helper.rb
      create  app/views/layouts/application.html.erb
      ...
{% endhighlight %}

After you create new direcotry, change into that directory from the command line:
{% highlight console %}
jamies-air:~ jxberc$ cd micro-reddit
jamies-air:micro-reddit jxberc$
{% endhighlight %}


<a name="step2"></a>
## Step 2: Create a User Model

From the command line:
{% highlight console %}
jamies-air:micro-reddit jxberc$ rails generate model User username:string, email:string, password:string
{% endhighlight %}

The `rails generate` script creates templates for models, controllers, and views. In this case, we will generate a new `model`, and name it `User`.

The additional arguments `username:string`, `email:string`, and `password:string` create 3 columns and sets their data type to string.

After you create the User Model, you should see this in your terminal:
{% highlight console %}
jamies-air:micro-reddit jxberc$ rails generate model User username:string, email:string, password:string
      invoke  active_record
      create    db/migrate/20140502132449_create_users.rb
      create    app/models/user.rb
      invoke    test_unit
      create      test/models/user_test.rb
      create      test/fixtures/users.yml
{% endhighlight %}

Check the `micro-reddit/db/migrate/` folder to confirm migration file was created. It should look like this:

{% highlight ruby %}
class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :username
      t.string :email
      t.string :password

      t.timestamps
    end
  end
end
{% endhighlight %}

From the command line, run:

{% highlight console %}
jamies-air:micro-reddit jxberc$ rake db:migrate
== 20140502150931 CreateComments: migrating ===================================
-- create_table(:comments)
   -> 0.0074s
== 20140502150931 CreateComments: migrated (0.0074s) ==========================
{% endhighlight %}

The `rake db:migrate` command should create a sql database in your `micro-reddit/db` folder.

### Working with the Model in the Console

From command line:
{% highlight console %}
jamies-air:micro-reddit jxberc$ rails console
Loading development environment (Rails 4.0.4)
2.0.0-p451 :001 >
{% endhighlight %}

Check User Table; it should be empty:
{% highlight bash %}
2.0.0-p451 :003 > User.all
  User Load (0.3ms)  SELECT "users".* FROM "users"
 => #<ActiveRecord::Relation []>
{% endhighlight %}


Create a new User record:
{% highlight bash %}
2.0.0-p451 :004 > u = User.new
 => #<User id: nil, username: nil, email: nil, password: nil, created_at: nil, updated_at: nil>
{% endhighlight %}

Check if record is valid:
{% highlight bash %}
2.0.0-p451 :005 > u.valid?
 => true
{% endhighlight %}

It's currently valid because we have no validations.  We don't want to accidently create blank usernames, so we can create validations in the `app/models/user.rb` file:

{% highlight ruby %}
class User < ActiveRecord::Base
  validates :username, presence: true, uniqueness: true,
            length: { maximum: 20 }
end

{% endhighlight %}

Reload the console, and confirm validations are working:

{% highlight bash %}
2.0.0-p451 :010 > reload!
Reloading...
 => true
2.0.0-p451 :011 > u2 = User.new
 => #<User id: nil, username: nil, email: nil, password: nil, created_at: nil, updated_at: nil>
2.0.0-p451 :012 > u2.valid?
  User Exists (0.2ms)  SELECT 1 AS one FROM "users" WHERE "users"."username" IS NULL LIMIT 1
 => false
2.0.0-p451 :013 >
{% endhighlight %}

If you can't save record to database, it is good to check error messages with `#errors.full_messages` method:
{% highlight bash %}
2.0.0-p451 :021 > u = User.new(username: 'abcdefghijklmnopqrstuvwxyz')
 => #<User id: nil, username: "abcdefghijklmnopqrstuvwxyz", email: nil, password: nil, created_at: nil, updated_at: nil>
 {% endhighlight %}
{% highlight bash %}
 2.0.0-p451 :024 > u.errors.full_messages
 => ["Username is too long (maximum is 20 characters)"]
{% endhighlight %}

Finally, create a user and save to User table:

{% highlight bash %}
2.0.0-p451 :019 > u = User.new(username: 'Thor', email: 'Thor@email.com', password: 'foobar')
 => #<User id: nil, username: "Thor", email: "Thor@email.com", password: "foobar", created_at: nil, updated_at: nil>
{% endhighlight %}

{% highlight bash %}
2.0.0-p451 :020 > u.save
   (0.1ms)  begin transaction
  User Exists (0.2ms)  SELECT 1 AS one FROM "users" WHERE "users"."username" = 'Thor' LIMIT 1
  SQL (4.8ms)  INSERT INTO "users" ("created_at", "email", "password", "updated_at", "username") VALUES (?, ?, ?, ?, ?)  [["created_at", Sat, 03 May 2014 15:43:22 UTC +00:00], ["email", "Thor@email.com"], ["password", "foobar"], ["updated_at", Sat, 03 May 2014 15:43:22 UTC +00:00], ["username", "Thor"]]
   (0.8ms)  commit transaction
 => true
{% endhighlight %}

<a name="step3"></a>
## Step 3: Create a Post Model

Generate new model `Post`:
{% highlight console %}
jamies-air:micro-reddit jxberc$ rails generate model Post title:string body:text
      invoke  active_record
      create    db/migrate/20140502133817_create_posts.rb
      create    app/models/post.rb
      invoke    test_unit
      create      test/models/post_test.rb
      create      test/fixtures/posts.yml
{% endhighlight %}

Code above generates `Post` model with `title:` and `body:` columns.

Migrate table to database:
{% highlight console %}
jamies-air:micro-reddit jxberc$ rake db:migrate
== 20140502133817 CreatePosts: migrating ======================================
-- create_table(:posts)
   -> 0.0062s
== 20140502133817 CreatePosts: migrated (0.0063s) =============================
{% endhighlight %}

Add some validations to `app/models/post.rb`:
{% highlight ruby %}
class Post < ActiveRecord::Base
  validates :title, presence: true
  validates :body, presence:true
end
{% endhighlight %}

Confirm that you can create and save a post in the console:

Run `rails console` if you haven't already.

{% highlight bash %}
2.0.0-p451 :025 > p = Post.new
 => #<Post id: nil, title: nil, body: nil, created_at: nil, updated_at: nil, user_id: nil>
2.0.0-p451 :026 > p.title = 'First Post'
 => "First Post"
2.0.0-p451 :027 > p.body = 'Hello World'
 => "Hello World"
2.0.0-p451 :028 > p.save
   (0.1ms)  begin transaction
  SQL (0.7ms)  INSERT INTO "posts" ("body", "created_at", "title", "updated_at") VALUES (?, ?, ?, ?)  [["body", "Hello World"], ["created_at", Sat, 03 May 2014 17:21:54 UTC +00:00], ["title", "First Post"], ["updated_at", Sat, 03 May 2014 17:21:54 UTC +00:00]]
   (0.8ms)  commit transaction
 => true

{% endhighlight %}

<a name="step4"></a>
## Step 4: Build Associations between User and Post Models

Generate Migration to Add Foreign Key to `Post` Model.
{% highlight bash %}
jamies-air:micro-reddit jxberc$ rails generate migration AddForeignKeyToPost user:references
      invoke  active_record
      create    db/migrate/20140502140547_add_foreign_key_to_post.rb
{% endhighlight %}

The `user:references` argument will add a column with foreign key that references User model.

Check `db/migrate` folder to see new migration file:
{% highlight ruby %}
class AddForeignKeyToPost < ActiveRecord::Migration
  def change
    add_reference :posts, :user, index: true
  end
end
{% endhighlight %}

Run migration:

{% highlight console %}
jamies-air:micro-reddit jxberc$ rake db:migrate
== 20140502140547 AddForeignKeyToPost: migrating ==============================
-- add_reference(:posts, :user, {:index=>true})
   -> 0.0033s
== 20140502140547 AddForeignKeyToPost: migrated (0.0034s) =====================
{% endhighlight %}


Create relationships in `app/models/post.rb` and `app/models/user.rb`:

{% highlight ruby %}
class Post < ActiveRecord::Base
  ...
  belongs_to :user
end
{% endhighlight %}

{% highlight ruby %}
class User < ActiveRecord::Base
  ...
  has_many :posts
end
{% endhighlight %}

The above code creates the relationship between `Post` and `User` models.  It basically says a post belongs to a user, and a user can have many posts.  This is known as a one-to-many relationship.  

Goign forward, you will likely see the `belongs_to` and `has_many` helper methods a lot when building models in Rails.

###Confirm associations in console:

First, create a new user, 

{% highlight bash %}
2.0.0-p451 :016 > u = User.create(username: "Odin", email: "odin@email.com", password: "foobar")
...
 => #<User id: 5, username: "Odin", email: "odin@email.com", password: "foobar", created_at: "2014-05-03 18:02:23", updated_at: "2014-05-03 18:02:23">
{% endhighlight %}

Now create new post referencing new user.  Add the `user_id` from previously created user. In the above example, the user id is 5.

{% highlight bash %}
2.0.0-p451 :017 > p = Post.create(title: "A New Post", body: "A post by Odin himself.", user_id: 5)
...
 => #<Post id: 4, title: "A New Post", body: "A post by Odin himself.", created_at: "2014-05-03 18:03:16", updated_at: "2014-05-03 18:03:16", user_id: 5>
{% endhighlight %}

Confirm you can find posts for given user:

{% highlight bash %}
2.0.0-p451 :018 > u.posts
  Post Load (0.2ms)  SELECT "posts".* FROM "posts" WHERE "posts"."user_id" = ?  [["user_id", 5]]
 => #<ActiveRecord::Associations::CollectionProxy [#<Post id: 4, title: "A New Post", body: "A post by Odin himself.", created_at: "2014-05-03 18:03:16", updated_at: "2014-05-03 18:03:16", user_id: 5>]>
{% endhighlight %}

Finally, confirm you can find User for given post (the other side of the relationship):

{% highlight bash %}
2.0.0-p451 :021 > p.user
  User Load (0.2ms)  SELECT "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 5]]
 => #<User id: 5, username: "Odin", email: "odin@email.com", password: "foobar", created_at: "2014-05-03 18:02:23", updated_at: "2014-05-03 18:02:23">

{% endhighlight %}

<a name="step5"></a>
## Step 5: Build Comment Model

Generate a `Comment` Model:

{% highlight console %}
jamies-air:micro-reddit jxberc$ rails generate model Comment body:text user:references post:references
      invoke  active_record
      create    db/migrate/20140502150931_create_comments.rb
      create    app/models/comment.rb
      invoke    test_unit
      create      test/models/comment_test.rb
      create      test/fixtures/comments.yml
{% endhighlight %}

Running the above command will create a migration file located in `db/migration` folder. See below:

{% highlight Ruby %}
class CreateComments < ActiveRecord::Migration
  def change
    create_table :comments do |t|
      t.text :body
      t.references :user, index: true
      t.references :post, index: true

      t.timestamps
    end
  end
end

{% endhighlight %}

Run migration:
{% highlight console %}
jamies-air:micro-reddit jxberc$ rake db:migrate
== 20140502150931 CreateComments: migrating ===================================
-- create_table(:comments)
   -> 0.0074s
== 20140502150931 CreateComments: migrated (0.0074s) ==========================
{% endhighlight %}

<a name="step6"></a>
##Step 6: Bulding Additional Assocations

In the `app/models` folder, update associations for each of the models:

{% highlight ruby %}
class Comment < ActiveRecord::Base
  belongs_to :user
  belongs_to :post
  ...
end
{% endhighlight %}

{% highlight ruby %}
class User < ActiveRecord::Base
  ...
  has_many :posts
  has_many :comments
end
{% endhighlight %}

{% highlight ruby %}
class Post < ActiveRecord::Base
  ...  
  belongs_to :user 
  has_many :comments
end
{% endhighlight %}

<a name="step7"></a>
##Step 7: Add Validations to Comment Model

We're adding validaitons to the Comment model, so we don't accidently create comments with no associated User or Post.

In the file `app/models/comment.rb`, include validations:

{% highlight ruby %}
class Comment < ActiveRecord::Base
  belongs_to :user
  belongs_to :post
  validates :user, presence:true
  validates :post, presence:true
  validates :body, presence:true
end
{% endhighlight %}

By validating `:user` and `:post`, we validate based on associated objects. Another way is to validate 
using the foreign keys: `:user_id` and `post_id`, but I've read this is not as robust as the above validations.

Validating `:user` and `:post` will check that associated object exists, while validating on foreign key will only check that a key was entered, but not whether that `:user_id` or `:post_id` actually exist in the other models.

Let's test in the console:

{% highlight bash %}
2.0.0-p451 :049 > c = Comment.new(body: "I enjoyed your post!")
 => #<Comment id: nil, body: "I enjoyed your post!", user_id: nil, post_id: nil, created_at: nil, updated_at: nil>
2.0.0-p451 :050 > c.save
   (0.1ms)  begin transaction
   (0.1ms)  rollback transaction
 => false
2.0.0-p451 :051 > c.errors.full_messages
 => ["User can't be blank", "Post can't be blank"]
{% endhighlight %}

First, I create a new comment with `:body` argument and try to save.  I cannot save, lets check the `errors.full_messages`.

Next, add a`user_id` and `post_id` to your comment.  They need to already exist in your User and Post models:

{% highlight bash %}

2.0.0-p451 :052 > c.user_id = 5
 => 5
2.0.0-p451 :053 > c.post_id = 4
 => 4
2.0.0-p451 :054 > c.save
   (0.1ms)  begin transaction
  User Load (0.2ms)  SELECT "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 5]]
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."id" = ? LIMIT 1  [["id", 4]]
  SQL (1.0ms)  INSERT INTO "comments" ("body", "created_at", "post_id", "updated_at", "user_id") VALUES (?, ?, ?, ?, ?)  [["body", "I enjoyed your post!"], ["created_at", Sun, 04 May 2014 21:08:34 UTC +00:00], ["post_id", 4], ["updated_at", Sun, 04 May 2014 21:08:34 UTC +00:00], ["user_id", 5]]
   (1.7ms)  commit transaction
 => true
{% endhighlight %}

It looks like it is now a valid comment.  Also check to make sure you cannot create a comment with invalid `user_id` and `post_id`.

Lastly, check to see if you can find comments from User and Post objects:

{% highlight bash %}
2.0.0-p451 :056 > u = User.find(5).comments
 ...
 => #<ActiveRecord::Associations::CollectionProxy [#<Comment id: 3, body: "another comment", user_id: 5, post_id: 4, created_at: "2014-05-04 20:43:47", updated_at: "2014-05-04 20:43:47">, #<Comment id: 4, body: "I enjoyed your post!", user_id: 5, post_id: 4, created_at: "2014-05-04 21:08:34", updated_at: "2014-05-04 21:08:34">]>
2.0.0-p451 :057 > p = Post.find(4).comments
 ...
 => #<ActiveRecord::Associations::CollectionProxy [#<Comment id: 3, body: "another comment", user_id: 5, post_id: 4, created_at: "2014-05-04 20:43:47", updated_at: "2014-05-04 20:43:47">, #<Comment id: 4, body: "I enjoyed your post!", user_id: 5, post_id: 4, created_at: "2014-05-04 21:08:34", updated_at: "2014-05-04 21:08:34">]>
{% endhighlight %}

<a name="step8"></a>
##Step 8: Check valid associations in Console

This is a final run-through to make sure the associations between the  `User`, `Post`, and `Comment` models are working as we expect.

My tables should be different than yours, so play around with your sample data and make sure you can return similiar results:

{% highlight bash %}
2.0.0-p451 :067 > u = User.find(5)
  User Load (0.1ms)  SELECT "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 5]]
 => #<User id: 5, username: "Odin", email: "odin@email.com", password: "foobar", created_at: "2014-05-03 18:02:23", updated_at: "2014-05-03 18:02:23">
 {% endhighlight %}

 {% highlight bash %}
2.0.0-p451 :068 > c = u.comments.last
  Comment Load (0.2ms)  SELECT "comments".* FROM "comments" WHERE "comments"."user_id" = ? ORDER BY "comments"."id" DESC LIMIT 1  [["user_id", 5]]
 => #<Comment id: 4, body: "I enjoyed your post!", user_id: 5, post_id: 4, created_at: "2014-05-04 21:08:34", updated_at: "2014-05-04 21:08:34">
  {% endhighlight %}

 {% highlight bash %}
2.0.0-p451 :069 > c.user
  User Load (0.1ms)  SELECT "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 5]]
 => #<User id: 5, username: "Odin", email: "odin@email.com", password: "foobar", created_at: "2014-05-03 18:02:23", updated_at: "2014-05-03 18:02:23">
  {% endhighlight %}

  {% highlight bash %}
2.0.0-p451 :070 > p = Post.first
  Post Load (0.3ms)  SELECT "posts".* FROM "posts" ORDER BY "posts"."id" ASC LIMIT 1
 => #<Post id: 4, title: "A New Post", body: "A post by Odin himself.", created_at: "2014-05-03 18:03:16", updated_at: "2014-05-03 18:03:16", user_id: 5>
  {% endhighlight %}

 {% highlight bash %}
2.0.0-p451 :071 > p.comments.first
  Comment Load (0.3ms)  SELECT "comments".* FROM "comments" WHERE "comments"."post_id" = ? ORDER BY "comments"."id" ASC LIMIT 1  [["post_id", 4]]
 => #<Comment id: 3, body: "another comment", user_id: 5, post_id: 4, created_at: "2014-05-04 20:43:47", updated_at: "2014-05-04 20:43:47">
  {% endhighlight %}

{% highlight bash %}
2.0.0-p451 :072 > c.post
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."id" = ? LIMIT 1  [["id", 4]]
 => #<Post id: 4, title: "A New Post", body: "A post by Odin himself.", created_at: "2014-05-03 18:03:16", updated_at: "2014-05-03 18:03:16", user_id: 5>
  {% endhighlight %}








