---
layout: post
title: Reverse a String in Ruby
comments: true
permalink: reverse-string
---

**Small challenge**: Reverse a string in ruby without using the standard
library `#reverse` method.

There were some interesting comparisons on [ stackoverflow ](http://stackoverflow.com/questions/3057967/reverse-a-string-in-ruby). I decided to write my own solution and run some benchmarks with ruby `2.2.0`.

My reverse function turned out similiar to one of the stackoverflow solutions,
which used `Enumerable#reduce` method combined with `#unshift`ing
(enqueue) characters into a new array.

<!--more-->

However, you can check the stackoverflow discussion as to why this isn't the most
efficient solution (hint: what's happening when you `#unshift` array?).

For practice, I also tried another implementation with `#tap` method.
Here's some more examples:

{% highlight ruby %}
def reverse(s)
  s.chars.reduce([]) { |word, char| word.unshift char }.join
end

class String
  def my_reverse
    word = ""
    chars = self.chars
    length.times {word << chars.pop }
    word
  end

  def my_reverse_with_tap
    "".tap do |word|
      chars = self.chars
      length.times { word << chars.pop }
    end
  end

  def reverse_inplace!
    half_length = self.length / 2
    half_length.times {|i| self[i], self[-i-1] = self[-i-1], self[i] }
    self
  end
end

# quick test
word = "hello world"
word.reverse             # => "dlrow olleh"
reverse(word)            # => "dlrow olleh"
word.my_reverse          # => "dlrow olleh"
word.my_reverse_with_tap # => "dlrow olleh"
word.reverse_inplace!    # => "dlrow olleh"
{% endhighlight %}

And some benchmarks for comparison:

{% highlight ruby %}

require_relative 'reverse_string'
require 'benchmark'

n = 500
lorum = <<EOT
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent quis magna eu
lacus pulvinar vestibulum ut ac ante. Lorem ipsum dolor sit amet, consectetur
adipiscing elit. Suspendisse et pretium orci. Phasellus congue iaculis
sollicitudin. Morbi in sapien mi, eget faucibus ipsum. Praesent pulvinar nibh
vitae sapien congue scelerisque. Aliquam sed aliquet velit. Praesent vulputate
facilisis dolor id ultricies. Phasellus ipsum justo, eleifend vel pretium nec,
pulvinar a justo. Phasellus erat velit, porta sit amet molestie non,
pellentesque a urna. Etiam at arcu lorem, non gravida leo. Suspendisse eu leo
nibh. Mauris ut diam eu lorem fringilla commodo. Aliquam at augue velit, id
viverra nunc.
EOT

lorum *= 10

Benchmark.bmbm(5) do |b|
  b.report("standard library reverse") { n.times do; lorum.reverse; end }
  b.report("reverse function") { n.times do; reverse(lorum); end }
  b.report("reverse method") { n.times do; lorum.my_reverse; end }
  b.report("reverse method with tap") { n.times do; lorum.my_reverse_with_tap; end }
  b.report("reverse inplace") { n.times do; lorum.reverse_inplace!; end }
end
{% endhighlight %}

**Results**

{% highlight bash %}

Rehearsal ------------------------------------------------------------
standard library reverse   0.000000   0.000000   0.000000 (  0.002172)
reverse function           1.000000   0.000000   1.000000 (  0.995974)
reverse method             0.870000   0.000000   0.870000 (  0.876662)
reverse method with tap    0.900000   0.000000   0.900000 (  0.900853)
reverse inplace            4.760000   0.010000   4.770000 (  4.766830)
--------------------------------------------------- total: 7.540000sec

                               user     system      total        real
standard library reverse   0.000000   0.000000   0.000000 (  0.002304)
reverse function           1.010000   0.000000   1.010000 (  1.010974)
reverse method             0.880000   0.000000   0.880000 (  0.877761)
reverse method with tap    0.890000   0.000000   0.890000 (  0.895835)
reverse inplace            4.690000   0.000000   4.690000 (  4.692113)

{% endhighlight %}

Overall, it looks like the standard library `#reverse` method is
signficantly faster. 

The reverse with `#tap` didn't seem to have much of a performance hit compared to the other reverse method.

And lastly, I was expecting the reverse function (using `#unshift`) to take much
longer than it did. Supposedly, the `#unshift` causes the solution to be
O(n^2) since characters have to be shifted in array for each iteration. I'll have to investigate this further.

**EDIT**: Checked with @Marc-André Lafortune on stackoverflow, and it looks like "Ruby now [optimizes]( https://github.com/ruby/ruby/commit/fdbd3716781817c8) for successive unshifts and pre allocates some memory to avoid moving all elements". This helps to explain the different benchmark results using ruby `2.2.0`.
