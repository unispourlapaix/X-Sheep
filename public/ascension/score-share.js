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
 art:null,artReady:Promise.resolve(),
 setArt(src){this.artReady=new Promise(resolve=>{const img=new Image();img.onload=()=>{this.art=img;resolve()};img.onerror=()=>resolve();img.src=src})},
 card(){const c=document.createElement('canvas');c.width=c.height=1080;const x=c.getContext('2d'),w=this.text(),rtl=['ar','he'].includes(I18n.lang);x.fillStyle='#fff1db';x.fillRect(0,0,1080,1080);if(this.art){x.imageSmoothingEnabled=true;x.drawImage(this.art,0,0,1080,1080)}
 const line=(t,y,size,color)=>{x.font=`700 ${size}px "Segoe UI",system-ui,sans-serif`;x.textAlign='center';x.direction=rtl?'rtl':'ltr';x.fillStyle=color;x.fillText(t,540,y,930)};
 x.save();x.shadowColor='#24466566';x.shadowBlur=10;x.shadowOffsetY=3;line('X-Sheep',116,74,'#fffdf1');x.restore();line(w[1],169,31,'#f2f8ff');
 const value=Math.max(0,Math.floor(score)).toLocaleString(I18n.lang==='jp'?'ja':I18n.lang==='rc'?'fr':I18n.lang);line(value,827,94,'#34475e');line(mode==='adventure'?w[4]:w[5],878,28,'#657387');line(w[2],950,35,'#34475e');line('unispourlapaix.github.io/X-Sheep',1012,22,'#7d7e88');
 // Small seasonal accents stay clear of the character and score.
 const season=Number($('share-season')?.value??0);x.save();x.translate(540,735);x.fillStyle=['#eeb5cf','#e9bf6d','#d59a67','#9abbd2'][season];if(season===3){x.fillRect(-1,-9,2,18);x.fillRect(-9,-1,18,2)}else if(season===1){x.beginPath();x.arc(0,0,6,0,Math.PI*2);x.fill()}else{x.rotate(-.5);x.beginPath();x.ellipse(0,0,4,8,0,0,Math.PI*2);x.fill()}x.restore();return c},
 async preview(){await this.artReady;const img=$('share-preview-image');img.src=this.card().toDataURL('image/png');$('share-preview-send').textContent='↗ '+this.text()[0];$('share-preview').showModal()},
 async share(){const b=$('share-score'),words=this.text();b.disabled=true;try{await this.artReady;const blob=await new Promise(resolve=>this.card().toBlob(resolve,'image/png'));if(!blob)throw Error('PNG');const file=new File([blob],`X-Sheep-${Math.floor(score)}.png`,{type:'image/png'}),text=`🐑 🚀 X-Sheep · ${Math.floor(score)} ⭐ · ${words[1]} 😊 ${words[2]} https://unispourlapaix.github.io/X-Sheep/`;
 if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:'X-Sheep',text});return}catch(e){if(e.name==='AbortError')return}}
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);$('share-status').textContent=words[3]+' 🐑 🚀';
 }finally{b.disabled=false}}
};
$('share-score').textContent='🐑 '+ScoreShare.text()[0]+' 🚀';$('share-score').onclick=()=>ScoreShare.preview().catch(()=>{$('share-status').textContent='⚠️ PNG';});

if($('share-season'))$('share-season').value=String(Math.floor(((new Date().getMonth()+9)%12)/3));

$('share-preview-send').onclick=()=>ScoreShare.share().catch(()=>{$('share-status').textContent='⚠️ PNG'});
$('share-preview-close').onclick=()=>$('share-preview').close();
