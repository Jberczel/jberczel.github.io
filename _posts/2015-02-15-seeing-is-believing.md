---
layout: post
title: Seeing is Believing gem
comments: true
permalink: seeing-is-believing
---

Just thought I'd share a cool little [ gem ](https://github.com/JoshCheek/seeing_is_believing) I came across recently. As
mentioned in the README, it was inspired by Bret Victor's thought-provoking talk [ Inventing on Principle ](https://www.youtube.com/watch?v=PUv66718DII).

The Principle:
> Creators need an immediate connection to what they create.

Seeing is believing acts like a multi-line, editor-based REPL (Read Evaluate Print Loop).
For ruby, think IRB.

<!--more-->

With seeing-is-believing, you can see what you're doing right in the editor. As an example, we can trace through a binary search function:

{% highlight ruby %}

def binary_search(array, target)
  low  = 0                        # => 0
  high = array.length - 1         # => 6
  while low <= high               # => true, true, true
    mid = (low + high) / 2        # => 3, 1, 2
    if array[mid] == target       # => false, false, true
      return mid                  # => 2
    elsif array[mid] < target     # => false, true
      low = mid + 1               # => 2
    elsif array[mid] > target     # => true
      high = mid - 1              # => 2
    end
  end
  nil
end

array = [*'a'..'g']        # => ["a", "b", "c", "d", "e", "f", "g"]
binary_search(array, 'c')  # => 2

{% endhighlight %}


Rather than switching over to irb, we can checkout enumerators in the text editor as well:

{% highlight ruby %}

# Playing around with enumerables and splat operator in this case
[*1..10]              # => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .select(&:even?)    # => [2, 4, 6, 8, 10]
  .map { |i| i * 2 }  # => [4, 8, 12, 16, 20]
  .take(2)            # => [4, 8]

{% endhighlight %}

And here's another example checking out object classes:

{% highlight ruby %}

# Checking out class
[*1..10].class                  # => Array
(1..10).class                   # => Range

{% endhighlight %}

Can I `#map` a range?

{% highlight ruby %}

(1..10).class.included_modules  # => [Enumerable, JSON::Ext::Generator::GeneratorMethods::Object, Kernel]

# Range class includes Enumerable so yes we can
(1..10)               # => 1..10
  .map { |i| i - 5 }  # => [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5]

{% endhighlight %}

Again, the immediate feedback is nice!


