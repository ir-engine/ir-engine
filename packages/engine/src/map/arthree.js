import * as THREE from 'three';

export const factory = function() {
  const ARTHREE = {};
  ARTHREE.is_mobile = (function(a) {
    return (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    );
  })(navigator.userAgent || navigator.vendor || window.opera);

  var hour = new Date().getHours();
  ARTHREE.is_daytime = hour > 7 && hour < 20;

  /**
   *  Get browser viewport coords from a scene object.
   */
  ARTHREE.to_screen_position = function(obj, camera) {
    var vector = new THREE.Vector3();

    var widthHalf = 0.5 * renderer.context.canvas.width;
    var heightHalf = 0.5 * renderer.context.canvas.height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = vector.x * widthHalf + widthHalf;
    vector.y = -(vector.y * heightHalf) + heightHalf;

    return {
      x: vector.x,
      y: vector.y
    };
  };

  ARTHREE.onWindowResize = function() {
    shader_uniforms.resolution.value.x = window.innerWidth;
    shader_uniforms.resolution.value.y = window.innerHeight;
  };

  var ARWorld = function(opts) {
    this.opts = opts;

    if (!this.opts.camera) {
      throw new Error("opts.camera is required.");
    }
    ARTHREE.onWindowResize();
    window.addEventListener("resize", ARTHREE.onWindowResize, false);

    // raycasters for collisions.
    this.touch_raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(1, 0, 0), 0, 325);
  };

  var velocity = new THREE.Vector3();

  ARWorld.prototype.update = function() {
    var time = performance.now();

    var delta = (time - prevTime) / 1000;

    shader_uniforms.time.value += clock.getDelta() * 5;

    prevTime = time;
  };

  ARWorld.prototype.getFeatureDesc = function(feat) {
    return (
      feat.name ||
      feat.properties.name ||
      feat.properties.kind_detail ||
      feat.properties.address ||
      (feat.dataset === "landuse" && feat.properties.landuse_kind) ||
      (feat.properties.addr_street ? feat.properties.addr_street + " - " + feat.properties.addr_housenumber : null) ||
      feat.properties.kind
    );
  };

  ARWorld.prototype.clearSelection = function() {
    if (this.selection) {
      this.selection.material.emissive.setHex(this.selection.currentHex);
      scene.remove(this.selection.sdf);
      this.selection = null;
    }
  };

  /**
   * @param look - based on look direction.
   */
  ARWorld.prototype.updateSelection = function(object) {
    var vector = new THREE.Vector3(); // create once and reuse it!
    this.opts.camera.getWorldDirection(vector);
    this.touch_raycaster.ray.origin.copy(object.position);
    this.touch_raycaster.ray.origin.y -= 3;
    this.touch_raycaster.ray.direction = vector;

    // get closest object in target ray.
    var intersects = this.touch_raycaster.intersectObjects(scene.children);

    var closest = intersects.shift();
    while (closest && !closest.object.feature) closest = intersects.shift();

    if (closest) {
      if (this.selection !== closest.object) {
        this.clearSelection();

        this.selection = closest.object;

        //this.selection.currentHex = this.selection.material.emissive.getHex();
        //this.selection.material.emissive.setHex( 0x333333 );

        if (this.selection.feature.dataset == "roads") this.selection.scale.y += 0.1;

        console.log(this.getFeatureDesc(this.selection.feature), ":");
        console.log(this.selection.feature);

        var desc = this.getFeatureDesc(this.selection.feature);
        /*if (desc) {

            var sdf = new THREE.ARText(desc);
            scene.add(sdf.text);
            sdf.text.position.copy(closest.point);
            this.selection.sdf = sdf;

            var deco_material = new THREE.MeshLambertMaterial( {
              fog: false,
              color: 0xddbb33
            } );
            var geo = new THREE.SphereGeometry( 15, 10, 10);
            var sphere = new THREE.Mesh( geo, deco_material );
            sphere.position.copy(closest.point);
            scene.add(sphere);
          }*/
      }
      this.selection.distance = closest.distance;
    } else {
      this.clearSelection();
    }
  };

  var shader_uniforms = {
    time: { value: 1.0 },
    resolution: { value: new THREE.Vector2() }
  };

  var clock = new THREE.Clock();

  var prevTime = performance.now();

  ARWorld.prototype.update_scene_label = function() {
    if (this.selection && this.selection.sdf) {
      var sdf = this.selection.sdf;
      //position
      /*var vector = new THREE.Vector3();
      vector.copy(this.opts.camera.getWorldPosition())
      var offset = new THREE.Vector3();
      offset.copy(this.opts.camera.getWorldDirection());
      offset.multiplyScalar(3);
      vector.add(offset);
      vector.multiplyScalar(0.2);
      sdf.text.position.multiplyScalar(0.8);
      sdf.text.position.add(vector);*/

      //rotation
      var vector2 = sdf.text.parent.worldToLocal(this.opts.camera.getWorldPosition());
      sdf.text.lookAt(vector2);
      sdf.text.rotateX(Math.PI);
    }
  };

  ARTHREE.ARWorld = ARWorld;

  return ARTHREE;
};
