# FORGE.js changelog 0.9.5

### Viewer

- New: you can now set options of the WebGL context in the viewer json configuration.
- New: `onMainConfigLoadComplete` event that is fired when all the configuration has been parsed. So the new event order is `onReady`, `onConfigLoadcomplete` then `onMainConfigLoadComplete`.

### Media

- Fix: `startTime` not taken into account. Medias were always starting at 0s unless it was synced with another media.
- New: add a `preview` object to the media, allowing to have a low resolution preview of the displayed media (work for media of `image` type).
- New: ability to load a complex image composed of multiples tiles, for high multi resolution purpose.

### Renderer

- New: multiresolution image processing for tiled images through a new background pyramid renderer. See the `multiresolution` and `paris26g` samples for use case.

### Display

- New: add a `capture` method to `FORGE.Canvas`. This allows you to capture the user viewport and get an image with `viewer.canvas.capture()`.

### Camera

- Update: `onCameraChange` event is now renamed to `onChange`.
- New: add a `onOrientationChange` event to the `FORGE.Camera`.
- New: add a `onFovChange` event to the `FORGE.Camera`.
- Improvement: the lookAt method takes cancelRoll argument into account.

### Views

- New: add flat view options to repeat the media on x and y axis.

### Video

- New: add a `playbackRate` setter for `VideoHTML5` and `VideoDash`.
- New: add `onRateChange` event for videos.

### Hotspots

- New: `Hotspots3D` now support the use of offset values (x, y and z) into the `geometry` configuration object in world unit.
- New: `HotspotsDOM` now support the use of offset values (x, y) into the `dom` configuration object in pixel units.
- New: hotspot has a new `autoScale` parameter in their configuration. This allows the hotspot to keep the same aspect whatever the fov is.
- Fix: when destroying a `HotspotDOM`, do not remove the dom but hide it away. Adaptation of the events because of bad reference when destroying it.

### Plugins

- New: add `GoogleMaps` plugin to display a GPX track on a Google Maps.
- New: add an `Altimeter` plugin to display the altitude extracted from the telemetry sensors of GoPro's cameras.
- New: add an `Compass` plugin to display the orientation extracted from the telemetry sensors of GoPro's cameras.
- New: add an `Speedometer` plugin to display the speed extracted from the telemetry sensors of GoPro's cameras.
- New: add an `Accelerometer` plugin to display the G force extracted from the telemetry sensors of GoPro's cameras.
- New: add a `Share` plugin that keeps the url updated according to your camera orientation. That allows the user to share its current view with people through the url.
- Update: add playback rate menu to the `VideoControls` plugin.
- Update: new version of the `Editor` plugin. You can now manipulate hotspots in space (translation, rotation, scale), change their names, edit the geometry, browse the history.
- Update: new version of the `Toolbox` plugin that have a view selector now.

### Samples

- New: `telemetry` sample to demonstrate the use of the telemetry plugins (`speedometer`, `accelerometer`, `compass` and `altimeter`). The plugins can be display as hotspots in the 3D world or in screen space in 2D.
- New: `multiresolution` sample to demonstrate the performance and the display quality of ForgeJS to handle any kind of panoramic-image size.
- New: `paris26g` sample. It is a multiresolution sample with our famous Paris 26 Gigapixels panorama.
- New: `googlemaps` sample to demonstrate the use of the `GoogleMaps` plugin.
- New: `view-flat` sample to demonstrate the options of the flat view.
- New `camera-events` sample to log new `FORGE.Camera` events in the browser console.
- Update: edit `editor` sample for the new version of the `Editor` plugin.
- Update: edit `multiple-media` sample to demonstrate the flat view options.

### Misc

- Update: Omnitone library to 1.0.1
- Update: dash.js library to 2.6.0

### Diff since 0.9.4

60 files changed, 4246 insertions(+), 381 deletions(-)
