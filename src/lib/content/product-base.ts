export type Locale = 'pl' | 'en';

export type FeatureBlock = {
	title: string;
	body: string;
};

export type HardwareOption = {
	title: string;
	status: string;
	body: string;
};

export type FaqItem = {
	question: string;
	answer: string;
};

export type MediaSlot = {
	title: string;
	body: string;
	src: string;
	alt: string;
};

export type DemoFlowExample = {
	id: 'climate' | 'nightHumidity' | 'mqttBridge' | 'safetyAlert';
	title: string;
	body: string;
};

export type ProductContent = {
	meta: {
		title: string;
		description: string;
		socialTitle: string;
		socialDescription: string;
	};
	nav: {
		demo: string;
		diagnostics: string;
		capabilities: string;
		hardware: string;
		faq: string;
		contact: string;
		language: string;
		theme: {
			label: string;
			system: string;
			light: string;
			dark: string;
		};
	};
	hero: {
		kicker: string;
		title: string;
		headline: string;
		copy: string;
		availability: string;
		primaryCta: string;
		secondaryCta: string;
		imageSrc: string;
		imageAlt: string;
	};
	demo: {
		kicker: string;
		title: string;
		copy: string;
		loading: string;
		reset: string;
		examples: DemoFlowExample[];
		libraryTitle: string;
		libraryGroups: { label: string; nodes: string[] }[];
	};
	capabilities: {
		kicker: string;
		title: string;
		copy: string;
		items: FeatureBlock[];
	};
	hardware: {
		kicker: string;
		title: string;
		copy: string;
		baseTitle: string;
		baseItems: string[];
		optionsTitle: string;
		options: HardwareOption[];
		technicalTitle: string;
		technicalBody: string;
		sourceLabel: string;
	};
	beta: {
		kicker: string;
		title: string;
		copy: string;
		primaryCta: string;
		note: string;
	};
	showcase: {
		kicker: string;
		title: string;
	};
	media: MediaSlot[];
	faq: {
		kicker: string;
		title: string;
		items: FaqItem[];
	};
	footer: {
		tagline: string;
	};
};

export const locales = ['pl', 'en'] as const satisfies readonly Locale[];

export const elecrowHref =
	'https://www.elecrow.com/crowpanel-esp32-2-9-e-paper-hmi-display-with-128-296-resolution-black-white-color-driven-by-spi-interface.html';

const sharedDemoExampleIds = ['climate', 'nightHumidity', 'mqttBridge', 'safetyAlert'] as const;

