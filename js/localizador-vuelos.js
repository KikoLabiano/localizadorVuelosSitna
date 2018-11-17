window.onload = function () {

   // setInterval(function(){ 
        runner(getFlightData()); 
    //}, 3000);   

    // map.loaded(()=>{
    //     let c = document.getElementsByClassName("ol-unselectable")[0];
    // var ctx=c.getContext("2d");
    // ctx.beginPath();
    // ctx.moveTo(0,0);
    // ctx.lineTo(300,1500);
    // ctx.stroke();
    // });
}

let map = new SITNA.Map("mapa", {
    crs: "EPSG:4326",
    initialExtent: [ // Coordenadas en grados decimales, porque el sistema de referencia espacial es WGS 84.
        -2.84820556640625,
        41.78912492257675, -0.32135009765625,
        43.55789822064767
    ],
    maxExtent: [-2.84820556640625,
        41.78912492257675, -0.32135009765625,
        43.55789822064767
    ],
    baseLayers: [
        SITNA.Consts.layer.IDENA_DYNBASEMAP
    ],
    defaultBaseLayer: SITNA.Consts.layer.IDENA_DYNBASEMAP,
    // Establecemos el mapa de situación con una capa compatible con WGS 84
    controls: {
        overviewMap: {
            layer: SITNA.Consts.layer.IDENA_DYNBASEMAP
        }
    }
});

let vuelosFiltrados = [];
let aeropuertos = [];
let aviones = [];

//fetch('https://aviation-edge.com/v2/public/airportDatabase?key=924c89-5af179')



function* getFlightData() {

    let aeropuertosJSON;
    try {
        aeropuertosJSON = yield fetchJSONFile("mockAPI/airports.json");
    } catch (err) {
        console.error("Se ha producido un error al obtener los aeropuertos");
    } finally {
        for (let i = 0; i <= aeropuertosJSON.length; i++) {
            if (aeropuertosJSON[i] !== undefined) {
                aeropuertos.push({
                    "Codigo": aeropuertosJSON[i].codeIataAirport,
                    "nombre": aeropuertosJSON[i].nameAirport,
                    "pais": aeropuertosJSON[i].nameCountry
                });
            }
        }
    }
    
    /*let c = document.getElementsByClassName("ol-unselectable")[0];
    var ctx=c.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(300,1500);
    ctx.stroke();*/

    let vuelos;
    try {
        vuelos = yield fetchJSONFile("mockAPI/flightsNavarra.json");
    } catch (err) {
        console.error("Se ha producido un error al obtener los vuelos");
    } finally {
        let latMin = 41.78912492257675;
        let latMax = 43.55789822064767;
        let longMin = -2.84820556640625;
        let longMax = -0.32135009765625;
        vuelosFiltrados = vuelos.filter(v => v.geography.latitude >= latMin &&
            v.geography.latitude <= latMax &&
            v.geography.longitude >= longMin &&
            v.geography.longitude <= longMax);

        let aerop;
        for (let i = 0; i < vuelosFiltrados.length; i++) {
            aeropOrigen = obtenerAeropuerto(vuelosFiltrados[i].departure.iataCode);
            aeropDest = obtenerAeropuerto(vuelosFiltrados[i].arrival.iataCode);
            //tipoAvion = obtenerAvion(vuelosFiltrados[i].aircraft.regNumber)
            //document.documentElement.style.setProperty('--radius', '50deg');

            map.addMarker([vuelosFiltrados[i].geography.longitude, vuelosFiltrados[i].geography.latitude], { // Coordenadas en grados decimales porque el mapa está en WGS 84.
                cssClass: "plane",
                width: 40,
                height: 40,
                data: {
                    "Nombre vuelo": vuelosFiltrados[i].flight.iataNumber,
                    "Origen": `${aeropOrigen.nombre} (${aeropOrigen.pais})`,
                    "Destino": `${aeropDest.nombre} (${aeropDest.pais})`,
                    "Altitud": vuelosFiltrados[i].geography.altitude,
                    "Velocidad horizontal": vuelosFiltrados[i].speed.horizontal
                },
                showPopup: true
            });
        }
    }
}

function obtenerAeropuerto(codAeropuerto) {
    let aeropuertoFiltrado = aeropuertos.filter(a => a.Codigo == codAeropuerto);
    return {
        "nombre": aeropuertoFiltrado[0].nombre,
        "pais": aeropuertoFiltrado[0].pais
    };
}

function obtenerAvion(numRegAvion) {
    let avionFiltrado = aviones.filter(a => a.Codigo == codAeropuerto);
    return {
        "nombre": avionFiltrado[0].nombre
    };
}

function fetchJSONFile(path) {
    return new Promise((resolve) => {
        let httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4) {
                if (httpRequest.status === 200) {
                    resolve(JSON.parse(httpRequest.responseText));
                }
            }
        };
        httpRequest.open('GET', path);
        httpRequest.send();
    });
}

function runner(gen) {
    const iterator = gen;

    function run(arg) {
        let res = iterator.next(arg);
        if (res.done) {
            return res.value;
        } else {
            return Promise.resolve(res.value).then(run);
        }
    }

    return run();
}


