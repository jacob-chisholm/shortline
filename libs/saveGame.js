m['m_sav'].onclickEvent = function(menuItem,clicked){
  if(clicked == 1){
    var test = false;
    while(!test){
      var email = window.prompt("Enter a valid email address to save.");
      if(email == null){
        m['m_sav'].e.click();
        return
      }
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      test = re.test(email);
    }
    saveGame.save(email);
  }
}

var saveGame = new (function(){
  this.loaded = false;
  this.CORSRequest = function(method, url, callback, data) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
      // Most browsers.
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      // IE8 & IE9
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      // CORS not supported.
      alert('Could not contact server. <br> CORS Not Supported :-/');
    }

    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr.responseText);
        }
    }

    method == 'POST' ? xhr.send(data) : xhr.send();

  };

  this.save = function(email){

    var data = {
      tree: [],
      track: [],
      land: [],
      building: [],
      roads: []
    };

    for(var i = 0; i < tree.trees.length; i++)
      data.tree.push({x: tree.trees[i][0].position.x, z: tree.trees[i][0].position.z});

    for(var i = 0; i < trackPoints.length; i++)
      data.track.push(
        {x: trackPoints[i].p1.x, z: trackPoints[i].p1.z},
        {x: trackPoints[i].p3.x, z: trackPoints[i].p3.z}
      );

    var planeLineV = worldObj['plane'].children[0].geometry.vertices;
    for(var i = 0; i < planeLineV.length; i++)
      if(planeLineV[i].y != 0.1)
        data.land.push(
          {x: planeLineV[i].x, y: planeLineV[i].y, z: planeLineV[i].z}
        );

    for(var i = 0; i < building.building.length; i++)
      if(building.building[i] != undefined)
        data.building.push({
          name: building.building[i].name,
          x: building.building[i].position.x,
          z: building.building[i].position.z,
          height: building.building[i].buildingHeight,
          rotY: building.building[i].rotation.y
        });

    data.roads = layRoads.lay.saveData();

    console.log('save data',data);

    var form = new FormData();
    form.append('data', JSON.stringify(data));

    var saveURL = 'http://24.56.23.241:33033/shortline/trainserver/db.php?email='+email+'&type=add';
    var xhr = this.CORSRequest('POST', saveURL, function(response){
      alert("saveid: "+response);
      m['m_sav'].e.click();
    },form);
  }

  this.load = function(id){
    if(id != parseInt(id)){
      console.log('no Id given, game not loaded', id, parseInt(id))
      this.loaded = true;
      return;
    }

    var loadURL = 'http://24.56.23.241:33033/shortline/trainserver/db.php?id='+id+'&type=get';
    var xhr = this.CORSRequest('GET', loadURL, function(response){
      gameLoadData = JSON.parse(response);

      console.log('load save game: land');
      for(var i = 0; i < gameLoadData.land.length; i++)
        loadTerrain(gameLoadData.land[i]);

      console.log('load save game: tree');
      for(var i = 0; i < gameLoadData.tree.length; i++)
        tree.onclickAddTree(gameLoadData.tree[i]);

      console.log('load save game: building');
      for(var i = 0; i < gameLoadData.building.length; i++){
        building.curBuildingId++;
        building.building[building.curBuildingId] = worldObj[gameLoadData.building[i].name].newMesh();
        building.building[building.curBuildingId].name = gameLoadData.building[i].name;
        building.building[building.curBuildingId].position.x = gameLoadData.building[i].x;
        building.building[building.curBuildingId].position.z = gameLoadData.building[i].z;
        building.building[building.curBuildingId].baseY = gameLoadData.building[i].height
        building.building[building.curBuildingId].buildingHeight = findY(gameLoadData.building[i].x,gameLoadData.building[i].z) + gameLoadData.building[i].height
        building.building[building.curBuildingId].position.y = building.building[building.curBuildingId].buildingHeight;
        building.building[building.curBuildingId].rotation.y = gameLoadData.building[i].rotY;
        scene.add(building.building[building.curBuildingId]);
      }

      console.log('load save game: track');
      for(var i = 0; i < gameLoadData.track.length; i += 2){
        //if(i > 14) die();
        layTrack.trackPreLine.curSeg++;
        var p1 = new THREE.Vector3(gameLoadData.track[i].x,   findY(gameLoadData.track[i].x,  gameLoadData.track[i].z),  gameLoadData.track[i].z);
        var p3 = new THREE.Vector3(gameLoadData.track[i+1].x, findY(gameLoadData.track[i+1].x,gameLoadData.track[i+1].z),gameLoadData.track[i+1].z);

        track.addToSection(p1,recalcY(midpoint(p1,p3)),p3);

        var loadLine = new THREE.Geometry();
        loadLine.vertices = gridPointsOnLine(100,p1,p3);
        lineGeometry.computeLineDistances();
        layTrack.trackPreLine.children[layTrack.trackPreLine.curSeg] = new THREE.Line(loadLine, layTrack.trackPreLine.blinemat);

        trackPoints.push({
          p1: p1,
          p2: midpoint(p1,p2),
          p3: p3
        });

        layTrack.trackPreLine.curSeg--;

      }

      console.log('load save game: roads');
      for(var i = 0; i < gameLoadData.roads.length; i += 2)
        layRoads.lay.loadData(gameLoadData.roads[i],gameLoadData.roads[i + 1]);

      console.log('Save Loaded');
      saveGame.loaded = true;
    });

    //scene.remove(layTrack.trackPreLine.temp)

     //console.log('game loaded',gameLoadData);
  }



})();
