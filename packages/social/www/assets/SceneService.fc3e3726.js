import{A as i}from"./AlertService.bfed2141.js";import{c}from"./feathers.081246a7.js";import{al as s,am as E}from"./_app.009e96ac.js";const n={locationsRetrieved:e=>({type:"ADMIN_LOCATIONS_RETRIEVED",locations:e}),locationRetrieved:e=>({type:"ADMIN_LOCATION_RETRIEVED",location:e}),locationCreated:e=>({type:"ADMIN_LOCATION_CREATED",location:e}),locationPatched:e=>({type:"ADMIN_LOCATION_PATCHED",location:e}),locationRemoved:e=>({type:"ADMIN_LOCATION_REMOVED",location:e}),locationBanCreated:()=>({type:"ADMIN_LOCATION_BAN_CREATED"}),fetchingCurrentLocation:()=>({type:"ADMIN_FETCH_CURRENT_LOCATION"}),locationNotFound:()=>({type:"ADMIN_LOCATION_NOT_FOUND"}),locationTypesRetrieved:e=>({type:"ADMIN_LOCATION_TYPES_RETRIEVED",types:e})},p={setReadScopeError:(e,t)=>({type:"SET_SCOPE_READ_ERROR",message:e,statusCode:t}),setWriteScopeError:(e,t)=>({type:"SET_SCOPE_WRITE_ERROR",message:e,statusCode:t})},y={fetchLocationTypes:()=>async e=>{const t=await c.service("location-type").find();e(n.locationTypesRetrieved(t))},patchLocation:(e,t)=>async o=>{try{const r=await c.service("location").patch(e,t);o(n.locationPatched(r))}catch(r){console.error(r),i.dispatchAlertError(o,r.message)}},removeLocation:e=>async t=>{const o=await c.service("location").remove(e);t(n.locationRemoved(o))},createLocation:e=>async t=>{try{const o=await c.service("location").create(e);t(n.locationCreated(o))}catch(o){console.error(o),i.dispatchAlertError(t,o.message)}},fetchAdminLocations:e=>async t=>{try{const o=await c.service("location").find({query:{$sort:{name:1},$skip:s().locations.skip.value,$limit:s().locations.limit.value,adminnedLocations:!0}});t(n.locationsRetrieved(o))}catch(o){console.error(o),t(p.setReadScopeError(o.message,o.statusCode))}}},A={collectionsFetched:e=>({type:"ADMIN_SCENES_RETRIEVED",collections:e})},R={fetchAdminScenes:e=>async t=>{const o=E(),r=o.scenes.skip.value,a=o.scenes.limit.value,l=await c.service("collection").find({query:{$skip:e==="increment"?r+a:e==="decrement"?r-a:r,$limit:e==="all"?1e3:a,$sort:{name:1}}});t(A.collectionsFetched(l))},deleteScene:e=>async t=>{}};export{y as L,R as S};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmVTZXJ2aWNlLmZjM2UzNzI2LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9jbGllbnQtY29yZS9zcmMvYWRtaW4vcmVkdWNlcnMvYWRtaW4vbG9jYXRpb24vTG9jYXRpb25BY3Rpb25zLnRzIiwiLi4vLi4vLi4vY2xpZW50LWNvcmUvc3JjL2NvbW1vbi9yZWR1Y2Vycy9lcnJvci9FcnJvckFjdGlvbnMudHMiLCIuLi8uLi8uLi9jbGllbnQtY29yZS9zcmMvYWRtaW4vcmVkdWNlcnMvYWRtaW4vbG9jYXRpb24vTG9jYXRpb25TZXJ2aWNlLnRzIiwiLi4vLi4vLi4vY2xpZW50LWNvcmUvc3JjL2FkbWluL3JlZHVjZXJzL2FkbWluL3NjZW5lL1NjZW5lQWN0aW9ucy50cyIsIi4uLy4uLy4uL2NsaWVudC1jb3JlL3NyYy9hZG1pbi9yZWR1Y2Vycy9hZG1pbi9zY2VuZS9TY2VuZVNlcnZpY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9jYXRpb24gfSBmcm9tICdAeHJlbmdpbmUvY29tbW9uL3NyYy9pbnRlcmZhY2VzL0xvY2F0aW9uJ1xuXG5leHBvcnQgY29uc3QgTG9jYXRpb25BY3Rpb24gPSB7XG4gIGxvY2F0aW9uc1JldHJpZXZlZDogKGxvY2F0aW9uczogYW55KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdBRE1JTl9MT0NBVElPTlNfUkVUUklFVkVEJyBhcyBjb25zdCxcbiAgICAgIGxvY2F0aW9uczogbG9jYXRpb25zXG4gICAgfVxuICB9LFxuICBsb2NhdGlvblJldHJpZXZlZDogKGxvY2F0aW9uOiBhbnkpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ0FETUlOX0xPQ0FUSU9OX1JFVFJJRVZFRCcgYXMgY29uc3QsXG4gICAgICBsb2NhdGlvbjogbG9jYXRpb25cbiAgICB9XG4gIH0sXG4gIGxvY2F0aW9uQ3JlYXRlZDogKGxvY2F0aW9uOiBMb2NhdGlvbikgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnQURNSU5fTE9DQVRJT05fQ1JFQVRFRCcgYXMgY29uc3QsXG4gICAgICBsb2NhdGlvbjogbG9jYXRpb25cbiAgICB9XG4gIH0sXG4gIGxvY2F0aW9uUGF0Y2hlZDogKGxvY2F0aW9uOiBMb2NhdGlvbikgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnQURNSU5fTE9DQVRJT05fUEFUQ0hFRCcgYXMgY29uc3QsXG4gICAgICBsb2NhdGlvbjogbG9jYXRpb25cbiAgICB9XG4gIH0sXG4gIGxvY2F0aW9uUmVtb3ZlZDogKGxvY2F0aW9uOiBMb2NhdGlvbikgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnQURNSU5fTE9DQVRJT05fUkVNT1ZFRCcgYXMgY29uc3QsXG4gICAgICBsb2NhdGlvbjogbG9jYXRpb25cbiAgICB9XG4gIH0sXG4gIGxvY2F0aW9uQmFuQ3JlYXRlZDogKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnQURNSU5fTE9DQVRJT05fQkFOX0NSRUFURUQnIGFzIGNvbnN0XG4gICAgfVxuICB9LFxuICBmZXRjaGluZ0N1cnJlbnRMb2NhdGlvbjogKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnQURNSU5fRkVUQ0hfQ1VSUkVOVF9MT0NBVElPTicgYXMgY29uc3RcbiAgICB9XG4gIH0sXG4gIGxvY2F0aW9uTm90Rm91bmQ6ICgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ0FETUlOX0xPQ0FUSU9OX05PVF9GT1VORCcgYXMgY29uc3RcbiAgICB9XG4gIH0sXG4gIGxvY2F0aW9uVHlwZXNSZXRyaWV2ZWQ6IChkYXRhOiBhbnkpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ0FETUlOX0xPQ0FUSU9OX1RZUEVTX1JFVFJJRVZFRCcgYXMgY29uc3QsXG4gICAgICB0eXBlczogZGF0YVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgdHlwZSBMb2NhdGlvbkFjdGlvblR5cGUgPSBSZXR1cm5UeXBlPHR5cGVvZiBMb2NhdGlvbkFjdGlvbltrZXlvZiB0eXBlb2YgTG9jYXRpb25BY3Rpb25dPlxuIiwiZXhwb3J0IGNvbnN0IEVycm9yQWN0aW9uID0ge1xuICBzZXRSZWFkU2NvcGVFcnJvcjogKG1lc3NhZ2U6IHN0cmluZywgc3RhdHVzQ29kZTogbnVtYmVyKSA9PiB7XG4gICAgcmV0dXJuIHsgdHlwZTogJ1NFVF9TQ09QRV9SRUFEX0VSUk9SJyBhcyBjb25zdCwgbWVzc2FnZSwgc3RhdHVzQ29kZSB9XG4gIH0sXG4gIHNldFdyaXRlU2NvcGVFcnJvcjogKG1lc3NhZ2U6IHN0cmluZywgc3RhdHVzQ29kZTogbnVtYmVyKSA9PiB7XG4gICAgcmV0dXJuIHsgdHlwZTogJ1NFVF9TQ09QRV9XUklURV9FUlJPUicgYXMgY29uc3QsIG1lc3NhZ2UsIHN0YXR1c0NvZGUgfVxuICB9XG59XG5leHBvcnQgdHlwZSBFcnJvckFjdGlvblR5cGUgPSBSZXR1cm5UeXBlPHR5cGVvZiBFcnJvckFjdGlvbltrZXlvZiB0eXBlb2YgRXJyb3JBY3Rpb25dPlxuIiwiaW1wb3J0IHsgRGlzcGF0Y2ggfSBmcm9tICdyZWR1eCdcbmltcG9ydCB7IExvY2F0aW9uQWN0aW9uIH0gZnJvbSAnLi9Mb2NhdGlvbkFjdGlvbnMnXG5pbXBvcnQgeyBBbGVydFNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9jb21tb24vcmVkdWNlcnMvYWxlcnQvQWxlcnRTZXJ2aWNlJ1xuaW1wb3J0IHsgRXJyb3JBY3Rpb24gfSBmcm9tICcuLi8uLi8uLi8uLi9jb21tb24vcmVkdWNlcnMvZXJyb3IvRXJyb3JBY3Rpb25zJ1xuaW1wb3J0IHsgY2xpZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vZmVhdGhlcnMnXG5pbXBvcnQgeyBhY2Nlc3NMb2NhdGlvblN0YXRlIH0gZnJvbSAnLi9Mb2NhdGlvblN0YXRlJ1xuXG5leHBvcnQgY29uc3QgTG9jYXRpb25TZXJ2aWNlID0ge1xuICBmZXRjaExvY2F0aW9uVHlwZXM6ICgpID0+IHtcbiAgICByZXR1cm4gYXN5bmMgKGRpc3BhdGNoOiBEaXNwYXRjaCk6IFByb21pc2U8YW55PiA9PiB7XG4gICAgICBjb25zdCBsb2NhdGlvblR5cGVzID0gYXdhaXQgY2xpZW50LnNlcnZpY2UoJ2xvY2F0aW9uLXR5cGUnKS5maW5kKClcbiAgICAgIGRpc3BhdGNoKExvY2F0aW9uQWN0aW9uLmxvY2F0aW9uVHlwZXNSZXRyaWV2ZWQobG9jYXRpb25UeXBlcykpXG4gICAgfVxuICB9LFxuICBwYXRjaExvY2F0aW9uOiAoaWQ6IHN0cmluZywgbG9jYXRpb246IGFueSkgPT4ge1xuICAgIHJldHVybiBhc3luYyAoZGlzcGF0Y2g6IERpc3BhdGNoKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5zZXJ2aWNlKCdsb2NhdGlvbicpLnBhdGNoKGlkLCBsb2NhdGlvbilcbiAgICAgICAgZGlzcGF0Y2goTG9jYXRpb25BY3Rpb24ubG9jYXRpb25QYXRjaGVkKHJlc3VsdCkpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXG4gICAgICAgIEFsZXJ0U2VydmljZS5kaXNwYXRjaEFsZXJ0RXJyb3IoZGlzcGF0Y2gsIGVyci5tZXNzYWdlKVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcmVtb3ZlTG9jYXRpb246IChpZDogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIGFzeW5jIChkaXNwYXRjaDogRGlzcGF0Y2gpOiBQcm9taXNlPGFueT4gPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnNlcnZpY2UoJ2xvY2F0aW9uJykucmVtb3ZlKGlkKVxuICAgICAgZGlzcGF0Y2goTG9jYXRpb25BY3Rpb24ubG9jYXRpb25SZW1vdmVkKHJlc3VsdCkpXG4gICAgfVxuICB9LFxuICBjcmVhdGVMb2NhdGlvbjogKGxvY2F0aW9uOiBhbnkpID0+IHtcbiAgICByZXR1cm4gYXN5bmMgKGRpc3BhdGNoOiBEaXNwYXRjaCk6IFByb21pc2U8YW55PiA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQuc2VydmljZSgnbG9jYXRpb24nKS5jcmVhdGUobG9jYXRpb24pXG4gICAgICAgIGRpc3BhdGNoKExvY2F0aW9uQWN0aW9uLmxvY2F0aW9uQ3JlYXRlZChyZXN1bHQpKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgICAgICBBbGVydFNlcnZpY2UuZGlzcGF0Y2hBbGVydEVycm9yKGRpc3BhdGNoLCBlcnIubWVzc2FnZSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGZldGNoQWRtaW5Mb2NhdGlvbnM6IChpbmNEZWM/OiAnaW5jcmVtZW50JyB8ICdkZWNyZW1lbnQnKSA9PiB7XG4gICAgcmV0dXJuIGFzeW5jIChkaXNwYXRjaDogRGlzcGF0Y2gpOiBQcm9taXNlPGFueT4gPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbG9jYXRpb25zID0gYXdhaXQgY2xpZW50LnNlcnZpY2UoJ2xvY2F0aW9uJykuZmluZCh7XG4gICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICRzb3J0OiB7XG4gICAgICAgICAgICAgIG5hbWU6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAkc2tpcDogYWNjZXNzTG9jYXRpb25TdGF0ZSgpLmxvY2F0aW9ucy5za2lwLnZhbHVlLFxuICAgICAgICAgICAgJGxpbWl0OiBhY2Nlc3NMb2NhdGlvblN0YXRlKCkubG9jYXRpb25zLmxpbWl0LnZhbHVlLFxuICAgICAgICAgICAgYWRtaW5uZWRMb2NhdGlvbnM6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIGRpc3BhdGNoKExvY2F0aW9uQWN0aW9uLmxvY2F0aW9uc1JldHJpZXZlZChsb2NhdGlvbnMpKVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICAgICAgZGlzcGF0Y2goRXJyb3JBY3Rpb24uc2V0UmVhZFNjb3BlRXJyb3IoZXJyb3IubWVzc2FnZSwgZXJyb3Iuc3RhdHVzQ29kZSkpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJleHBvcnQgY29uc3QgU2NlbmVBY3Rpb24gPSB7XG4gIGNvbGxlY3Rpb25zRmV0Y2hlZDogKGNvbGxlY3Rpb25zOiBhbnlbXSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnQURNSU5fU0NFTkVTX1JFVFJJRVZFRCcsXG4gICAgICBjb2xsZWN0aW9uczogY29sbGVjdGlvbnNcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgU2NlbmVBY3Rpb25UeXBlID0gUmV0dXJuVHlwZTx0eXBlb2YgU2NlbmVBY3Rpb25ba2V5b2YgdHlwZW9mIFNjZW5lQWN0aW9uXT5cbiIsImltcG9ydCB7IGNsaWVudCB9IGZyb20gJy4uLy4uLy4uLy4uL2ZlYXRoZXJzJ1xuaW1wb3J0IHsgRGlzcGF0Y2ggfSBmcm9tICdyZWR1eCdcbmltcG9ydCB7IFNjZW5lQWN0aW9uIH0gZnJvbSAnLi9TY2VuZUFjdGlvbnMnXG5pbXBvcnQgeyBhY2Nlc3NTY2VuZVN0YXRlIH0gZnJvbSAnLi9TY2VuZVN0YXRlJ1xuXG5leHBvcnQgY29uc3QgU2NlbmVTZXJ2aWNlID0ge1xuICBmZXRjaEFkbWluU2NlbmVzOiAoaW5jRGVjPzogJ2luY3JlbWVudCcgfCAnZGVjcmVtZW50JyB8ICdhbGwnKSA9PiB7XG4gICAgcmV0dXJuIGFzeW5jIChkaXNwYXRjaDogRGlzcGF0Y2gpOiBQcm9taXNlPGFueT4gPT4ge1xuICAgICAgY29uc3QgYWRtaW5TY2VuZSA9IGFjY2Vzc1NjZW5lU3RhdGUoKVxuICAgICAgY29uc3Qgc2tpcCA9IGFkbWluU2NlbmUuc2NlbmVzLnNraXAudmFsdWVcbiAgICAgIGNvbnN0IGxpbWl0ID0gYWRtaW5TY2VuZS5zY2VuZXMubGltaXQudmFsdWVcbiAgICAgIGNvbnN0IHNjZW5lcyA9IGF3YWl0IGNsaWVudC5zZXJ2aWNlKCdjb2xsZWN0aW9uJykuZmluZCh7XG4gICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgJHNraXA6IGluY0RlYyA9PT0gJ2luY3JlbWVudCcgPyBza2lwICsgbGltaXQgOiBpbmNEZWMgPT09ICdkZWNyZW1lbnQnID8gc2tpcCAtIGxpbWl0IDogc2tpcCxcbiAgICAgICAgICAkbGltaXQ6IGluY0RlYyA9PT0gJ2FsbCcgPyAxMDAwIDogbGltaXQsXG4gICAgICAgICAgJHNvcnQ6IHtcbiAgICAgICAgICAgIG5hbWU6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBkaXNwYXRjaChTY2VuZUFjdGlvbi5jb2xsZWN0aW9uc0ZldGNoZWQoc2NlbmVzKSlcbiAgICB9XG4gIH0sXG4gIGRlbGV0ZVNjZW5lOiAoc2NlbmVJZDogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIGFzeW5jIChkaXNwYXRjaDogRGlzcGF0Y2gpOiBQcm9taXNlPGFueT4gPT4ge31cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIwSUFFYSxHQUFpQixDQUM1QixtQkFBb0IsQUFBQyxHQUNaLEVBQ0wsS0FBTSw0QkFDTixjQUdKLGtCQUFtQixBQUFDLEdBQ1gsRUFDTCxLQUFNLDJCQUNOLGFBR0osZ0JBQWlCLEFBQUMsR0FDVCxFQUNMLEtBQU0seUJBQ04sYUFHSixnQkFBaUIsQUFBQyxHQUNULEVBQ0wsS0FBTSx5QkFDTixhQUdKLGdCQUFpQixBQUFDLEdBQ1QsRUFDTCxLQUFNLHlCQUNOLGFBR0osbUJBQW9CLElBQ1gsRUFDTCxLQUFNLCtCQUdWLHdCQUF5QixJQUNoQixFQUNMLEtBQU0saUNBR1YsaUJBQWtCLElBQ1QsRUFDTCxLQUFNLDZCQUdWLHVCQUF3QixBQUFDLEdBQ2hCLEVBQ0wsS0FBTSxpQ0FDTixNQUFPLEtDbkRBLEVBQWMsQ0FDekIsa0JBQW1CLENBQUMsRUFBaUIsSUFDNUIsRUFBRSxLQUFNLHVCQUFpQyxVQUFTLGVBRTNELG1CQUFvQixDQUFDLEVBQWlCLElBQzdCLEVBQUUsS0FBTSx3QkFBa0MsVUFBUyxnQkNFakQsRUFBa0IsQ0FDN0IsbUJBQW9CLElBQ1gsS0FBTyxJQUFxQyxNQUMzQyxHQUFnQixLQUFNLEdBQU8sUUFBUSxpQkFBaUIsU0FDbkQsRUFBZSx1QkFBdUIsS0FHbkQsY0FBZSxDQUFDLEVBQVksSUFDbkIsS0FBTyxJQUFxQyxJQUM3QyxNQUNJLEdBQVMsS0FBTSxHQUFPLFFBQVEsWUFBWSxNQUFNLEVBQUksS0FDakQsRUFBZSxnQkFBZ0IsVUFDakMsV0FDQyxNQUFNLEtBQ0QsbUJBQW1CLEVBQVUsRUFBSSxXQUlwRCxlQUFnQixBQUFDLEdBQ1IsS0FBTyxJQUFxQyxNQUMzQyxHQUFTLEtBQU0sR0FBTyxRQUFRLFlBQVksT0FBTyxLQUM5QyxFQUFlLGdCQUFnQixLQUc1QyxlQUFnQixBQUFDLEdBQ1IsS0FBTyxJQUFxQyxJQUM3QyxNQUNJLEdBQVMsS0FBTSxHQUFPLFFBQVEsWUFBWSxPQUFPLEtBQzlDLEVBQWUsZ0JBQWdCLFVBQ2pDLFdBQ0MsTUFBTSxLQUNELG1CQUFtQixFQUFVLEVBQUksV0FJcEQsb0JBQXFCLEFBQUMsR0FDYixLQUFPLElBQXFDLElBQzdDLE1BQ0ksR0FBWSxLQUFNLEdBQU8sUUFBUSxZQUFZLEtBQUssQ0FDdEQsTUFBTyxDQUNMLE1BQU8sQ0FDTCxLQUFNLEdBRVIsTUFBTyxJQUFzQixVQUFVLEtBQUssTUFDNUMsT0FBUSxJQUFzQixVQUFVLE1BQU0sTUFDOUMsa0JBQW1CLFFBR2QsRUFBZSxtQkFBbUIsVUFDcEMsV0FDQyxNQUFNLEtBQ0wsRUFBWSxrQkFBa0IsRUFBTSxRQUFTLEVBQU0sZ0JDMUR2RCxFQUFjLENBQ3pCLG1CQUFvQixBQUFDLEdBQ1osRUFDTCxLQUFNLHlCQUNOLGlCQ0NPLEVBQWUsQ0FDMUIsaUJBQWtCLEFBQUMsR0FDVixLQUFPLElBQXFDLE1BQzNDLEdBQWEsSUFDYixFQUFPLEVBQVcsT0FBTyxLQUFLLE1BQzlCLEVBQVEsRUFBVyxPQUFPLE1BQU0sTUFDaEMsRUFBUyxLQUFNLEdBQU8sUUFBUSxjQUFjLEtBQUssQ0FDckQsTUFBTyxDQUNMLE1BQU8sSUFBVyxZQUFjLEVBQU8sRUFBUSxJQUFXLFlBQWMsRUFBTyxFQUFRLEVBQ3ZGLE9BQVEsSUFBVyxNQUFRLElBQU8sRUFDbEMsTUFBTyxDQUNMLEtBQU0sUUFJSCxFQUFZLG1CQUFtQixLQUc1QyxZQUFhLEFBQUMsR0FDTCxLQUFPLElBQXFDIn0=