/*let map = new SITNA.Map("mapa", {
    crs: "EPSG:4326",
    initialExtent: [ // Coordenadas en grados decimales, porque el sistema de referencia espacial es WGS 84.
        -2.84820556640625,
        41.78912492257675,
        -0.32135009765625,
        43.55789822064767
    ],
    maxExtent: [
        -2.84820556640625,
        41.78912492257675,
        -0.32135009765625,
        43.55789822064767
    ],
    baseLayers: [
        SITNA.Consts.layer.IDENA_DYNBASEMAP
    ],
    defaultBaseLayer: SITNA.Consts.layer.IDENA_DYNBASEMAP,
    // Establecemos el mapa de situación con una capa compatible con WGS 84
    controls: {
        overviewMap: {
            layer: SITNA.Consts.layer.IDENA_DYNBASEMAP
        }
    }
});

let vuelosFiltrados = [];
let aeropuertos = [];
let aviones = [];

//fetch('https://aviation-edge.com/v2/public/airportDatabase?key=924c89-5af179')
fetchJSONFile("mockAPI/airports.json")
// .then((response)=>{
//     return response.json();
// })
.then((aeropuertosJSON)=>{
    for(let i=0;i<=aeropuertosJSON.length;i++)
    {
        if(aeropuertosJSON[i]!==undefined)
        {
            aeropuertos.push({"Codigo": aeropuertosJSON[i].codeIataAirport, "nombre": aeropuertosJSON[i].nameAirport, "pais": aeropuertosJSON[i].nameCountry});
        }
    }
})
.then(()=>{
    //fetch('http://aviation-edge.com/v2/public/flights?key=924c89-5af179&limit=30000')
    fetchJSONFile("mockAPI/flights.json")
    // .then((response)=>{
    //     return response.json();
    // })
    .then((vuelos)=>{
        let latMin = 41.78912492257675;
        let latMax = 43.55789822064767;
        let longMin = -2.84820556640625;
        let longMax = -0.32135009765625;
        vuelosFiltrados = vuelos.filter(v=>v.geography.latitude >= latMin
        && v.geography.latitude <= latMax
        && v.geography.longitude >= longMin
        && v.geography.longitude <= longMax);

        let aerop;
        for(let i=0;i<vuelosFiltrados.length;i++)
        {
            aeropOrigen = obtenerAeropuerto(vuelosFiltrados[i].departure.iataCode);
            aeropDest = obtenerAeropuerto(vuelosFiltrados[i].arrival.iataCode);
            //tipoAvion = obtenerAvion(vuelosFiltrados[i].aircraft.regNumber)
            //document.documentElement.style.setProperty('--radius', '50deg');

            map.addMarker([vuelosFiltrados[i].geography.longitude, vuelosFiltrados[i].geography.latitude], { // Coordenadas en grados decimales porque el mapa está en WGS 84.
            cssClass: "plane",
            width: 40,
            height: 40,
            data: {
                "Nombre vuelo": vuelosFiltrados[i].flight.iataNumber,
                "Origen": `${aeropOrigen.nombre} (${aeropOrigen.pais})`,
                "Destino": `${aeropDest.nombre} (${aeropDest.pais})`,
                "Altitud": vuelosFiltrados[i].geography.altitude,
                "Velocidad horizontal": vuelosFiltrados[i].speed.horizontal
            },
            showPopup: true
        });
        }
    });
    // .then(()=>{
    //     for(let i=0;i<vuelosFiltrados.length;i++)
    //     {
    //         fetch('https://aviation-edge.com/v2/public/airplaneDatabase?key=924c89-5af179&numberRegistration=' + vuelosFiltrados[i].aircraft.regNumber)
    //         .then((response)=>{
    //             return response.json();
    //         })
    //         .then((avionJSON)=>{
    //             aviones.push({"Nombre": avionJSON[0].productionLine, "NumReg": avionJSON[0].numberRegistration});
    //         });
    //     }
    //     console.log(aviones);
    // });
});
// .then(()=>{
//     fetch('https://aviation-edge.com/v2/public/planeTypeDatabase?key=924c89-5af179')
//     .then((response)=>{
//                 return response.json();
//             })
//             .then((avionesJSON)=>{
//                 for(let i=0;i<=avionesJSON.length;i++)
//                 {
//                     if(avionesJSON[i]!==undefined)
//                     {
//                         aeropuertos.push({"NumReg": avionesJSON[i].numberRegistration, "nombre": aeropuerto[i].nameAircraft});
//                     }
//                 }
//         })
//         .then(()=>{

// })

map.loaded(()=>{
    let cnv = document.querySelector(".ol-unselectable");
    // cnv.parent('myCanvas');
    // ellipse(50, 50, 50, 50);
    var ctx=cnv.getContext("2d");
    ctx.beginPath();
    ctx.arc(100,75,50,0,2*Math.PI);
    ctx.stroke();
});

function obtenerAeropuerto(codAeropuerto)
{
    let aeropuertoFiltrado = aeropuertos.filter(a => a.Codigo == codAeropuerto);
    return {"nombre": aeropuertoFiltrado[0].nombre, "pais": aeropuertoFiltrado[0].pais};
}

function obtenerAvion(numRegAvion)
{
    let avionFiltrado = aviones.filter(a => a.Codigo == codAeropuerto);
    return {"nombre": avionFiltrado[0].nombre};
}

function fetchJSONFile(path) {
  return new Promise((resolve)=>{
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                resolve(JSON.parse(httpRequest.responseText));
            }
        }
    };
  httpRequest.open('GET', path);
  httpRequest.send();
});
}*/