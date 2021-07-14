THREE.ARMiniMap = (function() {
  var ARMiniMap = function(geography) {
    var minimap;
    minimap = L.map("mapid").setView([geography.player.lat, geography.player.lng], 17);

    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(minimap);

    var arrow_icon = L.divIcon({
      iconSize: [40, 40], // size of the icon
      className: "arrow-marker",
      html: '<div class="arrow-marker-inner"></div>'
    });

    var arrow_marker = L.marker([geography.player.lat, geography.player.lng], { icon: arrow_icon }).addTo(minimap);

    setInterval(function() {
      // update the map arrow.
      var vector = camera.getWorldDirection();
      var theta = -Math.atan2(vector.x, vector.z) + Math.PI / 2;
      $(".arrow-marker-inner").css({
        transform: "rotateZ(" + theta + "rad)"
      });
      arrow_marker.setLatLng(new L.LatLng(geography.player.lat, geography.player.lng));
    }, 100);

    setInterval(function() {
      minimap.panTo(new L.LatLng(geography.player.lat, geography.player.lng), { animate: false });
    }, 1000);
  };

  return ARMiniMap;
})();
