# Public copy contract — November 2026

Reviewed against current product source and accepted private field-beta evidence. This is a public summary, not an independent hardware qualification.

| Area                                                  | Public status                                                                                                                                         |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local rules, graph save/reload, MQTT to Shelly ON/OFF | Verified in the scoped physical core candidate                                                                                                        |
| Telegram                                              | Physical alert delivery verified; internet required                                                                                                   |
| MQTT                                                  | Named input/output catalog; configured input topic, JSON path, max age; value/fresh/age; output topic, body, QoS and retain; nodes select catalog IDs |
| Zigbee                                                | Optional ESP32-C6; selected configurations qualified, compatibility per device                                                                        |
| ESP-NOW                                               | Receive-only main runtime; physical command transmission/acknowledgement not qualified                                                                |
| Discord                                               | Outbound webhooks only; inbound commands remain development                                                                                           |
| microSD                                               | Optional archive, not equivalent to Data Logger measurement history                                                                                   |
| Hardware                                              | Reference prototype, not a finalized commercial package                                                                                               |
| Availability                                          | Private field beta; no public sales or pricing promise                                                                                                |

Polish is the canonical root; English is a separate prerendered /en/ route. Both have explicit canonical and language alternates. Do not silently switch URL content from local storage. Keep parity tests and review wording whenever product contracts change.

## Product refresh — 2026-11-24

Product source: 64dc7713b0b360d5d56e04b36533a33285e4b688. The optional ESP32-C6 Zigbee coordinator supports device management and physically qualified measurement mapping in selected configurations (docs/main_docs/integrations/ZIGBEE_C6_INTEGRATION.md). E-paper Clay Charts previews one selected configured field, up to 64 recent matching raw samples within six hours (docs/main_docs/architecture/DATA_LOGGER.md); implementation confirmed, not a new physical qualification. Separate Data Logger measurements from Automation Archive decisions.
