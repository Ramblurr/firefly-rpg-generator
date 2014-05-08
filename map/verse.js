var map = new OpenLayers.Map({
    div: "map",
    layers: [
        new OpenLayers.Layer.Image(
                'Drawing',
                'versemap.svg',
                new OpenLayers.Bounds(-600, -860, 600, 860),
                new OpenLayers.Size(600,860), null
                ),
        new OpenLayers.Layer.OSM("OSM (with buffer)", null, {buffer: 2})
    ],
    controls: [
        new OpenLayers.Control.Navigation({
            dragPanOptions: {
                enableKinetic: true
            }
        }),
        new OpenLayers.Control.PanZoom(),
        new OpenLayers.Control.Attribution()
    ],
    center: [120, -50],
    zoom: 3
});

map.addControl(new OpenLayers.Control.LayerSwitcher());
