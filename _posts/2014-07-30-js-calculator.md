---
layout: post
title: Javascript Calculator
comments: true
permalink: js-calculator
---

![calculator example](/assets/calculator.png) 

Course List >> Javascript and jQuery >> The Basics and the Browser >> 
[Project: On Screen Calculator](http://www.theodinproject.com/javascript-and-jquery/on-screen-calculator)

<!--more-->

##Objective:
>Build an on-screen calculator with javascript.

If you've been following the curriculum, then it's been awhile since you've looked 
at javascript.  

We learned the basics in the Web Development 101 course.  In this
project, you get to refresh and apply those basics. In terms of difficulty, the
calculator project is comparable 
to the jQuery [sketch-a-pad](http://www.theodinproject.com/web-development-101/javascript-and-jquery)
project, which seemed to be very popular in the Web Dev 101 track.

To see a working version of a javascript calculator, you can check out my [demo](http://jsfiddle.net/Jberczel/3f3SG/).



My primary objective of this project is the flex your javascript muscles. But after building 
the functionality with javascript, you can have fun designing the calculator with CSS.  As an example, 
I used the Braun/Apple [calculator](http://www.cultofmac.com/188753/the-braun-products-that-inspired-apples-iconic-designs-gallery/). Recreating the model from scratch is a fun way to learn CSS.

Also, I went on auto-pilot and automatically used jQuery on this project. There's not much going on in terms
of interactivity, so you might want to try and code in pure vanilla javascript.


##Basic Steps:

1. [Build content with HTML](#step1)
2. [Build interactivity with Javascript](#step2)
3. [Build presentation with CSS](#step3)

<a name="step1"></a>
## Step 1: HTML

First thing I did was build the calculator buttons and screen with HTML using `<div>`s.

Then, I added IDs and classes to distinguish between the numbers, operators, and screen.
This allows us to style based on each `<div>`'s class or id.  Also, it lets us bind
event handlers to specific buttons, so that when a user clicks on them, some action
is performed.

Below is the basic structure of the html file.

{% highlight html %}
<div class="container">

<div id="screen">0</div>
<div class="keys">m+</div>
<div class="keys">m-</div>
<div class="keys">mr</div>
<div class="keys operator">%</div>

<div class="keys numpad">7</div>
<div class="keys numpad">8</div>
<div class="keys numpad">9</div>
<div class="keys operator">x</div>

<div class="keys numpad">4</div>
<div class="keys numpad">5</div> 
<div class="keys numpad">6</div>
 <div class="keys operator">+</div>

<div class="keys numpad">1</div>
<div class="keys numpad">2</div>
<div class="keys numpad">3</div>
<div class="keys operator">-</div>

<div class="keys numpad">0</div>
<div class="keys numpad">.</div>
<div class="keys" id="clear">C</div>
<div class="keys" id="equals">=</div>
</div>

{% endhighlight %}

<a name="step2"></a>
## Step 2: Javascript

This is where all the functionality occurs when user clicks buttons.  I will do a
brief run down of each section of code.

**Variables**

{% highlight js %}
var num1 = [],
    num2 = [],
    operand = null,
    solved = false,
    $screen = $("#screen");
{% endhighlight %}

`num1` and `num2` are arrays that store numbers when a user clicks on buttons. The
reason they are arrays is because a user might click the `1` button twice, so each
click will get stored in the array as `['1', '1']`.  Later, and more specifically, 
after user clicks on an operator (+, -, *, %), then we can combine those clicks and 
convert `num1` from an array to a number.  That is `['1', '1']` will convert to the
integer `11`.

`operand` will store which operator (+, -, *, %) user clicks.

`solved` will keep track if user has already made a calculation.  This will be helpful
for when user enters erroneous order of operation, or if they want to keep clicking
`=` button to continue performing operation.  For example they can input 100 / 2, 
which output 50.  User should be able to hit enter again, which would about 25.

`$screen` variable is a cached version of a jQuery object.  It's not necessary for small 
project like this, but general rule is use cached variable if you're going to repeatedly 
call a jQuery selector.

**Helper Functions**

Below are several helper functions I use in the event handlers (checking for 
user clicks).  

{% highlight js %}
function setOperand(symbol) {
  if (!operand) {   
    operand = symbol.replace("x", "*").replace("%", "/");
    $screen.html(num1.join('') + operand);
  }
}

function clear() {
  num1 = [];
  num2 = [];
  operand = null;
  solved = false;
  $screen.html(0);
}

function formatNum(num) {
  return (num % 1 === 0) ? num : num.toFixed(4);
}
{% endhighlight %}

`setOperand` function sets the `operand` variable we declared earlier to the variable
`symbol`.  I used different symbols for multiplication and division, so I have to 
replace them, so javascript can perform calculation, using correct syntax.

`clear` basically resets all variables.

`formatNum` function truncates any numbers with decimals to 4 decimal points.

**Event Handlers**


TODO:
{% highlight js %}


{% endhighlight %}


<a name="step3"></a>

## Step 3: CSS

I used Shay Howe's CSS [guide](http://learn.shayhowe.com/html-css/) as a reference
anytime I stumbled or became confused about positioning, box model, etc..  I highly 
recommend reading sections of his guide and then applying concepts to this project.

If you read his guide, the CSS in this project should make sense.  You'll probably
notice other ways to style the calculator as well.





