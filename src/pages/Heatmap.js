import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import { Container, Row, Col, Form, Button, InputGroup, DropDown } from 'react-bootstrap';
import './Heatmap.css';
import Select, { StylesConfig } from 'react-select';



// Your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoic2ltZ3NzIiwiYSI6ImNsdGl2Z2RiNjBrdTYya3RrdW1sbWlpNzMifQ.ApaBswyO4uiI7f3fcMshTg';

const shipTypes = {
  "General Purpose Tug": '#1f77b4',
  "Tanker": '#ff7f0e',
  "Line Handling Tug": "#2ca02c",
  "Anchor Handling Tug": '#d62728',
  "Escort Tug": '#9467bd',
  "Utility Tug": '#8c564b',
};

const ShipListes = [
  "General Purpose Tug",
  "Tanker",
  "Line Handling Tug",
  "Anchor Handling Tug",
  "Escort Tug",
  "Utility Tug"
]

const shipTypeOptions = [
  { label: "Select All", value: "all" },  // "Select All" option
  ...ShipListes.map(ship => ({ label: ship, value: ship }))
];

/*spire_mit_20170130to20170130_evergreenstate
mxak_mit_20170130to20170130_evergreenstate */


function Onemap() {
  const mapContainerRef1 = useRef(null);
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const [MapObject, SetMapObject] = useState(null);

  //const Spirelayers = ['spire_mit_20170109to20170109_alaskanfrontier'];

  //const Mxaklayers = ['mxak_mit_20170109to20170109_alaskanfrontier'];

  const [Spirelayers, setSpirelayers] = useState([/*'spire_mit_20170130to20170130_polarendeavour'*/]);

  const [Mxaklayers, setMxaklayer] = useState([/*'mxak_mit_20170130to20170130_polarendeavour'*/]);
  const MxaklayersRef = useRef(Mxaklayers);
  const SpirelayersRef = useRef(Spirelayers);
  const [checkedShips, setCheckedShips] = useState([]);

  const [selectedShipTypes, setSelectedShipTypes] = useState([]);

  const handleShipTypeSelect = (selectedOptions) => {
    // If "Select All" is selected, set selectedShipTypes to all ship types
    const allSelected = selectedOptions.some(option => option.value === 'all');
    setSelectedShipTypes(allSelected ? shipTypeOptions.slice(1) : selectedOptions);
  };

  useEffect(() => {
    MxaklayersRef.current = Mxaklayers;
  }, [Mxaklayers]);

  useEffect(() => {
    SpirelayersRef.current = Spirelayers;
  }, [Spirelayers]);

  const [sliderValue, setSliderValue] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  // Format dates to datetime-local input format (YYYY-MM-DDTHH:MM)
  const formatDateTimeLocal = (date) => {
    return date.toISOString().slice(0, 16);
  };

  // State initialization
  const [fromTime, setFromTime] = useState(formatDateTimeLocal(oneDayAgo));
  const [toTime, setToTime] = useState(formatDateTimeLocal(now));
  const [fromTimeHeatMap, setFromTimeHeatMap] = useState(formatDateTimeLocal(oneDayAgo));
  const [toTimeHeatMap, setToTimeHeatMap] = useState(formatDateTimeLocal(now));

  const [vesselNames1, setvesselNames1] = useState([])

  const [isPlaying, setIsPlaying] = useState(false);
  const [CurrentIntervalTimestamp, setCurrentIntervalTimestamp] = useState('')
  const [currentLyerID, setcurrentLyerID] = useState(null)

  const [showTimeInterval, setShowTimeInterval] = useState(false);

  const [trips, setTrips] = useState([
    { id: 1, name: 'mxak_monthly_20160101to20160131', mxaklayer: 'mxak_monthly_20160101to20160131', fromTime: '2016-01-01T01:00', toTime: '2016-01-31T23:00' },
    { id: 2, name: 'mxak_monthly_20170101to20170131', mxaklayer: 'mxak_monthly_20170101to20170131', fromTime: '2017-01-01T01:00', toTime: '2017-01-31T23:00' },
    { id: 3, name: 'mxak_monthly_20180301to20180331', mxaklayer: 'mxak_monthly_20180301to20180331', fromTime: '2018-03-01T01:00', toTime: '2018-03-31T23:00' },
    { id: 4, name: 'mxak_monthly_20190701to20190731', mxaklayer: 'mxak_monthly_20190701to20190731', fromTime: '2019-07-01T01:00', toTime: '2019-07-31T23:00' },
    { id: 5, name: 'mxak_monthly_20201101to20201130', mxaklayer: 'mxak_monthly_20201101to20201130', fromTime: '2020-11-01T01:00', toTime: '2020-11-30T23:00' },
    { id: 6, name: 'mxak_monthly_20210401to20210430', mxaklayer: 'mxak_monthly_20210401to20210430', fromTime: '2021-04-01T01:00', toTime: '2021-04-30T23:00' },
    { id: 7, name: 'mxak_monthly_20221101to20221130', mxaklayer: 'mxak_monthly_20221101to20221130', fromTime: '2022-11-01T01:00', toTime: '2022-11-30T23:00' },
    { id: 8, name: 'minmax_20170101to20170104_polarresolution', spirelayer: 'spire_minmax_20170101to20170104_polarresolution', mxaklayer: 'mxak_minmax_20170101to20170104_polarresolution', fromTime: '2017-01-01T01:00', toTime: '2017-01-04T23:00' },
    { id: 9, name: 'minmax_20170102to20170109_libertybay', spirelayer: 'spire_minmax_20170102to20170109_libertybay', mxaklayer: 'mxak_minmax_20170102to20170109_libertybay', fromTime: '2017-01-02T01:00', toTime: '2017-01-09T23:00' },
    { id: 10, name: 'minmax_20170105to20170108_polarAdventure', spirelayer: 'spire_minmax_20170105to20170108_polaradventure', mxaklayer: 'mxak_minmax_20170105to20170108_polaradventure', fromTime: '2017-01-05T01:00', toTime: '2017-01-08T23:00' },
    { id: 11, name: 'minmax_20170105to20170108_evergreenstate', spirelayer: 'spire_minmax_20170105to20170108_evergreenstate', mxaklayer: 'mxak_minmax_20170105to20170108_evergreenstate', fromTime: '2017-01-05T01:00', toTime: '2017-01-08T23:00' },
    { id: 12, name: 'minmax_20170118to20170120_polarendeavour', spirelayer: 'spire_minmax_20170118to20170120_polarendeavour', mxaklayer: 'mxak_minmax_20170118to20170120_polarendeavour', fromTime: '2017-01-18T01:00', toTime: '2017-01-20T23:00' },
    { id: 13, name: 'mxak_june2019', spirelayer: 'none', mxaklayer: 'mxak_june2019', fromTime: '2019-06-01T01:00', toTime: '2019-06-31T23:00' },
    { id: 14, name: 'mxak_june24tojune26_2019', spirelayer: 'none', mxaklayer: 'mxak_june24tojune26_2019', fromTime: '2019-06-24T01:00', toTime: '2019-06-26T23:00' },
    { id: 15, name: 'mxak_dec12todec14_2019', spirelayer: 'none', mxaklayer: 'mxak_dec12todec14_2019', fromTime: '2019-12-12T01:00', toTime: '2019-12-14T23:00' },

    //{ id: 3, name: 'Trippy', spirelayer : 'mxak1m', mxaklayer : 'mxak1m', fromTime: '2016-01-15T01:00', toTime: '2016-01-25T23:00'}

    // Add more trips as needed
  ]);
  const [selectedTripId, setSelectedTripId] = useState('');



  const displayRenderedvessels = (map, layers, vesselSide) => {

    // Assuming your vector tile layer has an ID 'vessels-layer'
    // and 'vesselname' is a property in your vector tile source
    const features = map.queryRenderedFeatures({ layers: layers });
    // Temporary map to ensure uniqueness
    const tempMap = new Map();

    features.forEach(feature => {
      const vesselName = feature.properties.vesselname;
      const shipType = feature.properties.shiptype;

      // Use vesselName and shipType as a composite key
      const uniqueKey = `${vesselName}-${shipType}`;

      // Only add if this uniqueKey hasn't been added before
      if (!tempMap.has(uniqueKey)) {
        tempMap.set(uniqueKey, {
          name: vesselName,
          shiptype: shipType,
        });
      }
    });

    // Convert the Map values back to an array
    const uniqueVesselInfo = Array.from(tempMap.values());

    if (vesselSide === 1) {
      setvesselNames1(uniqueVesselInfo);
    } else {
      //setvesselNames2(uniqueVesselInfo);
    }

  }
  useEffect(() => {
    const map1 = new mapboxgl.Map({
      container: mapContainerRef1.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-146.88171, 60.55939],
      zoom: 2,
      scrollZoom: false, // disable scroll zoom
      dragPan: false, // disable drag panning
      touchZoomRotate: false // disable pinch zoo
    });


    map1.on('load', function () {
      
      SetMapObject(map1)

      //Set the Geojson Layer
      map1.addSource('pg_zones', {
        type: 'geojson',
        // Use the URL to your GeoServer GeoJSON output
        data: 'http://34.23.30.245:8080/geoserver/ne/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ne:pg_zones&outputFormat=application/json'
      });

      map1.addLayer({
        id: 'pg_zones',
        type: 'fill',
        source: 'pg_zones', // This should match the ID of the source added
        layout: {},
        paint: {
          'fill-color': '#888888', // Choose a fill color
          'fill-opacity': 0.1, // Very transparent fill
          'fill-outline-color': '#000000' // Color of the border
        }
      }/*, 'background'*/); // Adding it behind all other layers

      map1.addLayer({
        id: 'labels',
        type: 'symbol',
        source: 'pg_zones', // This should match the ID of your GeoJSON source
        layout: {
          'text-field': ['get', 'zonename'], // Adjust 'name' to the property you want to use for labels
          'text-size': 12,
          'text-anchor': 'center',
          'text-justify': 'center'
        },
        paint: {
          'text-color': '#000000', // Set the text color
          'text-halo-color': '#ffffff', // Optional: Set a halo color to make labels more readable over map features
          'text-halo-width': 1 // Optional: Set the halo width
        }
      });

      map1.on('zoom', () => {
        if (map1.getZoom() > 8) {
          // Make the layer invisible if the zoom level is greater than 10
          if (map1.getLayer('durationHeatmap')) {

            map1.setLayoutProperty('durationHeatmap', 'visibility', 'none');

          }
          if (map1.getLayer('durationLabels')) {

            map1.setLayoutProperty('durationLabels', 'visibility', 'none');

          }

        } else {
          // Make the layer visible otherwise

          if (map1.getLayer('durationHeatmap')) {

            map1.setLayoutProperty('durationHeatmap', 'visibility', 'visible');

          }
          if (map1.getLayer('durationLabels')) {

            map1.setLayoutProperty('durationLabels', 'visibility', 'visible');

          }
        }
      });

    });


    //Trigger event when the map fully loaded and rendered anything
    function onMapIdle() {

      if (MxaklayersRef.current.length > 0) {
        displayRenderedvessels(map1, MxaklayersRef.current, 1);
      }


      // Optionally, remove the listener if you only need to run this once
      //map1.off('idle', onMapIdle);
    }

    // Listen for the idle event
    map1?.on('idle', onMapIdle);


    // Clean up on unmount
    return () => {

      map1.remove();
    };
  }, []); // Empty array ensures effect runs once on mount

  const GetfilteredData = (fromTime, toTime) => {
    console.log(fromTime, toTime)
    const fromUnix = Math.floor(new Date(fromTime).getTime() / 1000);
    const toUnix = Math.floor(new Date(toTime).getTime() / 1000);

    // Difference in seconds divided by (20 * 60) to get total 20-minute intervals

    const hoursDiff = (toUnix - fromUnix) / (20 * 60);

    setTotalHours(Math.floor(hoursDiff));


    MapObject?.setFilter(Mxaklayers, [
      'all',
      ['>=', ['to-number', ['get', 'bs_ts_unix']], fromUnix],
      ['<=', ['to-number', ['get', 'bs_ts_unix']], toUnix]
    ]);
    MapObject?.setFilter(`${Mxaklayers}-labels`, [
      'all',
      ['>=', ['to-number', ['get', 'bs_ts_unix']], fromUnix],
      ['<=', ['to-number', ['get', 'bs_ts_unix']], toUnix]
    ]);

    /*
    if(ismxak1mLayerVisible === true) {
      MapObject.setFilter('vector-tiles-mxak1m', [
        'all',
        ['>=', ['to-number', ['get', 'bs_ts_unix']], fromUnix],
        ['<=', ['to-number', ['get', 'bs_ts_unix']], toUnix]
      ]);
    } 
    if(istripLayerVisible === true) {
      MapObject.setFilter('vector-tiles-layer', [
        'all',
        ['>=', ['to-number', ['get', 'bs_ts_unix']], fromUnix],
        ['<=', ['to-number', ['get', 'bs_ts_unix']], toUnix]
      ]);
    } */


  }

  useEffect(() => {
    if (MapObject && Mxaklayers.length > 0 && totalHours > 0) {


      //displayRenderedvessels(MapObject2)
      const fromUnix = Math.floor(new Date(fromTime).getTime() / 1000);
      // Calculate the timestamp for the selected hour
      const selectedHourTimestamp = fromUnix + parseInt(sliderValue) * (20 * 60); // Convert hours to seconds

      //Setting starting and endpoint dates
      const Startdate = new Date(selectedHourTimestamp * 1000);
      const Enddate = new Date((selectedHourTimestamp + (20 * 60)) * 1000);

      let startingDate = ('0' + (Startdate.getMonth() + 1)).slice(-2) + '/' + // Months are zero-indexed, add 1
        ('0' + Startdate.getDate()).slice(-2) + '/' +
        Startdate.getFullYear();

      let startingTime = ('0' + Startdate.getHours()).slice(-2) + ':' +
        ('0' + Startdate.getMinutes()).slice(-2)

      let endingDate = ('0' + (Enddate.getMonth() + 1)).slice(-2) + '/' + // Months are zero-indexed, add 1
        ('0' + Enddate.getDate()).slice(-2) + '/' +
        Enddate.getFullYear();

      let endingTime = ('0' + Enddate.getHours()).slice(-2) + ':' +
        ('0' + Enddate.getMinutes()).slice(-2)

      //console.log(startingTimeSecond, endingTimeSecond)
      setCurrentIntervalTimestamp(`${startingDate} - ${endingDate}\n${startingTime} - ${endingTime}`)

      //layers.forEach(function (layerID) {
      MapObject?.setFilter(Mxaklayers, [
        'all',
        ['>=', ['to-number', ['get', 'bs_ts_unix']], selectedHourTimestamp],
        ['<=', ['to-number', ['get', 'bs_ts_unix']], selectedHourTimestamp + (20 * 60)]
      ]);
      MapObject?.setFilter(`${Mxaklayers}-labels`, [
        'all',
        ['>=', ['to-number', ['get', 'bs_ts_unix']], selectedHourTimestamp],
        ['<=', ['to-number', ['get', 'bs_ts_unix']], selectedHourTimestamp + (20 * 60)]
      ]);


      //Refresh the vessel list
      //displayRenderedvessels(MapObject, Mxaklayers)
      //});
    }
  }, [sliderValue, MapObject, totalHours]); // Update when sliderValue changes or map1 object changes

  useEffect(() => {
    let interval = null;

    if (isPlaying && sliderValue < totalHours) {
      interval = setInterval(() => {
        setSliderValue((prevSliderValue) => {
          const nextSliderValue = parseInt(prevSliderValue) + 1;
          // Stop automatically when reaching the end
          if (nextSliderValue >= totalHours) {
            setIsPlaying(false);
            return prevSliderValue; // Keep the slider at the last hour without overflowing
          }
          return nextSliderValue.toString();
        });
      }, 1000); // Update every second
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval); // Cleanup on component unmount or isPlaying change
  }, [isPlaying, sliderValue, totalHours]);

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d.getTime());
  }

  function formatDateToDateTimeLocalWithAMPM(date) {
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error('Invalid date');
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // JS months are zero-indexed.
    const day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours.toString().padStart(2, '0') : 12; // the hour '0' should be '12'

    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  }
  function Legend({ shipTypes }) {
    return (
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '10px', borderRadius: '8px', zIndex: 1 }}>
        <span style={{ marginBottom: '10px', fontWeight: 600, fontSize: '0.8em' }}>Ship Types</span>
        <table style={{ borderCollapse: 'collapse' }}>
          {Object.entries(shipTypes).map(([type, color]) => (
            <tr key={type}>
              <td style={{ padding: '5px' }}>
                <span style={{ backgroundColor: color, width: '10px', height: '10px', display: 'inline-block', marginRight: '5px' }}></span>
              </td>
              <td style={{ textAlign: 'left', padding: '5px' }}>
                <span style={{ fontWeight: 400, fontSize: '0.8em' }}>{type}</span>
              </td>
            </tr>
          ))}
        </table>
      </div>
    );
  }


  function extractDistinctVesselNames(geojsonData) {
    const nameTypeSet = new Set(); // Use a Set to collect unique name and type pairs

    geojsonData.features.forEach(feature => {
      const vesselName = feature.properties.vesselname;
      const vesselType = feature.properties.shiptype;
      if (vesselName && vesselType) {
        // Combine the name and type into a single string with a delimiter
        const combined = `${vesselName}|${vesselType}`;
        nameTypeSet.add(combined);
      }
    });

    // Convert the Set back into an array of objects with distinct name and type pairs
    const distinctPairs = Array.from(nameTypeSet).map(item => {
      const [name, type] = item.split('|');
      return { vessel_name: name, vessel_type: type };
    });

    return distinctPairs;
  }
  function calculateDurationsByVessel(pointsWithin) {
    const durationsByVessel = {};
    pointsWithin.features.forEach((feature) => {
      const vesselName = feature.properties.vesselname;
      const timestamp = (feature.properties.bs_ts_unix / (60 * 60)).toFixed(1);
      if (!durationsByVessel[vesselName]) {
        durationsByVessel[vesselName] = { min: timestamp, max: timestamp };
      } else {
        durationsByVessel[vesselName].min = Math.min(durationsByVessel[vesselName].min, timestamp);
        durationsByVessel[vesselName].max = Math.max(durationsByVessel[vesselName].max, timestamp);
      }
    });

    // Convert min/max to duration and aggregate total duration
    let totalDuration = 0;
    Object.keys(durationsByVessel).forEach(vesselName => {
      const duration = parseInt(durationsByVessel[vesselName].max - durationsByVessel[vesselName].min);
      durationsByVessel[vesselName] = duration; // Replace min/max with duration
      totalDuration += duration;
    });

    return { totalDuration, durationsByVessel };
  }
  function updateMapSourceHeatMap(map, layer, shiptype, currentLayerId, fromUNIX, toUNIX) {
    console.log(layer, shiptype, currentLayerId, fromUNIX, toUNIX)
    if (!map) return; // Ensure the map is initialized

    //const currentLayerId = "your-current-layer-id"; // You need to manage layer IDs state if they change dynamically

    // Remove existing layer/source if necessary
    /*if(layer !== '' && layer !== undefined){
      if (map.getLayer(layer)) {
        map.removeLayer(layer);
        map.removeSource(layer);
      }
    } */
    const cqlFilterValue = shiptype.map(value => `'${value}'`).join(',');
    const cqlFilter = `shiptype IN (${cqlFilterValue}) AND bs_ts_unix BETWEEN ${fromUNIX} AND ${toUNIX}`;
    const encodedCqlFilter = encodeURIComponent(cqlFilter);
    console.log(cqlFilterValue);
    let url = `http://34.23.30.245:8080/geoserver/ne/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ne%3A${currentLayerId}&outputFormat=application%2Fjson&CQL_FILTER=${encodedCqlFilter}`

    fetch(url)
      .then(response => response.json())
      .then(data => {

        //const uniqueVesselNames = extractDistinctVesselNames(data);
        //setvesselNames1(uniqueVesselNames)
        //console.log(uniqueVesselNames)

        const buffered = data.features.map((feature) => turf.buffer(feature, 5, { units: 'kilometers' }));

        // Calculate durations based on intersections
        const durationResults = buffered.map((buffer) => {
          // Find original points within the current buffer
          const pointsWithin = turf.pointsWithinPolygon(
            turf.featureCollection(data.features),
            buffer
          );

          let Durations_By_Vessel = calculateDurationsByVessel(pointsWithin)

          // Extract bs_ts_unix timestamps from points within the buffer
          const timestamps = pointsWithin.features.map(
            (feature) => feature.properties.bs_ts_unix
          );

          let totalDurationFromTimestamps = 0;
          // Calculate duration as max - min timestamp
          if (timestamps.length > 0) {
            const minTimestamp = Math.min(...timestamps);
            const maxTimestamp = Math.max(...timestamps);
            totalDurationFromTimestamps = maxTimestamp - minTimestamp

            return { totalDurationFromTimestamps, Durations_By_Vessel };
          }

          return { totalDurationFromTimestamps, Durations_By_Vessel }; // Return 0 duration if no points are within the buffer
        });

        const durations = durationResults.map(result => result.Durations_By_Vessel.totalDuration);
        const durationsByVessel = durationResults.map(result => result.Durations_By_Vessel);

        const maxDuration = Math.max(...durations);

        // Prepare heatmap features with calculated durations
        const heatmapFeatures = buffered.map((feature, index) => ({
          type: "Feature",
          properties: { duration: durations[index], detail: `${JSON.stringify(durationsByVessel[index])}` },
          geometry: feature.geometry,
        }));


        const heatmapGeoJSON = {
          type: "FeatureCollection",
          features: heatmapFeatures,
        };
        //console.log(heatmapGeoJSON)

        // Continue with adding/updating the heatmap source and layer in Mapbox as before
        if (map.getSource("heatmapSource")) {
          map.getSource("heatmapSource").setData(heatmapGeoJSON);
        } else {
          // Add heatmap source and layer as before
          map.addSource('heatmapSource', {
            type: 'geojson',
            data: heatmapGeoJSON,
          });

          map.addLayer({
            id: 'durationHeatmap',
            type: 'heatmap',
            source: 'heatmapSource',
            minzoom: 0, // Ensure layer is visible starting from the lowest zoom level
            paint: {
              // Increase the heatmap weight based on the 'duration' property
              'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', 'duration'],
                0, 0,
                maxDuration, 1 // Adjust according to your data
              ],
              // Heatmap color ramp
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(33,102,172,0)',
                0.2, 'blue',
                0.4, 'royalblue',
                0.6, 'cyan',
                0.8, 'lime',
                1, 'yellow'
              ],
              // Adjust the heatmap radius by zoom level to stay visible at higher zoom levels
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 30, // Small radius at the lowest zoom levels
                9, 30, // Larger radius at mid zoom levels
                22, 50 // Even larger radius at the highest zoom levels to ensure visibility
              ],
              // Ensure the heatmap is not fully transparent at higher zoom levels
              'heatmap-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 1,
                9, 0.8,
                22, 0.6
              ]
            }
          });
          map.addLayer({
            id: 'durationLabels',
            type: 'symbol',
            source: 'heatmapSource', // Use the same source as your heatmap
            layout: {
              'text-field': ['get', 'detail'],
              'text-size': 12,
              'text-allow-overlap': false,
              'text-ignore-placement': false
            },
            paint: {
              'text-color': '#000000', // Adjust text color as needed
              'text-halo-color': '#ffffff',
              'text-halo-width': 1,
            }
          });
        }
      })
      .catch((error) => console.error("Error fetching or processing data:", error));

  }
  const handleTripChange = (e) => {
    const selectedId = e.target.value;

    //Clear previous vessels name
    setvesselNames1([])


    setSelectedTripId(selectedId);

    const selectedTrip = trips.find(trip => trip.id.toString() === selectedId);

    if (selectedTrip) {

      setFromTime(selectedTrip.fromTime);
      setToTime(selectedTrip.toTime);


      // Update vector tile sources for MapObject and MapObject2
      // Assuming the existence of functions to update these sources; you might need to create or adjust them.
      updateMapSource(MapObject, selectedTrip.mxaklayer, 'shiptype', Mxaklayers[0], 1);

      setMxaklayer([selectedTrip.mxaklayer])

      GetfilteredData(selectedTrip.fromTime, selectedTrip.toTime)
    }
  };
  function updateMapSource(map, layer, filterfield, currentLayerId, vesselSide) {
    console.log(layer, filterfield, currentLayerId)
    if (!map) return; // Ensure the map is initialized

    //const currentLayerId = "your-current-layer-id"; // You need to manage layer IDs state if they change dynamically

    // Remove existing layer/source if necessary
    if (currentLayerId !== '' && currentLayerId !== undefined) {
      if (map.getLayer(currentLayerId)) {
        map.removeLayer(currentLayerId);
        map.removeSource(currentLayerId);
      }
    }

    map.addSource(layer, {
      type: 'vector',
      //tiles : [`http://localhost:3002/${layer}/{z}/{x}/{y}`],
      tiles: [`http://34.23.30.245:8080/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=ne:${layer}&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}`],
      minZoom: 0,
      maxZoom: 30,
      tileSize: 512
    });


    map.addLayer({
      id: layer,
      type: 'circle',
      source: layer,
      'source-layer': layer, // Replace with your actual source layer name
      paint: {
        // Use a match expression to differentiate ship types
        'circle-radius': [
          'match',
          ['get', filterfield], // Replace 'ship_type' with the actual property name
          'Tanker', 7, // 8 pixel radius for tankers
          4 // 4 pixel radius for all other ship types
        ],
        'circle-color': [
          'match',
          ['get', filterfield], // Replace 'ship_type' with the actual property name
          "General Purpose Tug", '#1f77b4',
          "Tanker", '#ff7f0e',
          "Line Handling Tug", "#2ca02c",
          "Anchor Handling Tug", '#d62728',
          "Escort Tug", '#9467bd',
          "Utility Tug", '#8c564b',
          '#088' // Color for all other ship types


        ]
      }
    });

    map.addLayer({
      id: `${layer}-labels`, // Ensure the ID is unique
      type: 'symbol',
      source: layer, // Reference the same source as your circle layer
      'source-layer': layer, // Match the source-layer of your vector tile source
      layout: {
        'text-field': ['get', 'vesselname'], // Specify the property for the label text
        'text-size': 10,
        'text-anchor': 'top', // Anchor the text above the point
        'text-offset': [0, 0.5], // Offset the text vertically above the point
      },
      paint: {
        'text-color': '#000000', // Label text color
        'text-halo-color': '#ffffff', // Halo color to increase legibility over backgrounds
        'text-halo-width': 1, // Halo width
      }
      // Optionally, apply a filter similar to your circle layer if you only want labels for specific points
    });

    map.on('moveend', function () {

      displayRenderedvessels(map, currentLayerId, vesselSide)

    });
    map.on('click', layer, function (e) {
      // Check if a feature is clicked
      if (e.features.length > 0) {


        const feature = e.features[0];

        // Start building the HTML content for the popup
        let popupContent = '<div><h3>Feature Detailss</h3><ul>';

        // Loop over all properties of the feature
        for (const [key, value] of Object.entries(feature.properties)) {
          // Append each key-value pair as a list item
          popupContent += `<li><strong>${key}:</strong> ${value}</li>`;
        }

        // Close the list and div
        popupContent += '</ul></div>';

        // Create and show the popup
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(popupContent)
          .addTo(map);

      }
    });


  }

  const handleShipCheck = (ship) => {
    setCheckedShips(current => {
      if (current.includes(ship)) {
        // If already included, remove it
        return current.filter(item => item !== ship);
      } else {
        // Otherwise, add it to the list of checked ships
        return [...current, ship];
      }
    });
  };

  const GenerateHeatMap = (Data) => {
    const { Shiptype, From, To, Layer } = Data
    console.log(selectedShipTypes)
    //console.log(Data)
    //clearalllayersansSources(MapObject)
    if (currentLyerID !== null && currentLyerID !== undefined) {
      if (MapObject.getLayer(currentLyerID)) {
        MapObject.removeLayer(currentLyerID);
        MapObject.removeSource(currentLyerID);
      }
    }
    setcurrentLyerID(`${Layer[0]}-${From}-${To}`)
    updateMapSourceHeatMap(MapObject, `${Layer[0]}-${From}-${To}`, Shiptype, Layer[0], Math.floor(new Date(From).getTime() / 1000), Math.floor(new Date(To).getTime() / 1000));

    //setMxaklayer([Layer[0]])
  }

  const handleGenerateHeatMap = () => {
    GenerateHeatMap({
      Shiptype: selectedShipTypes.map((option) => option.value),
      From: fromTimeHeatMap,
      To: toTimeHeatMap,
      Layer: MxaklayersRef.current,
    });
  };
  return (
    <>
      <Container >
        <Row mt={2}>
          <Col md={4}>
            <Form.Group controlId="selectedTripId" className="mb-3">
              <Form.Label>Ships Data:</Form.Label>
              <Form.Control
                as="select" value={selectedTripId} onChange={handleTripChange}
                style={{ marginBottom: '2px' }}>
                <option value="">Select a trip</option>
                {trips.map(trip => (
                  <option key={trip.id} value={trip.id}>{trip.name}</option>
                ))}
              </Form.Control>
              {/* Checkbox to toggle visibility of the second filter */}

            </Form.Group>
            <div className="slider-container">
              <InputGroup className="mb-3">
                <Form.Control
                  type="range"
                  min="0"
                  max={totalHours}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(e.target.value)}
                  className="custom-slider"
                />
                <div className="slider-bar"></div>
                <Button className="btn-custom" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
              </InputGroup>
              <Form.Check
                type="checkbox"
                label="Do you want to add time interval filter"
                checked={showTimeInterval}
                onChange={(e) => setShowTimeInterval(e.target.checked)}
                style={{ marginTop: '1rem', marginBottom: '1rem' }}
              />
            </div>
          </Col>
          {showTimeInterval && (
            <Col md={4}>
              <Form.Group>
                <Form.Label>HeatMap Data:</Form.Label>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="datetime-local"
                    value={fromTimeHeatMap}
                    onChange={(e) => {
                      setFromTimeHeatMap(e.target.value)
                      // Add your logic here
                    }}
                  />
                </InputGroup>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="datetime-local"
                    value={toTimeHeatMap}
                    onChange={(e) => {
                      setToTimeHeatMap(e.target.value)
                    }}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          )}
          <Col md={4} style={{ zIndex: '3' }} >
            <Form.Group className="mb-3"   >
              <Form.Label>Ship Type:</Form.Label>
              <Select
                value={selectedShipTypes}
                options={shipTypeOptions}
                isMulti
                onChange={handleShipTypeSelect}

              />
            </Form.Group>
            <Button onClick={handleGenerateHeatMap}>Heat Map</Button>
          </Col>
        </Row>
        <Row >
          <Col>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '5px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '5px', borderRadius: '12px', zIndex: 1 }}>
                <span style={{ margin: '0', fontWeight: '400', fontSize: '1.0em', textAlign: 'center' }}>{CurrentIntervalTimestamp}</span>
              </div>
              <div className="map-container" style={{ width: '100%', margin: 'auto', marginTop: '10px', height: '80vh', position: 'relative' }}>
                <div ref={mapContainerRef1} style={{ width: '100%', height: '100%' }} />
                <div className="vessel-list" style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'white', padding: '21px', zIndex: 1 }}>
                  {vesselNames1.map((vessel, index) => (
                    <h3 key={index} style={{ fontWeight: 400, fontSize: '0.8em', color: shipTypes[vessel.shiptype] || '#000' }}>{vessel.name}</h3>
                  ))}
                </div>
                <Legend shipTypes={shipTypes} />
              </div>
            </div>
          </Col>

        </Row>

      </Container>

    </>
  )
}

export default Onemap;