export const productContent: Record<Locale, ProductContent> = {
	pl: {
		meta: {
			title: 'GrowClip - lokalny wizualny sterownik growboxa',
			description:
				'GrowClip beta: lokalny wizualny sterownik growboxa z Nodeflow, diagnostyką decyzji, MQTT, Telegramem, webhookami, BLE, opcjonalnymi sensorami i e-paper HMI.',
			socialTitle: 'GrowClip - lokalny wizualny sterownik flow',
			socialDescription:
				'Lokalna automatyzacja, która pokazuje wejścia, warunki, akcje i powód każdej decyzji.'
		},
		nav: {
			demo: 'Demo',
			diagnostics: 'Diagnostyka',
			capabilities: 'Możliwości',
			hardware: 'Sprzęt',
			faq: 'FAQ',
			contact: 'Kontakt',
			language: 'Zmień język',
			theme: {
				label: 'Zmień motyw',
				system: 'System',
				light: 'Jasny',
				dark: 'Ciemny'
			}
		},
		hero: {
			kicker: 'Lokalny wizualny sterownik reguł',
			title: 'GrowClip',
			headline: 'Automatyzacja growboxa. Lokalne reguły, pełna kontrola.',
			copy: 'Wizualnie połącz czujniki, warunki i akcje (Input -> Processing -> Output). Reguły działają lokalnie, a ich decyzje można sprawdzić w historii.',
			availability: 'Limitowana beta prywatna · prototyp · bez publicznej sprzedaży',
			primaryCta: 'Opisz swój growbox',
			secondaryCta: 'Zobacz demo flow',
			imageSrc: '/media/growclip-hero.webp',
			imageAlt: 'Wizualizacja koncepcyjna sterownika w growboxie, nie zdjęcie gotowego urządzenia'
		},
		demo: {
			kicker: 'Interaktywne demo',
			title: 'Zobacz język flow w praktyce',
			copy: 'Cztery symulacje w przeglądarce. Bez połączenia ze sprzętem; nie katalog gotowych konfiguracji.',
			loading: 'Demo ładuje edytor dopiero przy tej sekcji',
			reset: 'Reset demo',
			libraryTitle: 'Biblioteka nodów — wybrane elementy',
			libraryGroups: [
				{
					label: 'Wejścia',
					nodes: ['SCD41', 'BLE Thermometer', 'MQTT Input', 'Gateway Input (Zigbee)']
				},
				{ label: 'Logika', nodes: ['Compare', 'Hysteresis', 'Formula', 'Time Filter'] },
				{ label: 'Wyjścia', nodes: ['Shelly Plug', 'MQTT Publish', 'Telegram', 'GPIO Output'] }
			],
			examples: [
				{
					id: sharedDemoExampleIds[0],
					title: 'Wentylacja klimatu',
					body: 'Symulowana temperatura z SCD41 przechodzi przez histerezę i filtr czasu; demo pokazuje wynik dla wentylatora i powiadomienia.'
				},
				{
					id: sharedDemoExampleIds[1],
					title: 'Nocna wilgotność',
					body: 'BLE thermometer i okno czasu sterują RF433 tylko wtedy, gdy warunki naprawdę tego wymagają.'
				},
				{
					id: sharedDemoExampleIds[2],
					title: 'MQTT do akcji',
					body: 'Zewnętrzny sensor MQTT trafia do lokalnego flow, filtr czasu ogranicza akcję, a stan wraca do brokera.'
				},
				{
					id: sharedDemoExampleIds[3],
					title: 'Alert bezpieczeństwa',
					body: 'Przekroczenie CO2 albo offline sensor trafia przez filtr czasu do Telegrama bez dotykania wykonawców.'
				}
			]
		},
		capabilities: {
			kicker: 'Możliwości',
			title: 'Co potrafi GrowClip',
			copy: '',
			items: [
				{
					title: 'Czujniki i wejścia',
					body: 'SCD41, DHT22, BME680, SGP30, DS18B20, BLE Thermometer, BLE Presence, BLE Beacon, GPIO/touchRead i analog.'
				},
				{
					title: 'Reguły i sterowanie',
					body: 'Porównania, histereza, VPD, harmonogramy, Shelly, GPIO, RF433 i ręczne sterowanie.'
				},
				{
					title: 'MQTT i sieć',
					body: 'Katalog MQTT: temat, JSON path, świeżość, QoS i retain. Wi-Fi AP/router/AP+router; bez wymogu Home Assistanta.'
				},
				{
					title: 'Zigbee — opcjonalny ESP32-C6',
					body: 'Parowanie i zarządzanie urządzeniami, pomiary w regułach i Data Loggerze. Sprawdzone wybrane konfiguracje; zgodność zależy od urządzenia.'
				},
				{
					title: 'Historia i wykresy',
					body: 'Automation Timeline i Rule Telemetry pokazują decyzje. Data Logger: historia pomiarów, wykresy, CSV i zapis na microSD.'
				},
				{
					title: 'E-paper HMI',
					body: 'Menu, dashboard, akcje ręczne i Charts — podgląd do 64 ostatnich próbek wybranego pomiaru.'
				},
				{
					title: 'Powiadomienia',
					body: 'Telegram, Device Webhooks (JSON/Discord, tylko wychodzące), Text to Speech w panelu.'
				},
				{
					title: 'ESP-NOW',
					body: 'Odbiór telemetrii. Nadawanie komend pozostaje w rozwoju.'
				}
			]
		},
		hardware: {
			kicker: 'Sprzęt',
			title: 'ESP32-S3 i opcjonalne rozszerzenia',
			copy: 'Prototyp CrowPanel 2,9″ e-paper. Rekomendowane 8 MB Flash i 8 MB PSRAM.',
			baseTitle: 'Wariant bazowy',
			baseItems: ['ESP32-S3 · Wi-Fi/BLE · e-paper 128 × 296'],
			optionsTitle: 'Moduły i szczegóły',
			options: [
				{
					title: 'Czujniki',
					status: 'Opcja',
					body: 'Dobór do instalacji; DS18B20 wymaga walidacji fizycznej.'
				},
				{
					title: 'Zigbee / RF433',
					status: 'Opcja',
					body: 'Koordynator ESP32-C6 lub moduł radiowy 433 MHz.'
				},
				{
					title: 'Czas',
					status: 'Opcja',
					body: 'RTC jako zaufany backup; Xiaomi PVVX jako zdegradowany backup BLE.'
				},
				{
					title: 'Montaż i zapis',
					status: 'Opcja',
					body: 'microSD, bateria Li-ion, obudowa.'
				}
			],
			technicalTitle: 'Specyfikacja modułu',
			technicalBody: 'Elecrow CrowPanel ESP32-S3-WROOM-1-N8R8, SPI, Wi-Fi, TF Card/BAT.',
			sourceLabel: 'Specyfikacja Elecrow'
		},
		beta: {
			kicker: 'Beta',
			title: 'Dołącz do prywatnych testów',
			copy: 'Opisz instalację i potrzebne funkcje. Ustalimy zakres testów oraz konfigurację.',
			primaryCta: 'Zapytaj o beta moduł',
			note: 'Brak publicznej sprzedaży i ogłoszonej ceny.'
		},
		showcase: {
			kicker: 'Interfejs',
			title: 'Panel i historia decyzji'
		},
		media: [
			{
				title: 'Edytor Nodeflow',
				body: 'Rzeczywisty edytor reguł z demonstracyjnym przepływem klimatu.',
				src: '/media/product-nodeflow.webp',
				alt: 'Edytor Nodeflow GrowClip z przykładową regułą klimatu'
			},
			{
				title: 'Konfiguracja sprzętu',
				body: 'Panel konfiguracji czujników i funkcji sprzętowych z danymi demonstracyjnymi.',
				src: '/media/product-hardware.webp',
				alt: 'Panel konfiguracji sprzętu GrowClip'
			},
			{
				title: 'Szczegóły zdarzenia',
				body: 'Przykładowe zdarzenie: reguła, warunki, wynik i ślad decyzji.',
				src: '/media/product-event-detail.webp',
				alt: 'Okno szczegółów zdarzenia automatyzacji GrowClip'
			},
			{
				title: 'Automation Archive',
				body: 'Archiwum z przykładowymi zdarzeniami; zapis na microSD zależy od konfiguracji.',
				src: '/media/product-archive.webp',
				alt: 'Lista i wykres przykładowych zdarzeń Automation Archive'
			}
		],
		faq: {
			kicker: 'FAQ',
			title: 'Krótko, bez obietnic ponad stan',
			items: [
				{
					question: 'Czy demo to gotowe presety?',
					answer: 'Nie. Progi i okablowanie trzeba dopasować do własnej instalacji.'
				},
				{
					question: 'Co jeśli czujnik przestanie odpowiadać?',
					answer:
						'Reguły mogą uwzględniać brak pomiaru i stan źródła, a diagnostyka pomaga ustalić przyczynę.'
				},
				{
					question: 'Czy urządzenie działa bez internetu?',
					answer:
						'Podstawowe reguły działają lokalnie. Usługi zewnętrzne, np. Telegram, wymagają internetu.'
				}
			]
		},
		footer: {
			tagline: 'GrowClip - lokalna automatyka dla growboxa i małych instalacji.'
		}
	},
	en: {
		meta: {
			title: 'GrowClip - local visual growbox controller',
			description:
				'GrowClip beta: a local visual growbox controller with Nodeflow, decision diagnostics, MQTT, Telegram, webhooks, BLE, optional sensors and e-paper HMI.',
			socialTitle: 'GrowClip - local visual flow controller',
			socialDescription:
				'Local automation that shows inputs, conditions, actions and the reason behind each decision.'
		},
		nav: {
			demo: 'Demo',
			diagnostics: 'Diagnostics',
			capabilities: 'Capabilities',
			hardware: 'Hardware',
			faq: 'FAQ',
			contact: 'Contact',
			language: 'Change language',
			theme: {
				label: 'Change theme',
				system: 'System',
				light: 'Light',
				dark: 'Dark'
			}
		},
		hero: {
			kicker: 'Local visual rule controller',
			title: 'GrowClip',
			headline: 'Local growbox automation that shows the rule as a flow',
			copy: 'Connect sensors, conditions and actions visually (Input -> Processing -> Output). Rules run locally and their decisions can be reviewed.',
			availability: 'Limited beta · private field testing · not on public sale',
			primaryCta: 'Describe your growbox',
			secondaryCta: 'See the flow demo',
			imageSrc: '/media/growclip-hero.webp',
			imageAlt: 'Concept illustration of a controller in a growbox, not a finished device'
		},
		demo: {
			kicker: 'Interactive demo',
			title: 'Try the visual rule editor',
			copy: 'Four browser simulations. No device connection; not a catalogue of ready-to-use presets.',
			loading: 'The editor loads only when this section is reached',
			reset: 'Reset demo',
			libraryTitle: 'Node library — selected nodes',
			libraryGroups: [
				{
					label: 'Inputs',
					nodes: ['SCD41', 'BLE Thermometer', 'MQTT Input', 'Gateway Input (Zigbee)']
				},
				{ label: 'Logic', nodes: ['Compare', 'Hysteresis', 'Formula', 'Time Filter'] },
				{ label: 'Outputs', nodes: ['Shelly Plug', 'MQTT Publish', 'Telegram', 'GPIO Output'] }
			],
			examples: [
				{
					id: sharedDemoExampleIds[0],
					title: 'Climate ventilation',
					body: 'Simulated SCD41 temperature passes through hysteresis and a time gate; the demo shows the fan and notification outcomes.'
				},
				{
					id: sharedDemoExampleIds[1],
					title: 'Night humidity',
					body: 'BLE thermometer and a time window drive RF433 only when conditions actually require it.'
				},
				{
					id: sharedDemoExampleIds[2],
					title: 'MQTT to action',
					body: 'An external MQTT sensor enters the local flow, a time filter limits the action and state returns to the broker.'
				},
				{
					id: sharedDemoExampleIds[3],
					title: 'Safety alert',
					body: 'CO2 threshold breach or stale sensor state goes through a time filter to Telegram without touching actuators.'
				}
			]
		},
		capabilities: {
			kicker: 'Capabilities',
			title: 'What GrowClip can do',
			copy: '',
			items: [
				{
					title: 'Sensors and inputs',
					body: 'SCD41, DHT22, BME680, SGP30, DS18B20, BLE Thermometer, BLE Presence, BLE Beacon, GPIO/touchRead and analog.'
				},
				{
					title: 'Rules and control',
					body: 'Compare, hysteresis, VPD, schedules, Shelly, GPIO, RF433 and manual control.'
				},
				{
					title: 'MQTT and networking',
					body: 'MQTT catalog: topic, JSON path, freshness, QoS and retain. Wi-Fi AP/router/AP+router; no Home Assistant required.'
				},
				{
					title: 'Zigbee — optional ESP32-C6',
					body: 'Pair and manage devices; use measurements in rules and Data Logger. Selected configurations verified; device compatibility varies.'
				},
				{
					title: 'History and charts',
					body: 'Automation Timeline and Rule Telemetry explain decisions. Data Logger: measurement history, charts, CSV and microSD storage.'
				},
				{
					title: 'E-paper HMI',
					body: 'Menu, dashboard, manual actions and Charts — preview up to 64 recent samples of a selected measurement.'
				},
				{
					title: 'Notifications',
					body: 'Telegram, Device Webhooks (outbound JSON/Discord only), Text to Speech in the panel.'
				},
				{
					title: 'ESP-NOW',
					body: 'Telemetry reception. Command transmission remains in development.'
				}
			]
		},
		hardware: {
			kicker: 'Hardware',
			title: 'ESP32-S3 and optional extensions',
			copy: 'CrowPanel 2.9-inch e-paper prototype. Recommended 8 MB Flash and 8 MB PSRAM.',
			baseTitle: 'Base variant',
			baseItems: ['ESP32-S3 · Wi-Fi/BLE · e-paper 128 × 296'],
			optionsTitle: 'Modules and details',
			options: [
				{
					title: 'Sensors',
					status: 'Option',
					body: 'Installation-specific selection; DS18B20 needs physical validation.'
				},
				{
					title: 'Zigbee / RF433',
					status: 'Option',
					body: 'ESP32-C6 coordinator or 433 MHz radio module.'
				},
				{
					title: 'Time',
					status: 'Option',
					body: 'RTC as trusted backup; Xiaomi PVVX as degraded BLE backup.'
				},
				{
					title: 'Assembly and storage',
					status: 'Option',
					body: 'microSD, Li-ion battery, enclosure.'
				}
			],
			technicalTitle: 'Module specification',
			technicalBody: 'Elecrow CrowPanel ESP32-S3-WROOM-1-N8R8, SPI, Wi-Fi, TF Card/BAT.',
			sourceLabel: 'Elecrow specification'
		},
		beta: {
			kicker: 'Beta',
			title: 'Join private field testing',
			copy: 'Describe your installation and required features. We will agree on the test scope and configuration.',
			primaryCta: 'Ask about the beta module',
			note: 'No public sales or announced price.'
		},
		showcase: {
			kicker: 'Interface',
			title: 'Panel and decision history'
		},
		media: [
			{
				title: 'Nodeflow editor',
				body: 'Actual rule editor with an illustrative climate flow.',
				src: '/media/product-nodeflow.webp',
				alt: 'GrowClip Nodeflow editor showing an illustrative climate rule'
			},
			{
				title: 'Hardware configuration',
				body: 'Hardware and sensor configuration panel using demonstration data.',
				src: '/media/product-hardware.webp',
				alt: 'GrowClip hardware configuration panel'
			},
			{
				title: 'Event details',
				body: 'Example event details: rule, conditions, outcome and decision trace.',
				src: '/media/product-event-detail.webp',
				alt: 'GrowClip automation event details dialog'
			},
			{
				title: 'Automation Archive',
				body: 'Archive with example events; microSD storage depends on configuration.',
				src: '/media/product-archive.webp',
				alt: 'Automation Archive list and chart with example events'
			}
		],
		faq: {
			kicker: 'FAQ',
			title: 'Frequently asked questions',
			items: [
				{
					question: 'Are demo flows ready-to-use presets?',
					answer: 'No. Thresholds and wiring must match your installation.'
				},
				{
					question: 'What if a sensor stops responding?',
					answer:
						'Rules can account for missing readings and source state; diagnostics help identify the cause.'
				},
				{
					question: 'Can it work without internet?',
					answer: 'Core rules run locally. External services such as Telegram require internet.'
				}
			]
		},
		footer: {
			tagline: 'GrowClip - local automation for growboxes and small installations.'
		}
	}
};

export function resolveLocale(value: string | null | undefined): Locale {
	return value === 'en' ? 'en' : 'pl';
}

export function getProductContent(locale: string | null | undefined): ProductContent {
	return productContent[resolveLocale(locale)];
}
