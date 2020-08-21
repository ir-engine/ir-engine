'use strict';

if( !window.__ECSY_DEVTOOLS_INJECTED ) {
	function compareVersions(v1, v2) {
    if (typeof v1 !== 'string') return false;
    if (typeof v2 !== 'string') return false;
    v1 = v1.split('.');
    v2 = v2.split('.');
    const k = Math.min(v1.length, v2.length);
    for (let i = 0; i < k; ++ i) {
        v1[i] = parseInt(v1[i], 10);
        v2[i] = parseInt(v2[i], 10);
        if (v1[i] > v2[i]) return 1;
        if (v1[i] < v2[i]) return -1;
    }
    return v1.length == v2.length ? 0: (v1.length < v2.length ? -1 : 1);
	}

	function sendMessage( type, data ) {
		if (window.__ECSY_REMOTE_DEVTOOLS_INJECTED && window.__ECSY_REMOTE_DEVTOOLS.connection) {
			window.__ECSY_REMOTE_DEVTOOLS.connection.send({
				id: 'ecsy-devtools',
				method: type,
				data: JSON.stringify(data)
			});
		}
		window.postMessage({
			id: 'ecsy-devtools',
			method: type,
			data,
		}, '*');
	}

	window.addEventListener('ecsy-world-created', e => {
		if (!window.__ECSY_DEVTOOLS) {
			window.__ECSY_DEVTOOLS = {
				worlds: []
			};
		}

		var world = e.detail.world;
		var version = e.detail.version;
		if (!version || compareVersions(version, "0.1.4") < 0) {
			console.info("ECSY detected but this version is not compatible with the devtools installed");
			return;
		}

		window.__ECSY_DEVTOOLS.worlds.push(world);
		window.__ECSY_DEVTOOLS.ecsyVersion = version;

		var stats = {
			processDeferredRemoval: 0
		};

		var _pools = {};

		var oriWorldExecute = world.execute;

		world.execute = function(delta, time) {
			oriWorldExecute.apply(world, arguments);
			window.__ECSY_DEVTOOLS.refreshStats();
		}

		window.__ECSY_DEVTOOLS.refreshStats = function() {
			let startTime = performance.now();
			const entityManager = world.entityManager;

			const deferredRemoval = {
				enabled: entityManager.deferredRemovalEnabled,
				executeTime: stats.processDeferredRemoval,
				entitiesToRemove: entityManager.entitiesToRemove.length,
				entitiesWithComponentsToRemove: entityManager.entitiesWithComponentsToRemove.length,
				totalComponentsToRemove: entityManager.entitiesWithComponentsToRemove.reduce((a, c) => a + c._ComponentTypesToRemove.length, 0)
			};

			const queries = Object.values(world.entityManager._queryManager._queries).map(q => q.toJSON());

			const systems = world.systemManager._systems.map(system => {
				let data = system.toJSON();
				for (name in data.queries) {
					var query = data.queries[name];
					var queryData = queries.find(q => q.key === query.key);
					query.numEntities = queryData.numEntities;
					query.components = queryData.components;
				}

				return data;
			});

			systems.sort((a, b) => {
				return a.priority - b.priority || a.order - b.order;
			});

			// Reset time for next step
			// @todo Do it on core?
			world.systemManager._systems.forEach(system => {
				system.executeTime = 0;
			});


			let componentsNum = world.componentsManager.numComponents;
			let components = {};
			for (let id in componentsNum) {
				var component = world.componentsManager.Components[id];
				const name = component.getName ? component.getName() : id;

				components[name] = {
					count: componentsNum[id],
					type: component.isTagComponent ? 'tag' :
								(component.isComponent ? 'component' :
								(component.isSystemStateComponent ? 'systemstate' : 'none'))
				};
			}

			let componentsPools = {};
			for (name in world.componentsManager._componentPool) {
				if (!_pools[name]) {
					_pools[name] = {
						lastPoolSize: 0
					};
				}

				let pool = world.componentsManager._componentPool[name];
				var cName = pool.T.name;
				componentsPools[cName] = {
					valid: pool.isObjectPool,
					used: pool.totalUsed(),
					free: pool.totalFree(),
					size: pool.totalSize(),
					increased: pool.totalSize() > _pools[name].lastPoolSize
				}

				_pools[name].lastPoolSize = pool.totalSize();
			};

			let data = {
				world: {
					enabled: world.enabled
				},
				lastExecutedSystem: world.systemManager.lastExecutedSystem ? world.systemManager.lastExecutedSystem.constructor.name : '',
				numEntities: world.entityManager._entities.length,
				systems: systems,
				queries: queries,
				components: components,
				deferredRemoval: deferredRemoval,
				componentsPools: componentsPools,
				ecsyVersion: version,
				statsComputeTime: performance.now() - startTime
			};
			sendMessage('refreshData', data);
		}

		sendMessage('worldCreated', {});
	});

	function log() {
		var args = Array.from( arguments );
		 args.unshift( 'background: #9999ff; color: #ffffff;' );
		args.unshift( `%c ECSY Injector ` );

		console.log.apply( console, args );
	}

	// log( 'ECSYInspector injected', document.location.href );

	window.__ECSY_DEVTOOLS_INJECTED = true;
}
