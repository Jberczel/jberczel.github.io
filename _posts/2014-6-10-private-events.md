---
layout: post
title: Private Events Project
comments: true
permalink: private-events
---

Course: Course List >> Ruby on Rails >> Advanced Forms and Active Record >> [Project: Associations](http://www.theodinproject.com/ruby-on-rails/associations)

##Objective:
>...build a site similar to a private [Eventbrite](http://www.eventbrite.com) which allows users to create events and then manage user signups. 

There's countless ways to customize and implement this project, so rather than doing a step-by-step walkthrough, I decided to deploy a [demo](http://privent.herokuapp.com) and describe how I set up the models and associations.

I used twitter bootstrap to work on CSS styling. I saved the extra credit (sending and accepting invites to/from users) for a later date.

<!--more-->

---

##Model Associations:

1. [User](#step1)
2. [Events](#step2)
3. [Invites](#step3)
4. [Verify Associations](#step4)

The primary focus of this project is to build associations between a `User` and `Events` models as well as a 'through' model I named `Invites`.  I plan to discuss each model; below is a snapshot of the models and associations at the end of the project:

{% highlight ruby %}
class User < ActiveRecord::Base
  has_many :events, :foreign_key => :creator_id

  has_many :invites, :foreign_key => :attendee_id
  has_many :attended_events, :through => :invites

  before_create :create_remember_token

  def upcoming_events
    self.attended_events.upcoming
  end

  def previous_events
    self.attended_events.past
  end

  def attending?(event)
    event.attendees.include?(self)
  end

  def attend!(event)
    self.invites.create!(attended_event_id: event.id)
  end

  def cancel!(event)
    self.invites.find_by(attended_event_id: event.id).destroy
  end

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

{% highlight ruby %}
class Event < ActiveRecord::Base
  belongs_to :creator, :class_name => "User"

  has_many :invites, :foreign_key => "attended_event_id"
  has_many :attendees, :through => :invites

  scope :upcoming, -> { where("Date >= ?", Date.today).order('Date ASC') }
  scope :past, -> { where("Date < ?", Date.today).order('Date DESC') }

end
{% endhighlight %}


{% highlight ruby %}
class Invite < ActiveRecord::Base
  belongs_to :attendee, class_name: "User"
  belongs_to :attended_event, class_name: "Event"

  validates :attendee_id, presence: true
  validates :attended_event_id, presence: true
end
{% endhighlight %}

<a name="step1"></a>
##User Model

A user can create many events and attend many events, so there are two types of `has_many` relationships with the `Event` model: user being a creator and/or user attending an event.  

We create a `creator_id` field in the `Event` model, so that each event has one creator (user). We could've created a `user_id` field in the `Event` model, but in this case, we're more explicit by naming it `creator_id`.

The `creator_id` is a foreign key, which links to the `user_id` from the `User` model.  

{% highlight ruby %}
class User < ActiveRecord::Base
  has_many :events, :foreign_key => :creator_id
  ...
{% endhighlight %}

When a user attends an event, we use an association through the `Invite` model.  This is because an event can have many attendees, which is different than having only one creator. 

{% highlight ruby %}
class User < ActiveRecord::Base
  ...
  has_many :invites, :foreign_key => :attendee_id
  has_many :attended_events, :through => :invites
  ...
{% endhighlight %}


The methods you see in the `User` model class are used to query data and build/destroy associations. They are used in the views and should make more sense after building out the `Event` and `Invite` models.

{% highlight ruby %}
def upcoming_events
    self.attended_events.upcoming
  end

  def previous_events
    self.attended_events.past
  end

  def attending?(event)
    event.attendees.include?(self)
  end

  def attend!(event)
    self.invites.create!(attended_event_id: event.id)
  end

  def cancel!(event)
    self.invites.find_by(attended_event_id: event.id).destroy
  end
{% endhighlight %}

<a name="step2"></a>
##Event Model

In the `User` model, we created the `has_many` relationship between the `User` and `Event` models.  Now, we build the other side of the relationship where an `Event` `belongs_to` a creator (`User`).  Rails knows to look for `creator_id` field when you include the line below:

{% highlight ruby %}
class Event < ActiveRecord::Base
  belongs_to :creator, :class_name => "User"
  ...
{% endhighlight %}

An `Event` has many `Users` (`attendees`), through `invites`.  Note that the `Invite` model allows us to have two `has_many` relationships: a user has many events, and an event has many users.

{% highlight ruby %}
class Event < ActiveRecord::Base
  ...
  has_many :invites, :foreign_key => "attended_event_id"
  has_many :attendees, :through => :invites
  ...
{% endhighlight %}

We use scopes to query for upcoming and past events in our application.  We use these scopes in some of the methods defined in the `User` model, to pull a specific user's upcoming and past events.

{% highlight ruby %}
class Event < ActiveRecord::Base
  ...
  scope :upcoming, -> { where("Date >= ?", Date.today).order('Date ASC') }
  scope :past, -> { where("Date < ?", Date.today).order('Date DESC') }

end
{% endhighlight %}

<a name="step3"></a>
##Invite Model

{% highlight ruby %}
class Invite < ActiveRecord::Base
  belongs_to :attendee, class_name: "User"
  belongs_to :attended_event, class_name: "Event"
  ...
end
{% endhighlight %}

The `Invite` model brings the `User` and `Event` models together, where a user can have (attend) many events, and events can have many users (attendees).  This puts our associations all together.  Finally, we can verify that the assocations are working correctly.

<a name="step4"></a>
## Verify Associations

From the command line, you should be able retrieve `events` a user has created as well as build new events.  Note that I have already populated data.

{% highlight bash %}
2.0.0-p451 :001 > u = User.first
  User Load (0.1ms)  SELECT "users".* FROM "users" ORDER BY "users"."id" ASC LIMIT 1
 => #<User id: 1, name: "Thor", email: "thor@email.com", created_at: "2014-06-02 14:17:19", updated_at: "2014-06-02 14:17:19", remember_token: "b8e3bd3a092332d40b7b1b7c46b85c49cc635a62">
2.0.0-p451 :002 > u.events
  Event Load (1.5ms)  SELECT "events".* FROM "events" WHERE "events"."creator_id" = ?  [["creator_id", 1]]
 => #<ActiveRecord::Associations::CollectionProxy [#<Event id: 1, location: "9750 Pfeffer Locks", date: "2013-09-03", created_at: "2014-06-02 14:17:19", updated_at: "2014-06-02 14:17:19", creator_id: 1, description: "Rem quia dicta rerum velit aspernatur molestiae non...", title: "Grimes Group's event">, #<Event id: 6, location: "7352 Marquardt Union", date: "2015-01-16", created_at: "2014-06-02 14:17:19", updated_at: "2014-06-02 14:17:19", creator_id: 1, description: "Quae consequatur dolor labore voluptatum soluta. As...", title: "Larkin, Nicolas and Wuckert's event">]>
2.0.0-p451 :003 > u.events.build
 => #<Event id: nil, location: nil, date: nil, created_at: nil, updated_at: nil, creator_id: 1, description: nil, title: nil>
2.0.0-p451 :004 >

{% endhighlight %}

You should be able to retrieve `invites` as well as `attended_events` from the command line:

{% highlight bash %}
2.0.0-p451 :004 > u.invites
  Invite Load (1.5ms)  SELECT "invites".* FROM "invites" WHERE "invites"."attendee_id" = ?  [["attendee_id", 1]]
 => #<ActiveRecord::Associations::CollectionProxy [#<Invite id: 1, attendee_id: 1, attended_event_id: 10, created_at: "2014-06-02 14:17:19", updated_at: "2014-06-02 14:17:19">, #<Invite id: 2, attendee_id: 1, attended_event_id: 7, created_at: "2014-06-02 14:17:19", updated_at: "2014-06-02 14:17:19">]>
2.0.0-p451 :005 > u.attended_events
  Event Load (0.6ms)  SELECT "events".* FROM "events" INNER JOIN "invites" ON "events"."id" = "invites"."attended_event_id" WHERE "invites"."attendee_id" = ?  [["attendee_id", 1]]
 => #<ActiveRecord::Associations::CollectionProxy [#<Event id: 7, location: "46647 Boyle Isle", date: "2015-04-18", created_at: "2014-06-02 14:17:19", updated_at: "2014-06-02 14:17:19", creator_id: 2, description: "Consequatur aliquid ut consequatur. Accusantium fac...", title: "Bogan and Sons's event">, #<Event id: 10, location: "8330 Hartmann Ways", date: "2015-02-08", created_at: "2014-06-02 14:17:19", updated_at: "2014-06-02 14:17:19", creator_id: 5, description: "Expedita velit molestiae. Corporis qui alias ut omn...", title: "Conn, Paucek and Conn's event">]>
2.0.0-p451 :006 >

{% endhighlight %}

Note, the `invites` do not give you much information.  Rather, you really want the information from `attended_events` (through the invites association).

Check `upcoming` and `past` scopes:

{% highlight bash %}
2.0.0-p451 :001 > e = Event.all
  Event Load (2.5ms)  SELECT "events".* FROM "events"
...
2.0.0-p451 :002 > e.upcoming
  Event Load (0.4ms)  SELECT "events".* FROM "events" WHERE (Date >= '2014-06-11') ORDER BY Date ASC
 => #<ActiveRecord::Relation [#<Event id: 9, location: "3577 Declan Cove", date: "2014-08-15", created_at: "2014-06-02 14:17:19", updated_at: "2014-06-02 14:17:19", creator_id: 4, description: "Explicabo eaque molestias sit. Molestiae est sapien...", title: "McKenzie Group's event">, #<Event id: 6, location: "7352 Marquardt Union", date: "2015-01-16", created_at: "2014-06-02 14:17:19"
...
2.0.0-p451 :003 > e.past
  Event Load (0.3ms)  SELECT "events".* FROM "events" WHERE (Date < '2014-06-11') ORDER BY Date DESC
 => #<ActiveRecord::Relation [#<Event id: 4, location: "89806 Hermann Drive", date: "2014-03-13", created_at: "2014-06-02 14:17:19", updated_at: "2014-06-02 14:17:19", creator_id: 4, description: "Magni ad commodi quibusdam aperiam rerum tempore.
...
{% endhighlight %}

And lastly verify that you can get event's creator and attendees:

{% highlight bash %}
2.0.0-p451 :004 > e = Event.first
  Event Load (0.3ms)  SELECT "events".* FROM "events" ORDER BY "events"."id" ASC LIMIT 1
 => #<Event id: 1,
...
2.0.0-p451 :006 > e.creator.name
 => "Thor"
...
2.0.0-p451 :009 > e.attendees.each { |a| puts a.name }
Garrett Kuvalis
Marvin Klocko
Yasmine Brakus
Carli Littel
Jordane Harvey Sr.

{% endhighlight %}

At this point, we have built the models and associations. The rest of the project is building the user interface.


