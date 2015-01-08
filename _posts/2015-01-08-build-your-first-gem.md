---
layout: post
title: Build Your First Ruby Gem
comments: true
permalink: build-first-ruby-gem
---

After working through the [Ruby section]( http://www.theodinproject.com/ruby-programming)
of the Odin curriculum, you might want to try writing your own gem. It's good practice and
helps get you familiar with the structure of the code you include in your Rails applications.

I found this [tutorial](http://www.howistart.org/posts/ruby/1) helpful. It's short and to the point.  Follow along, and try to build something simple.

For me, I built a poker ranking [library](https://github.com/Jberczel/holdem) inspired by the [rubyquiz](http://rubyquiz.com/quiz24.html). Feel free to take a look to get an idea on how to get started.

### Example of holdem gem, a poker ranking library
{% highlight ruby %}
require 'holdem'

deck = Deck.new
deck.shuffle!

hand1 = PokerHand.new(deck.deal(7))
hand2 = PokerHand.new(deck.deal(7))
hand3 = PokerHand.new("4c Kc 4h 5d 6s Kd Qs")

puts hand1
# => 5♦ K♣ T♠ J♥ 8♥ 8♠ 2♥ -> Pair of 8s
puts hand2                     # => Q♦ 6♦ 2♦ 6♣ 5♥ 6♠ T♦ -> Three of a Kind (trip 6s)
puts hand3                     # => 4♣ K♣ 4♥ 5♦ 6♠ K♦ Q♠ -> Two Pairs (Ks and 4s)

puts hand1 > hand2             # => false
puts hand2 < hand3             # => false
puts [hand1, hand2, hand3].max # => Q♦ 6♦ 2♦ 6♣ 5♥ 6♠ T♦ -> Three of a Kind (trip 6s)
{% endhighlight %}
