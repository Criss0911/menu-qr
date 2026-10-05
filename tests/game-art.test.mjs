import test from 'node:test';
import assert from 'node:assert/strict';
import {gameArt,treatArt} from '../assets/game-art.js';

test('todos los personajes contienen trazos propios sin imágenes, símbolos externos ni fuentes',()=>{
 for(const name of ['berry','mascot','cake','chocolate','gold','pepper','basket','burger','coffee','trophy']){
  const svg=gameArt(name);
  assert.match(svg,/<svg[^>]+viewBox="0 0 100 100"/);
  assert.match(svg,/width="100" height="100"/);
  assert.match(svg,/<(?:path|rect|ellipse|circle)\b/);
  assert.doesNotMatch(svg,/<(?:use|image|text)\b|href=|url\(/);
 }
});
test('picante y estrella son dibujos distintos de comida en todas las plantillas',()=>{
 for(const theme of ['berries','cafe','classic']){
  assert.match(treatArt('gold',0,theme),/game-art-gold/);
  assert.match(treatArt('pepper',0,theme),/game-art-pepper/);
  for(let i=0;i<6;i++)assert.doesNotMatch(treatArt('food',i,theme),/game-art-(gold|pepper)/);
 }
 assert.match(gameArt('desconocido'),/game-art-berry/);
});
