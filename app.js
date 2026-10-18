'use strict';
const $ = id=>document.getElementById(id);
let mode='text', currentVideoUrl=null, photoData=null;
const toggleMode = value=>{mode=value;$('t2v').classList.toggle('active',value==='text');$('i2v').classList.toggle('active',value==='image');$('imageArea').hidden=value!=='image';$('result').style.display='none';setStatus('');};
$('t2v').onclick=()=>toggleMode('text');$('i2v').onclick=()=>toggleMode('image');
$('upload').onclick=()=>$('file').click();
$('file').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>8*1024*1024){setStatus('Usa JPG, PNG o WEBP de menos de 8 MB.',true);return;}photoData=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)});$('preview').replaceChildren();const img=document.createElement('img');img.src=photoData;img.alt='Imagen seleccionada';$('preview').append(img);setStatus('Fotografía lista ✅');};
function setStatus(message,error=false){$('status').textContent=message;$('status').classList.toggle('err',error)}
function extractResponse(data){if(data?.data?.[0]?.url)return {url:data.data[0].url};if(data?.data?.[0]?.b64_json)return {b64:data.data[0].b64_json};let content=data?.choices?.[0]?.message?.content;if(Array.isArray(content)){for(const item of content){if(item?.video_url?.url)return {url:item.video_url.url};if(item?.url)return {url:item.url};}content=content.map(item=>item.text||'').join(' ');}if(typeof content==='string'){const link=content.match(/https?:\/\/[^\s"'<>]+\.mp4(?:\?[^\s"'<>]*)?/);if(link)return {url:link[0]};}throw Error('El motor no devolvió un enlace MP4 interpretable. Prueba otro motor.');}
function cleanup(){if(currentVideoUrl?.startsWith('blob:'))URL.revokeObjectURL(currentVideoUrl);currentVideoUrl=null;}
$('generate').onclick=async()=>{const prompt=$('prompt').value.trim(),key=$('key').value.trim(),model=$('model').value,duration=Number($('duration').value);if(!prompt){setStatus('Escribe una descripción del video.',true);return}if(!key){setStatus('Falta tu clave de Pollinations.',true);return}if(mode==='image'&&!photoData){setStatus('Primero selecciona una fotografía.',true);return}
$('generate').disabled=true;$('result').style.display='none';setStatus('⏳ Solicitando video al motor IA. Puede tardar varios minutos...');cleanup();
try{let response;
if(mode==='text'){const url=`https://gen.pollinations.ai/video/${encodeURIComponent(prompt)}?model=${encodeURIComponent(model)}&duration=${duration}`;response=await fetch(url,{headers:{Authorization:`Bearer ${key}`}});}
else{response=await fetch('https://gen.pollinations.ai/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model,messages:[{role:'user',content:[{type:'text',text:`${prompt}\nDuration: ${duration} seconds.`},{type:'image_url',image_url:{url:photoData}}]}]})});}
if(!response.ok){let msg=await response.text();throw Error(`Error ${response.status}: ${msg.slice(0,260)}`)}
const mime=response.headers.get('content-type')||'';let videoUrl;
if(mime.includes('video/')){const videoBlob=await response.blob();videoUrl=URL.createObjectURL(videoBlob)}else{const data=await response.json();const result=extractResponse(data);if(result.b64){const binary=atob(result.b64),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);videoUrl=URL.createObjectURL(new Blob([bytes],{type:'video/mp4'}));}else{const download=await fetch(result.url);if(download.ok){videoUrl=URL.createObjectURL(await download.blob())}else{videoUrl=result.url;}}}
currentVideoUrl=videoUrl;$('video').src=videoUrl;$('save').href=videoUrl;$('result').style.display='block';setStatus('✅ Video generado. Puedes reproducirlo y descargarlo.');$('result').scrollIntoView({behavior:'smooth'});
}catch(error){const message=String(error?.message||error);setStatus(`❌ ${message}\nComprueba tu clave, cuota y compatibilidad del motor.`,true)}finally{$('generate').disabled=false}};
$('again').onclick=()=>{$('result').style.display='none';window.scrollTo({top:0,behavior:'smooth'})};
window.addEventListener('beforeunload',cleanup);
