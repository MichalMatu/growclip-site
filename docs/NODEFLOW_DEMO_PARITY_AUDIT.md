# Public Nodeflow demo parity audit

Product reference: 64dc7713b0b360d5d56e04b36533a33285e4b688. Site baseline: 3ad28803b93f358b50d0367ae4677cd4c49d8361.

Scope: twelve registered public demo node types, four examples, catalog preview, time/condition/value connections, stale samples, and action presentation. The site must never import private device runtime or connect to external services.

| Product source                                                            | Finding and candidate correction                                                                                                                                                                             |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| nodes/input/ble_sensor.ts, nodes/shared/ble_sensor_config.ts              | Current type Sensor/BLE Sensor; selected catalog field IDs, numeric online and age_sec; no offline boolean output. Offline example uses Compare online == 0; BLE values are withheld when simulated offline. |
| nodes/input/scd41.ts                                                      | Keep three numeric ports; align Temperature/Humidity labels and fail closed on missing or stale fixture readings.                                                                                            |
| nodes/input/mqtt_input.ts                                                 | MQTT catalog ID title, Fresh and Age (s) numeric ports, stale value not presented as current.                                                                                                                |
| nodes/input/ds3231.ts, nodes/processing/base_time_node.ts, time_filter.ts | Sensor/DS3231, structured time payload, upstream bool propagation and integer hour/minute properties; deterministic synthetic time.                                                                          |
| nodes/operators/boolean_operation.ts, hysteresis.ts                       | Compare uses actual operands; Hysteresis uses canonical threshold port labels and must not substitute defaults for missing input.                                                                            |
| nodes/widget/knob.ts                                                      | Input/Number output label hidden as in product.                                                                                                                                                              |
| nodes/output/433mhz_socket.ts                                             | Replace obsolete raw codes with configured device_id.                                                                                                                                                        |
| nodes/output/shelly_plug.ts, telegram_notification.ts, mqtt_publish.ts    | Keep typed time/condition inputs; explicit AUTO/AND demo configuration; show rule match rather than claim an actual message was sent.                                                                        |

Four scenarios: climate rising hysteresis; night humidity with overnight time gate; MQTT soil value with freshness rejection; CO2 and independent numeric BLE online comparison. Product catalog/library remains informational, not exhaustive; the six BLE fixture fields are a selected catalog projection, not the full device configurator. The public demo intentionally models AND-connected rules only, not optional/disconnected input modes, all output edge policies, hardware configuration, or physical execution. Visual controls are illustrative; no real actuation. Remaining visual parity review: current product-specific card rendering and browser matrix screenshots. No product source modifications.

## Visual follow-up

Owner reported whole panel moving on hover and outdated Number styling. The shared `.asset-frame:hover` lift is excluded from the interactive canvas. Number uses the current default 280×140 geometry, 6px ring, continuous cyan/green/red ratio, theme track/body/text, numeric precision 0–2 and drag hint. Examples stack paired Number nodes to prevent overlap. Regression tests cover panel bounds and canvas offset on pointer-only hover and the gauge contract. Other card renderers remain a separate visual review; no claim of full renderer parity.

The interactive demo root also opts out of the scroll-reveal transform. The hover test waits for page motion to settle, confirms the pointer is over the canvas, and compares document-space panel coordinates plus exact graph geometry.

## Closeout candidate

Compare adds the six product operator controls in the public-only simulation; Hysteresis differentiates invalid thresholds from missing input. The remaining device-specific card bodies are intentionally simplified. A visual comparison with the product gallery remains required, not inferred from test success.
