'use strict';
// Soft space ambience and the original MP3 playlist.
const SpaceAudio={
 music:null,musicReady:false,musicPending:false,musicBlocked:false,musicIndex:0,musicPath:0,
 tracks:['Jojo-notre-beau-Petit-mouton.mp3','Des_Maux_dans_mon_viseur.mp3','Je-dis-boum.mp3','Nabandonnejamais.mp3','Ilsuffitpas.mp3','LavoixducielmurmurelAmour.mp3','DansQuelMondeOnVit.mp3','forteresses_de_peur_xT.mp3'],
 prepareMusic(){if(this.music)return;this.music=new Audio();this.music.volume=.24;this.music.preload='none';this.music.addEventListener('ended',()=>{this.musicIndex=(this.musicIndex+1)%this.tracks.length;this.musicBlocked=false;this.loadMusic();this.syncMusic()});this.music.addEventListener('error',()=>{this.musicPending=false;if(this.musicPath<2){this.musicPath++;this.loadMusic();this.syncMusic()}else this.musicBlocked=true});this.loadMusic()},
 loadMusic(){this.music.src=['../music/','../public/music/','music/'][this.musicPath]+this.tracks[this.musicIndex]},
 syncMusic(){if(!this.musicReady)return;this.prepareMusic();if(muted||document.hidden||state==='paused'){this.music.pause();return}if(this.music.paused&&!this.musicPending&&!this.musicBlocked){this.musicPending=true;const promise=this.music.play();if(promise?.then)promise.then(()=>{this.musicPending=false;if(muted||document.hidden||state==='paused')this.music.pause()}).catch(error=>{this.musicPending=false;if(error.name==='NotAllowedError')this.musicBlocked=true});else this.musicPending=false}},
 activeEffects:0,eventTimes:{},master:null,pad:null,jet:null,jetFilter:null,voices:[],lastNote:-1,lastChord:-1,
 init(){if(this.master)return true;try{audio??=new(window.AudioContext||window.webkitAudioContext)();const ctx=audio,master=ctx.createGain(),compressor=ctx.createDynamicsCompressor();master.gain.value=0;compressor.threshold.value=-24;compressor.knee.value=24;compressor.ratio.value=3;compressor.attack.value=.03;compressor.release.value=.4;master.connect(compressor).connect(ctx.destination);this.master=master;
   const pad=ctx.createGain(),low=ctx.createBiquadFilter();pad.gain.value=.34;low.type='lowpass';low.frequency.value=620;low.Q.value=.35;pad.connect(low).connect(master);this.pad=pad;
   [55,82.41,110,164.81].forEach((frequency,i)=>{const o=ctx.createOscillator(),v=ctx.createGain();o.type='sine';o.frequency.value=frequency;o.detune.value=i%2?4:-4;v.gain.value=i===0?.045:.025;o.connect(v).connect(pad);o.start();this.voices.push(o)});
   const breath=ctx.createOscillator(),depth=ctx.createGain();breath.frequency.value=.065;depth.gain.value=.055;breath.connect(depth).connect(pad.gain);breath.start();
   const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);let smooth=0;for(let i=0;i<data.length;i++){smooth=(smooth+Math.random()*.08-.04)/1.025;data[i]=smooth}const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),jet=ctx.createGain();this.noiseBuffer=buffer;noise.buffer=buffer;noise.loop=true;filter.type='lowpass';filter.frequency.value=360;filter.Q.value=.4;jet.gain.value=0;noise.connect(filter).connect(jet).connect(master);noise.start();this.jet=jet;this.jetFilter=filter;
   this.echo=ctx.createDelay(1);this.echo.delayTime.value=.26;const feedback=ctx.createGain(),wet=ctx.createGain(),damp=ctx.createBiquadFilter();feedback.gain.value=.18;wet.gain.value=.17;damp.type='lowpass';damp.frequency.value=900;this.echo.connect(damp).connect(feedback).connect(this.echo);damp.connect(wet).connect(master);return true
  }catch{this.master=null;return false}},
 unlock(){this.musicReady=true;this.musicBlocked=false;this.syncMusic();if(!this.init())return;const p=audio.resume();if(p?.catch)p.catch(()=>{});this.update()},
 quiet(){if(this.music)this.music.pause();if(this.master&&audio)this.master.gain.setTargetAtTime(0,audio.currentTime,.14)},
 update(){this.syncMusic();if(!this.master)return;const active=!muted&&!document.hidden&&state!=='paused',now=audio.currentTime;this.master.gain.setTargetAtTime(active?.28:0,now,.25);let thrust=0;if(active&&state==='playing'){thrust=mode==='adventure'?Math.min(1,Math.hypot(Adventure.thrustX||0,Adventure.thrustY||0)):.3;if(mode==='adventure'&&['warp','entry'].includes(Adventure.phase))thrust=.75}this.jet.gain.setTargetAtTime(thrust*.14,now,.2);this.jetFilter.frequency.setTargetAtTime(260+thrust*240,now,.3);
  if(active&&state==='playing'){if(fuel<20&&now-(this.lastLowFuel??-100)>6){this.lastLowFuel=now;this.event('lowFuel')}if(mode==='adventure'&&['fuel','combat'].includes(Adventure.phase)){const close=(Adventure.mineCells||[]).some(c=>c.mine&&!c.spent&&Math.hypot(Adventure.minePoint(c).x-player.x,Adventure.minePoint(c).y-player.y)<68);if(close&&now-(this.lastMineWarning??-100)>.85){this.lastMineWarning=now;this.event('warning')}}}const chord=Math.floor(clock/20)%3;if(chord!==this.lastChord){this.lastChord=chord;const notes=[[55,82.41,110,164.81],[65.41,98,130.81,196],[58.27,87.31,116.54,174.61]][chord];this.voices.forEach((o,i)=>o.frequency.setTargetAtTime(notes[i],now,3))}},
 note(f=550,d=.1){if(muted||document.hidden||state==='paused')return;if(!this.init())return;const now=audio.currentTime;if(now-this.lastNote<.035)return;this.lastNote=now;const o=audio.createOscillator(),v=audio.createGain(),filter=audio.createBiquadFilter(),duration=Math.max(.14,d*1.8);o.type='sine';o.frequency.setValueAtTime(Math.max(70,Math.min(740,f*.72)),now);o.frequency.exponentialRampToValueAtTime(Math.max(55,Math.min(620,f*.6)),now+duration);filter.type='lowpass';filter.frequency.value=950;v.gain.setValueAtTime(.0001,now);v.gain.exponentialRampToValueAtTime(.07,now+.025);v.gain.exponentialRampToValueAtTime(.0001,now+duration+.2);o.connect(filter).connect(v);v.connect(this.master);v.connect(this.echo);o.start();o.stop(now+duration+.3);o.onended=()=>{o.disconnect();filter.disconnect();v.disconnect()}},
 gesture(){this.musicReady=true;this.musicBlocked=false;this.syncMusic();if(!muted&&(!audio||audio.state==='suspended'))this.unlock()},
 event(name){if(muted||document.hidden||state==='paused'||!this.init())return;const now=audio.currentTime;if(now-(this.eventTimes[name]??-100)<(name==='shoot'?.09:.07))return;this.eventTimes[name]=now;if(name==='mine'){this.mineExplosion();return}
  const sounds={
   shootLaser:[[650,230,.11,.13,'triangle',0]],
   shootTriple:[[520,240,.12,.1,'sine',0],[700,320,.13,.08,'sine',.025],[860,390,.14,.07,'sine',.05]],
   shootMega:[[180,65,.22,.20,'triangle',0],[360,120,.18,.10,'sine',.02]],
   shootBomb:[[140,55,.28,.16,'sine',0]],
   shootMultiple:[[540,260,.14,.11,'triangle',0],[810,390,.16,.08,'sine',.035]],
   shootWave:[[240,740,.22,.13,'sine',0],[480,370,.25,.08,'sine',.04]],
   weaponSwap:[[392,523,.13,.13,'sine',0],[587,784,.18,.11,'sine',.12]],
   rockHit:[[150,62,.12,.15,'triangle',0]],
   bossHit:[[320,90,.075,.20,'sine',0],[580,180,.06,.065,'triangle',.015]],
   shieldHit:[[420,650,.13,.12,'sine',0]],
   shieldBreak:[[600,240,.28,.13,'triangle',0],[900,320,.3,.08,'sine',.08]],
   sparkle:[[740,990,.16,.12,'sine',0]],
   heart:[[330,440,.22,.13,'sine',0],[440,660,.3,.12,'sine',.16]],
   power:[[440,660,.18,.13,'sine',0],[660,880,.25,.1,'sine',.14]],
   launch:[[130,260,.3,.14,'sine',0],[196,392,.35,.1,'sine',.14]],
   stageBoss:[[110,73,.45,.14,'triangle',0],[146,98,.45,.1,'sine',.25],[196,130,.5,.1,'sine',.5]],
   fuel:[[220,330,.18,.15,'sine',0],[330,495,.22,.12,'sine',.13]],
   fuelFull:[[262,392,.3,.15,'sine',0],[392,523,.36,.12,'sine',.15],[523,659,.4,.1,'sine',.3]],
   equip:[[784,784,.10,.19,'sine',0],[1568,1568,.07,.045,'sine',0],[1175,1318,.19,.20,'sine',.14],[2350,2350,.09,.035,'sine',.14]],
   wrong:[[260,220,.2,.12,'triangle',0],[220,174,.25,.1,'sine',.18]],
   coin:[[660,880,.12,.12,'sine',0],[880,660,.16,.07,'sine',.07]],
   donate:[[262,330,.3,.12,'sine',0],[330,440,.4,.1,'sine',.15],[392,523,.5,.08,'sine',.3]],
   impact:[[105,48,.25,.2,'triangle',0]],
   shield:[[330,660,.3,.14,'sine',0],[495,740,.3,.07,'sine',.08]],
   mine:[[72,32,.5,.24,'sine',0],[110,45,.3,.13,'triangle',.03]],
   boss:[[130,87,.5,.14,'triangle',0],[98,65,.6,.12,'sine',.18]],
   push:[[180,55,.65,.15,'sine',0]],
   attack:[[210,135,.18,.13,'triangle',0],[280,180,.14,.08,'sine',.05]],
   bossDefeat:[[270,85,.075,.25,'sine',0],[480,145,.07,.23,'sine',.12],[245,75,.09,.25,'sine',.25]],
   victory:[[262,330,.25,.14,'sine',0],[330,392,.3,.12,'sine',.13],[392,523,.45,.12,'sine',.26]],
   arrival:[[523,392,.35,.12,'sine',0],[392,262,.5,.1,'sine',.2]],
   brake:[[180,70,.2,.1,'sine',0]],
   shoot:[[560,220,.13,.09,'triangle',0]],
   bomb:[[100,35,.6,.2,'sine',0]],
   warning:[[300,285,.12,.07,'sine',0]],
   lowFuel:[[174,164,.2,.08,'sine',0],[174,164,.2,.07,'sine',.3]],
   over:[[196,147,.4,.14,'sine',0],[147,98,.65,.11,'sine',.3]],
   fun:[[330,440,.2,.12,'sine',0],[440,550,.2,.1,'sine',.12],[550,660,.3,.08,'sine',.24]]
  };for(const part of sounds[name]||sounds.fun)this.voice(...part);if(['mine','bomb','impact','push','brake','shield'].includes(name))this.noise(name==='mine'||name==='bomb'?.65:.22,name==='mine'?.19:.09,name==='shield'?1400:500)
 },
 mineExplosion(){
  // Three low pulses: ka / bou / roum, followed by a muffled rolling tail.
  this.voice(110,38,.22,.30,'sine',0);
  this.voice(72,29,.62,.27,'sine',.09);
  this.voice(52,25,1.05,.18,'sine',.26);
  this.voice(125,42,.34,.10,'triangle',.035);
  this.noise(1.3,.29,240);
 },
 voice(from,to,duration,volume,type='sine',delay=0){if(this.activeEffects>=32)return;this.activeEffects++;const t=audio.currentTime+delay,o=audio.createOscillator(),v=audio.createGain(),filter=audio.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(to,t+duration);filter.type='lowpass';filter.frequency.value=1400;v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(volume,t+.018);v.gain.exponentialRampToValueAtTime(.0001,t+duration+.15);o.connect(filter).connect(v);v.connect(this.master);v.connect(this.echo);o.start(t);o.stop(t+duration+.2);o.onended=()=>{o.disconnect();filter.disconnect();v.disconnect();this.activeEffects--}},
 noise(duration,volume,cutoff){const t=audio.currentTime,source=audio.createBufferSource(),v=audio.createGain(),filter=audio.createBiquadFilter();source.buffer=this.noiseBuffer;filter.type='lowpass';filter.frequency.value=cutoff;v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(volume,t+.02);v.gain.exponentialRampToValueAtTime(.0001,t+duration);source.connect(filter).connect(v).connect(this.master);source.start();source.stop(t+duration+.02);source.onended=()=>{source.disconnect();filter.disconnect();v.disconnect()}},
 jump(delay=0){if(muted||document.hidden||!this.init())return;
  // Quick rising "swip", then a longer, downward-filtered "suhhh".
  this.voice(160,980,.17,.16,'sine',delay);
  const now=audio.currentTime+delay,source=audio.createBufferSource(),filter=audio.createBiquadFilter(),v=audio.createGain();source.buffer=this.noiseBuffer;source.loop=true;filter.type='bandpass';filter.Q.value=.65;filter.frequency.setValueAtTime(320,now);filter.frequency.exponentialRampToValueAtTime(2200,now+.16);filter.frequency.exponentialRampToValueAtTime(850,now+.36);filter.frequency.exponentialRampToValueAtTime(130,now+1.85);v.gain.setValueAtTime(.0001,now);v.gain.exponentialRampToValueAtTime(.35,now+.13);v.gain.exponentialRampToValueAtTime(.22,now+.32);v.gain.exponentialRampToValueAtTime(.0001,now+2.05);source.connect(filter).connect(v);v.connect(this.master);v.connect(this.echo);source.start(now);source.stop(now+2.12);source.onended=()=>{source.disconnect();filter.disconnect();v.disconnect()}
 }
};
