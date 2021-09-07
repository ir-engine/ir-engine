import{u as e}from"./upload.8895077e.js";import{a,d as t}from"./feathers.42c2841d.js";import{C as r,n as o,o as c,p as s,q as n,s as i,t as u,u as l,v as y,w as f}from"./_app.e67b0e96.js";function g(e){return{type:o,creator:e}}function w(){return{type:r}}function m(){return{type:n}}function p(e){return async(r,o)=>{try{if(r(w()),!e){e={};let a=Math.floor(1e3*Math.random())+1;e.name="User"+a,e.username="user_"+a}r(g(await a.service("creator").create(e)))}catch(c){console.log(c),t(r,c.message)}}}function d(){return async e=>{try{e(w());e(g(await a.service("creator").find({query:{action:"current"}})))}catch(r){console.log(r),t(e,r.message)}}}function v(e){return async(e,r)=>{try{e({type:c});const t=await a.service("creator").find({query:{}});e({type:s,creators:t})}catch(o){console.log(o),t(e,o.message)}}}function h(e){return async r=>{try{r(m());r(function(e){return{type:i,creator:e}}(await a.service("creator").get(e)))}catch(o){console.log(o),t(r,o.message)}}}function q(r){return async o=>{try{if(o(w()),r.newAvatar){const a=await e(r.newAvatar,null);r.avatarId=a.file_id,delete r.newAvatar}o(g(await a.service("creator").patch(r.id,r)))}catch(c){console.log(c),t(o,c.message)}}}function I(){return async e=>{try{e(m());const t=await a.service("notifications").find({query:{action:"byCurrentCreator"}});e({type:u,notifications:t})}catch(r){console.log(r),t(e,r.message)}}}function b(e){return async r=>{try{await a.service("follow-creator").create({creatorId:e})&&r({type:l})}catch(o){console.log(o),t(r,o.message)}}}function j(e){return async r=>{try{await a.service("follow-creator").remove(e)&&r({type:y})}catch(o){console.log(o),t(r,o.message)}}}function A(e){return async r=>{try{const t=await a.service("follow-creator").find({query:{action:"followers",creatorId:e}});r((o=t.data,{type:f,creators:o}))}catch(c){console.log(c),t(r,c.message)}var o}}function C(e){return async r=>{try{const t=await a.service("follow-creator").find({query:{action:"following",creatorId:e}});r((o=t.data,{type:f,creators:o}))}catch(c){console.log(c),t(r,c.message)}var o}}export{h as a,j as b,p as c,A as d,C as e,b as f,v as g,d as h,I as i,q as u};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS4wNzM3ZjhjMC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc29jaWFsL3NyYy9yZWR1Y2Vycy9jcmVhdG9yL2FjdGlvbnMudHMiLCIuLi8uLi8uLi9zb2NpYWwvc3JjL3JlZHVjZXJzL2NyZWF0b3Ivc2VydmljZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBhdXRob3IgVGFueWEgVnlrbGl1ayA8dGFueWEudnlrbGl1a0BnbWFpbC5jb20+XG4gKi9cbmltcG9ydCB7XG4gIENSRUFUT1JfUkVUUklFVkVELFxuICBDUkVBVE9SX0ZFVENILFxuICBDVVJSRU5UX0NSRUFUT1JfUkVUUklFVkVELFxuICBDUkVBVE9SU19SRVRSSUVWRUQsXG4gIENSRUFUT1JfTk9USUZJQ0FUSU9OX0xJU1RfUkVUUklFVkVELFxuICBTRVRfQ1JFQVRPUl9BU19GT0xMT1dFRCxcbiAgU0VUX0NSRUFUT1JfTk9UX0ZPTExPV0VELFxuICBDUkVBVE9SX0ZPTExPV0VSU19SRVRSSUVWRUQsXG4gIENSRUFUT1JTX0ZFVENILFxuICBDVVJSRU5UX0NSRUFUT1JfRkVUQ0gsXG4gIENSRUFUT1JfUkVNT1ZFRFxufSBmcm9tICcuLi9hY3Rpb25zJ1xuaW1wb3J0IHsgQ3JlYXRvciwgQ3JlYXRvclNob3J0IH0gZnJvbSAnQHhyZW5naW5lL2NvbW1vbi9zcmMvaW50ZXJmYWNlcy9DcmVhdG9yJ1xuXG5leHBvcnQgaW50ZXJmYWNlIENyZWF0b3JSZXRyaWV2ZWRBY3Rpb24ge1xuICB0eXBlOiBzdHJpbmdcbiAgY3JlYXRvcjogQ3JlYXRvclxufVxuZXhwb3J0IGludGVyZmFjZSBDcmVhdG9yc1JldHJpZXZlZEFjdGlvbiB7XG4gIHR5cGU6IHN0cmluZ1xuICBjcmVhdG9yczogQ3JlYXRvclNob3J0W11cbn1cblxuZXhwb3J0IGludGVyZmFjZSBGZXRjaGluZ0NyZWF0b3JBY3Rpb24ge1xuICB0eXBlOiBzdHJpbmdcbn1cbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRvcnNOb3RpZmljYXRpb25zUmV0cmlldmVkQWN0aW9uIHtcbiAgdHlwZTogc3RyaW5nXG4gIG5vdGlmaWNhdGlvbnM6IGFueVtdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRvclJlbW92ZUFjdGlvbiB7XG4gIHR5cGU6IHN0cmluZ1xuICBpZDogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIENyZWF0b3JzQWN0aW9uID0gQ3JlYXRvclJldHJpZXZlZEFjdGlvbiB8IEZldGNoaW5nQ3JlYXRvckFjdGlvbiB8IENyZWF0b3JzUmV0cmlldmVkQWN0aW9uXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdG9yTG9nZ2VkUmV0cmlldmVkKGNyZWF0b3I6IENyZWF0b3IpOiBDcmVhdG9yUmV0cmlldmVkQWN0aW9uIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBDVVJSRU5UX0NSRUFUT1JfUkVUUklFVkVELFxuICAgIGNyZWF0b3JcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRvclJldHJpZXZlZChjcmVhdG9yOiBDcmVhdG9yKTogQ3JlYXRvclJldHJpZXZlZEFjdGlvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQ1JFQVRPUl9SRVRSSUVWRUQsXG4gICAgY3JlYXRvclxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmZXRjaGluZ0NyZWF0b3JzKCk6IEZldGNoaW5nQ3JlYXRvckFjdGlvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQ1JFQVRPUlNfRkVUQ0hcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGZldGNoaW5nQ3VycmVudENyZWF0b3IoKTogRmV0Y2hpbmdDcmVhdG9yQWN0aW9uIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBDVVJSRU5UX0NSRUFUT1JfRkVUQ0hcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hpbmdDcmVhdG9yKCk6IEZldGNoaW5nQ3JlYXRvckFjdGlvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQ1JFQVRPUl9GRVRDSFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdG9yc1JldHJpZXZlZChjcmVhdG9yczogQ3JlYXRvclNob3J0W10pOiBDcmVhdG9yc1JldHJpZXZlZEFjdGlvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQ1JFQVRPUlNfUkVUUklFVkVELFxuICAgIGNyZWF0b3JzXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0b3JOb3RpZmljYXRpb25MaXN0KG5vdGlmaWNhdGlvbnM6IGFueVtdKTogQ3JlYXRvcnNOb3RpZmljYXRpb25zUmV0cmlldmVkQWN0aW9uIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBDUkVBVE9SX05PVElGSUNBVElPTl9MSVNUX1JFVFJJRVZFRCxcbiAgICBub3RpZmljYXRpb25zXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUNyZWF0b3JBc0ZvbGxvd2VkKCk6IEZldGNoaW5nQ3JlYXRvckFjdGlvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogU0VUX0NSRUFUT1JfQVNfRk9MTE9XRURcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlQ3JlYXRvck5vdEZvbGxvd2VkKCk6IEZldGNoaW5nQ3JlYXRvckFjdGlvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogU0VUX0NSRUFUT1JfTk9UX0ZPTExPV0VEXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0b3JGb2xsb3dlcnMoY3JlYXRvcnM6IENyZWF0b3JTaG9ydFtdKTogQ3JlYXRvcnNSZXRyaWV2ZWRBY3Rpb24ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IENSRUFUT1JfRk9MTE9XRVJTX1JFVFJJRVZFRCxcbiAgICBjcmVhdG9yc1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdG9yRm9sbG93aW5nKGNyZWF0b3JzOiBDcmVhdG9yU2hvcnRbXSk6IENyZWF0b3JzUmV0cmlldmVkQWN0aW9uIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBDUkVBVE9SX0ZPTExPV0VSU19SRVRSSUVWRUQsXG4gICAgY3JlYXRvcnNcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQ3JlYXRvcihpZDogc3RyaW5nKTogQ3JlYXRvclJlbW92ZUFjdGlvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQ1JFQVRPUl9SRU1PVkVELFxuICAgIGlkXG4gIH1cbn1cbiIsIi8qKlxuICogQGF1dGhvciBUYW55YSBWeWtsaXVrIDx0YW55YS52eWtsaXVrQGdtYWlsLmNvbT5cbiAqL1xuaW1wb3J0IHsgQ3JlYXRvciB9IGZyb20gJ0B4cmVuZ2luZS9jb21tb24vc3JjL2ludGVyZmFjZXMvQ3JlYXRvcidcbmltcG9ydCB7IERpc3BhdGNoIH0gZnJvbSAncmVkdXgnXG5pbXBvcnQgeyB1cGxvYWQgfSBmcm9tICdAeHJlbmdpbmUvZW5naW5lL3NyYy9zY2VuZS9mdW5jdGlvbnMvdXBsb2FkJ1xuaW1wb3J0IHsgZGlzcGF0Y2hBbGVydEVycm9yIH0gZnJvbSAnQHhyZW5naW5lL2NsaWVudC1jb3JlL3NyYy9jb21tb24vcmVkdWNlcnMvYWxlcnQvc2VydmljZSdcbmltcG9ydCB7IGNsaWVudCB9IGZyb20gJ0B4cmVuZ2luZS9jbGllbnQtY29yZS9zcmMvZmVhdGhlcnMnXG5pbXBvcnQge1xuICBmZXRjaGluZ0NyZWF0b3IsXG4gIGNyZWF0b3JSZXRyaWV2ZWQsXG4gIGNyZWF0b3JzUmV0cmlldmVkLFxuICBjcmVhdG9yTG9nZ2VkUmV0cmlldmVkLFxuICBjcmVhdG9yTm90aWZpY2F0aW9uTGlzdCxcbiAgdXBkYXRlQ3JlYXRvckFzRm9sbG93ZWQsXG4gIHVwZGF0ZUNyZWF0b3JOb3RGb2xsb3dlZCxcbiAgY3JlYXRvckZvbGxvd2VycyxcbiAgY3JlYXRvckZvbGxvd2luZyxcbiAgZmV0Y2hpbmdDcmVhdG9ycyxcbiAgZmV0Y2hpbmdDdXJyZW50Q3JlYXRvcixcbiAgcmVtb3ZlQ3JlYXRvclxufSBmcm9tICcuL2FjdGlvbnMnXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDcmVhdG9yKGRhdGE/OiBhbnkpIHtcbiAgcmV0dXJuIGFzeW5jIChkaXNwYXRjaDogRGlzcGF0Y2gsIGdldFN0YXRlOiBhbnkpOiBQcm9taXNlPGFueT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBkaXNwYXRjaChmZXRjaGluZ0N1cnJlbnRDcmVhdG9yKCkpXG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgZGF0YSA9IHt9XG4gICAgICAgIGxldCB1c2VyTnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMCkgKyAxXG4gICAgICAgIGRhdGEubmFtZSA9ICdVc2VyJyArIHVzZXJOdW1iZXJcbiAgICAgICAgZGF0YS51c2VybmFtZSA9ICd1c2VyXycgKyB1c2VyTnVtYmVyXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNyZWF0b3IgPSBhd2FpdCBjbGllbnQuc2VydmljZSgnY3JlYXRvcicpLmNyZWF0ZShkYXRhKVxuICAgICAgZGlzcGF0Y2goY3JlYXRvckxvZ2dlZFJldHJpZXZlZChjcmVhdG9yKSlcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgIGRpc3BhdGNoQWxlcnRFcnJvcihkaXNwYXRjaCwgZXJyLm1lc3NhZ2UpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2dnZWRDcmVhdG9yKCkge1xuICByZXR1cm4gYXN5bmMgKGRpc3BhdGNoOiBEaXNwYXRjaCk6IFByb21pc2U8YW55PiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGRpc3BhdGNoKGZldGNoaW5nQ3VycmVudENyZWF0b3IoKSlcbiAgICAgIGNvbnN0IGNyZWF0b3IgPSBhd2FpdCBjbGllbnQuc2VydmljZSgnY3JlYXRvcicpLmZpbmQoeyBxdWVyeTogeyBhY3Rpb246ICdjdXJyZW50JyB9IH0pXG4gICAgICBkaXNwYXRjaChjcmVhdG9yTG9nZ2VkUmV0cmlldmVkKGNyZWF0b3IpKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgZGlzcGF0Y2hBbGVydEVycm9yKGRpc3BhdGNoLCBlcnIubWVzc2FnZSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGZldGNoQ3JlYXRvckFzQWRtaW4gPVxuICAoKSA9PlxuICBhc3luYyAoZGlzcGF0Y2g6IERpc3BhdGNoLCBnZXRTdGF0ZTogYW55KTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnNlcnZpY2UoJ2NyZWF0b3InKS5maW5kKHsgcXVlcnk6IHsgYWN0aW9uOiAnYWRtaW4nIH0gfSlcbiAgICAgIGRpc3BhdGNoKGNyZWF0b3JMb2dnZWRSZXRyaWV2ZWQocmVzdWx0KSlcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICB9XG4gIH1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENyZWF0b3JzKGxpbWl0PzogbnVtYmVyKSB7XG4gIHJldHVybiBhc3luYyAoZGlzcGF0Y2g6IERpc3BhdGNoLCBnZXRTdGF0ZTogYW55KTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICB0cnkge1xuICAgICAgZGlzcGF0Y2goZmV0Y2hpbmdDcmVhdG9ycygpKVxuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IGNsaWVudC5zZXJ2aWNlKCdjcmVhdG9yJykuZmluZCh7IHF1ZXJ5OiB7fSB9KVxuICAgICAgZGlzcGF0Y2goY3JlYXRvcnNSZXRyaWV2ZWQocmVzdWx0cykpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICBkaXNwYXRjaEFsZXJ0RXJyb3IoZGlzcGF0Y2gsIGVyci5tZXNzYWdlKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3JlYXRvcihjcmVhdG9ySWQpIHtcbiAgcmV0dXJuIGFzeW5jIChkaXNwYXRjaDogRGlzcGF0Y2gpOiBQcm9taXNlPGFueT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBkaXNwYXRjaChmZXRjaGluZ0NyZWF0b3IoKSlcbiAgICAgIGNvbnN0IGNyZWF0b3IgPSBhd2FpdCBjbGllbnQuc2VydmljZSgnY3JlYXRvcicpLmdldChjcmVhdG9ySWQpXG4gICAgICBkaXNwYXRjaChjcmVhdG9yUmV0cmlldmVkKGNyZWF0b3IpKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgZGlzcGF0Y2hBbGVydEVycm9yKGRpc3BhdGNoLCBlcnIubWVzc2FnZSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUNyZWF0b3IoY3JlYXRvcjogQ3JlYXRvcikge1xuICByZXR1cm4gYXN5bmMgKGRpc3BhdGNoOiBEaXNwYXRjaCk6IFByb21pc2U8YW55PiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGRpc3BhdGNoKGZldGNoaW5nQ3VycmVudENyZWF0b3IoKSlcbiAgICAgIGlmIChjcmVhdG9yLm5ld0F2YXRhcikge1xuICAgICAgICBjb25zdCBzdG9yZWRBdmF0YXIgPSBhd2FpdCB1cGxvYWQoY3JlYXRvci5uZXdBdmF0YXIsIG51bGwpXG4gICAgICAgIDsoY3JlYXRvciBhcyBhbnkpLmF2YXRhcklkID0gKHN0b3JlZEF2YXRhciBhcyBhbnkpLmZpbGVfaWRcbiAgICAgICAgZGVsZXRlIGNyZWF0b3IubmV3QXZhdGFyXG4gICAgICB9XG4gICAgICBjb25zdCB1cGRhdGVkQ3JlYXRvciA9IGF3YWl0IGNsaWVudC5zZXJ2aWNlKCdjcmVhdG9yJykucGF0Y2goY3JlYXRvci5pZCwgY3JlYXRvcilcbiAgICAgIGRpc3BhdGNoKGNyZWF0b3JMb2dnZWRSZXRyaWV2ZWQodXBkYXRlZENyZWF0b3IpKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgZGlzcGF0Y2hBbGVydEVycm9yKGRpc3BhdGNoLCBlcnIubWVzc2FnZSlcbiAgICB9XG4gIH1cbn1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1OT1QgdXNlZCBmb3Igbm93XG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3JlYXRvck5vdGlmaWNhdGlvbkxpc3QoKSB7XG4gIHJldHVybiBhc3luYyAoZGlzcGF0Y2g6IERpc3BhdGNoKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICB0cnkge1xuICAgICAgZGlzcGF0Y2goZmV0Y2hpbmdDcmVhdG9yKCkpXG4gICAgICBjb25zdCBub3RpZmljYXRpb25MaXN0ID0gYXdhaXQgY2xpZW50LnNlcnZpY2UoJ25vdGlmaWNhdGlvbnMnKS5maW5kKHsgcXVlcnk6IHsgYWN0aW9uOiAnYnlDdXJyZW50Q3JlYXRvcicgfSB9KVxuICAgICAgZGlzcGF0Y2goY3JlYXRvck5vdGlmaWNhdGlvbkxpc3Qobm90aWZpY2F0aW9uTGlzdCkpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICBkaXNwYXRjaEFsZXJ0RXJyb3IoZGlzcGF0Y2gsIGVyci5tZXNzYWdlKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9sbG93Q3JlYXRvcihjcmVhdG9ySWQ6IHN0cmluZykge1xuICByZXR1cm4gYXN5bmMgKGRpc3BhdGNoOiBEaXNwYXRjaCk6IFByb21pc2U8YW55PiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZvbGxvdyA9IGF3YWl0IGNsaWVudC5zZXJ2aWNlKCdmb2xsb3ctY3JlYXRvcicpLmNyZWF0ZSh7IGNyZWF0b3JJZCB9KVxuICAgICAgZm9sbG93ICYmIGRpc3BhdGNoKHVwZGF0ZUNyZWF0b3JBc0ZvbGxvd2VkKCkpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICBkaXNwYXRjaEFsZXJ0RXJyb3IoZGlzcGF0Y2gsIGVyci5tZXNzYWdlKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5Gb2xsb3dDcmVhdG9yKGNyZWF0b3JJZDogc3RyaW5nKSB7XG4gIHJldHVybiBhc3luYyAoZGlzcGF0Y2g6IERpc3BhdGNoKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZm9sbG93ID0gYXdhaXQgY2xpZW50LnNlcnZpY2UoJ2ZvbGxvdy1jcmVhdG9yJykucmVtb3ZlKGNyZWF0b3JJZClcbiAgICAgIGZvbGxvdyAmJiBkaXNwYXRjaCh1cGRhdGVDcmVhdG9yTm90Rm9sbG93ZWQoKSlcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgIGRpc3BhdGNoQWxlcnRFcnJvcihkaXNwYXRjaCwgZXJyLm1lc3NhZ2UpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGb2xsb3dlcnNMaXN0KGNyZWF0b3JJZDogc3RyaW5nKSB7XG4gIHJldHVybiBhc3luYyAoZGlzcGF0Y2g6IERpc3BhdGNoKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbGlzdCA9IGF3YWl0IGNsaWVudC5zZXJ2aWNlKCdmb2xsb3ctY3JlYXRvcicpLmZpbmQoeyBxdWVyeTogeyBhY3Rpb246ICdmb2xsb3dlcnMnLCBjcmVhdG9ySWQgfSB9KVxuICAgICAgZGlzcGF0Y2goY3JlYXRvckZvbGxvd2VycyhsaXN0LmRhdGEpKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgZGlzcGF0Y2hBbGVydEVycm9yKGRpc3BhdGNoLCBlcnIubWVzc2FnZSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZvbGxvd2luZ0xpc3QoY3JlYXRvcklkOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGFzeW5jIChkaXNwYXRjaDogRGlzcGF0Y2gpOiBQcm9taXNlPGFueT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBsaXN0ID0gYXdhaXQgY2xpZW50LnNlcnZpY2UoJ2ZvbGxvdy1jcmVhdG9yJykuZmluZCh7IHF1ZXJ5OiB7IGFjdGlvbjogJ2ZvbGxvd2luZycsIGNyZWF0b3JJZCB9IH0pXG4gICAgICBkaXNwYXRjaChjcmVhdG9yRm9sbG93aW5nKGxpc3QuZGF0YSkpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICBkaXNwYXRjaEFsZXJ0RXJyb3IoZGlzcGF0Y2gsIGVyci5tZXNzYWdlKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlQ3JlYXRvcihjcmVhdG9ySWQ6IHN0cmluZykge1xuICByZXR1cm4gYXN5bmMgKGRpc3BhdGNoOiBEaXNwYXRjaCk6IFByb21pc2U8YW55PiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGNsaWVudC5zZXJ2aWNlKCdjcmVhdG9yJykucmVtb3ZlKGNyZWF0b3JJZClcbiAgICAgIGRpc3BhdGNoKHJlbW92ZUNyZWF0b3IoY3JlYXRvcklkKSlcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJjcmVhdG9yIiwidHlwZSIsIkNVUlJFTlRfQ1JFQVRPUl9SRVRSSUVWRUQiLCJDVVJSRU5UX0NSRUFUT1JfRkVUQ0giLCJDUkVBVE9SX0ZFVENIIiwiZGF0YSIsImFzeW5jIiwiZGlzcGF0Y2giLCJnZXRTdGF0ZSIsImZldGNoaW5nQ3VycmVudENyZWF0b3IiLCJ1c2VyTnVtYmVyIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibmFtZSIsInVzZXJuYW1lIiwiY3JlYXRvckxvZ2dlZFJldHJpZXZlZCIsImNsaWVudCIsInNlcnZpY2UiLCJjcmVhdGUiLCJlcnIiLCJsb2ciLCJtZXNzYWdlIiwiZmluZCIsInF1ZXJ5IiwiYWN0aW9uIiwibGltaXQiLCJDUkVBVE9SU19GRVRDSCIsInJlc3VsdHMiLCJDUkVBVE9SU19SRVRSSUVWRUQiLCJjcmVhdG9ycyIsImNyZWF0b3JJZCIsImZldGNoaW5nQ3JlYXRvciIsIkNSRUFUT1JfUkVUUklFVkVEIiwiY3JlYXRvclJldHJpZXZlZCIsImdldCIsIm5ld0F2YXRhciIsInN0b3JlZEF2YXRhciIsInVwbG9hZCIsImF2YXRhcklkIiwiZmlsZV9pZCIsInBhdGNoIiwiaWQiLCJub3RpZmljYXRpb25MaXN0IiwiQ1JFQVRPUl9OT1RJRklDQVRJT05fTElTVF9SRVRSSUVWRUQiLCJub3RpZmljYXRpb25zIiwiU0VUX0NSRUFUT1JfQVNfRk9MTE9XRUQiLCJyZW1vdmUiLCJTRVRfQ1JFQVRPUl9OT1RfRk9MTE9XRUQiLCJsaXN0IiwiQ1JFQVRPUl9GT0xMT1dFUlNfUkVUUklFVkVEIl0sIm1hcHBpbmdzIjoidU1BMEN1Q0EsU0FDOUIsQ0FDTEMsS0FBTUMsRUFDTkYsUUFBQUEsc0JBaUJLLENBQ0xDLEtBQU1FLHNCQUtELENBQ0xGLEtBQU1HLGNDOUNvQkMsVUFDckJDLE1BQU9DLEVBQW9CQyxjQUVyQkMsTUFDSkosRUFBTSxHQUNGLE9BQ0hLLEVBQWFDLEtBQUtDLE1BQXNCLElBQWhCRCxLQUFLRSxVQUFtQixJQUMvQ0MsS0FBTyxPQUFTSixJQUNoQkssU0FBVyxRQUFVTCxJQUluQk0sUUFEYUMsRUFBT0MsUUFBUSxXQUFXQyxPQUFPZCxXQUVoRGUsV0FDQ0MsSUFBSUQsS0FDT2IsRUFBVWEsRUFBSUUsK0JBTTlCaEIsTUFBT0MsVUFFREUsT0FFQU8sUUFEYUMsRUFBT0MsUUFBUSxXQUFXSyxLQUFLLENBQUVDLE1BQU8sQ0FBRUMsT0FBUSxxQkFFakVMLFdBQ0NDLElBQUlELEtBQ09iLEVBQVVhLEVBQUlFLHNCQWdCWEksVUFDbkJwQixNQUFPQyxFQUFvQkMsV0RYM0IsQ0FDTFAsS0FBTTBCLFVDYUVDLFFBQWdCWCxFQUFPQyxRQUFRLFdBQVdLLEtBQUssQ0FBRUMsTUFBTyxPREczRCxDQUNMdkIsS0FBTTRCLEVBQ05DLFNDSjZCRixVQUNwQlIsV0FDQ0MsSUFBSUQsS0FDT2IsRUFBVWEsRUFBSUUsc0JBS1pTLFVBQ2xCekIsTUFBT0MsVUFFRHlCLGdCRGxDa0JoQyxTQUN4QixDQUNMQyxLQUFNZ0MsRUFDTmpDLFFBQUFBLEdDaUNXa0MsT0FEYWpCLEVBQU9DLFFBQVEsV0FBV2lCLElBQUlKLFdBRTdDWCxXQUNDQyxJQUFJRCxLQUNPYixFQUFVYSxFQUFJRSxzQkFLVHRCLFVBQ3JCTSxNQUFPQyxhQUVERSxLQUNMVCxFQUFRb0MsVUFBVyxPQUNmQyxRQUFxQkMsRUFBT3RDLEVBQVFvQyxVQUFXLFFBQ25DRyxTQUFZRixFQUFxQkcsZUFDNUN4QyxFQUFRb0MsWUFHUnBCLFFBRG9CQyxFQUFPQyxRQUFRLFdBQVd1QixNQUFNekMsRUFBUTBDLEdBQUkxQyxXQUVsRW9CLFdBQ0NDLElBQUlELEtBQ09iLEVBQVVhLEVBQUlFLCtCQU85QmhCLE1BQU9DLFVBRUR5QixXQUNIVyxRQUF5QjFCLEVBQU9DLFFBQVEsaUJBQWlCSyxLQUFLLENBQUVDLE1BQU8sQ0FBRUMsT0FBUSx3QkRuQ3BGLENBQ0x4QixLQUFNMkMsRUFDTkMsY0NrQ21DRixVQUMxQnZCLFdBQ0NDLElBQUlELEtBQ09iLEVBQVVhLEVBQUlFLHNCQUtUUyxVQUNyQnpCLE1BQU9DLGNBRVdVLEVBQU9DLFFBQVEsa0JBQWtCQyxPQUFPLENBQUVZLFVBQUFBLEtBQ3JEeEIsRUR6Q1AsQ0FDTE4sS0FBTTZDLFVDeUNHMUIsV0FDQ0MsSUFBSUQsS0FDT2IsRUFBVWEsRUFBSUUsc0JBS1BTLFVBQ3ZCekIsTUFBT0MsY0FFV1UsRUFBT0MsUUFBUSxrQkFBa0I2QixPQUFPaEIsSUFDbkR4QixFRC9DUCxDQUNMTixLQUFNK0MsVUMrQ0c1QixXQUNDQyxJQUFJRCxLQUNPYixFQUFVYSxFQUFJRSxzQkFLTlMsVUFDeEJ6QixNQUFPQyxjQUVKMEMsUUFBYWhDLEVBQU9DLFFBQVEsa0JBQWtCSyxLQUFLLENBQUVDLE1BQU8sQ0FBRUMsT0FBUSxZQUFhTSxVQUFBQSxRRHJEOURELEVDc0REbUIsRUFBSzVDLEtEckQ1QixDQUNMSixLQUFNaUQsRUFDTnBCLFNBQUFBLFdDb0RTVixXQUNDQyxJQUFJRCxLQUNPYixFQUFVYSxFQUFJRSxhRHpETlEsY0M4REFDLFVBQ3hCekIsTUFBT0MsY0FFSjBDLFFBQWFoQyxFQUFPQyxRQUFRLGtCQUFrQkssS0FBSyxDQUFFQyxNQUFPLENBQUVDLE9BQVEsWUFBYU0sVUFBQUEsUUQxRDlERCxFQzJERG1CLEVBQUs1QyxLRDFENUIsQ0FDTEosS0FBTWlELEVBQ05wQixTQUFBQSxXQ3lEU1YsV0FDQ0MsSUFBSUQsS0FDT2IsRUFBVWEsRUFBSUUsYUQ5RE5RIn0=
