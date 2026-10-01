import {config} from '../config.js?v=20260929-live';
export const demo=config.demo;
let instance;
export async function client(){
 if(demo)throw Error('El panel requiere conectar Supabase. Consulta README.md.');
 if(!config.supabaseUrl||!config.supabaseAnonKey)throw Error('Falta configurar Supabase.');
 if(!instance){const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.57.4');instance=createClient(config.supabaseUrl,config.supabaseAnonKey);}
 return instance;
}
export async function result(q){const {data,error}=await q;if(error)throw Error(error.message);return data;}
export const demoRestaurant={id:'demo',nombre:'Fast Burger',slug:'fastburger',descripcion:'A la plancha. Al momento. A tu gusto.',direccion:'Restaurante de demostración',whatsapp:'',logo:'',portada:'',activo:true};
export const demoCategories=[{id:'burgers',nombre:'Hamburguesas',orden:1},{id:'sides',nombre:'Acompañamientos',orden:2},{id:'drinks',nombre:'Bebidas',orden:3}];
export const demoProducts=[
 {id:'classic',categoria_id:'burgers',nombre:'La Clásica',descripcion:'Carne a la plancha, cheddar, lechuga y nuestra salsa de la casa.',precio:28,emoji:'🍔'},
 {id:'double',categoria_id:'burgers',nombre:'Doble Smash',descripcion:'Doble carne, doble cheddar, pepinillos y cebolla caramelizada.',precio:39,emoji:'🍔'},
 {id:'crispy',categoria_id:'burgers',nombre:'Pollo Crispy',descripcion:'Pollo crujiente, ensalada fresca y mayonesa de la casa.',precio:32,emoji:'🥪'},
 {id:'veggie',categoria_id:'burgers',nombre:'Green Burger',descripcion:'Medallón de garbanzos, tomate, rúcula y salsa de yogur.',precio:30,emoji:'🥬'},
 {id:'fries',categoria_id:'sides',nombre:'Papas doradas',descripcion:'Crujientes, recién hechas y con un toque de sal.',precio:12,emoji:'🍟'},
 {id:'lemon',categoria_id:'drinks',nombre:'Limonada de la casa',descripcion:'Limón fresco, hielo y un toque de hierbabuena.',precio:10,emoji:'🍋'}
].map((p,i)=>({...p,restaurante_id:'demo',disponible:true,orden:i,imagen:''}));
export async function loadDemoMenu(slug){if(slug!=='fastburger')throw Error('Restaurante no encontrado.');return {restaurant:demoRestaurant,categories:demoCategories,products:demoProducts,tables:[1,2,3,4,5,6].map(numero=>({numero}))};}
export async function loadMenu(slug){
 if(demo)return loadDemoMenu(slug);
 const c=await client();const restaurant=await result(c.from('restaurantes').select('*').eq('slug',slug).eq('activo',true).maybeSingle());
 if(!restaurant)throw Error('Restaurante no encontrado o no disponible.');
 const [categories,products,tables]=await Promise.all(['categorias','productos','mesas'].map(t=>result(c.from(t).select('*').eq('restaurante_id',restaurant.id).order(t==='mesas'?'numero':'orden'))));
 return {restaurant,categories:categories.filter(x=>x.activo),products:products.filter(x=>x.disponible&&categories.some(c=>c.id===x.categoria_id&&c.activo)),tables:tables.filter(x=>x.activo)};
}
