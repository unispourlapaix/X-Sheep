'use strict';
// Tilt uses relative orientation (accelerometer/gyroscope), with no compass or network data.
const Tilt={
 enabled:false,ready:false,pending:true,attempted:false,raw:null,neutral:null,filtered:{x:0,y:0},lastReading:0,lastFilter:0,timer:null,pausedForPanel:false,
 settings:{wanted:true,sensitivity:1.2,deadzone:2,invertX:false,invertY:false},
 now(){return Date.now()},
 init(){try{const s=JSON.parse(localStorage.getItem('xsheep-tilt-settings')||'null');if(s){this.settings={...this.settings,...s};this.settings.sensitivity=clamp(Number(this.settings.sensitivity)||1.2,.5,3);this.settings.deadzone=clamp(Number(this.settings.deadzone)||0,0,8)}}catch{}
  this.listener=e=>this.read(e);$('motion-settings').onclick=()=>this.open();$('motion-close').onclick=()=>this.close();$('motion-enable').onclick=()=>this.enable();$('motion-disable').onclick=()=>this.disable();$('motion-calibrate').onclick=()=>this.calibrate();
  for(const key of ['sensitivity','deadzone','invertX','invertY']){$('tilt-'+key).addEventListener('input',()=>{const el=$('tilt-'+key);this.settings[key]=el.type==='checkbox'?el.checked:Number(el.value);this.save();this.render()})}
  $('motion-panel').addEventListener('cancel',()=>{if(this.pausedForPanel&&state==='paused')pause();this.pausedForPanel=false});
  window.addEventListener('blur',()=>{this.filtered={x:0,y:0};this.lastReading=0});window.addEventListener('orientationchange',()=>this.recenter());window.screen?.orientation?.addEventListener('change',()=>this.recenter());this.status(I18n.t("Inclinaison prête à activer sur un appareil compatible."));this.render();
 },
 save(){try{localStorage.setItem('xsheep-tilt-settings',JSON.stringify(this.settings))}catch{}},
 onPlay(){if(this.settings.wanted&&!this.enabled&&!this.attempted&&(window.matchMedia?.('(pointer: coarse)').matches||typeof window.DeviceOrientationEvent?.requestPermission==='function'))this.enable()},
 async enable(){if(this.enabled){this.calibrate();return}this.attempted=true;
  if(window.isSecureContext===false){this.status(I18n.t("Capteurs bloqués : ouvrir le jeu en HTTPS sur le téléphone. Clavier et tactile disponibles."));return false}
  const api=window.DeviceOrientationEvent;if(!api){this.status(I18n.t("Ce navigateur ne fournit pas les capteurs d’inclinaison. Utilise le tactile ou le clavier."));return false}
  try{if(typeof api.requestPermission==='function'){const result=await api.requestPermission();if(result!=='granted'){this.settings.wanted=false;this.save();this.status(I18n.t("Accès aux capteurs refusé. Tu peux réessayer ici ou jouer au doigt."));return false}}
   this.enabled=true;this.ready=false;this.pending=true;this.raw=null;this.lastReading=0;this.filtered={x:0,y:0};this.settings.wanted=true;this.save();window.addEventListener('deviceorientation',this.listener);this.status(I18n.t("En attente du capteur… Tiens le téléphone comme pour jouer."));this.render();
   this.timer=setTimeout(()=>{if(this.enabled&&!this.ready)this.status(I18n.t("Aucune donnée reçue. Vérifie l’accès aux capteurs, ou utilise le tactile / clavier."));},4000);return true
  }catch{this.enabled=false;this.ready=false;this.status(I18n.t("Activation impossible. Vérifie les permissions du navigateur puis réessaie."));return false}
 },
 disable(){window.removeEventListener('deviceorientation',this.listener);clearTimeout(this.timer);this.enabled=this.ready=false;this.filtered={x:0,y:0};this.settings.wanted=false;this.save();this.status(I18n.t("Inclinaison désactivée. Clavier et tactile disponibles."));this.render()},
 recenter(){this.pending=true;this.ready=false;this.filtered={x:0,y:0};if(this.enabled)this.status(I18n.t("Orientation changée : garde la position pour recalibrer."))},
 calibrate(){if(!this.enabled){this.status(I18n.t("Active d’abord les capteurs."));return}if(!this.raw||this.now()-this.lastReading>1200){this.pending=true;this.status(I18n.t("En attente de données pour calibrer."));return}this.neutral={...this.raw};this.pending=false;this.filtered={x:0,y:0};this.lastFilter=this.now();this.status(I18n.t("Calibré. Incline à gauche / droite et vers l’avant / l’arrière."));this.render()},
 angle(){return Number(window.screen?.orientation?.angle??window.orientation??0)*Math.PI/180},
 read(e){if(!this.enabled||typeof e.beta!=='number'||typeof e.gamma!=='number'||!Number.isFinite(e.beta)||!Number.isFinite(e.gamma))return;const now=this.now();this.raw={beta:e.beta,gamma:e.gamma};this.lastReading=now;
  if(this.pending||!this.neutral){this.neutral={...this.raw};this.pending=false;this.filtered={x:0,y:0};this.lastFilter=now;this.status(I18n.t("Calibré. Incline le téléphone pour piloter."));}
  this.ready=true;let db=((e.beta-this.neutral.beta+540)%360)-180,dg=((e.gamma-this.neutral.gamma+540)%360)-180,a=this.angle();let x=dg*Math.cos(a)+db*Math.sin(a),y=db*Math.cos(a)-dg*Math.sin(a);
  const axis=v=>{const n=Math.max(0,Math.abs(v)-this.settings.deadzone)/20*this.settings.sensitivity;return clamp(Math.sign(v)*n,-1,1)};x=axis(x)*(this.settings.invertX?-1:1);y=axis(y)*(this.settings.invertY?-1:1);
  const alpha=1-Math.exp(-clamp((now-this.lastFilter)/1000,.008,.2)/.1);this.filtered.x+=(x-this.filtered.x)*alpha;this.filtered.y+=(y-this.filtered.y)*alpha;this.lastFilter=now;this.renderLive();
 },
 vector(){if(!this.enabled||!this.ready||this.now()-this.lastReading>1200||document.hidden)return null;return {...this.filtered}},
 status(message){$('motion-status').textContent=message},
 renderLive(){$('tilt-dot').style.transform=I18n.t(`translate(${Math.round(this.filtered.x*43)}px,${Math.round(this.filtered.y*43)}px)`);$('tilt-live').textContent=I18n.t("X ")+Math.round(this.filtered.x*100)+I18n.t("% · Y ")+Math.round(this.filtered.y*100)+'%';$('motion-settings').textContent=this.enabled&&this.ready?I18n.t("INCLINAISON ON"):I18n.t("INCLINAISON");$('motion-settings').setAttribute?.('aria-pressed',String(this.enabled&&this.ready))},
 render(){for(const key of ['sensitivity','deadzone','invertX','invertY']){const el=$('tilt-'+key);if(key.startsWith('invert'))el.checked=!!this.settings[key];else el.value=this.settings[key]}$('sensitivity-value').textContent=Number(this.settings.sensitivity).toFixed(1)+'×';$('deadzone-value').textContent=this.settings.deadzone+'°';$('motion-enable').disabled=this.enabled;$('motion-disable').disabled=!this.enabled;$('motion-calibrate').disabled=!this.enabled;this.renderLive()},
 open(){this.pausedForPanel=state==='playing';if(this.pausedForPanel)pause();$('motion-panel').showModal();this.render()},
 close(){$('motion-panel').close();if(this.pausedForPanel&&state==='paused')pause();this.pausedForPanel=false}
};
