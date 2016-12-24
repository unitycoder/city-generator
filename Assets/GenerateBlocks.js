﻿#pragma strict

import System.Collections.Generic;

private var city: CityConfig;
var meshgen: MeshGenerator;
var watermap: Texture2D;
var heightmap: Texture2D;

//recursively create buildings return array of meshes
function SetupBuildings(x, z, w, l, h, sub, color){
	// var street_meshes = new List.<GameObject>();
	SetupBuildings(x,z,w,l,h,sub,color, new List.<GameObject>());
}

function SetupBuildings(x, z, w, l, h, sub, color, buildings){
	var offset, half, between;
	var depth = Mathf.Pow(2, city.subdiv);
	var tall = Mathf.Round((h/city.build_max_h)*100) > 90;
	var slice_deviation = 15;
	//really tall buildings take the whole block
	var building: Building;
	if(sub<1 || tall){
		var buildingOpts: BuildingOpts = new BuildingOpts();
		buildingOpts.h = NumberRange.GetRandInt(h-city.block_h_dev, h+city.block_h_dev);
		buildingOpts.w = w;
		buildingOpt.l = l;
		buildingOpts.x = x;
		buildingOpts.z = z;
		buildingOpts.tall = tall;
		buildingOpt.color = color;

		building = new Building(buildingOpts);

		buildings.Add(building.group);
		//add all buildings in this block to scene as a single mesh
		if(buildings.length >= depth || tall){
			scene.add(mergeMeshes(buildings));
		}
	}
	else{
		//recursively slice the block until num of subdivisions met
		//TODO: simplify this
		var dir = (w==l) ? chance(50) : w>l;
		if(dir){
			offset = Math.abs(NumberRange.GetRandInt(0, slice_deviation));
			between = (city.inner_block_margin/2);
			half = w/2;
			var x_prime = x + offset; 
			var w1 = Math.abs((x+half)-x_prime) - between;
			var w2 = Math.abs((x-half)-x_prime) - between;
			var x1 = x_prime + (w1/2) + between;
			var x2 = x_prime - (w2/2) - between;
			SetupBuildings(x1, z, w1, l, h, sub-1, color, buildings);
			SetupBuildings(x2, z, w2, l, h, sub-1, color, buildings);
		}
		else{
			offset = Math.abs(NumberRange.GetRandInt(0, slice_deviation));
			between = (city.inner_block_margin/2);
			half = l/2;
			var z_prime = z + offset; 
			var l1 = Math.abs((z+half)-z_prime) - between;
			var l2 = Math.abs((z-half)-z_prime) - between;
			var z1 = z_prime + (l1/2) + between;
			var z2 = z_prime - (l2/2) - between;
			SetupBuildings(x, z1, w, l1, h, sub-1, color, buildings);
			SetupBuildings(x, z2, w, l2, h, sub-1, color, buildings);
		}
	}
}

function Start () {
	this.city = new CityConfig();
	this.meshgen = GetComponent.<MeshGenerator>();

	/* - Ported code - */

	var curb: GameObject;

	for (var i = 0; i < city.blocks_x; i++) {
		for (var j = 0; j < city.blocks_z; j++) {
			if(MyColors.ColorsEqual (watermap.GetPixel(j,i), Color.white)) {
				var x = ((city.block*i) + city.block/2) - city.width/2;
				var z = ((city.block*j) + city.block/2) - city.length/2;
				//get values from heightmap array
				var hm = heightmap.GetPixel(j,i).grayscale;
				//get building height for block
				var h = NumberRange.MapToRange(hm, city.build_min_h, city.build_max_h, city.build_exp);
				//max possible distance from center of block
				var w = city.block-city.road_w;
				//with inner block margins
				var inner = w-(city.inner_block_margin*2);
				//create curb mesh
				var curb_color = MyColors.GROUND;
				curb = meshgen.getBoxMesh(curb_color, w, city.curb_h, w);
				curb.transform.parent = transform;
				curb.transform.localPosition = new Vector3(x, city.curb_h/2, z);

				//create buildings in debug mode the building color is mapped to the hightmap
				if(hm > city.tree_threshold) {
					// var building_color = DEBUG ? getGreyscaleColor(hm) : colors.BUILDING;
					var building_color = MyColors.BUILDING;
					SetupBuildings(x, z, inner, inner,  h, city.subdiv, building_color);
				}
				/* TODO
				//create tree meshes
				else{ setupPark(x, z, inner, inner); }
				*/
			}
		}
	}
}

function Update () {

}