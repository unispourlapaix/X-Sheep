'use strict';
// Local artwork: no score or image is sent until the player chooses a destination.
const ScoreShare={
 words:{
 fr:['PARTAGER MON SCORE','Toujours plus haut !','À toi de jouer !','Image téléchargée','Aventure','Vol infini'],
 en:['SHARE MY SCORE','Always higher!','Your turn to play!','Image downloaded','Adventure','Endless flight'],
 es:['COMPARTIR MI PUNTUACIÓN','¡Siempre más alto!','¡Te toca jugar!','Imagen descargada','Aventura','Vuelo infinito'],
 de:['PUNKTZAHL TEILEN','Immer höher!','Jetzt bist du dran!','Bild heruntergeladen','Abenteuer','Endlosflug'],
 it:['CONDIVIDI IL PUNTEGGIO','Sempre più in alto!','Ora tocca a te!','Immagine scaricata','Avventura','Volo infinito'],
 pt:['PARTILHAR PONTUAÇÃO','Sempre mais alto!','É a tua vez!','Imagem transferida','Aventura','Voo infinito'],
 ru:['ПОДЕЛИТЬСЯ СЧЁТОМ','Всё выше!','Твой ход!','Изображение скачано','Приключение','Бесконечный полёт'],
 uk:['ПОДІЛИТИСЯ РЕЗУЛЬТАТОМ','Завжди вище!','Твоя черга!','Зображення завантажено','Пригода','Нескінченний політ'],
 zh:['分享我的分数','越飞越高！','轮到你啦！','图片已下载','冒险','无限飞行'],
 jp:['スコアをシェア','もっと高く！','次は君の番！','画像を保存しました','アドベンチャー','無限飛行'],
 ko:['점수 공유','더 높이 날아!','이제 네 차례!','이미지 다운로드 완료','모험','무한 비행'],
 rc:['PARTAZ MON SKOR','Toujours pli o !','Astèr sé out tour !','Zimaz télésharzé','Lavanti','Vol san fin'],
 ln:['KABOLA BAPWƐ́ NA NGAI','Likoló lisusu !','Sikoyo ngala na yo !','Elilingi ezwi','Mobembo','Kopumbwa ezangi nsuka'],
 ar:['مشاركة نتيجتي','إلى أعلى دائماً!','حان دورك للعب!','تم تنزيل الصورة','مغامرة','طيران لا نهائي'],
 he:['שיתוף הניקוד שלי','תמיד גבוה יותר!','עכשיו תורך לשחק!','התמונה הורדה','הרפתקה','טיסה אינסופית']},
 text(){return this.words[I18n.lang]||this.words.fr},
 card(){const c=document.createElement('canvas');c.width=1080;c.height=1080;const x=c.getContext('2d'),w=this.text(),rtl=['ar','he'].includes(I18n.lang);x.fillStyle='#101d35';x.fillRect(0,0,1080,1080);x.fillStyle='#182d48';x.fillRect(32,32,1016,1016);x.strokeStyle='#83d9d2';x.lineWidth=4;x.strokeRect(48,48,984,984);
 for(let i=0;i<65;i++){x.fillStyle=i%3?'#7393aa':'#f5dda0';x.fillRect(65+(i*139)%950,70+(i*193)%920,i%3?3:6,i%3?3:6)}
 const line=(t,y,size,color='#fff7df')=>{x.font=`bold ${size}px system-ui, sans-serif`;x.textAlign='center';x.direction=rtl?'rtl':'ltr';x.fillStyle=color;x.fillText(t,540,y,920)};
 line('X-Sheep',145,74);line(w[1]+' ✨',215,36,'#a4e6da');
 // Pixel jetpack, twin exhausts, fluffy white wool and a smiling face.
 const block=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
 block(372,365,82,190,'#0b1427');block(384,377,58,166,'#81b7cb');block(392,395,18,108,'#c0e9ec');block(398,543,34,75,'#f4a35d');block(406,565,18,95,'#ffe2a1');block(610,522,28,80,'#f4a35d');block(618,545,12,100,'#ffe2a1');
 const puff=(a,b,r,col)=>{x.fillStyle=col;x.beginPath();x.arc(a,b,r,0,Math.PI*2);x.fill()};
 [[470,422,65],[535,395,65],[597,429,66],[463,492,64],[535,489,88],[605,494,62]].forEach(([a,b,r])=>puff(a,b,r+8,'#c2d5de'));
 [[470,414,65],[535,387,65],[597,421,66],[463,484,64],[535,481,88],[605,486,62]].forEach(([a,b,r])=>puff(a,b,r,'#ffffff'));
 block(477,535,25,52,'#e5c0ad');block(579,535,25,52,'#e5c0ad');block(471,575,37,17,'#34435b');block(573,575,37,17,'#34435b');
 puff(493,414,27,'#efc8bd');puff(600,414,27,'#efc8bd');puff(546,453,65,'#f5dfcf');puff(517,465,11,'#efb7b5');puff(578,465,11,'#efb7b5');puff(523,442,7,'#26364c');puff(571,442,7,'#26364c');puff(521,440,2,'#ffffff');puff(569,440,2,'#ffffff');x.strokeStyle='#624f54';x.lineWidth=5;x.beginPath();x.arc(547,457,21,.15,Math.PI-.15);x.stroke();
 line(Math.max(0,Math.floor(score)).toLocaleString(I18n.lang==='jp'?'ja':I18n.lang==='rc'?'fr':I18n.lang)+' ⭐',740,86,'#ffdc91');line(mode==='adventure'?w[4]:w[5],805,34,'#a4e6da');line(w[2]+' 🚀 😊',886,42);line('unispourlapaix.github.io/X-Sheep',974,25,'#b9cad8');return c},
 async share(){const b=$('share-score'),words=this.text();b.disabled=true;try{const blob=await new Promise(resolve=>this.card().toBlob(resolve,'image/png'));if(!blob)throw Error('PNG');const file=new File([blob],`X-Sheep-${Math.floor(score)}.png`,{type:'image/png'}),text=`🐑 🚀 X-Sheep · ${Math.floor(score)} ⭐ · ${words[1]} 😊 ${words[2]} https://unispourlapaix.github.io/X-Sheep/`;
 if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:'X-Sheep',text});return}catch(e){if(e.name==='AbortError')return}}
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);$('share-status').textContent=words[3]+' 🐑 🚀';
 }finally{b.disabled=false}}
};
$('share-score').textContent='🐑 '+ScoreShare.text()[0]+' 🚀';$('share-score').onclick=()=>ScoreShare.share().catch(()=>{$('share-status').textContent='⚠️ PNG';});
