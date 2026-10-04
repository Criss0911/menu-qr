export function validatePhoto(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Selecciona una foto JPG, PNG o WebP.');
 if(file.size>10*1024*1024||!file.size)throw Error('La foto debe pesar entre 1 byte y 10 MB.');
}
export async function preparePhoto(file){
 validatePhoto(file);
 const bitmap=await createImageBitmap(file);
 try{
  if(bitmap.width*bitmap.height>40000000)throw Error('La imagen es demasiado grande. Usa una foto de menos de 40 megapíxeles.');
  const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.82));
  if(!blob||blob.size>2097152)throw Error('No se pudo reducir la foto a 2 MB. Elige una imagen más pequeña.');
  return blob;
 }finally{bitmap.close();}
}
export async function uploadPhoto(db,restaurantId,file){
 const blob=await preparePhoto(file),ext=blob.type==='image/webp'?'webp':'png';
 const path=restaurantId+'/'+crypto.randomUUID()+'.'+ext;
 const {error}=await db.storage.from('menu-productos').upload(path,blob,{contentType:blob.type,upsert:false,cacheControl:'31536000'});
 if(error)throw Error('No se pudo subir la foto: '+error.message);
 return db.storage.from('menu-productos').getPublicUrl(path).data.publicUrl;
}
