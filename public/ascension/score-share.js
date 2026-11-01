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
 card(){const c=document.createElement('canvas');c.width=c.height=1080;const x=c.getContext('2d'),w=this.text(),rtl=['ar','he'].includes(I18n.lang),season=Number($('share-season')?.value??Math.floor(((new Date().getMonth()+9)%12)/3)),palettes=[['#507e99','#b6dce1','#eab8c8','#9abf9e'],['#417a9f','#addcea','#f5d591','#89b79a'],['#776b89','#d3b6b0','#e7ac70','#b58c83'],['#4c698c','#b8d5e8','#b6d7e6','#d8e9eb']],p=palettes[season]||palettes[0];
 const art=document.createElement('canvas');art.width=art.height=216;const g=art.getContext('2d');g.imageSmoothingEnabled=false;
 const block=(a,b,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(a),Math.round(b),w,h)},oval=(cx,cy,rx,ry,col)=>{g.fillStyle=col;for(let yy=-ry;yy<=ry;yy++){const half=Math.floor(rx*Math.sqrt(Math.max(0,1-yy*yy/(ry*ry))));g.fillRect(cx-half,cy+yy,half*2+1,1)}};
 block(0,0,216,216,'#172c43');block(6,6,204,204,p[0]);block(8,8,200,53,'#172c43');
 // Layered pixel clouds and a landscape tinted by the selected season.
 for(let i=0;i<3;i++){const cy=65+i*26;block(8,cy,200,26,[p[0],p[1],p[3]][i]);for(let j=0;j<9;j++)oval(8+j*25,cy,19,6+(j%3)*2,[p[0],p[1],p[3]][i])}
 const cloud=(cx,cy,scale=1)=>{oval(cx,cy+4,24*scale,7*scale,'#a3c5d3');oval(cx-10*scale,cy,13*scale,7*scale,'#e5eef0');oval(cx+5*scale,cy-4*scale,15*scale,10*scale,'#fff8e8');oval(cx+19*scale,cy+1*scale,12*scale,7*scale,'#f6f4e8');block(cx-22*scale,cy+5*scale,47*scale,3*scale,'#d9e6e6')};
 cloud(35,79);cloud(176,72);cloud(37,122);cloud(180,120);
 for(let i=0;i<27;i++){const a=13+(i*37)%190,b=63+(i*19)%70;if(season===3){block(a,b,1,5,'#f6fbff');block(a-2,b+2,5,1,'#f6fbff')}else if(season===0){block(a,b,3,2,i%2?'#f4d2dc':'#eaa8bd');block(a+1,b-1,1,4,'#ffe4d2')}else if(season===2){block(a,b,3,2,i%2?'#f0ba6e':'#bf785e');block(a+1,b-1,1,5,'#de9c6b')}else{block(a,b,1,3,'#fff1ba');block(a-1,b+1,3,1,'#fff1ba')}}
 // Twin tanks: dark outline, steel seams, indicator lights and layered exhaust.
 for(const tankX of [78,129]){block(tankX-2,82,13,33,'#233b50');block(tankX,80,9,34,'#6c97ae');block(tankX+1,82,3,25,'#c4e6e3');block(tankX,90,9,3,'#36566d');block(tankX+6,94,2,4,'#f1ce87');block(tankX,110,9,6,'#314c62');block(tankX+1,116,7,12,'#eaa072');block(tankX+2,117,5,19,'#f5cb85');block(tankX+3,117,3,12,'#fff4c3');block(tankX+4,136,1,4,'#f5cb85')}
 // Fluffy silhouette, separate wool curls, soft blue shadows and cream highlights.
 oval(108,100,26,22,'#344f65');oval(108,98,25,22,'#c8dbdf');
 const tufts=[[89,91,8,9],[96,82,8,7],[107,79,10,8],[119,82,9,8],[128,92,8,9],[89,104,8,9],[97,113,9,7],[110,115,9,7],[122,110,10,9]];
 for(const [a,b,rx,ry] of tufts){oval(a,b,rx,ry,'#e4ece8');oval(a-1,b-2,rx-1,ry-2,'#fffdf1');block(a-3,b-3,3,2,'#ffffff')}
 // Little boots, pink ears and a warm face.
 block(96,116,5,10,'#e5cbb6');block(117,116,5,10,'#e5cbb6');block(94,124,9,4,'#344b63');block(115,124,9,4,'#344b63');block(95,124,5,1,'#7994a7');block(116,124,5,1,'#7994a7');
 oval(93,88,7,5,'#c7aa9b');oval(93,87,5,3,'#edb9ba');oval(124,88,7,5,'#c7aa9b');oval(124,87,5,3,'#edb9ba');oval(108,94,16,15,'#dbc5b3');oval(108,92,15,14,'#f4e3cd');oval(108,86,16,6,'#fffdf1');oval(101,83,6,5,'#fffdf1');oval(111,81,6,5,'#ffffff');oval(119,84,5,4,'#fffdf1');
 block(99,91,4,5,'#293f55');block(114,91,4,5,'#293f55');block(99,91,2,2,'#ffffff');block(114,91,2,2,'#ffffff');oval(97,98,3,2,'#efb7b1');oval(120,98,3,2,'#efb7b1');block(106,98,4,2,'#977e79');block(107,100,2,2,'#977e79');block(103,103,3,1,'#795f61');block(110,103,3,1,'#795f61');block(106,104,4,1,'#795f61');
 block(95,108,26,3,p[2]);block(117,110,5,7,p[2]);block(121,114,7,3,p[2]);
 // Calm panel for the translated result, clear at phone thumbnail size.
 block(8,137,200,71,'#172c43');block(8,137,200,1,p[2]);g.strokeStyle=p[2];g.lineWidth=1;g.strokeRect(5,5,206,206);x.imageSmoothingEnabled=false;x.drawImage(art,0,0,1080,1080);
 const line=(t,y,size,color='#fff7df')=>{x.font=`bold ${size}px system-ui, sans-serif`;x.textAlign='center';x.direction=rtl?'rtl':'ltr';x.fillStyle=color;x.fillText(t,540,y,920)};
 line('X-Sheep',145,74);line(w[1]+' ✨',220,34,p[1]);line(Math.max(0,Math.floor(score)).toLocaleString(I18n.lang==='jp'?'ja':I18n.lang==='rc'?'fr':I18n.lang)+' ⭐',785,78,'#ffdc91');line(mode==='adventure'?w[4]:w[5],846,31,p[1]);line(w[2]+' 🚀 😊',922,38);line('unispourlapaix.github.io/X-Sheep',998,24,'#b9cad8');return c},
 async share(){const b=$('share-score'),words=this.text();b.disabled=true;try{const blob=await new Promise(resolve=>this.card().toBlob(resolve,'image/png'));if(!blob)throw Error('PNG');const file=new File([blob],`X-Sheep-${Math.floor(score)}.png`,{type:'image/png'}),text=`🐑 🚀 X-Sheep · ${Math.floor(score)} ⭐ · ${words[1]} 😊 ${words[2]} https://unispourlapaix.github.io/X-Sheep/`;
 if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:'X-Sheep',text});return}catch(e){if(e.name==='AbortError')return}}
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);$('share-status').textContent=words[3]+' 🐑 🚀';
 }finally{b.disabled=false}}
};
$('share-score').textContent='🐑 '+ScoreShare.text()[0]+' 🚀';$('share-score').onclick=()=>ScoreShare.share().catch(()=>{$('share-status').textContent='⚠️ PNG';});

if($('share-season'))$('share-season').value=String(Math.floor(((new Date().getMonth()+9)%12)/3));
