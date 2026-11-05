const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let count=0,sound=true,sparkles=true,intensity=6,audioCtx=null;
function beep(freq=520,duration=.09,type='sine'){
 if(!sound)return;
 try{
  audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended') audioCtx.resume();
  const now=audioCtx.currentTime;
  const o=audioCtx.createOscillator(),g=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();
  o.type=type; o.frequency.setValueAtTime(freq,now);
  o.frequency.exponentialRampToValueAtTime(Math.max(75,freq*.48),now+duration);
  filter.type='lowpass';filter.frequency.setValueAtTime(2600,now);
  g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.095,now+.012);
  g.gain.exponentialRampToValueAtTime(.0001,now+duration);
  o.connect(filter);filter.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+duration+.015);
  // A soft upper harmonic adds a glossy, toy-like sparkle.
  const o2=audioCtx.createOscillator(),g2=audioCtx.createGain();
  o2.type='sine';o2.frequency.setValueAtTime(freq*2.02,now);
  g2.gain.setValueAtTime(.0001,now);g2.gain.exponentialRampToValueAtTime(.025,now+.008);
  g2.gain.exponentialRampToValueAtTime(.0001,now+duration*.65);
  o2.connect(g2);g2.connect(audioCtx.destination);o2.start(now);o2.stop(now+duration);
 }catch(e){}
}
function squishSound(index){
 const sounds=[
  [720,.12,'sine'],[390,.19,'triangle'],[560,.15,'sine'],[250,.22,'sawtooth'],
  [880,.10,'triangle'],[470,.16,'sine'],[620,.18,'triangle'],[340,.20,'sine']
 ];
 const s=sounds[index % sounds.length];beep(...s);
}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1300)}
function bump(){count++;$('#squishCount').textContent=String(count).padStart(3,'0')}
function burst(x,y,n=8){if(!sparkles)return;for(let i=0;i<n;i++){const p=document.createElement('i');p.className='spark';p.style.left=x+'px';p.style.top=y+'px';const a=Math.random()*Math.PI*2,d=25+Math.random()*65;p.style.setProperty('--dx',Math.cos(a)*d+'px');p.style.setProperty('--dy',Math.sin(a)*d+'px');document.body.append(p);setTimeout(()=>p.remove(),700)}}
document.addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--mx',e.clientX+'px');document.documentElement.style.setProperty('--my',e.clientY+'px');const b=e.target.closest('.btn');if(b){const r=b.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/r.width,y=(e.clientY-r.top-r.height/2)/r.height;b.style.setProperty('--tx',x*intensity*.55+'px');b.style.setProperty('--ty',y*intensity*.55+'px')}});
document.addEventListener('pointerout',e=>{const b=e.target.closest?.('.btn');if(b){b.style.setProperty('--tx','0px');b.style.setProperty('--ty','0px')}});
$$('[data-squish]').forEach((b,index)=>{b.addEventListener('click',e=>{bump();squishSound(index);toast(b.dataset.squish);burst(e.clientX,e.clientY,10);b.animate([{transform:'scale(1)'},{transform:'scale(.86,1.12)'},{transform:'scale(1.06,.94)'},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.2,.9,.25,1.5)'})})});
$('#intensity').addEventListener('input',e=>{intensity=+e.target.value;$('#intensityValue').textContent=intensity+' / 10'});
$('#sparkToggle').onclick=()=>{$('#sparkToggle').classList.toggle('on');sparkles=$('#sparkToggle').classList.contains('on');toast(sparkles?'Sparkles on ✨':'Sparkles off')};
$('#soundToggle').onclick=()=>{sound=!sound;$('#soundToggle').textContent=sound?'♫':'♪';toast(sound?'Sound on':'Sound off')};
$('#themeToggle').onclick=()=>{document.body.classList.toggle('soft');$('#themeToggle').textContent=document.body.classList.contains('soft')?'☾':'☼'};
$('#jumpBtn').onclick=()=>$('#play').scrollIntoView({behavior:'smooth'});
const moods=['✨ Cozy','🌈 Playful','🪷 Serene','🔥 Hype','☁️ Dreamy','🍓 Sweet'];$('#moodBtn').onclick=()=>{$('#mood').textContent=moods[Math.floor(Math.random()*moods.length)];beep(700,.12)};
$('#surpriseBtn').onclick=()=>{const b=$$('[data-squish]')[Math.floor(Math.random()*4)];b.click();$('#play').scrollIntoView({behavior:'smooth'})};
$('#heroBlob').addEventListener('pointermove',e=>{const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;e.currentTarget.style.background=`radial-gradient(circle at ${x*100}% ${y*100}%,#fff 0 2%,#ffffff66 9%,transparent 25%),radial-gradient(circle at 68% 75%,#6ae4ff 0,transparent 40%),linear-gradient(135deg,#ff9acb,#a18cff 52%,#6edaf1)`});
$('#heroBlob').onclick=e=>{bump();beep(390,.15,'sine');burst(e.clientX,e.clientY,16);e.currentTarget.animate([{scale:1},{scale:'.82 1.12'},{scale:'1.08 .92'},{scale:1}],{duration:550})};

const modal=$('#modal'),area=$('#gameArea'),start=$('#gameStart');let game='',timer=null,gameState={};
function openGame(name){game=name;modal.classList.add('open');clearInterval(timer);$('#gameStatLeft').textContent='';$('#gameStatRight').textContent='';start.style.display='';start.textContent="Let's go!";
if(name==='bubble'){$('#modalTitle').textContent='Bubble bonanza';$('#gameDescription').textContent='Pop every bubble you can in 20 seconds. Ready, set, pop!';area.innerHTML='<div class="game-help">Press “Let’s go!” to start your bubble storm.</div>'}
if(name==='reaction'){$('#modalTitle').textContent='Reflex rush';$('#gameDescription').textContent='Tap the pad as soon as it turns green. Don’t jump the gun!';area.innerHTML='<div class="game-help">Your best reaction time is the goal.</div>'}
if(name==='memory'){$('#modalTitle').textContent='Memory match';$('#gameDescription').textContent='Find all 8 matching pairs. Flip two tiles at a time.';area.innerHTML='<div class="game-help">Ready to give your memory a little workout?</div>'}}
$$('[data-game]').forEach(b=>b.onclick=()=>openGame(b.dataset.game));
$('#closeModal').onclick=()=>{modal.classList.remove('open');clearInterval(timer)};modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.remove('open');clearInterval(timer)}});
start.onclick=()=>{start.style.display='none';if(game==='bubble')startBubble();if(game==='reaction')startReaction();if(game==='memory')startMemory()};
function startBubble(){let score=0,left=20;area.innerHTML='<div class="bubble-field" id="bubbleField"></div>';const field=$('#bubbleField');$('#gameStatLeft').textContent='Popped: 0';$('#gameStatRight').textContent='Time: 20s';function add(){if(!field)return;const b=document.createElement('button');b.className='bubble';const s=24+Math.random()*43;b.style.width=s+'px';b.style.height=s+'px';b.style.left=Math.random()*(field.clientWidth-s)+'px';b.style.top=Math.random()*(field.clientHeight-s)+'px';b.setAttribute('aria-label','Pop bubble');b.onclick=()=>{score++;$('#gameStatLeft').textContent='Popped: '+score;beep(500+Math.random()*300,.06);burst(innerWidth/2,innerHeight/2,3);b.remove()};field.append(b);setTimeout(()=>b.remove(),2600)}for(let i=0;i<9;i++)add();const spawn=setInterval(add,380);timer=setInterval(()=>{left--;$('#gameStatRight').textContent='Time: '+left+'s';if(left<=0){clearInterval(timer);clearInterval(spawn);field.innerHTML=`<div class="game-help"><h2 style="color:white;font-size:38px;margin:0">${score}</h2>bubbles popped!<br>That's a whole lot of happy.</div>`;start.style.display='';start.textContent='Play again';}},1000)}
function startReaction(){let phase='wait',began=0,delay=1200+Math.random()*2600;area.innerHTML='<button class="reaction-pad wait" id="reactionPad">Wait for green…</button>';const pad=$('#reactionPad');$('#gameStatLeft').textContent='Best: —';$('#gameStatRight').textContent='';pad.onclick=()=>{if(phase==='wait'){phase='early';clearTimeout(change);pad.textContent='Too soon! Try again';pad.className='reaction-pad wait';start.style.display='';start.textContent='Try again'}else if(phase==='ready'){const ms=Math.round(performance.now()-began);phase='done';pad.textContent=ms+' ms — nice!';$('#gameStatLeft').textContent='Reaction: '+ms+' ms';beep(800,.13);start.style.display='';start.textContent='Try again'}};const change=setTimeout(()=>{if(phase!=='wait')return;phase='ready';began=performance.now();pad.className='reaction-pad ready';pad.textContent='TAP NOW!';beep(650,.08)},delay)}
function startMemory(){const icons=['🍓','🍋','🍇','🍒','🍉','🍍','🥝','🫐'];const deck=[...icons,...icons].sort(()=>Math.random()-.5);let first=null,lock=false,matches=0,moves=0;area.innerHTML='<div class="memory-grid" id="memoryGrid"></div>';const grid=$('#memoryGrid');$('#gameStatLeft').textContent='Pairs: 0 / 8';$('#gameStatRight').textContent='Moves: 0';deck.forEach((v,i)=>{const b=document.createElement('button');b.className='memory-tile';b.textContent='?';b.onclick=()=>{if(lock||b.classList.contains('revealed')||b.classList.contains('matched'))return;b.textContent=v;b.classList.add('revealed');beep(440,.05);if(!first){first={b,v};return}moves++;$('#gameStatRight').textContent='Moves: '+moves;if(first.v===v){first.b.classList.add('matched');b.classList.add('matched');first=null;matches++;$('#gameStatLeft').textContent='Pairs: '+matches+' / 8';beep(780,.1);if(matches===8){area.insertAdjacentHTML('beforeend','<div class="game-help" style="grid-column:1/-1">All matched! You did it in '+moves+' moves 🎉</div>');start.style.display='';start.textContent='Play again'}}else{lock=true;const prev=first.b;first=null;setTimeout(()=>{prev.textContent='?';b.textContent='?';prev.classList.remove('revealed');b.classList.remove('revealed');lock=false},750)}};grid.append(b)})}
