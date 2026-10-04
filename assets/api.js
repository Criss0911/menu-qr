import {withDeadline} from './navigation.js?v=stable-11';
import {todayLaPaz} from './catalog.js';
import {config} from '../config.js?v=20260929-live';
export const demo=config.demo;
let instance;
export async function client(){
 if(demo)throw Error('El panel requiere conectar Supabase. Consulta README.md.');
 if(!config.supabaseUrl||!config.supabaseAnonKey)throw Error('Falta configurar Supabase.');
 if(!instance){const {createClient}=await withDeadline(import('https://esm.sh/@supabase/supabase-js@2.57.4'));instance=createClient(config.supabaseUrl,config.supabaseAnonKey);}
 return instance;
}
export async function result(q){const {data,error}=await withDeadline(q);if(error)throw Error(error.message);return data;}
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

export async function loadDessertDemo(){return {restaurant:{id:'dessert-demo',promociones:[{titulo:'Tu próximo antojo, a tu manera',texto:'Ejemplo de anuncio programado: descubre tamaños y toppings en La consentida. No es una oferta real.',inicio:todayLaPaz(),fin:todayLaPaz(),activo:true}],nombre:'Fresas & Crema',slug:'fresas-demo',descripcion:'Fresas frescas, crema suave y un poquito de felicidad.',direccion:'Vista de ejemplo · personalizable para tu negocio',modo_atencion:'catalogo',plantilla:'berries',aviso_catalogo:'Demostración de diseño. Productos y precios ilustrativos.',activo:true},categories:[{id:'fresas',nombre:'Fresas con crema',activo:true},{id:'postres',nombre:'Postres',activo:true},{id:'bebidas',nombre:'Bebidas',activo:true}],products:[['f1','fresas','La consentida','Fresas con crema de la casa.',18,'🍓'],['f2','fresas','Tentación de chocolate','Fresas, crema y chocolate.',24,'🍫'],['f3','fresas','Extra crunch','Fresas con galleta y crema.',22,'🍪'],['p1','postres','Cheesecake de fresas','Un clásico suave y cremoso.',20,'🍰'],['p2','postres','Brownie de la casa','Chocolate intenso en cada bocado.',15,'🧁'],['b1','bebidas','Batido de fresa','Fresco, cremoso y frutal.',16,'🥤']].map(([id,categoria_id,nombre,descripcion,precio,emoji])=>({id,categoria_id,nombre,descripcion,precio,emoji,disponible:true,estado_venta:id==='p2'?'agotado':id==='p1'?'encargo':id==='f1'?'hoy':'disponible',fecha_disponible:todayLaPaz(),tamanos:id==='f1'?[{nombre:'Pequeño',precio:18},{nombre:'Mediano',precio:24},{nombre:'Grande',precio:30}]:[],extras:id==='f1'?[{nombre:'Chocolate',precio:3},{nombre:'Galleta',precio:2}]:[],galeria:id==='f1'?[new URL('./demo-fresas.svg',import.meta.url).href,new URL('./demo-fresas-detalle.svg',import.meta.url).href]:[],destacado:id==='f1'?'novedad':id==='p1'?'tendencia':id==='f2'?'novedad':''})),tables:[]};}

export async function loadDirectory(){if(demo)return [demoRestaurant];const c=await client();return result(c.from('restaurantes').select('nombre,slug,descripcion').eq('activo',true).order('nombre').limit(100));}
