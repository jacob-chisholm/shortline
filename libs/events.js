
//---Events---//

renderer.domElement.addEventListener( 'mousewheel', function( event ) {
  event.preventDefault();
  event.stopPropagation();

  var delta = 0;
  delta = event.wheelDelta * .001;
  if (((zoom + delta > .5) & delta < 0) | ((zoom + delta < 20) & delta > 0)) {
    zoom += delta;
  }

  camera.left = window.innerWidth / -zoom;
  camera.right = window.innerWidth / zoom;
  camera.top = window.innerHeight / zoom;
  camera.bottom = window.innerHeight / -zoom;

  camera.updateProjectionMatrix();
},false);

function onWindowResize() {
  camera.left = window.innerWidth / -zoom;
  camera.right = window.innerWidth / zoom;
  camera.top = window.innerHeight / zoom;
  camera.bottom = window.innerHeight / -zoom;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

mouseInMenu = 0;
document.addEventListener( 'mousemove', function (e){
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  if (e.target.id == 'c') {
    mouseInMenu = 0;
    getMouseIntersect(mouse, [plane],function(i){
      if(m['m_bld'].clicked == 1){building.processBuildingMove(i[0].point);}
    });
  }
  else{
    mouseInMenu = 1;
  }
});



document.addEventListener( 'mousedown', function (e){
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  if (mouseInMenu == 0) {

    //terrain
    console.log(plane);
    getMouseIntersect(mouse, [plane],function(i){
      console.log("'intersect'",i);
      if(m['m_ter_raise'].clicked == 1){raiseLowerTerrain(i,+10);}
      if(m['m_ter_lower'].clicked == 1){raiseLowerTerrain(i,-10);}
      if(m['m_tra_lay'].clicked == 1 ){layTrack.processClick(i);}
      if(m['m_tre'].clicked == 1){tree.onclickAddTree(i[0].point);}
      if(m['m_bld'].clicked == 1){building.processBuildingClick(i[0].point);}
    });

    //trackswitches
    console.log(track.throws);
    getMouseIntersect( mouse, track.throws, getThrows);

  }
}, false );
