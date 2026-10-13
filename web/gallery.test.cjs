const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function element(){const events={},attributes={};return {events,attributes,hidden:false,disabled:false,textContent:'',dataset:{},addEventListener:(name,fn)=>events[name]=fn,setAttribute:(name,value)=>attributes[name]=value,removeAttribute:name=>delete attributes[name]};}
const photos=[element(),element(),element()];photos.forEach((photo,i)=>{photo.dataset={src:'/photo-'+i+'.webp',caption:'Field photo '+i,alt:'Equipment '+i};});
const ids={};for(const id of ['gallery-dialog','gallery-image','gallery-caption','gallery-status'])ids[id]=element();
const selectors={'.gallery-retry':element(),'.gallery-prev':element(),'.gallery-next':element()};
ids['gallery-dialog'].querySelector=selector=>selectors[selector];ids['gallery-dialog'].showModal=()=>ids['gallery-dialog'].open=true;
const requests=[];const context={document:{querySelectorAll:()=>photos,getElementById:id=>ids[id],body:{classList:{add(){}}}},Image:class{constructor(){requests.push(this);}}};
vm.createContext(context);vm.runInContext(fs.readFileSync('web/gallery.js','utf8'),context);
photos[0].events.click();assert(ids['gallery-dialog'].open);assert.equal(ids['gallery-status'].textContent,'Loading photo…');
requests[0].onload();assert.equal(ids['gallery-image'].src,'/photo-0.webp');assert.equal(ids['gallery-image'].alt,'Equipment 0');
selectors['.gallery-prev'].events.click();assert.equal(ids['gallery-caption'].textContent,'3 / 3 — Field photo 2');
selectors['.gallery-next'].events.click();requests[1].onload();assert.equal(ids['gallery-image'].src,'/photo-0.webp');
requests[2].onerror();assert.equal(selectors['.gallery-retry'].hidden,false);assert.match(ids['gallery-status'].textContent,/could not be loaded/);
selectors['.gallery-retry'].events.click();requests[3].onload();assert.equal(selectors['.gallery-retry'].hidden,true);assert.equal(ids['gallery-status'].textContent,'');
selectors['.gallery-next'].events.click();ids['gallery-dialog'].events.close();requests[4].onload();assert.equal(ids['gallery-image'].src,'/photo-0.webp');
console.log('PASS gallery loading, wrap-around, stale image response, retry and close cancellation');
