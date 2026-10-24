import test from "node:test";
import assert from "node:assert/strict";
import { trendingWaves, waveAt, canRotate } from "../web/trending-atlas.mjs";

const repos = Array.from({length:25}, (_, i) => ({ name:`owner/project-${i+1}`, lang:"JavaScript", desc:"A project", stars:i }));
test("the daily top 20 retain Trending rank and form five groups of four", () => {
  const waves = trendingWaves({repositories:repos});
  assert.equal(waves.length,5);
  assert.ok(waves.every(w => w.length === 4));
  assert.equal(waves[0][0].name,"owner/project-1");
  assert.equal(waves[4][3].name,"owner/project-20");
  assert.equal(waveAt(5,waves.length),0);
  assert.equal(waveAt(-1,waves.length),4);
});
test("short daily lists use the available projects without inventing or duplicating entries", () => {
  assert.deepEqual(trendingWaves({repositories:repos.slice(0,6)}).map(w => w.length),[4,2]);
  assert.deepEqual(trendingWaves({repositories:[]}),[]);
  assert.equal(waveAt(10,0),0);
});
test("invalid external names, duplicate repos and malformed counts never enter the atlas", () => {
  const waves=trendingWaves({repositories:[repos[0],repos[0],
    {...repos[1],name:'javascript:alert(1)'},{...repos[2],name:'a/b/c'},
    {...repos[3],stars:-1},{...repos[4],stars:null}]});
  assert.deepEqual(waves.flat().map(r=>r.name),['owner/project-1','owner/project-5']);
});
test("autoplay pauses for scroll transitions, hidden tabs, interaction and motion preferences", () => {
  const state={visible:true,hidden:false,reduced:false,saveData:false,interacting:false,paused:false,atRest:true};
  assert.equal(canRotate(state),true);
  for(const key of ['hidden','reduced','saveData','interacting','paused'])assert.equal(canRotate({...state,[key]:true}),false,key);
  for(const key of ['visible','atRest'])assert.equal(canRotate({...state,[key]:false}),false,key);
});
