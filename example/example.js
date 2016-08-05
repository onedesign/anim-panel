var tl = new TimelineMax({
  onComplete: function() {
    this.play(0);
  }
});
var all = ['#circle', '#square', '#triangle'];

tl.addLabel('intro');

all.forEach(function(item, idx) {
  var itemTl = new TimelineMax({});
  itemTl
    .to(item, 1, {
      y: 80,
      ease: Power4.easeInOut
    }, item)
    .to(item, 1, {
      y: 0,
      ease: Power4.easeInOut
    });

  tl.add(itemTl, idx * 0.15);
});

tl.addLabel('outro')
  .to('.container', 1.5, {
    rotation: 360,
    ease: Power3.easeInOut
  }, 'outro')
  .to('#circle', 1, {
    y: -200,
    ease: Power4.easeInOut
  }, 'outro')
  .to('#triangle', 1, {
    y: 200,
    ease: Power4.easeInOut
  }, 'outro')
  .to(['#circle', '#triangle'], 1, {
    y: 0,
    ease: Power4.easeInOut
  }, 'outro+=1');

new AnimPanel(tl, {
  consoleTime: false
});