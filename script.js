(function(){
  const TOTAL = 10;
  const track = document.getElementById('track');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const progress = document.getElementById('progress');
  const curNum = document.getElementById('curNum');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let current = 0;
  let isAnimating = false;

  // build progress dots
  for(let i=0;i<TOTAL;i++){
    const d = document.createElement('div');
    d.className = 'dot' + (i===0 ? ' active':'');
    d.addEventListener('click', ()=> goTo(i));
    progress.appendChild(d);
  }
  const dots = Array.from(progress.children);

  function pad(n){ return (n+1) < 10 ? '0'+(n+1) : (n+1); }

  function render(){
    track.style.transform = `translateX(-${current*100}vw)`;
    slides.forEach((s,i)=> s.classList.toggle('active', i===current));
    dots.forEach((d,i)=> d.classList.toggle('active', i===current));
    curNum.textContent = pad(current);
    prevBtn.classList.toggle('hidden', current===0);
    nextBtn.classList.toggle('hidden', current===TOTAL-1);
  }

  function goTo(i){
    if(isAnimating) return;
    i = Math.max(0, Math.min(TOTAL-1, i));
    if(i===current) return;
    current = i;
    isAnimating = true;
    render();
    setTimeout(()=>{ isAnimating=false; }, 1100);
  }
  function next(){ goTo(current+1); }
  function prev(){ goTo(current-1); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // keyboard
  window.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowRight' || e.key==='PageDown'){ next(); }
    else if(e.key==='ArrowLeft' || e.key==='PageUp'){ prev(); }
  });

  // wheel (desktop) - horizontal intent from vertical wheel
  let wheelLock = false;
  window.addEventListener('wheel', (e)=>{
    if(wheelLock) return;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if(Math.abs(delta) < 18) return;
    wheelLock = true;
    if(delta > 0) next(); else prev();
    setTimeout(()=>{ wheelLock=false; }, 750);
  }, {passive:true});

  // touch swipe
  let touchStartX = 0, touchStartY = 0, touching = false;
  window.addEventListener('touchstart', (e)=>{
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touching = true;
  }, {passive:true});
  window.addEventListener('touchend', (e)=>{
    if(!touching) return;
    touching = false;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0) next(); else prev();
    }
  }, {passive:true});

  render();

  // ===== Starfield canvas (ambient, shared) =====
  function initStars(canvas, density){
    const ctx = canvas.getContext('2d');
    let w,h,stars;
    function resize(){
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }
    function build(){
      const count = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / density);
      stars = Array.from({length:count}, ()=>({
        x: Math.random()*w,
        y: Math.random()*h,
        r: Math.random()*1.4 + 0.2,
        a: Math.random()*0.6 + 0.2,
        speed: Math.random()*0.15 + 0.02,
        tw: Math.random()*Math.PI*2
      }));
    }
    function frame(t){
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = '#f0d9a8';
      stars.forEach(s=>{
        s.tw += 0.01;
        const alpha = s.a * (0.6 + 0.4*Math.sin(s.tw));
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r*devicePixelRatio, 0, Math.PI*2);
        ctx.fill();
        s.y += s.speed;
        if(s.y > h) s.y = 0;
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    function setup(){ resize(); build(); }
    window.addEventListener('resize', setup);
    setup();
    requestAnimationFrame(frame);
  }
  initStars(document.getElementById('starCanvas'), 9000);
  const c2 = document.getElementById('starCanvas2');
  if(c2) initStars(c2, 4500);

})();
